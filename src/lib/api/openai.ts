import OpenAI from "openai";
import { env } from "../env";

let _client: OpenAI | null = null;
function client() {
  if (!_client) _client = new OpenAI({ apiKey: env.openAiKey() });
  return _client;
}

export interface AiInsight {
  insight: string;
  actions: Array<{ title: string; detail: string; impact: "high" | "mid" | "low" }>;
}

export async function generateInsight(input: {
  bizName: string;
  industry: string;
  address: string;
  stats: {
    totalStores: number;
    competitorCount: number;
    topIndustries: Array<{ name: string; count: number }>;
    population: {
      total: number;
      dominantAgeGroup: string;
      malePct: number;
      femalePct: number;
      region: string;
    } | null;
  };
}): Promise<AiInsight> {
  const sys = `당신은 마케팅 회사 "와우포인트(WOW POINT)" 소속 상권분석 컨설턴트입니다.
한국의 동네 자영업자에게 보여줄 리포트의 인사이트 영역을 작성합니다.

규칙:
- 주어진 데이터만 사용. 추측·일반론·뻔한 조언 금지.
- 반드시 숫자를 2개 이상 인용해서 구체적으로.
- 톤은 신뢰감 있는 마케팅 컨설턴트. 과장·이모지 금지.
- 마지막 action 1개는 "와우포인트의 마케팅 실행 서비스(인스타·네이버·로컬광고·콘텐츠)와 자연스럽게 연결"되도록 작성.

출력은 반드시 아래 JSON 스키마:
{
  "insight": "3~4문장의 한국어 핵심 요약. 가장 눈에 띄는 데이터 2개를 짚고, 사장님 관점에서 무슨 의미인지 해석.",
  "actions": [
    { "title": "한 줄짜리 액션 제목", "detail": "왜·어떻게 한 문장으로 (숫자 인용)", "impact": "high|mid|low" }
  ]
}
actions 는 정확히 3개. (1) 즉시 실행 가능한 매장 운영/메뉴 액션, (2) 데이터 기반 마케팅 액션, (3) 와우포인트와 함께하면 더 잘할 수 있는 액션.`;

  const user = JSON.stringify(input, null, 2);

  const res = await client().chat.completions.create({
    model: env.openAiModel(),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(text) as AiInsight;
    if (!parsed.insight || !Array.isArray(parsed.actions)) {
      throw new Error("invalid shape");
    }
    return parsed;
  } catch {
    return {
      insight: text || "AI 인사이트 생성에 실패했습니다.",
      actions: [],
    };
  }
}
