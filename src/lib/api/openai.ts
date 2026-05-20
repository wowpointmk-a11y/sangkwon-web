import OpenAI from "openai";
import { env } from "../env";

let _client: OpenAI | null = null;
function client() {
  if (!_client) _client = new OpenAI({ apiKey: env.openAiKey() });
  return _client;
}

export interface AiKeyword {
  keyword: string;
  intent: "롱테일정밀" | "상황+업종+메뉴" | "랜드마크" | "브로드상위" | "메뉴직접";
  priority: "high" | "mid" | "low";
}

export interface AiPlatform {
  name: string;
  score: "high" | "mid" | "low";
  reason: string;
}

export interface AiAction {
  title: string;
  detail: string;
  impact: "high" | "mid" | "low";
}

export interface AiInsight {
  insight: string;
  target: string;
  hook: string;
  keywords: AiKeyword[];
  platforms: AiPlatform[];
  actions: AiAction[];
}

export async function generateInsight(input: {
  bizName: string;
  industry: string;
  menu?: string;
  address: string;
  region: {
    sido: string; // 서울특별시
    sgg: string; // 강남구
    dong: string; // 역삼동
    landmark?: string; // "강남역" 같은 거 (있으면)
  };
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
  const sys = `당신은 마케팅 회사 "와우포인트(WOW POINT)" 소속 상권·키워드 마케팅 전략가입니다.
한국 자영업자에게 보여줄 마케팅 진단 리포트를 만듭니다.

# 규칙
- 주어진 데이터만 사용. 없는 정보는 일반론으로 메우지 말 것.
- 숫자를 반드시 2개 이상 인용해 구체적으로.
- 톤: 신뢰감 있는 컨설턴트. 이모지·과장 금지.
- 한국어 자연스럽게.

# 출력은 반드시 아래 JSON 스키마

{
  "insight": "3~4문장 핵심 요약. 가장 눈에 띄는 데이터 2개를 짚고 사장님 관점에서 무슨 의미인지 해석.",
  "target": "한 문장. 이 매장이 주력해야 할 타겟 고객. 예: '30대 직장인 점심·소규모 회식'",
  "hook": "한 문장. 매장 SNS 첫 줄/배너에 쓸 후킹 멘트. 타겟에게 꽂히도록.",
  "keywords": [
    { "keyword": "지역+상황+업종+메뉴 조합", "intent": "롱테일정밀|상황+업종+메뉴|랜드마크|브로드상위|메뉴직접", "priority": "high|mid|low" }
  ],
  "platforms": [
    { "name": "플랫폼 이름", "score": "high|mid|low", "reason": "왜 이 매장에 좋은지 한 문장" }
  ],
  "actions": [
    { "title": "한 줄 액션", "detail": "왜·어떻게 한 문장 (숫자 인용)", "impact": "high|mid|low" }
  ]
}

# keywords 작성 룰 (★ 가장 중요)
네이버는 검색어를 "덩어리(어절)"로 인식합니다. 다음 공식대로 조합하세요:

[지역: 시/구 또는 동 + (랜드마크/대학교/관공서)] + [상황: 점심/저녁/회식/모임/외식/단체/혼술/데이트/기념일] + [업종: 한식집/이자카야/고기집/카페/술집/밥집 등] + [대표메뉴]

5개를 서로 다른 검색의도(intent)로 분산:
1. 롱테일정밀: 지역+상황+업종+메뉴 (4요소 모두)  예: "역삼동 직장인 점심 한식집 김치찌개"
2. 상황+업종+메뉴: 지역은 넓게, 상황 명확  예: "강남 회식 이자카야 사케"
3. 랜드마크: 역/대학/관공서 활용  예: "강남역 근처 술집 안주맛집"
4. 브로드상위: 상위 지역+업종+메뉴 (검색량 큰 키워드)  예: "강남 고기집 추천"
5. 메뉴직접: 메뉴+지역 (메뉴로 직접 검색하는 층) 예: "역삼동 차돌박이 맛집"

빈 메뉴가 들어오면 메뉴 자리는 업종 대표메뉴를 추정해서 채우지 말고 그냥 업종으로 대체.

# platforms 작성 룰
다음 풀에서 3~5개만 추천. 매장 특성과 타겟에 맞춰 score(high/mid/low)와 한 문장 reason 작성.

[국내 지도·검색] 네이버 플레이스, 카카오맵, 구글 비즈니스 프로필
[소셜] 인스타그램, 페이스북, 유튜브 쇼츠, 틱톡
[하이퍼로컬] 당근비즈니스 (비즈프로필·동네광고·단골관리), 네이버 카페/밴드
[외국인 관광객] 트립어드바이저, 샤오홍슈(중국), 인스타그램 영문 해시태그
[예약·리뷰] 캐치테이블, 망고플레이트, 네이버 예약
[배달] 배달의민족, 쿠팡이츠 (배달 가능한 업종일 때만)

가이드:
- 강남·홍대·이태원·명동 등 외국인 비중 높은 지역 → 트립어드바이저/샤오홍슈/인스타 영문 우선
- 주택가/동네 식당/카페·미용실·세탁소 등 동네 단골 비중 높은 업종 → 네이버 플레이스 + 당근비즈니스 + 카카오맵 (당근비즈니스는 반경 1~5km 동네 노출 최강)
- 회식·접대 술집/고기집 → 네이버 플레이스 + 카카오맵 + 인스타
- 20-30대 트렌디 업종 → 인스타 + 유튜브 쇼츠 + 틱톡
- 예약 자주 받는 업종 → 캐치테이블/네이버 예약
- 분식·치킨·피자 등 배달 강한 업종 → 배민 + 쿠팡이츠

# actions: 정확히 3개
- 1) 즉시 실행 가능한 매장 운영/메뉴 액션
- 2) 데이터 기반 마케팅 액션 (위 keywords/platforms 와 연결)
- 3) 와우포인트와 함께하면 더 잘할 수 있는 액션 (자연스럽게 영업 연결)`;

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
    return {
      insight: parsed.insight ?? "",
      target: parsed.target ?? "",
      hook: parsed.hook ?? "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  } catch {
    return {
      insight: text || "AI 인사이트 생성에 실패했습니다.",
      target: "",
      hook: "",
      keywords: [],
      platforms: [],
      actions: [],
    };
  }
}
