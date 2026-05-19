import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { env } from "@/lib/env";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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

  const supabase = getServiceClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">리드 관리</h1>
          <form action={logoutAction}>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              로그아웃
            </button>
          </form>
        </div>

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
              {leads?.length ? (
                leads.map((l) => (
                  <tr key={l.id} className="border-t border-border align-top">
                    <Td>
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
      </div>
    </main>
  );
}

async function logoutAction() {
  "use server";
  (await cookies()).delete("admin");
  redirect("/admin");
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-xs font-medium">{children}</th>;
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
