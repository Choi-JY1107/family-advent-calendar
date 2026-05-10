-- 가족 어드벤트 캘린더 V1 스키마
-- Supabase 대시보드 → SQL Editor 에서 실행

create table if not exists calendars (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  members jsonb not null default '[]'::jsonb,
  year int not null default 2026,
  created_at timestamptz default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid references calendars(id) on delete cascade,
  member_id text not null,
  date date not null,
  question text not null,
  body text,
  image_url text,
  created_at timestamptz default now(),
  unique(calendar_id, member_id, date)
);

-- V1: RLS 미적용 (anon key로 직접 CRUD)
alter table calendars disable row level security;
alter table entries disable row level security;

-- 별도로 Storage 대시보드에서:
-- 1. 버킷 생성: name = "entries", public access ON
-- 2. (RLS 미적용 V1) 정책 추가 불필요. 공개 버킷이라 익명 업로드 허용.
