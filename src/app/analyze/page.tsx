import { AnalyzeForm } from "./AnalyzeForm";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { brand } from "@/lib/brand";
import Link from "next/link";

export const metadata = {
  title: `상권 분석 시작 — ${brand.serviceTitle}`,
};

export default function AnalyzePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 홈
          </Link>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            <span aria-hidden>✱</span>
            <span>{brand.name} · ANALYZE</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            내 가게 주변,
            <br />
            데이터로 들여다보기
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            아래 정보를 입력하시면 와우포인트가 공공 데이터와 AI를 결합해
            상권 리포트를 즉시 만들어드립니다. 입력 정보는 분석 외 목적으로
            사용되지 않으며, 문의 시에만 마케팅 담당자에게 전달됩니다.
          </p>
          <div className="mt-10">
            <AnalyzeForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
