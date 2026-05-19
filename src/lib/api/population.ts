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

// 단일 행정동(법정동 10자리) 단위 인구 조회 — 내부 helper
export async function populationByRegion(opts: {
  bcode: string;
  year?: number;
  lv?: string;
}): Promise<PopulationSummary | null> {
  const ym = opts.year ? `${opts.year}01` : defaultYm();
  const candidates: string[] = [ym, fallbackYm(ym), "202501"];

  for (const targetYm of candidates) {
    const result = await tryCall({
      stdgCd: opts.bcode,
      srchFrYm: targetYm,
      srchToYm: targetYm,
      lv: opts.lv ?? "3", // 3 = 읍면동 단위 (행정동 통반은 4)
    });
    if (result) return result;
  }
  return null;
}

// 반경 N미터 안에 들어가는 행정동들의 인구 합산.
// 8방향 + 중심 = 9개 좌표 샘플링 → 각 좌표의 법정동 코드 unique 추출 → 합산.
export async function populationByRadius(opts: {
  lng: number;
  lat: number;
  radiusM: number;
  reverseGeocode: (
    lng: number,
    lat: number,
  ) => Promise<{ beob?: { code?: string; name?: string } | null } | null>;
}): Promise<PopulationSummary | null> {
  // 9개 샘플 점. 대각선 고려해서 반경의 0.7배 거리 사용.
  const r = opts.radiusM * 0.7;
  const dLatPer100m = 1 / 111000; // 1m → 위도 도(degree)
  const dLngPer100m = 1 / (111000 * Math.cos((opts.lat * Math.PI) / 180));

  const offsets: Array<[number, number]> = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ];

  const points = offsets.map(([dx, dy]) => ({
    lng: opts.lng + dx * r * dLngPer100m,
    lat: opts.lat + dy * r * dLatPer100m,
  }));

  // 각 좌표 → 법정동 코드
  const bcodes = new Set<string>();
  const regionNames = new Map<string, string>();
  await Promise.all(
    points.map(async (p) => {
      try {
        const region = await opts.reverseGeocode(p.lng, p.lat);
        const code = region?.beob?.code;
        if (code) {
          bcodes.add(code);
          if (region?.beob?.name) regionNames.set(code, region.beob.name);
        }
      } catch {
        // 무시
      }
    }),
  );

  if (bcodes.size === 0) return null;

  // 각 동 인구 → 합산
  const summaries: PopulationSummary[] = [];
  await Promise.all(
    Array.from(bcodes).map(async (code) => {
      const s = await populationByRegion({ bcode: code, lv: "3" }).catch(
        () => null,
      );
      if (s) summaries.push(s);
    }),
  );

  if (summaries.length === 0) return null;
  return mergeSummaries(summaries, Array.from(regionNames.values()));
}

function mergeSummaries(
  list: PopulationSummary[],
  regionNames: string[],
): PopulationSummary {
  const buckets: Record<string, { m: number; f: number }> = {};
  let totalM = 0;
  let totalF = 0;

  for (const s of list) {
    for (const b of s.byAge) {
      buckets[b.ageGroup] = buckets[b.ageGroup] ?? { m: 0, f: 0 };
      buckets[b.ageGroup].m += b.male;
      buckets[b.ageGroup].f += b.female;
      totalM += b.male;
      totalF += b.female;
    }
  }

  const total = totalM + totalF;
  const byAge: PopulationByAge[] = Object.entries(buckets)
    .map(([ageGroup, v]) => ({
      ageGroup,
      male: v.m,
      female: v.f,
      total: v.m + v.f,
    }))
    .sort((a, b) => ageOrder(a.ageGroup) - ageOrder(b.ageGroup));

  const dominant = [...byAge].sort((a, b) => b.total - a.total)[0];
  const region =
    regionNames.length === 1
      ? regionNames[0]
      : `${regionNames.slice(0, 2).join(", ")} 등 ${regionNames.length}개 동`;

  return {
    regionName: region || "반경 2km 권역",
    totalPopulation: total,
    household: null,
    byAge,
    malePct: total ? (totalM / total) * 100 : 0,
    femalePct: total ? (totalF / total) * 100 : 0,
    dominantAgeGroup: dominant?.ageGroup ?? "-",
  };
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
