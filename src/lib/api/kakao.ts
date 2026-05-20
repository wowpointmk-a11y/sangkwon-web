import { env } from "../env";

const KAKAO_LOCAL = "https://dapi.kakao.com/v2/local";

export interface GeocodeResult {
  address: string;
  road_address: string | null;
  lng: number;
  lat: number;
  region_1depth: string; // 시/도
  region_2depth: string; // 시/군/구
  region_3depth: string; // 동/읍/면
  bcode: string | null; // 법정동 코드 (10자리)
}

// 주소 문자열 → 좌표 (가장 우선)
export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  const url = `${KAKAO_LOCAL}/search/address.json?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${env.kakaoKey()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Kakao geocode 실패: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const doc = data.documents?.[0];
  if (!doc) return null;

  return {
    address: doc.address?.address_name || doc.address_name,
    road_address: doc.road_address?.address_name || null,
    lng: Number(doc.x),
    lat: Number(doc.y),
    region_1depth:
      doc.address?.region_1depth_name || doc.road_address?.region_1depth_name,
    region_2depth:
      doc.address?.region_2depth_name || doc.road_address?.region_2depth_name,
    region_3depth:
      doc.address?.region_3depth_name || doc.road_address?.region_3depth_name,
    bcode: doc.address?.b_code || null,
  };
}

// 좌표 → 행정구역 정보 (역지오코딩)
export async function reverseGeocode(lng: number, lat: number) {
  const url = `${KAKAO_LOCAL}/geo/coord2regioncode.json?x=${lng}&y=${lat}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${env.kakaoKey()}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  // documents[0] = 법정동, [1] = 행정동
  type KakaoRegionDoc = {
    region_type: string;
    code: string;
    region_3depth_name: string;
    region_2depth_name: string;
    region_1depth_name: string;
  };
  const docs: KakaoRegionDoc[] = data.documents ?? [];
  const b = docs.find((d) => d.region_type === "B");
  const h = docs.find((d) => d.region_type === "H");

  // populationByRadius 등에서 사용하기 쉽게 name 필드 노출
  const beob = b
    ? { ...b, name: b.region_3depth_name, code: b.code }
    : null;
  const haeng = h
    ? { ...h, name: h.region_3depth_name, code: h.code }
    : null;
  return { beob, haeng };
}
