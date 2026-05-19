"use client";

import { useEffect, useState } from "react";
import { Input, Label } from "@/components/ui/input";

type Status =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "active"; label: string; taxType: string | null }
  | { state: "suspended"; label: string }
  | { state: "closed"; label: string }
  | { state: "not_found" }
  | { state: "format_error" }
  | { state: "api_error"; message: string };

function format(raw: string) {
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function BizRegNoInput() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length === 0) {
      setStatus({ state: "idle" });
      return;
    }
    if (digits.length < 10) {
      setStatus({ state: "format_error" });
      return;
    }
    // 10자리 모이면 즉시 검증
    setStatus({ state: "checking" });
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/biz-status/check?b_no=${digits}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then(
          (d: {
            ok?: boolean;
            stage?: string;
            label?: string;
            taxType?: string | null;
            reason?: string;
            message?: string;
          }) => {
            if (d.stage === "active") {
              setStatus({
                state: "active",
                label: d.label || "계속사업자",
                taxType: d.taxType ?? null,
              });
            } else if (d.stage === "suspended") {
              setStatus({ state: "suspended", label: d.label || "휴업자" });
            } else if (d.stage === "closed") {
              setStatus({ state: "closed", label: d.label || "폐업자" });
            } else if (d.reason === "not_found") {
              setStatus({ state: "not_found" });
            } else {
              setStatus({
                state: "api_error",
                message: d.message || "확인 실패",
              });
            }
          },
        )
        .catch(() => setStatus({ state: "api_error", message: "확인 실패" }));
    }, 300);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="bizRegNo">사업자등록번호</Label>
      <Input
        id="bizRegNo"
        name="bizRegNo"
        value={value}
        onChange={(e) => setValue(format(e.target.value))}
        placeholder="예) 123-45-67890 (선택)"
        inputMode="numeric"
        maxLength={12}
      />
      <StatusLine status={status} />
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  switch (status.state) {
    case "idle":
      return (
        <p className="text-xs text-muted-foreground">
          10자리 입력 시 국세청 진위확인이 자동 수행됩니다.
        </p>
      );
    case "format_error":
      return (
        <p className="text-xs text-muted-foreground">
          10자리 숫자를 모두 입력해주세요.
        </p>
      );
    case "checking":
      return (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Spinner /> 국세청에 확인 중…
        </p>
      );
    case "active":
      return (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          ✓ 계속사업자 확인됨
          {status.taxType ? ` · ${status.taxType}` : ""}
        </p>
      );
    case "suspended":
      return (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          ⚠️ 휴업자 — 영업 중이 맞는지 확인 필요
        </p>
      );
    case "closed":
      return (
        <p className="text-xs text-destructive font-medium">
          ✕ 폐업자 — 등록 정보를 다시 확인해주세요
        </p>
      );
    case "not_found":
      return (
        <p className="text-xs text-destructive font-medium">
          ✕ 국세청에 등록되지 않은 번호입니다
        </p>
      );
    case "api_error":
      return (
        <p className="text-xs text-muted-foreground">
          국세청 확인 실패: {status.message} (분석은 계속 가능합니다)
        </p>
      );
  }
}

function Spinner() {
  return (
    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12C22 6.477 17.523 2 12 2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
