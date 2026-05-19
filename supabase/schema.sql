-- ================================================================
-- 상권분석 웹 - Supabase Schema (v2)
-- Supabase Dashboard > SQL Editor 에서 이 파일 내용을 그대로 실행
-- 이미 v1 실행하셨으면 끝부분의 마이그레이션 블록만 실행해도 됩니다.
-- ================================================================

-- 1) leads : 고객 입력 + 문의 (마케팅 영업 대상)
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- 입력폼
  biz_name        text not null,
  biz_reg_no      text,
  biz_status      text,
  industry        text,
  menu            text,
  address         text not null,
  road_address    text,
  lng             double precision,
  lat             double precision,

  -- 문의자 정보
  contact_name    text,
  contact_phone   text,
  contact_email   text,
  contact_memo    text,
  consent_pii     boolean default false,
  consent_marketing boolean default false,

  -- 상태
  source          text default 'web',
  stage           text default 'new',
  analysis_id     uuid
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_stage_idx on public.leads (stage);

-- 2) analyses : 분석 결과 캐시 + AI 마케팅 자산
create table if not exists public.analyses (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  biz_name        text,
  industry        text,
  menu            text,
  address         text,
  lng             double precision,
  lat             double precision,
  radius_m        integer default 2000,

  raw_stores      jsonb,
  raw_population  jsonb,
  raw_biz_status  jsonb,

  summary         jsonb,

  -- AI 마케팅 자산
  ai_insight      text,
  ai_target       text,      -- 타겟 지정 (예: "30대 직장인 점심·회식")
  ai_hook         text,      -- 후킹 멘트
  ai_keywords     jsonb,     -- [{ keyword, intent, priority }]  네이버 SEO 5종
  ai_platforms    jsonb,     -- [{ name, score, reason }]
  ai_actions      jsonb,

  cache_key       text unique
);

create index if not exists analyses_cache_key_idx on public.analyses (cache_key);
create index if not exists analyses_created_at_idx on public.analyses (created_at desc);

alter table public.leads enable row level security;
alter table public.analyses enable row level security;

-- ================================================================
-- v1 → v2 마이그레이션 블록 (이미 v1 만들어 둔 분만 실행)
-- ================================================================
alter table public.leads
  add column if not exists menu text;

alter table public.analyses
  add column if not exists menu text,
  add column if not exists ai_target text,
  add column if not exists ai_hook text,
  add column if not exists ai_keywords jsonb,
  add column if not exists ai_platforms jsonb;
