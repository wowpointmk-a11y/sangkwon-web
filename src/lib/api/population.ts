// 행정안전부_주민등록 인구 및 세대현황
// https://www.data.go.kr/data/15006840/openapi.do
//
// 실제 운영에서는 행정구역 코드(법정동/행정동) 입력이 필요.
// 본 모듈은 카카오 reverseGeocode 결과의 bcode(법정동 10자리) 앞 5자리(시군구)로 조회.

import { env } from "../env";

const BASE = "http://apis.data.go.kr/1741000/admmSexdAgePop";

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

// 시군구 단위 연령·성별 인구 조회
// bcode 가 정확히 매칭되지 않을 수 있어 결과는 best-effort.
export async function populationByRegion(opts: {
  bcode: string; // 법정동 10자리
  year?: number;
}): Promise<PopulationSummary | null> {
  const sggCode = opts.bcode.slice(0, 5);
  const year = opts.year ?? new Date().getFullYear() - 1; // 전년도 데이터가 안정적

  const params = new URLSearchParams({
    serviceKey: env.dataGoKrKey(),
    type: "json",
    pageNo: "1",
    numOfRows: "100",
    stdgCd: sggCode,
    srchFrYm: `${year}01`,
    srchToYm: `${year}12`,
  });

  const url = `${BASE}?${params.toString()}`;
  let data: unknown;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  // 응답 스키마는 API마다 다름. 안전하게 파싱.
  // 폴백: 데이터가 없으면 null.
  const items = extractItems(data);
  if (!items.length) return null;

  // 연령대 집계
  const buckets: Record<string, { m: number; f: number }> = {};
  let totalM = 0;
  let totalF = 0;
  let regionName = "";

  for (const item of items) {
    regionName =
      String(item.admmNm ?? item.stdgNm ?? "") || regionName;
    const age = normalizeAgeGroup(String(item.ageNm ?? item.ageGrp ?? ""));
    if (!age) continue;
    const m = Number(item.maleCnt ?? item.malePopltn ?? 0);
    const f = Number(item.femaleCnt ?? item.femalePopltn ?? 0);
    buckets[age] = buckets[age] ?? { m: 0, f: 0 };
    buckets[age].m += m;
    buckets[age].f += f;
    totalM += m;
    totalF += f;
  }

  const byAge: PopulationByAge[] = Object.entries(buckets)
    .map(([ageGroup, v]) => ({
      ageGroup,
      male: v.m,
      female: v.f,
      total: v.m + v.f,
    }))
    .sort((a, b) => ageOrder(a.ageGroup) - ageOrder(b.ageGroup));

  const total = totalM + totalF;
  if (total === 0) return null;

  const dominant = [...byAge].sort((a, b) => b.total - a.total)[0];

  return {
    regionName: regionName || sggCode,
    totalPopulation: total,
    household: null,
    byAge,
    malePct: (totalM / total) * 100,
    femalePct: (totalF / total) * 100,
    dominantAgeGroup: dominant?.ageGroup ?? "-",
  };
}

function extractItems(data: unknown): Array<Record<string, string | number>> {
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  // 케이스 1: { response: { body: { items: { item: [...] } } } }
  const r1 = (root.response as { body?: { items?: { item?: unknown[] } } })
    ?.body?.items?.item;
  if (Array.isArray(r1)) return r1 as Array<Record<string, string | number>>;
  // 케이스 2: { response: { body: { items: [...] } } }
  const r2 = (root.response as { body?: { items?: unknown[] } })?.body?.items;
  if (Array.isArray(r2)) return r2 as Array<Record<string, string | number>>;
  // 케이스 3: 단순 배열
  const r3 = root.items;
  if (Array.isArray(r3)) return r3 as Array<Record<string, string | number>>;
  return [];
}

function normalizeAgeGroup(raw: string): string | null {
  if (!raw) return null;
  const s = String(raw).replace(/\s/g, "");
  // "0~9세", "10대", "10-19", "10~19세" 등
  const m = s.match(/(\d+)\s*[~\-에서]?\s*(\d+)?/);
  if (!m) return null;
  const lo = Number(m[1]);
  if (lo >= 80) return "80+";
  const decade = Math.floor(lo / 10) * 10;
  return `${decade}-${decade + 9}`;
}

function ageOrder(group: string) {
  if (group === "80+") return 80;
  return Number(group.split("-")[0]) || 0;
}
