"use server";

import { z } from "zod";
import { analyze, type AnalyzeResult } from "./analyze";
import { getServiceClient } from "./supabase";
import { notifyNewLead } from "./notify";
import { headers } from "next/headers";

const analyzeSchema = z.object({
  bizName: z.string().min(1, "상호명을 입력해주세요"),
  bizRegNo: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/[^0-9]/g, "") : v))
    .refine((v) => !v || v.length === 10, "사업자번호는 10자리 숫자여야 합니다"),
  industry: z.string().min(1, "업종을 입력해주세요"),
  menu: z.string().optional(),
  address: z.string().min(2, "주소를 입력해주세요"),
});

export type AnalyzeFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; result: AnalyzeResult };

export async function runAnalyze(
  _prev: AnalyzeFormState,
  formData: FormData,
): Promise<AnalyzeFormState> {
  const parsed = analyzeSchema.safeParse({
    bizName: formData.get("bizName"),
    bizRegNo: formData.get("bizRegNo") || undefined,
    industry: formData.get("industry"),
    menu: formData.get("menu") || undefined,
    address: formData.get("address"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const result = await analyze(parsed.data);
    return { status: "success", result };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "분석에 실패했습니다.",
    };
  }
}

const leadSchema = z.object({
  analysisId: z.string().uuid().optional(),
  bizName: z.string().min(1),
  bizRegNo: z.string().optional(),
  industry: z.string().optional(),
  address: z.string().min(1),
  contactName: z.string().min(1, "이름을 입력해주세요"),
  contactPhone: z.string().min(9, "연락처를 입력해주세요"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  memo: z.string().optional(),
  consentPii: z.string().optional(), // checkbox "on"
  consentMarketing: z.string().optional(),
});

export type LeadFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const data = parsed.data;

  if (!data.consentPii) {
    return { status: "error", message: "개인정보 수집·이용에 동의해주세요." };
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from("leads").insert({
      analysis_id: data.analysisId ?? null,
      biz_name: data.bizName,
      biz_reg_no: data.bizRegNo,
      industry: data.industry,
      address: data.address,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail || null,
      contact_memo: data.memo || null,
      consent_pii: !!data.consentPii,
      consent_marketing: !!data.consentMarketing,
    });
    if (error) throw error;

    const host = (await headers()).get("host");
    const analysisUrl =
      data.analysisId && host
        ? `https://${host}/report/${data.analysisId}`
        : undefined;

    await notifyNewLead({
      bizName: data.bizName,
      industry: data.industry,
      address: data.address,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || undefined,
      memo: data.memo,
      analysisUrl,
    }).catch((e) => console.error("notify failed:", e));

    return { status: "success" };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "문의 접수에 실패했습니다.",
    };
  }
}
