-- schema.sql — run in Supabase SQL editor if not using Prisma Migrate

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

create table if not exists users (
  telegram_id     bigint primary key,
  username        text,
  first_name      text,
  last_name       text,
  language_code   text,
  photo_url       text,
  is_premium      boolean not null default false,
  premium_until   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists questions (
  id                    uuid primary key default gen_random_uuid(),
  subject               text not null,
  topic                 text not null,
  question_text         text not null,
  options               jsonb not null,          -- ["Option A", "Option B", ...]
  correct_option_index  int not null,
  explanation           text,
  is_free               boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_questions_subject_topic on questions (subject, topic);

create table if not exists exam_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           bigint not null references users(telegram_id),
  subject           text,
  question_ids      jsonb not null default '[]',
  current_answers   jsonb not null default '{}', -- { "<question_id>": <option_index> }
  score             int not null default 0,
  is_completed      boolean not null default false,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  expires_at        timestamptz
);
create index if not exists idx_exam_sessions_user on exam_sessions (user_id, is_completed);

-- Row Level Security: lock tables down since access goes through your backend
-- service role (not directly from the TMA frontend), so RLS blocks the anon key.
alter table users enable row level security;
alter table questions enable row level security;
alter table exam_sessions enable row level security;
-- No policies added for anon/authenticated roles => only service_role key
-- (used server-side) can read/write. Frontend never talks to Supabase directly.
