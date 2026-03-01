# Multi-User Platform Implementation Plan

## Stack: Supabase Auth + Supabase Postgres

### New Dependencies
- `@supabase/supabase-js` — Supabase client SDK
- `@supabase/ssr` — Next.js SSR auth helpers (cookie-based sessions)

### Environment Variables (new)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side admin key (for API routes)

---

## Phase 1: Supabase Setup & Auth Infrastructure

### 1a. Supabase Client Helpers (3 new files)
- `src/lib/supabase/client.ts` — Browser-side Supabase client (uses `createBrowserClient`)
- `src/lib/supabase/server.ts` — Server-side Supabase client (uses `createServerClient` with cookie handling for App Router)
- `src/lib/supabase/middleware.ts` — Middleware helper to refresh auth tokens on every request

### 1b. Next.js Middleware
- `src/middleware.ts` — Refreshes Supabase auth session on every request. Redirects:
  - Unauthenticated users hitting `/dashboard` or `/framework/*` → `/login`
  - Authenticated users hitting `/login` or `/signup` → `/dashboard`
  - `/share/*` remains public (no auth required)
  - `/` remains public (landing page)

### 1c. Auth Pages
- `src/app/(auth)/layout.tsx` — Centered layout with logo, no StepNav
- `src/app/(auth)/login/page.tsx` — Login form: email/password fields + Google button + Apple button
- `src/app/(auth)/signup/page.tsx` — Signup form: email/password + name + Google + Apple
- `src/app/auth/callback/route.ts` — OAuth callback handler (exchanges code for session, redirects to `/dashboard`)
- `src/app/auth/confirm/route.ts` — Email confirmation handler (for email/password signup verification links)

### 1d. Supabase Dashboard Config (manual, documented)
- Enable Email/Password auth provider
- Enable Google OAuth provider (requires Google Cloud Console client ID/secret)
- Enable Apple OAuth provider (requires Apple Developer account)
- Set redirect URLs for OAuth callbacks

---

## Phase 2: Database Schema

### SQL Migration (run in Supabase SQL editor)

```sql
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
```

---

## Phase 3: API Routes for Frameworks

### 3a. `src/app/api/frameworks/route.ts`
- **GET** — List all frameworks for the authenticated user (ordered by updated_at desc)
- **POST** — Create a new framework, return the new ID

### 3b. `src/app/api/frameworks/[id]/route.ts`
- **GET** — Fetch a single framework by ID (RLS ensures ownership)
- **PATCH** — Update a framework (partial updates for auto-save)
- **DELETE** — Delete a framework

### 3c. Update `src/app/api/share/route.ts`
- Replace in-memory Map with Supabase `shared_sessions` table
- POST: Insert into shared_sessions
- GET: Select from shared_sessions

---

## Phase 4: Dashboard

### `src/app/dashboard/page.tsx`
- Server component that fetches user's frameworks from Supabase
- Shows user greeting + logout button in header
- "Start New Messaging Framework" button → creates framework via API, redirects to `/framework/[id]`
- List of existing frameworks as cards showing:
  - Title (derived from `name` field, or "Untitled Framework")
  - Status badge (Draft / In Progress / Complete)
  - Location
  - Last updated timestamp
  - Current step indicator
  - Click → navigates to `/framework/[id]`
  - Delete button with confirmation

### `src/app/dashboard/layout.tsx`
- Dashboard layout with logo header, user menu (email, logout)

---

## Phase 5: Framework Editor Page

### `src/app/framework/[id]/page.tsx`
- Client component that replaces the current `src/app/page.tsx` functionality
- On mount: fetches framework data from API, hydrates Zustand store
- Renders StepNav + IntelEngine/StrategyWorkshop/FinalPlaybook (same as current page.tsx)
- Passes `frameworkId` context to components

### Store Changes (`src/lib/store.ts`)
- Add `frameworkId: string | null` to state
- Add `setFrameworkId` action
- Add `loadFramework(data)` action that hydrates all fields from DB data
- Add `saveStatus: 'idle' | 'saving' | 'saved' | 'error'` to state
- Add auto-save: subscribe to store changes, debounce 2s, PATCH to `/api/frameworks/[id]`
- `resetAll` also clears frameworkId

### StepNav Updates
- Add "Back to Dashboard" link (left of logo or as breadcrumb)
- Add save status indicator ("Saving..." / "Saved" / cloud icon)

---

## Phase 6: Update Landing Page & Routing

### `src/app/page.tsx`
- Convert to a simple landing/marketing page OR redirect to `/dashboard` if authenticated
- For now: redirect authenticated users to `/dashboard`, show login prompt for unauthenticated

### Updated Route Map
| Route | Auth | Purpose |
|---|---|---|
| `/` | Public | Landing page / redirect to dashboard |
| `/login` | Public (redirect if authed) | Login form |
| `/signup` | Public (redirect if authed) | Signup form |
| `/auth/callback` | Public | OAuth callback handler |
| `/auth/confirm` | Public | Email verification handler |
| `/dashboard` | Protected | Framework list |
| `/framework/[id]` | Protected | 3-step framework editor |
| `/share/[id]` | Public | Read-only shared view |
| `/api/frameworks` | Protected | Framework CRUD |
| `/api/frameworks/[id]` | Protected | Single framework CRUD |
| `/api/research` | Protected | AI research (unchanged) |
| `/api/strategy` | Protected | AI strategy gen (unchanged) |
| `/api/share` | Protected (POST) / Public (GET) | Share links |
| `/api/district-boundary` | Public | Map data (unchanged) |

---

## Phase 7: Auto-Save System

The auto-save works via Zustand store subscription:

1. On any state change (researchInput, researchSections, wells, grid, currentStep, mapData), a debounced function fires after 2 seconds of inactivity
2. It PATCHes only the changed fields to `/api/frameworks/[id]`
3. UI shows save status: cloud icon with "Saving..." → "Saved" → idle
4. On framework load, store is hydrated from DB data
5. Framework `status` auto-updates: `draft` (step 1 incomplete) → `in_progress` (research done) → `complete` (grid has tiles)

---

## Implementation Order

1. Install packages (`@supabase/supabase-js`, `@supabase/ssr`)
2. Create Supabase client helpers + middleware
3. Run SQL migration in Supabase
4. Build auth pages (login, signup, callbacks)
5. Build framework API routes
6. Build dashboard page
7. Build framework/[id] editor page (refactor current page.tsx)
8. Add auto-save to Zustand store
9. Update StepNav with dashboard link + save indicator
10. Update share API to use Supabase
11. Update landing page
12. Test full flow, deploy

---

## Files Created (new)
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/auth/confirm/route.ts`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/framework/[id]/page.tsx`
- `src/app/api/frameworks/route.ts`
- `src/app/api/frameworks/[id]/route.ts`
- `supabase-migration.sql` (for reference)

## Files Modified
- `package.json` (new dependencies)
- `src/lib/store.ts` (frameworkId, auto-save, loadFramework)
- `src/lib/types.ts` (MessagingFramework interface)
- `src/app/page.tsx` (landing page / redirect)
- `src/app/layout.tsx` (minimal changes)
- `src/components/StepNav.tsx` (dashboard link, save indicator)
- `src/components/FinalPlaybook.tsx` (use framework context for sharing)
- `src/app/api/share/route.ts` (Supabase instead of in-memory)
- `next.config.ts` (Supabase image domains if needed)
- `.env.local` (new Supabase env vars)
