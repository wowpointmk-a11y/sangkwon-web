import { NextResponse } from "next/server";
import { checkBusinessStatus } from "@/lib/api/nts";

// 사업자번호 진위확인 프록시 — 클라이언트가 실시간 검증할 수 있도록.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("b_no") || "").replace(/[^0-9]/g, "");
  if (raw.length !== 10) {
    return NextResponse.json(
      { ok: false, reason: "format", message: "10자리 숫자가 필요합니다" },
      { status: 200 },
    );
  }

  try {
    const result = await checkBusinessStatus(raw);
    if (!result || !result.b_stt_cd) {
      return NextResponse.json({
        ok: false,
        reason: "not_found",
        message: "국세청에 등록되지 않은 번호입니다",
      });
    }
    // b_stt_cd: 01=계속사업자, 02=휴업자, 03=폐업자, "" 또는 없음=미등록
    const stage =
      result.b_stt_cd === "01"
        ? "active"
        : result.b_stt_cd === "02"
          ? "suspended"
          : result.b_stt_cd === "03"
            ? "closed"
            : "unknown";

    return NextResponse.json({
      ok: stage === "active",
      stage,
      label: result.b_stt || "확인 불가",
      taxType: result.tax_type || null,
    });
  } catch (e) {
    console.error("biz-status/check error:", e);
    return NextResponse.json(
      {
        ok: false,
        reason: "api_error",
        message: "국세청 API 호출에 실패했습니다",
      },
      { status: 200 },
    );
  }
}
