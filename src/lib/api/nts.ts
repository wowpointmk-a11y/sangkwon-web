// 국세청_사업자등록정보 진위확인 및 상태조회 서비스
// https://www.data.go.kr/data/15081808/openapi.do
//
// 사업자번호로 사업 상태(계속/휴업/폐업/없음) 확인.

import { env } from "../env";

const ENDPOINT =
  "https://api.odcloud.kr/api/nts-businessman/v1/status";

export interface BizStatus {
  b_no: string;
  b_stt: string; // "계속사업자" | "휴업자" | "폐업자" | "" (등록되지 않음)
  b_stt_cd: string; // "01" | "02" | "03" | ""
  tax_type: string;
  tax_type_cd: string;
  end_dt: string;
}

export async function checkBusinessStatus(
  bizRegNo: string,
): Promise<BizStatus | null> {
  const cleaned = bizRegNo.replace(/[^0-9]/g, "");
  if (cleaned.length !== 10) return null;

  const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(env.odcloudKey())}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ b_no: [cleaned] }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`국세청 API 실패: ${res.status}`);
  }
  const data = (await res.json()) as { data?: BizStatus[] };
  return data.data?.[0] ?? null;
}
