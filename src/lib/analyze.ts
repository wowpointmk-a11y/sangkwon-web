// 상권분석 통합 파이프라인
// 1) 주소→좌표
// 2) 사업자번호 진위확인
// 3) 반경 내 상가 조회
// 4) 행정구역 인구 조회
// 5) OpenAI 인사이트 + 키워드 + 플랫폼 추천
// 6) 결과 캐싱 + 반환

import { geocodeAddress, reverseGeocode } from "./api/kakao";
import {
  storesInRadius,
  tallyByIndustry,
  countCompetitors,
} from "./api/sosang";
import { populationByRadius, populationByRegion } from "./api/population";
import { checkBusinessStatus } from "./api/nts";
import { generateInsight, type AiInsight } from "./api/openai";
import { getServiceClient } from "./supabase";

export interface AnalyzeInput {
  bizName: string;
  bizRegNo?: string;
  industry: string;
  menu?: string;
  address: string;
  radiusM?: number;
}

export interface AnalyzeResult {
  analysisId: string;
  location: {
    address: string;
    roadAddress: string | null;
    lng: number;
    lat: number;
    region: string;
  };
  bizStatus: {
    code: string;
    label: string;
  } | null;
  summary: {
    totalStores: number;
    competitorCount: number;
    topIndustries: Array<{ name: string; count: number }>;
    radiusM: number;
  };
  population: {
    region: string;
    total: number;
    dominantAgeGroup: string;
    malePct: number;
    femalePct: number;
    byAge: Array<{ ageGroup: string; male: number; female: number; total: number }>;
  } | null;
  ai: AiInsight;
}

export async function analyze(input: AnalyzeInput): Promise<AnalyzeResult> {
  const radiusM = input.radiusM ?? 2000;

  const geo = await geocodeAddress(input.address);
  if (!geo) {
    throw new Error("주소를 좌표로 변환하지 못했습니다. 더 정확한 주소를 입력해주세요.");
  }

  // 캐시는 메뉴까지 키에 포함 (메뉴 다르면 키워드가 달라야 함)
  const cacheKey = `${geo.lng.toFixed(5)}|${geo.lat.toFixed(5)}|${radiusM}|${input.industry}|${input.menu ?? ""}`;
  const supabase = getServiceClient();
  const { data: cached } = await supabase
    .from("analyses")
    .select("*")
    .eq("cache_key", cacheKey)
    .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())
    .maybeSingle();

  if (cached) {
    return hydrateFromCache(cached);
  }

  const [bizStatusRes, storesRes, regionRes] = await Promise.allSettled([
    input.bizRegNo ? checkBusinessStatus(input.bizRegNo) : Promise.resolve(null),
    storesInRadius({ lng: geo.lng, lat: geo.lat, radius: radiusM, numOfRows: 1000 }),
    reverseGeocode(geo.lng, geo.lat),
  ]);

  const bizStatusRaw =
    bizStatusRes.status === "fulfilled" ? bizStatusRes.value : null;
  const storesData =
    storesRes.status === "fulfilled" ? storesRes.value : { items: [], totalCount: 0 };
  const region = regionRes.status === "fulfilled" ? regionRes.value : null;

  // 반경 2km 안에 포함되는 모든 행정동의 인구 합산
  const population = await populationByRadius({
    lng: geo.lng,
    lat: geo.lat,
    radiusM,
    reverseGeocode,
  }).catch(() => null);

  const topIndustries = tallyByIndustry(storesData.items).slice(0, 10);
  const competitorCount = countCompetitors(storesData.items, input.industry);

  const ai = await generateInsight({
    bizName: input.bizName,
    industry: input.industry,
    menu: input.menu,
    address: geo.address,
    region: {
      sido: geo.region_1depth,
      sgg: geo.region_2depth,
      dong: geo.region_3depth,
    },
    stats: {
      totalStores: storesData.totalCount || storesData.items.length,
      competitorCount,
      topIndustries: topIndustries.slice(0, 5),
      population: population
        ? {
            total: population.totalPopulation,
            dominantAgeGroup: population.dominantAgeGroup,
            malePct: population.malePct,
            femalePct: population.femalePct,
            region: population.regionName,
          }
        : null,
    },
  }).catch((e) => {
    console.error("OpenAI 인사이트 생성 실패:", e);
    return {
      insight: "AI 인사이트 생성에 실패했습니다.",
      target: "",
      hook: "",
      keywords: [],
      platforms: [],
      actions: [],
    };
  });

  const summary = {
    totalStores: storesData.totalCount || storesData.items.length,
    competitorCount,
    topIndustries,
    radiusM,
  };

  const { data: inserted, error } = await supabase
    .from("analyses")
    .insert({
      biz_name: input.bizName,
      industry: input.industry,
      menu: input.menu,
      address: geo.address,
      lng: geo.lng,
      lat: geo.lat,
      radius_m: radiusM,
      raw_stores: storesData.items,
      raw_population: population,
      raw_biz_status: bizStatusRaw,
      summary,
      ai_insight: ai.insight,
      ai_target: ai.target,
      ai_hook: ai.hook,
      ai_keywords: ai.keywords,
      ai_platforms: ai.platforms,
      ai_actions: ai.actions,
      cache_key: cacheKey,
    })
    .select("id")
    .single();

  if (error) throw error;

  return {
    analysisId: inserted.id,
    location: {
      address: geo.address,
      roadAddress: geo.road_address,
      lng: geo.lng,
      lat: geo.lat,
      region: `${geo.region_1depth} ${geo.region_2depth} ${geo.region_3depth}`.trim(),
    },
    bizStatus: bizStatusRaw
      ? { code: bizStatusRaw.b_stt_cd, label: bizStatusRaw.b_stt || "확인 불가" }
      : null,
    summary,
    population: population
      ? {
          region: population.regionName,
          total: population.totalPopulation,
          dominantAgeGroup: population.dominantAgeGroup,
          malePct: population.malePct,
          femalePct: population.femalePct,
          byAge: population.byAge,
        }
      : null,
    ai,
  };
}

function hydrateFromCache(row: {
  id: string;
  address: string;
  lng: number;
  lat: number;
  summary: AnalyzeResult["summary"];
  raw_population: ReturnType<typeof populationByRegion> extends Promise<infer R> ? R : null;
  raw_biz_status: { b_stt_cd: string; b_stt: string } | null;
  ai_insight: string;
  ai_target: string | null;
  ai_hook: string | null;
  ai_keywords: AiInsight["keywords"] | null;
  ai_platforms: AiInsight["platforms"] | null;
  ai_actions: AiInsight["actions"] | null;
}): AnalyzeResult {
  const pop = row.raw_population;
  return {
    analysisId: row.id,
    location: {
      address: row.address,
      roadAddress: null,
      lng: row.lng,
      lat: row.lat,
      region: pop?.regionName ?? "",
    },
    bizStatus: row.raw_biz_status
      ? { code: row.raw_biz_status.b_stt_cd, label: row.raw_biz_status.b_stt }
      : null,
    summary: row.summary,
    population: pop
      ? {
          region: pop.regionName,
          total: pop.totalPopulation,
          dominantAgeGroup: pop.dominantAgeGroup,
          malePct: pop.malePct,
          femalePct: pop.femalePct,
          byAge: pop.byAge,
        }
      : null,
    ai: {
      insight: row.ai_insight,
      target: row.ai_target ?? "",
      hook: row.ai_hook ?? "",
      keywords: row.ai_keywords ?? [],
      platforms: row.ai_platforms ?? [],
      actions: row.ai_actions ?? [],
    },
  };
}
