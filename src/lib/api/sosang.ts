// 소상공인시장진흥공단 상가(상권)정보 API
// https://www.data.go.kr/data/15083033/openapi.do
//
// 가장 자주 쓰는 오퍼레이션:
//  - storeListInRadius : 반경 내 상가 목록 (현 서비스의 핵심)
//
// 좌표는 WGS84 (lng, lat).

import { env } from "../env";

const BASE = "http://apis.data.go.kr/B553077/api/open/sdsc2";

export interface Store {
  bizesNm: string; // 상호명
  bizesNo?: string; // 상가업소번호 (사업자번호 아님)
  indsLclsNm?: string; // 업종 대분류
  indsMclsNm?: string; // 중분류
  indsSclsNm?: string; // 소분류 (가장 구체적)
  ksicNm?: string;
  ctprvnNm?: string; // 시도
  signguNm?: string; // 시군구
  adongNm?: string; // 행정동
  lnoAdr?: string; // 지번주소
  rdnmAdr?: string; // 도로명주소
  lon?: string;
  lat?: string;
}

interface SosangBody {
  items?: Store[];
  totalCount?: number;
  pageNo?: number;
  numOfRows?: number;
}

interface SosangEnvelope {
  // 신규 응답 구조 (최상위 header/body)
  header?: { resultCode?: string; resultMsg?: string };
  body?: SosangBody;
  // 구 응답 구조 (response 래핑) — 호환용
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: SosangBody;
  };
}

// 반경 내 상가 조회
export async function storesInRadius(opts: {
  lng: number;
  lat: number;
  radius: number; // meters (API 공식 한도 1000, 실측 일부는 더 큰 값 허용)
  page?: number;
  numOfRows?: number;
  industryCode?: string; // 업종 코드 필터 (선택)
}): Promise<{ items: Store[]; totalCount: number }> {
  const params = new URLSearchParams({
    ServiceKey: env.dataGoKrKey(),
    type: "json",
    cx: String(opts.lng),
    cy: String(opts.lat),
    radius: String(opts.radius),
    pageNo: String(opts.page ?? 1),
    numOfRows: String(opts.numOfRows ?? 100),
  });
  if (opts.industryCode) params.set("indsLclsCd", opts.industryCode);

  const url = `${BASE}/storeListInRadius?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`소상공인 API 실패: ${res.status}`);
  }
  const data = (await res.json()) as SosangEnvelope;
  const header = data.header ?? data.response?.header;
  const body = data.body ?? data.response?.body;
  const code = header?.resultCode;
  if (code && code !== "00") {
    throw new Error(
      `소상공인 API 오류 [${code}]: ${header?.resultMsg}`,
    );
  }
  return {
    items: body?.items ?? [],
    totalCount: body?.totalCount ?? 0,
  };
}

// 업종 분포 집계 (소분류 기준)
export function tallyByIndustry(stores: Store[]) {
  const map = new Map<string, number>();
  for (const s of stores) {
    const key = s.indsSclsNm || s.indsMclsNm || s.indsLclsNm || "기타";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 동일 업종 경쟁업체 수 — 다층 분류 + 토큰 매칭으로 매칭률 향상.
// 사용자 입력 (카카오 카테고리 일부) 과 소상공인 분류 (대/중/소 + KSIC) 체계가
// 다르기 때문에 양쪽 모두 토큰화한 후 부분 매칭으로 비교.
export function countCompetitors(stores: Store[], myIndustryName: string) {
  if (!myIndustryName) return 0;
  const myTokens = tokenize(myIndustryName);
  if (myTokens.length === 0) return 0;

  return stores.filter((s) => {
    const candidateText = [
      s.indsLclsNm,
      s.indsMclsNm,
      s.indsSclsNm,
      s.ksicNm,
    ]
      .filter(Boolean)
      .join(" ");
    const candTokens = tokenize(candidateText);
    // 양방향 부분 매칭: my "돈가스" ⊃ cand "가스" 또는 my "한식" ⊂ cand "한식음식점"
    return myTokens.some((mt) =>
      candTokens.some((ct) => ct.includes(mt) || mt.includes(ct)),
    );
  }).length;
}

function tokenize(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[()/,·.]/g, " ")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}
