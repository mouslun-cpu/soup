-- ============================================================
-- True Need 挖掘機 - Supabase Schema
-- 請在 Supabase Dashboard > SQL Editor 中執行此檔案
-- ============================================================

-- 啟用 UUID 擴展
create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

-- 房間表
create table if not exists rooms (
  id              uuid primary key default gen_random_uuid(),
  room_code       text unique not null,
  story_title     text not null default '',
  story_content   text not null default '',
  true_need       text not null default '',
  is_active       boolean not null default true,
  reveal_triggered  boolean not null default false,
  buzz_triggered    boolean not null default false,
  buzz_team_name    text,
  created_at      timestamptz not null default now()
);

-- 小組表
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references rooms(id) on delete cascade,
  team_name   text not null,
  score       int not null default 0,
  created_at  timestamptz not null default now(),
  unique(room_id, team_name)
);

-- 問題表
create table if not exists questions (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references rooms(id) on delete cascade,
  team_id     uuid references teams(id) on delete set null,
  team_name   text not null,
  content     text not null,
  upvotes     int not null default 0,
  status      text not null default 'pending'
              check (status in ('pending', 'yes', 'no', 'irrelevant')),
  created_at  timestamptz not null default now()
);

-- 點讚紀錄表（防重複）
create table if not exists upvote_logs (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions(id) on delete cascade,
  team_id      uuid not null references teams(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique(question_id, team_id)
);

-- ============================================================
-- Indexes（提升查詢效能）
-- ============================================================

create index if not exists idx_questions_room_id on questions(room_id);
create index if not exists idx_questions_status on questions(status);
create index if not exists idx_questions_upvotes on questions(upvotes desc);
create index if not exists idx_teams_room_id on teams(room_id);
create index if not exists idx_upvote_logs_question on upvote_logs(question_id);

-- ============================================================
-- Row Level Security (RLS)
-- 允許匿名用戶讀寫（課堂場景不需要帳號驗證）
-- ============================================================

alter table rooms enable row level security;
alter table teams enable row level security;
alter table questions enable row level security;
alter table upvote_logs enable row level security;

-- Rooms: 所有人可讀，匿名可建立
create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (true);
create policy "rooms_update" on rooms for update using (true);

-- Teams: 所有人可讀寫
create policy "teams_select" on teams for select using (true);
create policy "teams_insert" on teams for insert with check (true);
create policy "teams_update" on teams for update using (true);

-- Questions: 所有人可讀寫
create policy "questions_select" on questions for select using (true);
create policy "questions_insert" on questions for insert with check (true);
create policy "questions_update" on questions for update using (true);

-- Upvote logs: 所有人可讀寫
create policy "upvote_logs_select" on upvote_logs for select using (true);
create policy "upvote_logs_insert" on upvote_logs for insert with check (true);

-- ============================================================
-- Realtime: 啟用即時訂閱
-- ============================================================

-- 啟用 rooms 即時推送
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table questions;
alter publication supabase_realtime add table upvote_logs;

-- ============================================================
-- Functions（原子操作，防 race condition）
-- ============================================================

-- 點讚原子操作：插入 log 並遞增 upvotes
create or replace function increment_upvote(
  p_question_id uuid,
  p_team_id     uuid
) returns void
language plpgsql
as $$
begin
  -- 嘗試插入點讚記錄（unique constraint 防重複）
  insert into upvote_logs (question_id, team_id)
  values (p_question_id, p_team_id);

  -- 遞增點讚數
  update questions
  set upvotes = upvotes + 1
  where id = p_question_id;
exception
  when unique_violation then
    -- 已點過讚，直接忽略
    null;
end;
$$;
