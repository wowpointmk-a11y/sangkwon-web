import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { env } from "@/lib/env";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const pw = String(formData.get("password") || "");
  if (pw !== env.adminPassword()) {
    redirect("/admin?error=1");
  }
  (await cookies()).set("admin", pw, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

async function logoutAction() {
  "use server";
  (await cookies()).delete("admin");
  redirect("/admin");
}

type Tab = "analyses" | "leads";

interface Lead {
  id: string;
  created_at: string;
  biz_name: string;
  industry: string | null;
  address: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_memo: string | null;
  analysis_id: string | null;
}

interface AnalysisRow {
  id: string;
  created_at: string;
  biz_name: string | null;
  industry: string | null;
  menu: string | null;
  address: string | null;
  lng: number | null;
  lat: number | null;
  summary: { totalStores?: number; competitorCount?: number } | null;
}

interface AnalysisGroup {
  key: string;
  bizName: string;
  industry: string;
  address: string;
  count: number;
  firstAt: string;
  lastAt: string;
  lastId: string;
  totalStores: number | null;
  convertedToLead: boolean;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: Tab }>;
}) {
  const sp = await searchParams;
  const cookie = (await cookies()).get("admin")?.value;
  const authed = cookie === env.adminPassword();

  if (!authed) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <form action={loginAction} className="w-full max-w-sm space-y-4 p-6">
          <h1 className="text-xl font-semibold">관리자 로그인</h1>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            로그인
          </button>
          {sp.error ? (
            <p className="text-xs text-destructive">비밀번호가 틀렸습니다.</p>
          ) : null}
        </form>
      </main>
    );
  }

  const activeTab: Tab = sp.tab === "leads" ? "leads" : "analyses";

  const supabase = getServiceClient();
  const [leadsRes, analysesRes] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("analyses")
      .select(
        "id, created_at, biz_name, industry, menu, address, lng, lat, summary",
      )
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const leads: Lead[] = (leadsRes.data ?? []) as Lead[];
  const analyses: AnalysisRow[] = (analysesRes.data ?? []) as AnalysisRow[];

  // 중복 분석 그루핑: biz_name + 좌표(소수점 4자리) 기준
  const leadAnalysisIds = new Set(
    leads.map((l) => l.analysis_id).filter((x): x is string => !!x),
  );
  const groupMap = new Map<string, AnalysisGroup>();
  for (const a of analyses) {
    const lng = a.lng ?? 0;
    const lat = a.lat ?? 0;
    const key = `${(a.biz_name ?? "-").trim()}|${lng.toFixed(4)}|${lat.toFixed(4)}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.count += 1;
      // 첫 등록은 더 오래된 것으로, 마지막은 더 최근 것으로
      if (a.created_at < existing.firstAt) existing.firstAt = a.created_at;
      // 우리는 desc로 가져왔으니 첫 등장이 가장 최근
      if (leadAnalysisIds.has(a.id)) existing.convertedToLead = true;
    } else {
      groupMap.set(key, {
        key,
        bizName: a.biz_name ?? "(이름 없음)",
        industry: a.industry ?? "-",
        address: a.address ?? "-",
        count: 1,
        firstAt: a.created_at,
        lastAt: a.created_at,
        lastId: a.id,
        totalStores: a.summary?.totalStores ?? null,
        convertedToLead: leadAnalysisIds.has(a.id),
      });
    }
  }
  const groups = Array.from(groupMap.values()).sort(
    (a, b) => (a.lastAt < b.lastAt ? 1 : -1),
  );

  // 대시보드 통계
  const stat = {
    totalAnalyses: analyses.length,
    uniqueMatches: groups.length,
    repeatVisitors: groups.filter((g) => g.count >= 2).length,
    leads: leads.length,
    convertedRate: groups.length
      ? Math.round(
          (groups.filter((g) => g.convertedToLead).length / groups.length) *
            100,
        )
      : 0,
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            ✱ WOW POINT · 관리자
          </h1>
          <form action={logoutAction}>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              로그아웃
            </button>
          </form>
        </div>

        {/* 상단 통계 카드 */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="누적 분석" value={formatNumber(stat.totalAnalyses)} />
          <Stat
            label="고유 매장"
            value={formatNumber(stat.uniqueMatches)}
            hint="biz·좌표 기준"
          />
          <Stat
            label="재분석 매장"
            value={formatNumber(stat.repeatVisitors)}
            hint="2회 이상"
            highlight
          />
          <Stat label="문의 수" value={formatNumber(stat.leads)} />
          <Stat label="전환율" value={`${stat.convertedRate}%`} hint="문의/매장" />
        </div>

        {/* 탭 */}
        <div className="mt-8 flex gap-1 border-b border-border">
          <TabLink
            href="/admin?tab=analyses"
            active={activeTab === "analyses"}
            label={`분석 (${stat.totalAnalyses})`}
          />
          <TabLink
            href="/admin?tab=leads"
            active={activeTab === "leads"}
            label={`문의 (${stat.leads})`}
          />
        </div>

        {activeTab === "analyses" ? (
          <AnalysisTable groups={groups} />
        ) : (
          <LeadsTable leads={leads} />
        )}
      </div>
    </main>
  );
}

function AnalysisTable({ groups }: { groups: AnalysisGroup[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr className="text-left">
            <Th>매장</Th>
            <Th>업종</Th>
            <Th>주소</Th>
            <Th className="text-center">분석횟수</Th>
            <Th>최근 분석</Th>
            <Th>반경 상가</Th>
            <Th className="text-center">문의</Th>
            <Th>리포트</Th>
          </tr>
        </thead>
        <tbody>
          {groups.length ? (
            groups.map((g) => (
              <tr key={g.key} className="border-t border-border align-top">
                <Td>
                  <div className="font-medium">{g.bizName}</div>
                </Td>
                <Td>
                  <span className="text-muted-foreground">{g.industry}</span>
                </Td>
                <Td>{g.address}</Td>
                <Td className="text-center">
                  <span
                    className={
                      "inline-flex items-center justify-center rounded-full min-w-[2rem] px-2 py-0.5 text-xs font-semibold " +
                      (g.count >= 3
                        ? "bg-destructive/15 text-destructive"
                        : g.count >= 2
                          ? "bg-foreground text-background"
                          : "border border-border")
                    }
                  >
                    {g.count}회
                  </span>
                </Td>
                <Td className="whitespace-nowrap">
                  {new Date(g.lastAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Td>
                <Td>
                  {g.totalStores !== null ? formatNumber(g.totalStores) : "-"}
                </Td>
                <Td className="text-center">
                  {g.convertedToLead ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-medium">
                      전환
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </Td>
                <Td>
                  <a
                    href={`/report/${g.lastId}`}
                    className="underline text-xs"
                    target="_blank"
                    rel="noreferrer"
                  >
                    보기
                  </a>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan={8}>
                <div className="py-12 text-center text-muted-foreground text-sm">
                  아직 분석 내역이 없습니다.
                </div>
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr className="text-left">
            <Th>접수일시</Th>
            <Th>상호 / 업종</Th>
            <Th>주소</Th>
            <Th>담당자</Th>
            <Th>연락처</Th>
            <Th>메모</Th>
            <Th>리포트</Th>
          </tr>
        </thead>
        <tbody>
          {leads.length ? (
            leads.map((l) => (
              <tr key={l.id} className="border-t border-border align-top">
                <Td className="whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                  })}
                </Td>
                <Td>
                  <div className="font-medium">{l.biz_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.industry}
                  </div>
                </Td>
                <Td>{l.address}</Td>
                <Td>{l.contact_name}</Td>
                <Td>
                  <div>{l.contact_phone}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.contact_email}
                  </div>
                </Td>
                <Td className="max-w-[240px] whitespace-pre-wrap">
                  {l.contact_memo}
                </Td>
                <Td>
                  {l.analysis_id ? (
                    <a
                      href={`/report/${l.analysis_id}`}
                      className="underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      보기
                    </a>
                  ) : (
                    "-"
                  )}
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan={7}>
                <div className="py-12 text-center text-muted-foreground text-sm">
                  아직 문의 내역이 없습니다.
                </div>
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border border-border p-4 " +
        (highlight ? "bg-foreground text-background" : "bg-background")
      }
    >
      <div
        className={
          "text-[11px] uppercase tracking-widest " +
          (highlight ? "text-background/70" : "text-muted-foreground")
        }
      >
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight">
        {value}
      </div>
      {hint ? (
        <div
          className={
            "mt-0.5 text-[11px] " +
            (highlight ? "text-background/60" : "text-muted-foreground")
          }
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px " +
        (active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </a>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-3 py-2 text-xs font-medium ${className ?? ""}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-3 py-2 ${className ?? ""}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
