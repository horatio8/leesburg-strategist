-- Messaging Frameworks table
create table messaging_frameworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Framework',
  current_step integer not null default 1,

  -- Step 1: Research Input
  entity_type text not null default 'candidate',
  name text not null default '',
  location text not null default '',
  goal text not null default '',
  website text not null default '',
  social_media jsonb not null default '{}',

  -- Step 1: Research Results
  research_sections jsonb not null default '[]',
  map_data jsonb,

  -- Step 2: Strategy
  wells jsonb not null default '{}',
  grid jsonb not null default '{}',

  -- Metadata
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row-Level Security: users can only access their own frameworks
alter table messaging_frameworks enable row level security;

create policy "Users can view own frameworks"
  on messaging_frameworks for select using (auth.uid() = user_id);

create policy "Users can create own frameworks"
  on messaging_frameworks for insert with check (auth.uid() = user_id);

create policy "Users can update own frameworks"
  on messaging_frameworks for update using (auth.uid() = user_id);

create policy "Users can delete own frameworks"
  on messaging_frameworks for delete using (auth.uid() = user_id);

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on messaging_frameworks
  for each row execute function update_updated_at();

-- Step 1: Oppositions
-- Run this migration to add opposition tracking columns:
-- ALTER TABLE messaging_frameworks ADD COLUMN IF NOT EXISTS oppositions jsonb NOT NULL DEFAULT '[]';
-- ALTER TABLE messaging_frameworks ADD COLUMN IF NOT EXISTS opposition_research jsonb NOT NULL DEFAULT '[]';

-- Shared sessions table (replaces in-memory Map)
create table shared_sessions (
  id text primary key,
  framework_id uuid references messaging_frameworks(id) on delete set null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Shared sessions are publicly readable (for /share/[id] pages)
alter table shared_sessions enable row level security;

create policy "Anyone can view shared sessions"
  on shared_sessions for select using (true);

create policy "Authenticated users can create shared sessions"
  on shared_sessions for insert with check (auth.uid() is not null);
