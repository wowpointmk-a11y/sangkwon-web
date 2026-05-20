import { NextResponse } from "next/server";
import { env } from "@/lib/env";

// 카카오 키워드 검색 프록시
// 클라이언트가 카카오 키를 보지 않도록 서버 사이드에서만 호출

export interface PlaceSuggestion {
  id: string;
  placeName: string;
  category: string; // "한식, 백반/한정식" 같이 마지막 잎 부분만
  fullCategory: string; // 카카오 원본
  address: string; // 도로명 우선, 없으면 지번
  jibunAddress: string;
  roadAddress: string;
  lng: number;
  lat: number;
  phone: string | null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=10`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${env.kakaoKey()}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { suggestions: [], error: `Kakao ${res.status}` },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      documents?: Array<{
        id: string;
        place_name: string;
        category_name: string;
        address_name: string;
        road_address_name: string;
        phone: string;
        x: string;
        y: string;
      }>;
    };

    const suggestions: PlaceSuggestion[] = (data.documents ?? []).map((d) => {
      const industry = pickIndustry(d.category_name, d.place_name);
      return {
        id: d.id,
        placeName: d.place_name,
        category: industry,
        fullCategory: d.category_name || "",
        address: d.road_address_name || d.address_name,
        jibunAddress: d.address_name,
        roadAddress: d.road_address_name,
        lng: Number(d.x),
        lat: Number(d.y),
        phone: d.phone || null,
      };
    });

    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error("places/search error:", e);
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}

// 카카오 category_name 에서 매장 브랜드명을 걸러내고 매칭 풀을 넓히기 위해
// 마지막 2계층을 합쳐서 반환. 예) "음식점 > 양식 > 돈가스 > 뜨돈" + "뜨돈 금호점"
//   → "양식 돈가스" (브랜드명 '뜨돈' 제외, 상위 2계층 합침)
// 이렇게 하면 소상공인 분류 (양식/돈가스/경양식 등) 와 부분 매칭이 잘 됨.
function pickIndustry(categoryName: string, placeName: string): string {
  const parts = (categoryName || "")
    .split(">")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  const last = parts[parts.length - 1];
  const placeNorm = (placeName || "").replace(/\s/g, "");
  const lastNorm = last.replace(/\s/g, "");

  // 마지막이 매장 브랜드명이면 → parts[-3]+parts[-2]
  const brandIsLast =
    parts.length >= 2 &&
    (placeNorm.includes(lastNorm) || lastNorm.length <= 2);

  if (brandIsLast) {
    if (parts.length >= 3) return `${parts[parts.length - 3]} ${parts[parts.length - 2]}`;
    return parts[parts.length - 2];
  }
  // 일반: parts[-2] + parts[-1]
  if (parts.length >= 2) return `${parts[parts.length - 2]} ${last}`;
  return last;
}
