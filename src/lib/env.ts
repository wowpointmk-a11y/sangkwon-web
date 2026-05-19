function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(
      `환경변수 ${key} 가 설정되지 않았습니다. .env.local 을 확인하세요.`,
    );
  }
  return v;
}

function optionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  supabaseUrl: () => requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: () => requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  kakaoKey: () => requireEnv("KAKAO_REST_API_KEY"),

  // 공공데이터포털 - apis.data.go.kr 도메인 (소상공인 상가, 행안부 인구)
  // 마이페이지 > 인증키 발급현황의 일반 인증키(Encoding) 사용
  dataGoKrKey: () => requireEnv("DATA_GO_KR_SERVICE_KEY"),

  // 공공데이터포털 - api.odcloud.kr 도메인 (국세청 사업자 진위확인)
  // 해당 API 활용신청 시 받는 별도 인증키
  // 없으면 dataGoKrKey 로 폴백(같은 키일 수도 있음)
  odcloudKey: () =>
    process.env.ODCLOUD_API_KEY ||
    process.env.NTS_BUSINESS_STATUS_KEY ||
    requireEnv("DATA_GO_KR_SERVICE_KEY"),

  openAiKey: () => requireEnv("OPENAI_API_KEY"),
  openAiModel: () => process.env.OPENAI_MODEL || "gpt-5.5",
  adminPassword: () => requireEnv("ADMIN_PASSWORD"),
  slackWebhook: () => optionalEnv("SLACK_WEBHOOK_URL"),
  resendKey: () => optionalEnv("RESEND_API_KEY"),
  leadNotifyEmail: () => optionalEnv("LEAD_NOTIFY_EMAIL"),
  leadNotifyFrom: () =>
    process.env.LEAD_NOTIFY_FROM || "onboarding@resend.dev",
};
