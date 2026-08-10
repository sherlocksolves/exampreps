-- ============================================================================
-- BASELINE SCHEMA
-- Consolidated migration reconstructing the full production database:
-- tables, constraints, RLS, policies, functions, and triggers.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

-- ----------------------------------------------------------------------------
-- profiles: the source of truth for who is an admin. Row is auto-created for
-- every new auth.users signup with role='user' — nobody can self-promote.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.is_admin()
returns boolean
language sql
stable security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "admins read all profiles" on public.profiles
  for select using (is_admin());
create policy "admins update profiles" on public.profiles
  for update using (is_admin());

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- exams
-- ----------------------------------------------------------------------------
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  session text,
  authority text not null,
  exam_date timestamptz,
  status text not null default 'not_announced' check (status in ('official','expected','not_announced','completed')),
  expected_date timestamptz,
  official_url text not null,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category text not null check (category in ('JEE','NEET','NDA','CUET','BOARDS','GATE','UPSC','OTHER')),
  target_score text,
  syllabus_tips text[] default '{}',
  is_target boolean not null default false,
  expected_note text
);

alter table public.exams enable row level security;
create trigger trg_exams_updated_at before update on public.exams
  for each row execute function public.set_updated_at();

create policy "public read active exams" on public.exams
  for select using (is_active = true or is_admin());
create policy "admins insert exams" on public.exams for insert with check (is_admin());
create policy "admins update exams" on public.exams for update using (is_admin());
create policy "admins delete exams" on public.exams for delete using (is_admin());

grant select on public.exams to anon, authenticated;
grant insert, update, delete on public.exams to authenticated;
revoke insert, update, delete on public.exams from anon;

-- ----------------------------------------------------------------------------
-- quotes
-- ----------------------------------------------------------------------------
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text not null default 'PeaceGhost Study System',
  category text not null default 'general' check (category in (
    'discipline','focus','consistency','comeback','failure','JEE','NEET','NDA','CUET',
    'exam_pressure','confidence','late_night','morning','productivity','self_belief','general'
  )),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes enable row level security;
create trigger trg_quotes_updated_at before update on public.quotes
  for each row execute function public.set_updated_at();

create policy "public read active quotes" on public.quotes
  for select using (is_active = true or is_admin());
create policy "admins insert quotes" on public.quotes for insert with check (is_admin());
create policy "admins update quotes" on public.quotes for update using (is_admin());
create policy "admins delete quotes" on public.quotes for delete using (is_admin());

grant select on public.quotes to anon, authenticated;
grant insert, update, delete on public.quotes to authenticated;
revoke insert, update, delete on public.quotes from anon;

-- ----------------------------------------------------------------------------
-- study_vibes
-- ----------------------------------------------------------------------------
create table public.study_vibes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 120),
  category text not null check (category in ('night','rain','morning','library','science','math','exam','cafe','forest','ocean')),
  image_url text not null,
  mobile_image_url text,
  overlay_strength numeric not null default 0.5 check (overlay_strength >= 0 and overlay_strength <= 1),
  is_active boolean not null default true,
  display_order int not null default 0,
  photographer text,
  source_name text,
  source_url text,
  license text,
  quote_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.study_vibes enable row level security;
create trigger trg_study_vibes_updated_at before update on public.study_vibes
  for each row execute function public.set_updated_at();

create policy "public read active study_vibes" on public.study_vibes
  for select using (is_active = true or is_admin());
create policy "admins insert study_vibes" on public.study_vibes for insert with check (is_admin());
create policy "admins update study_vibes" on public.study_vibes for update using (is_admin());
create policy "admins delete study_vibes" on public.study_vibes for delete using (is_admin());

grant select on public.study_vibes to anon, authenticated;
grant insert, update, delete on public.study_vibes to authenticated;
revoke insert, update, delete on public.study_vibes from anon;

create index idx_study_vibes_active_order on public.study_vibes (is_active, display_order);

-- ----------------------------------------------------------------------------
-- ambient_tracks
-- ----------------------------------------------------------------------------
create table public.ambient_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 120),
  category text not null check (category in ('rain','library','cafe','forest','ocean','deep_focus','white_noise','silent')),
  audio_url text,
  duration text default 'Infinite Loop',
  is_active boolean not null default true,
  display_order int not null default 0,
  volume_recommendation numeric default 0.5 check (volume_recommendation >= 0 and volume_recommendation <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ambient_tracks enable row level security;
create trigger trg_ambient_tracks_updated_at before update on public.ambient_tracks
  for each row execute function public.set_updated_at();

create policy "public read active ambient_tracks" on public.ambient_tracks
  for select using (is_active = true or is_admin());
create policy "admins insert ambient_tracks" on public.ambient_tracks for insert with check (is_admin());
create policy "admins update ambient_tracks" on public.ambient_tracks for update using (is_admin());
create policy "admins delete ambient_tracks" on public.ambient_tracks for delete using (is_admin());

grant select on public.ambient_tracks to anon, authenticated;
grant insert, update, delete on public.ambient_tracks to authenticated;
revoke insert, update, delete on public.ambient_tracks from anon;

create index idx_ambient_tracks_active_order on public.ambient_tracks (is_active, display_order);

-- ----------------------------------------------------------------------------
-- feedback (public insert, admin-only read/manage; rate-limited + sanitized)
-- ----------------------------------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) <= 120),
  email text check (email is null or (char_length(email) <= 200 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')),
  message text not null check (char_length(message) >= 1 and char_length(message) <= 2000),
  rating int check (rating >= 1 and rating <= 5),
  status text not null default 'new' check (status in ('new','reviewed','resolved','archived')),
  type text not null default 'suggestion' check (type in ('suggestion','bug','praise','exam_request')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
create trigger trg_feedback_updated_at before update on public.feedback
  for each row execute function public.set_updated_at();

create policy "anyone can submit feedback" on public.feedback
  for insert with check (
    char_length(message) >= 1 and char_length(message) <= 2000
    and (rating is null or (rating >= 1 and rating <= 5))
  );
create policy "admins read feedback" on public.feedback for select using (is_admin());
create policy "admins update feedback" on public.feedback for update using (is_admin());
create policy "admins delete feedback" on public.feedback for delete using (is_admin());

grant insert on public.feedback to anon, authenticated;
grant select, update, delete on public.feedback to authenticated;
revoke select, update, delete on public.feedback from anon;

-- Private rate-limit bookkeeping table — never exposed via API (private schema)
create table private.feedback_rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

create function public.enforce_feedback_rate_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'private', 'extensions'
as $$
declare
  headers json;
  client_ip text;
  ip_hash text;
  existing record;
  max_per_window int := 5;
  window_minutes int := 60;
begin
  headers := nullif(current_setting('request.headers', true), '')::json;
  client_ip := coalesce(
    nullif(split_part(headers->>'x-forwarded-for', ',', 1), ''),
    nullif(headers->>'cf-connecting-ip', ''),
    'unknown'
  );
  ip_hash := encode(extensions.digest(client_ip || ':examcountdown-feedback', 'sha256'), 'hex');

  select * into existing from private.feedback_rate_limits where key = ip_hash;

  if existing is null then
    insert into private.feedback_rate_limits (key, count, window_start)
    values (ip_hash, 1, now());
  elsif now() - existing.window_start > (window_minutes || ' minutes')::interval then
    update private.feedback_rate_limits
      set count = 1, window_start = now()
      where key = ip_hash;
  else
    if existing.count >= max_per_window then
      raise exception 'Too many submissions. Please try again later.';
    end if;
    update private.feedback_rate_limits
      set count = count + 1
      where key = ip_hash;
  end if;

  -- Strip control characters; never trust client-side sanitization alone.
  new.name := nullif(trim(both from regexp_replace(coalesce(new.name, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F]', '', 'g')), '');
  new.message := trim(both from regexp_replace(new.message, '[\x00-\x08\x0B\x0C\x0E-\x1F]', '', 'g'));
  new.email := nullif(trim(both from coalesce(new.email, '')), '');

  return new;
end;
$$;

create trigger trg_feedback_rate_limit
  before insert on public.feedback
  for each row execute function public.enforce_feedback_rate_limit();

-- ----------------------------------------------------------------------------
-- study_sessions (personal, per-user; requires a real authenticated user)
-- ----------------------------------------------------------------------------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subject text,
  task text,
  duration_seconds int not null default 0,
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.study_sessions enable row level security;

create policy "users read own sessions" on public.study_sessions
  for select using (auth.uid() = user_id or is_admin());
create policy "users insert own sessions" on public.study_sessions
  for insert with check (auth.uid() = user_id);
create policy "users update own sessions" on public.study_sessions
  for update using (auth.uid() = user_id);
create policy "users delete own sessions" on public.study_sessions
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.study_sessions to authenticated;
revoke insert, update, delete on public.study_sessions from anon;

-- ----------------------------------------------------------------------------
-- site_settings (public read, admin write — small key/value config store)
-- ----------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "public read site settings" on public.site_settings for select using (true);
create policy "admins write site settings" on public.site_settings for insert with check (is_admin());
create policy "admins update site settings" on public.site_settings for update using (is_admin());

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
revoke insert, update, delete on public.site_settings from anon;

-- ----------------------------------------------------------------------------
-- admin_audit_logs (admin-only, append-mostly audit trail)
-- ----------------------------------------------------------------------------
create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

create policy "admins read audit logs" on public.admin_audit_logs for select using (is_admin());
create policy "admins insert audit logs" on public.admin_audit_logs for insert with check (is_admin());

grant insert on public.admin_audit_logs to authenticated;
revoke select, update, delete, truncate on public.admin_audit_logs from anon;
