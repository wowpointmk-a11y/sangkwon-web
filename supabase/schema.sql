-- ================================================================
-- 상권분석 웹 - Supabase Schema
-- Supabase Dashboard > SQL Editor 에서 이 파일 내용을 그대로 실행
-- ================================================================

-- 1) leads : 고객이 입력한 사업자 정보 + 문의 (마케팅 영업 대상)
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- 입력폼
  biz_name        text not null,
  biz_reg_no      text,
  biz_status      text,           -- 국세청 진위확인 결과 (계속사업자/휴업/폐업/없음)
  industry        text,
  address         text not null,
  road_address    text,
  lng             double precision,
  lat             double precision,

  -- 문의자 정보
  contact_name    text,
  contact_phone   text,
  contact_email   text,
  contact_memo    text,
  consent_pii     boolean default false,    -- 개인정보 수집 동의
  consent_marketing boolean default false,  -- 마케팅 활용 동의

  -- 상태
  source          text default 'web',
  stage           text default 'new',       -- new | contacted | qualified | won | lost
  analysis_id     uuid                       -- 어떤 분석 보고 문의했는지
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_stage_idx on public.leads (stage);

-- 2) analyses : 분석 결과 캐시 (좌표 기준)
--   동일 좌표/업종 요청 재호출 시 공공 API 호출 절감용
create table if not exists public.analyses (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  biz_name        text,
  industry        text,
  address         text,
  lng             double precision,
  lat             double precision,
  radius_m        integer default 500,

  -- 외부 API 원본 응답 (디버깅·재계산용)
  raw_stores      jsonb,    -- 소상공인 상가
  raw_population  jsonb,    -- 행안부 인구
  raw_biz_status  jsonb,    -- 국세청 진위확인

  -- 계산된 지표
  summary         jsonb,    -- { total_stores, competitor_count, dominant_industry, ... }

  -- AI 인사이트
  ai_insight      text,
  ai_actions      jsonb,    -- [{ title, detail, impact }]

  cache_key       text unique  -- "{lng}|{lat}|{radius}|{industry}" 형태
);

create index if not exists analyses_cache_key_idx on public.analyses (cache_key);
create index if not exists analyses_created_at_idx on public.analyses (created_at desc);

-- 3) RLS : 외부에서 직접 읽기 차단. 모든 접근은 service_role 키로만.
alter table public.leads enable row level security;
alter table public.analyses enable row level security;

-- anon/authenticated 역할에는 어떤 정책도 부여하지 않음 → 기본 차단
-- 서버 라우트에서 SUPABASE_SERVICE_ROLE_KEY 로 접근 (RLS 우회)

-- 4) 알림용 트리거 (옵션) - pg_net 으로 Slack webhook 호출
-- pg_net extension 활성화 후 사용. 지금은 서버 액션에서 webhook 호출하므로 미사용.

-- ================================================================
-- 끝. Dashboard > Table Editor 에서 leads/analyses 가 생성됐는지 확인.
-- ================================================================
