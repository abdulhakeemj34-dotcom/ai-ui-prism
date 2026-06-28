-- Nexora Supabase schema
-- Run in Supabase SQL editor when connecting cloud auth.

-- =============================
-- Extensions
-- =============================
create extension if not exists pgcrypto;

-- =============================
-- 0) Profiles (existing)
-- =============================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  avatar_url text,
  join_date timestamptz default now(),
  subscription_plan text default 'free'
    check (subscription_plan in ('free', 'premium', 'premium_plus')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at auto-maintenance
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.profiles enable row level security;



create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

-- Triggers for all tables with updated_at

drop trigger if exists set_updated_at_chat_sessions on public.chat_sessions;
create trigger set_updated_at_chat_sessions
before update on public.chat_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_chat_messages on public.chat_messages;
create trigger set_updated_at_chat_messages
before update on public.chat_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_user_memory_entries on public.user_memory_entries;
create trigger set_updated_at_user_memory_entries
before update on public.user_memory_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_user_notes on public.user_notes;
create trigger set_updated_at_user_notes
before update on public.user_notes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_user_tasks on public.user_tasks;
create trigger set_updated_at_user_tasks
before update on public.user_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_user_goals on public.user_goals;
create trigger set_updated_at_user_goals
before update on public.user_goals
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_planner_subjects on public.planner_subjects;
create trigger set_updated_at_planner_subjects
before update on public.planner_subjects
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_planner_sessions on public.planner_sessions;
create trigger set_updated_at_planner_sessions
before update on public.planner_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_user_expenses on public.user_expenses;
create trigger set_updated_at_user_expenses
before update on public.user_expenses
for each row execute function public.set_updated_at();

-- activity_log does not define updated_at; no trigger added.

-- NOTE: public.profiles already has its own trigger for updated_at.
-- Remaining tables with updated_at are covered by the shared public.set_updated_at() trigger.


-- =============================
-- 1) Chat (sessions + messages)
-- =============================
create table if not exists public.chat_sessions (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  title text not null default 'New chat',
  last_message text not null default '',
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions: select own"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "chat_sessions: insert own"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "chat_sessions: update own"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

create policy "chat_sessions: delete own"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

create index if not exists chat_sessions_user_timestamp_idx
  on public.chat_sessions (user_id, timestamp desc);

create table if not exists public.chat_messages (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  session_id text not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  timestamp timestamptz not null,
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages: select own"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "chat_messages: insert own"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "chat_messages: update own"
  on public.chat_messages for update
  using (auth.uid() = user_id);

create policy "chat_messages: delete own"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

create index if not exists chat_messages_user_session_timestamp_idx
  on public.chat_messages (user_id, session_id, timestamp);

create index if not exists chat_messages_session_timestamp_idx
  on public.chat_messages (session_id, timestamp);

-- Harden chat ownership: ensure chat_messages.user_id matches the owning session's user_id
create or replace function public.validate_chat_message_session_ownership()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1
    from public.chat_sessions s
    where s.id = new.session_id
      and s.user_id = new.user_id
  ) then
    raise exception 'chat message session_id does not belong to the specified user';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_chat_message_session_ownership on public.chat_messages;
create trigger trg_validate_chat_message_session_ownership
before insert or update on public.chat_messages
for each row execute function public.validate_chat_message_session_ownership();


create index if not exists chat_messages_session_timestamp_idx
  on public.chat_messages (session_id, timestamp);


-- =============================
-- 2) Memory (entries)
-- =============================
-- Your client model:
-- MemoryEntry: id, key, value, category, createdAt, updatedAt
create table if not exists public.user_memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  value text not null,
  category text not null check (category in ('preference','context','fact','conversation')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_memory_entries enable row level security;

create policy "memory_entries: select own"
  on public.user_memory_entries for select
  using (auth.uid() = user_id);

create policy "memory_entries: insert own"
  on public.user_memory_entries for insert
  with check (auth.uid() = user_id);

create policy "memory_entries: update own"
  on public.user_memory_entries for update
  using (auth.uid() = user_id);

create policy "memory_entries: delete own"
  on public.user_memory_entries for delete
  using (auth.uid() = user_id);

create index if not exists user_memory_entries_user_updated_idx
  on public.user_memory_entries (user_id, updated_at desc);

create index if not exists user_memory_entries_user_key_idx
  on public.user_memory_entries (user_id, key);


-- =============================
-- 3) Notes
-- =============================
create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  content text not null default '',
  category text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_notes enable row level security;

create policy "notes: select own"
  on public.user_notes for select
  using (auth.uid() = user_id);

create policy "notes: insert own"
  on public.user_notes for insert
  with check (auth.uid() = user_id);

create policy "notes: update own"
  on public.user_notes for update
  using (auth.uid() = user_id);

create policy "notes: delete own"
  on public.user_notes for delete
  using (auth.uid() = user_id);

create index if not exists user_notes_user_updated_idx
  on public.user_notes (user_id, updated_at desc);

-- Simple text search accelerators (optional but useful for future AI search)
create index if not exists user_notes_user_title_trgm_idx
  on public.user_notes using gin (to_tsvector('english', title));

-- =============================
-- 4) Tasks
-- =============================
create table if not exists public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  priority text not null check (priority in ('low','medium','high')) default 'medium',
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_tasks enable row level security;

create policy "tasks: select own"
  on public.user_tasks for select
  using (auth.uid() = user_id);

create policy "tasks: insert own"
  on public.user_tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks: update own"
  on public.user_tasks for update
  using (auth.uid() = user_id);

create policy "tasks: delete own"
  on public.user_tasks for delete
  using (auth.uid() = user_id);

create index if not exists user_tasks_user_completed_updated_idx
  on public.user_tasks (user_id, completed, updated_at desc);

-- =============================
-- 5) Goals (with milestones JSON)
-- =============================
-- Your client GoalMilestone has: id, title, value, completed
create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  target_value numeric not null,
  current_value numeric not null default 0,
  unit text not null default '%',
  milestones jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_goals enable row level security;

create policy "goals: select own"
  on public.user_goals for select
  using (auth.uid() = user_id);

create policy "goals: insert own"
  on public.user_goals for insert
  with check (auth.uid() = user_id);

create policy "goals: update own"
  on public.user_goals for update
  using (auth.uid() = user_id);

create policy "goals: delete own"
  on public.user_goals for delete
  using (auth.uid() = user_id);

create index if not exists user_goals_user_updated_idx
  on public.user_goals (user_id, updated_at desc);

-- =============================
-- 6) Planner (subjects + sessions)
-- =============================
create table if not exists public.planner_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  color text not null,
  hours_per_week integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planner_subjects enable row level security;

create policy "planner_subjects: select own"
  on public.planner_subjects for select
  using (auth.uid() = user_id);

create policy "planner_subjects: insert own"
  on public.planner_subjects for insert
  with check (auth.uid() = user_id);

create policy "planner_subjects: update own"
  on public.planner_subjects for update
  using (auth.uid() = user_id);

create policy "planner_subjects: delete own"
  on public.planner_subjects for delete
  using (auth.uid() = user_id);

create index if not exists planner_subjects_user_updated_idx
  on public.planner_subjects (user_id, updated_at desc);

create table if not exists public.planner_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  subject_id uuid references public.planner_subjects(id) on delete set null,
  title text not null default '',
  day_of_week integer not null default 0,
  start_time text not null default '00:00',
  duration_minutes integer not null default 0,
  reminder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planner_sessions enable row level security;

create policy "planner_sessions: select own"
  on public.planner_sessions for select
  using (auth.uid() = user_id);

create policy "planner_sessions: insert own"
  on public.planner_sessions for insert
  with check (auth.uid() = user_id);

create policy "planner_sessions: update own"
  on public.planner_sessions for update
  using (auth.uid() = user_id);

create policy "planner_sessions: delete own"
  on public.planner_sessions for delete
  using (auth.uid() = user_id);

create index if not exists planner_sessions_user_updated_idx
  on public.planner_sessions (user_id, updated_at desc);

-- =============================
-- 7) Expenses
-- =============================
create table if not exists public.user_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  amount numeric not null,
  type text not null check (type in ('income','expense')),
  category text not null default 'General',
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_expenses enable row level security;

create policy "expenses: select own"
  on public.user_expenses for select
  using (auth.uid() = user_id);

create policy "expenses: insert own"
  on public.user_expenses for insert
  with check (auth.uid() = user_id);

create policy "expenses: update own"
  on public.user_expenses for update
  using (auth.uid() = user_id);

create policy "expenses: delete own"
  on public.user_expenses for delete
  using (auth.uid() = user_id);

create index if not exists user_expenses_user_date_idx
  on public.user_expenses (user_id, date desc);

-- =============================
-- 8) Activity Log
-- =============================
-- Your client ActivityItem:
-- id, type, title, description, timestamp
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null,
  title text not null,
  description text not null,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "activity_log: select own"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "activity_log: insert own"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

create policy "activity_log: update own"
  on public.activity_log for update
  using (auth.uid() = user_id);

create policy "activity_log: delete own"
  on public.activity_log for delete
  using (auth.uid() = user_id);

create index if not exists activity_log_user_timestamp_idx
  on public.activity_log (user_id, timestamp desc);

-- =============================
-- Notes on compatibility
-- =============================
-- Chat IDs and session/message IDs are TEXT because the current client uses Date.now().toString()
-- and user/assistant message IDs based on Date.now().
-- Other entities use UUID primary keys; when Step 2 adapter is added, it can map existing client IDs.

