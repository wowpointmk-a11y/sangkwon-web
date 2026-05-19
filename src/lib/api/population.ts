// 행정안전부_법정동별(행정동 통반단위) 성/연령별 주민등록 인구수
// https://www.data.go.kr/data/15108074/openapi.do
// End Point: https://apis.data.go.kr/1741000/stdgSexdAgePpltn/selectStdgSexdAgePpltn
//
// 응답: Response.head{resultCode, totalCount, ...} / Response.items.item[]
// 필드:
//   tong, ban, ctpvNm, stdgNm, dongNm, totNmprCnt
//   male0AgeNmprCnt ... male100AgeNmprCnt
//   feml0AgeNmprCnt ... feml100AgeNmprCnt

import { env } from "../env";

const ENDPOINT =
  "https://apis.data.go.kr/1741000/stdgSexdAgePpltn/selectStdgSexdAgePpltn";

export interface PopulationByAge {
  ageGroup: string; // "0-9", "10-19", ...
  male: number;
  female: number;
  total: number;
}

export interface PopulationSummary {
  regionName: string;
  totalPopulation: number;
  household: number | null;
  byAge: PopulationByAge[];
  malePct: number;
  femalePct: number;
  dominantAgeGroup: string;
}

interface ApiItem {
  ctpvNm?: string;
  signguNm?: string;
  stdgNm?: string;
  dongNm?: string;
  tong?: string;
  ban?: string;
  totNmprCnt?: string | number;
  [key: string]: unknown;
}

interface ApiEnvelope {
  Response?: {
    head?: {
      resultCode?: string;
      resultMsg?: string;
      totalCount?: string;
      pageNo?: string;
      numOfRows?: string;
    };
    items?: { item?: ApiItem[] | ApiItem } | string;
  };
}

// "현재 - 3개월" 의 년월. 데이터 발행 지연을 고려.
// 너무 최근이면 NO_DATA. 너무 과거면 의미 떨어짐.
function defaultYm(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 시군구 단위 (lv=2) 성/연령별 인구 조회.
// bcode: 법정동 10자리 (앞 5자리가 시군구).
export async function populationByRegion(opts: {
  bcode: string;
  year?: number;
}): Promise<PopulationSummary | null> {
  const ym = opts.year
    ? `${opts.year}01`
    : defaultYm();

  // 3개월 시도 → 안 되면 1년 전 같은 달 fallback
  const candidates: string[] = [ym, fallbackYm(ym), "202501"];

  for (const targetYm of candidates) {
    const result = await tryCall({
      stdgCd: opts.bcode,
      srchFrYm: targetYm,
      srchToYm: targetYm,
      lv: "2",
    });
    if (result) return result;
  }
  return null;
}

function fallbackYm(ym: string): string {
  // 한 해 전 같은 달
  const y = Number(ym.slice(0, 4));
  const m = ym.slice(4, 6);
  return `${y - 1}${m}`;
}

async function tryCall(
  extra: Record<string, string>,
): Promise<PopulationSummary | null> {
  const params = new URLSearchParams({
    serviceKey: env.dataGoKrKey(),
    type: "json",
    pageNo: "1",
    numOfRows: "100",
    regSeCd: "1",
    ...extra,
  });

  let data: ApiEnvelope;
  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    data = (await res.json()) as ApiEnvelope;
  } catch {
    return null;
  }

  const head = data.Response?.head;
  if (!head || head.resultCode !== "0") return null;

  const itemsContainer = data.Response?.items;
  if (!itemsContainer || typeof itemsContainer === "string") return null;

  const raw = itemsContainer.item;
  const items: ApiItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  if (items.length === 0) return null;

  return aggregate(items);
}

function aggregate(items: ApiItem[]): PopulationSummary | null {
  const buckets: Record<string, { m: number; f: number }> = {};
  let totalM = 0;
  let totalF = 0;
  let regionName = "";

  for (const item of items) {
    // 지역명 잡기 (가장 구체적인 것 우선)
    const parts = [
      String(item.ctpvNm ?? "").trim(),
      String(item.signguNm ?? "").trim(),
      String(item.dongNm ?? item.stdgNm ?? "").trim(),
    ].filter(Boolean);
    if (parts.length && !regionName) regionName = parts.join(" ");

    // male{X}AgeNmprCnt, feml{X}AgeNmprCnt 패턴 매칭
    for (const [k, v] of Object.entries(item)) {
      const m = String(k).match(/^(male|feml)(\d+)AgeNmprCnt$/);
      if (!m) continue;
      const gender = m[1] === "male" ? "m" : "f";
      const age = Number(m[2]);
      const cnt = Number(v ?? 0) || 0;
      // 10년 단위 버킷 (0,10,20,...,70,80+)
      const decade = age >= 80 ? 80 : Math.floor(age / 10) * 10;
      const groupKey = decade === 80 ? "80+" : `${decade}-${decade + 9}`;
      buckets[groupKey] = buckets[groupKey] ?? { m: 0, f: 0 };
      buckets[groupKey][gender] += cnt;
      if (gender === "m") totalM += cnt;
      else totalF += cnt;
    }
  }

  const total = totalM + totalF;
  if (total === 0) return null;

  const byAge: PopulationByAge[] = Object.entries(buckets)
    .map(([ageGroup, v]) => ({
      ageGroup,
      male: v.m,
      female: v.f,
      total: v.m + v.f,
    }))
    .sort((a, b) => ageOrder(a.ageGroup) - ageOrder(b.ageGroup));

  const dominant = [...byAge].sort((a, b) => b.total - a.total)[0];

  return {
    regionName: regionName || "-",
    totalPopulation: total,
    household: null,
    byAge,
    malePct: (totalM / total) * 100,
    femalePct: (totalF / total) * 100,
    dominantAgeGroup: dominant?.ageGroup ?? "-",
  };
}

function ageOrder(group: string) {
  if (group === "80+") return 80;
  return Number(group.split("-")[0]) || 0;
}
