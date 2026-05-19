import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-1.5 font-semibold tracking-tight">
            <span aria-hidden>✱</span>
            <span>{brand.name}.</span>
          </div>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {brand.taglineKo}
          </p>
          <a
            href={brand.company.site}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            와우포인트 메인 사이트 →
          </a>
        </div>

        <div>
          <div className="text-xs font-medium text-foreground">
            서비스
          </div>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link href="/analyze" className="hover:text-foreground">
                상권 분석 시작
              </Link>
            </li>
            <li>
              <a
                href={`${brand.company.site}#services`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                와우포인트 마케팅 서비스
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                개인정보 처리방침
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                이용약관
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-medium text-foreground">
            연락처
          </div>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>{brand.company.address}</li>
            <li>
              <a
                href={`tel:${brand.company.phone.replace(/-/g, "")}`}
                className="hover:text-foreground"
              >
                {brand.company.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${brand.company.email}`}
                className="hover:text-foreground"
              >
                {brand.company.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-5 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {brand.company.name}. All rights
            reserved.
          </span>
          <span>
            데이터 출처: 공공데이터포털 · 카카오 로컬 · OpenAI
          </span>
        </div>
      </div>
    </footer>
  );
}
