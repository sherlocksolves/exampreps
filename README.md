# EXAM//COUNTDOWN — Digital Study Sanctuary

A cinematic exam-countdown and focus-study site (JEE / NEET / NDA / CUET), backed
by a real, production Supabase database: exams, motivational quotes, study
vibes, ambient audio tracks, and a moderated public feedback inbox are all
served from Postgres with Row Level Security — not localStorage, not mock data.

---

## What's automated vs. what you must do once

Everything in this repo — schema, RLS policies, functions, triggers, seed
content — is defined as SQL migrations in [`supabase/migrations/`](supabase/migrations)
and has already been applied to the live project. The frontend talks to it
through two build-time environment variables (below).

The **only** thing that cannot be scripted from SQL alone is creating your
first login, because Supabase Auth passwords go through GoTrue, not a plain
`INSERT`. See **Admin Setup** below — it's one form + one SQL statement.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

## Environment variables

Only two variables are needed, both public/client-safe (see `.env.example`):

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API (the `anon` / `public` key) |

**Never** put the `service_role` key, database password, or JWT secret in
this file, in any frontend code, or in an env var prefixed `VITE_` — anything
with that prefix is bundled into the browser JS. The anon key is safe to ship
because every table is protected by Row Level Security on the database
itself; the anon key alone grants nothing beyond what a policy explicitly
allows.

## Database schema & migrations

Run these against a fresh Supabase project (or `supabase db push` if you use
the CLI) in order:

1. `20260807185556_baseline_schema.sql` — every table, RLS policy, function, and trigger
2. `20260807185701_seed_content.sql` — the site's real exam/quote/vibe/track content
3. `20260808035931_admin_bootstrap_note.sql` — documentation only (see below)
4. `20260809120000_tighten_grants_defense_in_depth.sql` — least-privilege GRANT hardening

### Data model

| Table | Who can read | Who can write |
|---|---|---|
| `exams`, `quotes`, `study_vibes`, `ambient_tracks` | anyone (active rows only) | admins only |
| `feedback` | admins only | anyone can **insert** (rate-limited, sanitized); nobody but admins can read/edit/delete |
| `study_sessions` | the owning user, or an admin | the owning user only |
| `profiles` | own row, or an admin (all rows) | admins only (nobody can self-promote) |
| `site_settings` | anyone | admins only |
| `admin_audit_logs` | admins only | admins only |

`is_admin()` is a `SECURITY DEFINER` SQL function that checks the caller's
own `profiles.role`. It's the single source of truth for every admin-gated
policy — there is no client-side flag, hidden route, or hardcoded password
that grants access.

## Admin Setup (the one manual step)

1. In the Supabase Dashboard → **Authentication → Users**, click **Add user**
   and create an account with your own email + a strong password. (Or, from
   a trusted server context only — never the browser — call
   `supabase.auth.admin.createUser()` with your `service_role` key.)
2. Promote that account to admin by running once in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Open the site, click the admin icon in the nav, and sign in with that
   email + password. From there you can manage exams, quotes, study vibes,
   ambient tracks, and read/delete feedback submissions — every action goes
   straight to Supabase and is re-checked by RLS server-side.

A bootstrap admin account already exists on the deployed project
(`admin@peaceghost`) with a freshly-generated password that was provided to
you outside this repo. **Sign in and change it immediately** (Supabase
Dashboard → Authentication → Users → that user → reset password), or delete
it and create your own via the steps above.

## What's intentionally *not* backed by Supabase

Focus-session history, the study journal, your selected target exam/vibe,
and streak count stay in the browser's `localStorage`. This site has no
end-user sign-up flow — visitors are anonymous — so there's no account to
attach personal study data to. If you later want cross-device sync for
these, the natural extension is Supabase Auth for regular users (the
`study_sessions` table and its RLS policies already exist and are ready for
that — they just aren't wired into the UI yet).

## Security notes

- RLS is enabled on every table; policies were tested against the live
  project with the `anon` role (including a real blocked-insert attempt)
  before delivery.
- Feedback submissions are rate-limited server-side (5/hour per IP hash,
  stored in a `private` schema never exposed via the API) and sanitized by
  a `BEFORE INSERT` trigger — this can't be bypassed by calling the
  Supabase REST/JS API directly.
- Table-level `GRANT`s were explicitly narrowed to match each table's RLS
  intent (defense-in-depth beyond RLS alone).
- The production bundle (`npm run build` → `dist/`) was scanned for secrets;
  the only credential present is the public anon key, confirmed by decoding
  its JWT payload (`role: anon`).

## Scripts

```bash
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
npm run lint       # tsc --noEmit
```
