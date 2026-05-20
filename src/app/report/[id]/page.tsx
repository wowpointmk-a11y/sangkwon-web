import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { Card, CardTitle, CardDescription, Stat } from "@/components/ui/card";
import { formatNumber, formatPercent, formatRadius } from "@/lib/utils";
import { LeadForm } from "./LeadForm";
import { IndustryChart, AgeChart } from "./Charts";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { brand } from "@/lib/brand";

type Params = { id: string };

export default async function ReportPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const supabase = getServiceClient();
  const { data: row } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const summary = row.summary ?? {};
  const pop = row.raw_population;
  const bizStatus = row.raw_biz_status;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/analyze"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 새로 분석하기
        </Link>

        <header className="mt-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              <span aria-hidden>✱</span>
              <span>{brand.name} · MARKET REPORT</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {row.biz_name}{" "}
              <span className="text-muted-foreground text-xl">
                · {row.industry}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">{row.address}</p>
          </div>
          {bizStatus?.b_stt ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
              사업자 상태: <b>{bizStatus.b_stt}</b>
            </span>
          ) : null}
        </header>

        {/* AI 인사이트 + 타겟 + 후킹 */}
        <section className="mt-10 space-y-4">
          <Card className="bg-muted">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              ✱ WOW POINT · 한 줄 진단
            </div>
            <p className="mt-3 text-base leading-relaxed whitespace-pre-line">
              {row.ai_insight ?? "인사이트 생성 결과가 없습니다."}
            </p>
          </Card>

          {(row.ai_target || row.ai_hook) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {row.ai_target && (
                <Card>
                  <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    🎯 추천 타겟
                  </div>
                  <p className="mt-3 text-lg font-semibold tracking-tight">
                    {row.ai_target}
                  </p>
                </Card>
              )}
              {row.ai_hook && (
                <Card>
                  <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    🪝 후킹 멘트
                  </div>
                  <p className="mt-3 text-lg font-semibold tracking-tight leading-snug">
                    &ldquo;{row.ai_hook}&rdquo;
                  </p>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* 네이버 대표 키워드 5가지 */}
        {Array.isArray(row.ai_keywords) && row.ai_keywords.length > 0 && (
          <section className="mt-8">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold">
                🔑 네이버 대표 키워드 5가지
              </h2>
              <span className="text-xs text-muted-foreground">
                네이버 검색은 단어 덩어리를 인식합니다
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {row.ai_keywords.map(
                (
                  k: {
                    keyword: string;
                    intent: string;
                    priority: string;
                  },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background p-4 flex items-start gap-3"
                  >
                    <div className="text-2xl font-semibold text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold tracking-tight break-keep">
                        {k.keyword}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] rounded border border-border px-1.5 py-0.5 text-muted-foreground">
                          {k.intent}
                        </span>
                        <span
                          className={
                            "text-[11px] rounded px-1.5 py-0.5 " +
                            (k.priority === "high"
                              ? "bg-foreground text-background"
                              : "border border-border text-muted-foreground")
                          }
                        >
                          우선순위 {k.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* 추천 플랫폼 */}
        {Array.isArray(row.ai_platforms) && row.ai_platforms.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">📱 추천 마케팅 플랫폼</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              매장 특성·타겟·지역에 맞춰 우선순위 매김
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {row.ai_platforms.map(
                (
                  p: { name: string; score: string; reason: string },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold tracking-tight">
                        {p.name}
                      </div>
                      <span
                        className={
                          "text-[11px] rounded px-1.5 py-0.5 " +
                          (p.score === "high"
                            ? "bg-foreground text-background"
                            : p.score === "mid"
                              ? "border border-border"
                              : "text-muted-foreground")
                        }
                      >
                        {p.score}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {p.reason}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* 실행 액션 3가지 */}
        {Array.isArray(row.ai_actions) && row.ai_actions.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">⚡ 다음 액션 3가지</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {row.ai_actions.map(
                (
                  a: { title: string; detail: string; impact: string },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        액션 {i + 1}
                      </span>
                      <span
                        className={
                          "text-[10px] rounded px-1.5 py-0.5 " +
                          (a.impact === "high"
                            ? "bg-foreground text-background"
                            : "border border-border")
                        }
                      >
                        {a.impact}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold">{a.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {a.detail}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* 주요 지표 */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">주요 지표</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              label={`반경 ${formatRadius(summary.radiusM ?? 2000)} 내 상가`}
              value={formatNumber(summary.totalStores)}
              hint="공공 상가 DB 기준"
            />
            <Stat
              label="동일 업종 경쟁업체"
              value={formatNumber(summary.competitorCount)}
              hint={`업종: ${row.industry}`}
            />
            <Stat
              label="반경 2km 인구"
              value={pop ? formatNumber(pop.totalPopulation) : "-"}
              hint={pop?.regionName}
            />
            <Stat
              label="주력 연령대"
              value={pop?.dominantAgeGroup ?? "-"}
              hint={
                pop
                  ? `남 ${formatPercent(pop.malePct)} / 여 ${formatPercent(pop.femalePct)}`
                  : undefined
              }
            />
          </div>
        </section>

        {/* 차트 */}
        <section className="mt-10 grid lg:grid-cols-2 gap-4">
          <Card>
            <CardTitle>주변 업종 분포 TOP 8</CardTitle>
            <CardDescription>반경 내 상가들의 업종 분포</CardDescription>
            <div className="mt-4 h-72">
              <IndustryChart
                data={(summary.topIndustries ?? []).slice(0, 8)}
              />
            </div>
          </Card>
          <Card>
            <CardTitle>연령대별 인구</CardTitle>
            <CardDescription>
              반경 2km · {pop?.regionName ?? "권역"} 주민등록 인구
            </CardDescription>
            <div className="mt-4 h-72">
              {pop ? (
                <AgeChart data={pop.byAge} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  인구 데이터를 가져오지 못했습니다.
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* CTA - 문의 폼 */}
        <section className="mt-12">
          <Card className="bg-foreground text-background">
            <div className="text-xs font-medium tracking-widest text-background/60 uppercase">
              ✱ {brand.name} · NEXT STEP
            </div>
            <CardTitle className="text-background mt-3 text-xl">
              이 데이터로 실제 매출까지 만들고 싶으신가요?
            </CardTitle>
            <CardDescription className="text-background/70">
              와우포인트 마케팅팀이 위 데이터를 토대로 인스타·네이버·로컬
              광고 실행안을 무료 컨설팅해드립니다. 영업일 24시간 내 연락드려요.
            </CardDescription>
            <div className="mt-6">
              <LeadForm
                defaults={{
                  analysisId: row.id,
                  bizName: row.biz_name,
                  industry: row.industry,
                  address: row.address,
                }}
              />
            </div>
          </Card>
        </section>
      </div>
      </main>
      <SiteFooter />
    </>
  );
}
