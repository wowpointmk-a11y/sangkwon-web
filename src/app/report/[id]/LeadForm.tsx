"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitLead, type LeadFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

const initial: LeadFormState = { status: "idle" };

interface Props {
  defaults: {
    analysisId: string;
    bizName: string;
    industry: string;
    address: string;
  };
}

export function LeadForm({ defaults }: Props) {
  const [state, action, pending] = useActionState(submitLead, initial);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("문의가 접수되었습니다. 곧 연락드리겠습니다.");
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-md border border-background/30 bg-background/10 p-4 text-sm">
        ✅ 문의가 정상 접수되었습니다. 영업일 기준 24시간 내 담당자가 연락드립니다.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="analysisId" value={defaults.analysisId} />
      <input type="hidden" name="bizName" value={defaults.bizName} />
      <input type="hidden" name="industry" value={defaults.industry} />
      <input type="hidden" name="address" value={defaults.address} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="contactName" required>
            <span className="text-background">이름</span>
          </Label>
          <Input
            id="contactName"
            name="contactName"
            placeholder="홍길동"
            className="bg-background/10 border-background/30 text-background placeholder:text-background/50"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPhone" required>
            <span className="text-background">연락처</span>
          </Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            placeholder="010-0000-0000"
            inputMode="tel"
            className="bg-background/10 border-background/30 text-background placeholder:text-background/50"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contactEmail">
          <span className="text-background">이메일 (선택)</span>
        </Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          placeholder="me@example.com"
          className="bg-background/10 border-background/30 text-background placeholder:text-background/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">
          <span className="text-background">남기실 말씀 (선택)</span>
        </Label>
        <Textarea
          id="memo"
          name="memo"
          placeholder="예) 인스타 광고 효율을 높이고 싶어요"
          className="bg-background/10 border-background/30 text-background placeholder:text-background/50"
        />
      </div>

      <div className="space-y-2 text-xs text-background/80">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="consentPii"
            required
            className="mt-0.5 accent-background"
          />
          <span>
            [필수] 개인정보 수집·이용에 동의합니다. (수집 항목: 이름, 연락처,
            이메일 / 보유 기간: 3년)
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="consentMarketing"
            className="mt-0.5 accent-background"
          />
          <span>[선택] 마케팅 정보 수신에 동의합니다.</span>
        </label>
      </div>

      <Button
        type="submit"
        variant="outline"
        className="w-full bg-background text-foreground border-background hover:opacity-90"
        size="lg"
        disabled={pending}
      >
        {pending ? "접수 중…" : "마케팅 문의하기"}
      </Button>
    </form>
  );
}
