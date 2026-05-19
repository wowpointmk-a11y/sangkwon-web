"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runAnalyze, type AnalyzeFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AddressSearch } from "@/components/site/AddressSearch";
import { BizNameAutocomplete } from "@/components/site/BizNameAutocomplete";
import { AnalyzingOverlay } from "./AnalyzingOverlay";

const initial: AnalyzeFormState = { status: "idle" };

export function AnalyzeForm() {
  const [state, action, pending] = useActionState(runAnalyze, initial);
  const [bizName, setBizName] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success("분석이 완료되었습니다. 리포트로 이동합니다.");
      router.push(`/report/${state.result.analysisId}`);
    } else if (state.status === "error") {
      toast.error(`분석에 실패했습니다 — ${state.message}`);
    }
  }, [state, router]);

  return (
    <>
      <AnalyzingOverlay open={pending} />
      <form action={action} className="space-y-5">
        <BizNameAutocomplete
          value={bizName}
          onChange={setBizName}
          required
          onPick={(s) => {
            setAddress(s.address);
            if (s.category) setIndustry(s.category);
          }}
        />

        <div className="space-y-1.5">
          <Label htmlFor="bizRegNo">사업자등록번호</Label>
          <Input
            id="bizRegNo"
            name="bizRegNo"
            placeholder="예) 123-45-67890 (선택)"
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground">
            입력 시 국세청 진위확인이 자동 수행됩니다.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="industry" required>
            업종
          </Label>
          <Input
            id="industry"
            name="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="예) 한식집, 이자카야, 카페, 미용실"
            required
          />
          <p className="text-xs text-muted-foreground">
            상호명 자동완성에서 선택하면 자동으로 채워집니다.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="menu">대표 메뉴</Label>
          <Input
            id="menu"
            name="menu"
            placeholder="예) 김치찌개, 차돌박이, 아메리카노 (쉼표로 구분)"
          />
          <p className="text-xs text-muted-foreground">
            1~3개 적어주시면 네이버 키워드 추천이 훨씬 정교해집니다.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" required>
            매장 주소
          </Label>
          <AddressSearch
            value={address}
            onChange={setAddress}
            required
            placeholder="클릭해서 검색 또는 위에서 매장 선택 시 자동 채움"
          />
          <p className="text-xs text-muted-foreground">
            도로명/지번 모두 가능. 상호명 자동완성에서 매장 선택 시 자동
            채워집니다.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "분석 중… (약 10초)" : "상권 분석 시작"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          분석은 공공 API 응답 속도에 따라 최대 15초 소요될 수 있습니다.
        </p>
      </form>
    </>
  );
}
