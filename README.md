# 상권분석 웹

고객이 상호·업종·주소를 입력하면 공공 API로 상권 데이터를 수집·분석해 리포트를
보여주고, "마케팅 문의하기" 폼에서 자연스럽게 리드를 수집하는 웹 서비스.

## 빠른 시작

```bash
# 1) 의존성은 이미 설치되어 있습니다
npm install   # 필요 시

# 2) 환경변수 파일 만들기
cp .env.example .env.local
# .env.local 의 값을 채워주세요. 발급 방법: docs/API_KEYS.md

# 3) Supabase 스키마 적용
# Supabase Dashboard > SQL Editor 에서 supabase/schema.sql 내용을 실행

# 4) 개발 서버 시작
npm run dev
# → http://localhost:3010
```

## 라우트 구조

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 페이지 (가치제안 + CTA) |
| `/analyze` | 상호·업종·주소 입력 폼 |
| `/report/[id]` | 분석 리포트 (지표·차트·AI 인사이트·문의 폼) |
| `/admin` | 관리자 리드 조회 (비밀번호 인증) |

## 데이터 소스

| API | 용도 | 키 |
|---|---|---|
| 카카오 로컬 | 주소 → 좌표 | `KAKAO_REST_API_KEY` |
| [소상공인시장진흥공단 상가(상권)정보 API](https://www.data.go.kr/data/15012005/openapi.do) | 반경 내 업종 분포·경쟁업체 | `DATA_GO_KR_SERVICE_KEY` |
| [행정안전부 법정동별 주민등록 인구 및 세대현황](https://www.data.go.kr/data/15108071/openapi.do) | 지역 연령·성별 인구 | `DATA_GO_KR_SERVICE_KEY` |
| [국세청 사업자등록상태 (odcloud)](https://www.data.go.kr/data/15081808/openapi.do) | 사업자번호 진위확인 | `ODCLOUD_API_KEY` |
| OpenAI | 한국어 인사이트·액션 추천 | `OPENAI_API_KEY` |

## 폴더 구조

```
src/
  app/
    page.tsx                # 랜딩
    analyze/page.tsx        # 분석 입력 폼
    report/[id]/page.tsx    # 분석 리포트
    admin/page.tsx          # 관리자 리드 목록
  components/ui/            # Button, Input, Card 등 기본 UI
  lib/
    actions.ts              # Server Actions (runAnalyze, submitLead)
    analyze.ts              # 분석 파이프라인 (모든 API 조합)
    api/
      kakao.ts              # 주소 지오코딩
      sosang.ts             # 소상공인 상가 API
      population.ts         # 행안부 인구 API
      nts.ts                # 국세청 사업자 상태
      openai.ts             # AI 인사이트 생성
    notify.ts               # 슬랙/이메일 알림
    supabase.ts             # service_role 클라이언트
    env.ts                  # 환경변수 헬퍼
docs/
  API_KEYS.md               # API 키 발급 가이드
supabase/
  schema.sql                # leads, analyses 테이블 DDL
```

## 주요 흐름

```
[고객] 주소 입력
   ↓ Server Action: runAnalyze
[server] 카카오 → 좌표
[server] 소상공인 + 행안부 + 국세청 병렬 호출
[server] OpenAI 인사이트 생성
[server] Supabase analyses 캐시 저장
   ↓
[고객] /report/[id] 에서 결과 확인
   ↓ "문의하기" 클릭
[server] Server Action: submitLead
[server] Supabase leads 저장 + 슬랙/이메일 알림
[마케팅팀] /admin 에서 리드 확인 → 영업
```

## 분석 결과 캐싱

동일한 (좌표 5자리 + 반경 + 업종) 키에 대해 **7일간 캐시**합니다.
공공 API 호출 1만건/일 제한을 보호하기 위한 장치입니다.

## 배포 (Vercel)

1. GitHub에 푸시
2. https://vercel.com/new 에서 import
3. Environment Variables 에 `.env.local` 내용 복사
4. 카카오 콘솔에 운영 도메인 추가 등록

## 운영 체크리스트

- [ ] Supabase 스키마 실행 완료
- [ ] 5개 필수 API 키 발급 (`docs/API_KEYS.md`)
- [ ] 카카오 콘솔 도메인 등록 (개발: localhost, 운영: 도메인)
- [ ] 슬랙 웹훅 또는 Resend 이메일 중 1개 이상 설정
- [ ] `ADMIN_PASSWORD` 변경
- [ ] 개인정보 처리방침 / 이용약관 페이지 추가 (법적 필수)

## 다음 단계 아이디어

- 카카오맵 시각화 (반경 원 + 경쟁업체 핀)
- 매출 추정 지표 (소상공인 API 추가 활용)
- PDF 리포트 다운로드
- 카카오 알림톡 자동 발송 (가입자 대상)
- 관리자 페이지에 리드 단계(stage) 변경 UI
