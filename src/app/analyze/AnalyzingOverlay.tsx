"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "주소를 좌표로 변환하는 중…",
  "반경 2km 상가 데이터를 불러오는 중…",
  "행정구역 인구 통계를 가져오는 중…",
  "사업자 정보를 확인하는 중…",
  "AI가 키워드와 플랫폼을 분석하는 중…",
  "리포트를 생성하는 중…",
];

export function AnalyzingOverlay({ open }: { open: boolean }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setStepIdx(0);
      setElapsed(0);
      return;
    }
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const step = setInterval(() => {
      setStepIdx((i) => (i + 1 < STEPS.length ? i + 1 : i));
    }, 2500);
    return () => {
      clearInterval(tick);
      clearInterval(step);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="분석 진행 중"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center">
          <Spinner />
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight">
          분석중입니다
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          잠시만 기다려주세요. 약 10~15초 소요됩니다.
        </p>

        <div className="mt-6 rounded-lg bg-muted px-4 py-3 text-left text-sm">
          <div className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5">
            현재 단계
          </div>
          <div className="font-medium">{STEPS[stepIdx]}</div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {stepIdx + 1} / {STEPS.length}
          </span>
          <span>{elapsed}초 경과</span>
        </div>

        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-12 w-12 animate-spin text-foreground"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.15"
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
