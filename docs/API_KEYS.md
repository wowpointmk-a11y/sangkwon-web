# API 키 발급 가이드

서비스 운영에 필요한 키 5종 + 알림 옵션 2종.
발급 후 `.env.local` 에 채워 넣으세요.

---

## 1. Supabase (필수)

리드 DB, 분석 캐시, 어드민 대시보드용.

1. https://supabase.com 가입 (GitHub 로그인 가능)
2. **New project** → 이름 `sangkwon-analysis`, region `Northeast Asia (Seoul)`
3. DB 비밀번호 설정 → 어딘가에 따로 저장
4. 프로젝트 생성 후 **Settings → API** 이동
5. 다음 3개 값을 `.env.local` 에 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` 키 → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ 절대 노출 금지
6. **SQL Editor** → `supabase/schema.sql` 내용 복사·실행

---

## 2. 카카오 로컬 API (필수, 무료)

주소 → 좌표 변환. 일 300,000 건.

1. https://developers.kakao.com 카카오 계정으로 로그인
2. **내 애플리케이션 → 애플리케이션 추가하기**
3. 앱 이름 `상권분석`, 사업자명 입력
4. **앱 키 → REST API 키** 복사 → `KAKAO_REST_API_KEY`
5. **플랫폼 → Web 플랫폼 등록**
   - 개발 시: `http://localhost:3010`
   - 운영 시: `https://your-domain.com`

> ⚠️ 로컬 API는 별도 설정 없이 REST 키만으로 호출 가능. Web 플랫폼은 JS SDK용.

---

## 3. 공공데이터포털 (필수, 무료)

3개 API를 모두 활용신청. 도메인이 두 가지(`apis.data.go.kr` / `api.odcloud.kr`)라
**키도 2개가 될 수 있음** — 신청 페이지에서 안내된 인증키를 그대로 사용.

### 3-1. 회원가입
1. https://www.data.go.kr 가입 (실명인증 필요)

### 3-2. 활용신청 (각각 클릭 → "활용신청" 버튼)
| API | 링크 | 도메인 | 사용 변수 |
|---|---|---|---|
| 소상공인시장진흥공단 상가(상권)정보 **API** | https://www.data.go.kr/data/15012005/openapi.do | `apis.data.go.kr` | `DATA_GO_KR_SERVICE_KEY` |
| 행정안전부 법정동별(행정동 통반단위) 주민등록 인구 및 세대현황 | https://www.data.go.kr/data/15108071/openapi.do | `apis.data.go.kr` | `DATA_GO_KR_SERVICE_KEY` |
| 국세청 사업자등록정보 진위확인 및 상태조회 서비스 | https://www.data.go.kr/data/15081808/openapi.do | `api.odcloud.kr` | `ODCLOUD_API_KEY` |

> 💡 위 3개 모두 **개발계정 / 자동승인** 입니다. 활용목적은 "상권 분석 서비스" 등 자유 기재.

### 3-3. 키 복사 위치
- **앞 두 개 (apis.data.go.kr)**: 마이페이지 → 인증키 발급현황 → **일반 인증키 (Encoding)** 값을 `DATA_GO_KR_SERVICE_KEY` 에 붙여넣기
- **국세청 (api.odcloud.kr)**: 활용신청 상세 페이지 → "서비스정보" 박스의 **일반 인증키** 값을 `ODCLOUD_API_KEY` 에 붙여넣기
  - 만약 두 키가 같다면 `ODCLOUD_API_KEY` 는 비워둬도 됨 (코드가 자동으로 `DATA_GO_KR_SERVICE_KEY` 로 폴백)

> ⚠️ 활용신청 후 실제 호출은 1~2시간 이내 활성화될 수 있음. `SERVICE KEY IS NOT REGISTERED ERROR` 가 뜨면 잠시 후 재시도.

---

## 4. OpenAI (필수)

상권 데이터를 한국어 인사이트로 자동 요약. 사용량 기반 과금 (분석 1건당 약 10원~50원 예상).

1. https://platform.openai.com 가입 / 로그인
2. **결제 → 결제 수단 등록** ($5 이상 충전)
3. **API keys → Create new secret key** → `OPENAI_API_KEY`
4. 비용 관리:
   - **Settings → Limits** 에서 **Monthly budget** 설정 권장 (예: $20)
   - 사용량 알림 이메일 활성화

---

## 5. Slack Webhook (선택)

새 문의 들어왔을 때 슬랙 채널 즉시 알림.

1. https://api.slack.com/apps → **Create New App → From scratch**
2. 앱 이름 `상권분석 리드`, 워크스페이스 선택
3. **Incoming Webhooks → Activate Incoming Webhooks (On)**
4. **Add New Webhook to Workspace** → 채널 선택 (예: `#마케팅-리드`)
5. 생성된 Webhook URL 복사 → `SLACK_WEBHOOK_URL`

---

## 6. Resend 이메일 (선택)

문의 알림을 이메일로도 받고 싶을 때.

1. https://resend.com 가입 (GitHub 로그인)
2. **API Keys → Create API Key** → `RESEND_API_KEY`
3. 무료 플랜은 `onboarding@resend.dev` 발신만 가능. 자체 도메인을 쓰려면 DNS 인증 필요.
4. `.env.local`:
   ```
   RESEND_API_KEY=re_xxx
   LEAD_NOTIFY_EMAIL=marketing@chancecompany.kr
   LEAD_NOTIFY_FROM=onboarding@resend.dev
   ```

---

## 체크리스트

발급 완료되면 `.env.local` 에 아래 값이 모두 있어야 함:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `KAKAO_REST_API_KEY`
- [ ] `DATA_GO_KR_SERVICE_KEY` (apis.data.go.kr 용)
- [ ] `ODCLOUD_API_KEY` (api.odcloud.kr 용 — 위와 같으면 비워둬도 OK)
- [ ] `OPENAI_API_KEY`
- [ ] `ADMIN_PASSWORD` (임의 문자열)
- [ ] (선택) `SLACK_WEBHOOK_URL`
- [ ] (선택) `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`
