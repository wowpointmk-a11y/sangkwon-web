import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { brand } from "@/lib/brand";
import { getServiceClient } from "@/lib/supabase";
import {
  formatNumber,
  maskAddress,
  maskBizName,
} from "@/lib/utils";

// 5분마다 랜딩 페이지를 ISR 재생성 (최신 분석 반영)
export const revalidate = 300;

type SampleData = {
  bizName: string;
  industry: string;
  address: string;
  totalStores: number;
  competitorCount: number;
  population: number | null;
  dominantAgeGroup: string | null;
  insight: string | null;
};

async function fetchLatestSample(): Promise<SampleData | null> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("analyses")
      .select("biz_name, industry, address, summary, raw_population, ai_insight")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!data) return null;

    // totalStores 가 0인 (실패) 분석은 거름
    const good = data.find(
      (r) =>
        r.biz_name &&
        r.summary &&
        typeof r.summary?.totalStores === "number" &&
        r.summary.totalStores > 0,
    );
    if (!good) return null;

    const pop = good.raw_population as
      | { totalPopulation?: number; dominantAgeGroup?: string }
      | null;

    return {
      bizName: good.biz_name as string,
      industry: (good.industry as string) || "",
      address: (good.address as string) || "",
      totalStores: good.summary.totalStores ?? 0,
      competitorCount: good.summary.competitorCount ?? 0,
      population: pop?.totalPopulation ?? null,
      dominantAgeGroup: pop?.dominantAgeGroup ?? null,
      insight: (good.ai_insight as string) || null,
    };
  } catch (e) {
    console.error("랜딩 샘플 fetch 실패:", e);
    return null;
  }
}

const FALLBACK: SampleData = {
  bizName: "찬스카페 강남점",
  industry: "카페",
  address: "서울 강남구 테헤란로",
  totalStores: 3127,
  competitorCount: 34,
  population: 182431,
  dominantAgeGroup: "30-39",
  insight:
    "30대 직장인 비중이 높고, 반경 내 카페가 평균보다 18% 많습니다. 점심 직후 시간대를 노린 차별화 메뉴와…",
};

export default async function Home() {
  const sampleRaw = (await fetchLatestSample()) ?? FALLBACK;
  const isLive = sampleRaw !== FALLBACK;
  const sample = {
    ...sampleRaw,
    bizName: isLive ? maskBizName(sampleRaw.bizName) : sampleRaw.bizName,
    address: isLive ? maskAddress(sampleRaw.address) : sampleRaw.address,
  };
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-24">
          <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            <span aria-hidden>✱</span>
            <span>{brand.name} · MARKET INSIGHT</span>
          </div>
          <h1 className="mt-6 text-center text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
            We Partner
            <br />
            to Create{" "}
            <span className="italic text-muted-foreground">Wow.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-center text-base sm:text-lg text-muted-foreground leading-relaxed">
            상호·업종·주소만 입력하면{" "}
            <strong className="text-foreground">상권 데이터 + 타겟 + 후킹 멘트 + 네이버 키워드 5개 + 플랫폼 추천</strong>
            까지 한 번에. 무료로.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link href="/analyze">
              <Button size="lg">
                내 상권 무료 분석 시작 →
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="ghost">
                어떻게 동작하나요?
              </Button>
            </a>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            ✓ 공공 데이터 + AI 분석   ·   ✓ 네이버 SEO 키워드 5종
            ·   ✓ 플랫폼별 우선순위
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                How it works
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
                3단계로 끝나는 상권 분석
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <div className="text-3xl font-semibold tracking-tight text-muted-foreground">
                  01
                </div>
                <CardTitle className="mt-4">정보 입력</CardTitle>
                <CardDescription>
                  상호·업종·주소·사업자번호(선택). 30초면 끝나요.
                </CardDescription>
              </Card>
              <Card>
                <div className="text-3xl font-semibold tracking-tight text-muted-foreground">
                  02
                </div>
                <CardTitle className="mt-4">공공 데이터 수집</CardTitle>
                <CardDescription>
                  소상공인시장진흥공단·행정안전부·국세청 API를 동시에
                  호출합니다.
                </CardDescription>
              </Card>
              <Card>
                <div className="text-3xl font-semibold tracking-tight text-muted-foreground">
                  03
                </div>
                <CardTitle className="mt-4">키워드·플랫폼·액션</CardTitle>
                <CardDescription>
                  네이버 SEO 키워드 5개, 적합 플랫폼 3~5종, 다음 액션
                  3가지를 한 번에 제안합니다.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* WHY WOW POINT */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Why ✱ {brand.name}
                </div>
                <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
                  데이터만 보지 않습니다.
                  <br />
                  <span className="text-muted-foreground">
                    실행까지 함께합니다.
                  </span>
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  분석 결과만 던지고 끝내는 곳은 많습니다. 와우포인트는
                  데이터 기반으로 실제 매장에 적용할 마케팅·운영 액션을
                  제시하고, 원하시면 직접 실행까지 도와드립니다.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  <Bullet>매장 주변 인구·연령·성별 분포 한눈에</Bullet>
                  <Bullet>반경 내 동일 업종 경쟁 강도 정량 측정</Bullet>
                  <Bullet>AI가 즉시 제안하는 우선순위 액션 3가지</Bullet>
                  <Bullet>원하면 와우포인트 실행팀이 직접 캠페인 운영</Bullet>
                </ul>
                <Link href="/analyze" className="inline-block mt-8">
                  <Button size="lg">지금 분석 시작 →</Button>
                </Link>
              </div>

              <div className="relative">
                <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{isLive ? "LIVE REPORT" : "SAMPLE REPORT"}</span>
                    {isLive && (
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] tracking-wide">
                        실제 분석 · 일부 마스킹
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    {sample.bizName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sample.industry}
                    {sample.address ? ` · ${sample.address}` : ""}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      {
                        l: "반경 2km 내 상가",
                        v: formatNumber(sample.totalStores),
                      },
                      {
                        l: "동일 업종 경쟁",
                        v: formatNumber(sample.competitorCount),
                      },
                      {
                        l: "행정구역 인구",
                        v:
                          sample.population !== null
                            ? formatNumber(sample.population)
                            : "-",
                      },
                      {
                        l: "주력 연령대",
                        v: sample.dominantAgeGroup ?? "-",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="text-[11px] text-muted-foreground">
                          {s.l}
                        </div>
                        <div className="mt-1 text-lg font-semibold tracking-tight">
                          {s.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  {sample.insight && (
                    <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                      💡 {sample.insight}
                    </div>
                  )}
                </div>
                <div
                  aria-hidden
                  className="absolute -inset-4 -z-10 rounded-3xl bg-foreground/[0.03]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-foreground text-background">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <div className="text-xs font-medium tracking-widest text-background/60 uppercase">
              Ready to grow?
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              상권 분석은 첫 걸음입니다.
              <br />
              <span className="text-background/70">
                실행은 와우포인트가 함께합니다.
              </span>
            </h2>
            <Link href="/analyze" className="inline-block mt-10">
              <Button
                size="lg"
                variant="outline"
                className="bg-background text-foreground border-background hover:opacity-90"
              >
                무료 분석 받기 →
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-block size-1.5 rounded-full bg-foreground shrink-0" />
      <span>{children}</span>
    </li>
  );
}
