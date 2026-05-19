import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span aria-hidden>✱</span>
          <span>{brand.name}</span>
          <span className="text-muted-foreground font-normal">
            상권분석
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-xs text-muted-foreground">
          <a
            href={brand.company.site}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            와우포인트 메인
          </a>
          <Link href="/analyze" className="hover:text-foreground">
            분석 시작
          </Link>
        </nav>
      </div>
    </header>
  );
}
