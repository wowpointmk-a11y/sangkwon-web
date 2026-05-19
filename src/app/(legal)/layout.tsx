import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16 prose prose-sm dark:prose-invert">
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
