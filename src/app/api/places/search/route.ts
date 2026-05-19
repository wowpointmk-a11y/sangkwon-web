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
      const parts = (d.category_name || "")
        .split(">")
        .map((s) => s.trim())
        .filter(Boolean);
      const leaf = parts[parts.length - 1] || "";
      return {
        id: d.id,
        placeName: d.place_name,
        category: leaf,
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
