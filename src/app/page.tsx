import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { brand } from "@/lib/brand";

export default function Home() {
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
            마케팅의 시작부터 끝까지, 와우포인트가 함께합니다.
            <br className="hidden sm:block" />
            먼저, 내 가게 주변 상권을{" "}
            <strong className="text-foreground">1분</strong> 안에
            데이터로 확인하세요.
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
            ✓ 공공 데이터 + AI 분석   ·   ✓ 분석 비용 무료
            ·   ✓ 1분 안에 리포트 도착
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
                <CardTitle className="mt-4">AI 인사이트 + 제안</CardTitle>
                <CardDescription>
                  데이터를 바탕으로 마케팅·메뉴·운영 액션 3가지를 제안합니다.
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
                  <div className="text-xs text-muted-foreground">
                    SAMPLE REPORT
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    찬스카페 강남점
                  </div>
                  <div className="text-sm text-muted-foreground">
                    카페 · 서울 강남구 테헤란로
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      { l: "반경 500m 내 상가", v: "812" },
                      { l: "동일 업종 경쟁", v: "34" },
                      { l: "행정구역 인구", v: "182,431" },
                      { l: "주력 연령대", v: "30-39" },
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
                  <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground leading-relaxed">
                    💡 30대 직장인 비중이 높고, 반경 내 카페가 평균보다
                    18% 많습니다. 점심 직후 시간대를 노린 차별화 메뉴와…
                  </div>
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
