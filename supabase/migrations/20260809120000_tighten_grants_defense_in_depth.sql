-- Defense-in-depth: RLS is the real access-control gate on every table, but
-- table-level GRANTs should still follow least privilege. Postgres/Supabase
-- gives newly-created tables broad default privileges for anon/authenticated;
-- this migration explicitly narrows them to match the intent of each table's
-- RLS policies, so a future RLS misconfiguration can't be silently papered
-- over by a stale, overly-broad GRANT.

revoke insert, update, delete on public.study_vibes from anon;
revoke insert, update, delete on public.ambient_tracks from anon;

revoke insert, update, delete, truncate on public.profiles from anon;
revoke select, update, insert, delete, truncate on public.admin_audit_logs from anon;
revoke insert, update, delete, truncate on public.site_settings from anon;
revoke insert, update, delete, truncate on public.study_sessions from anon;

revoke insert, update, delete on public.admin_audit_logs from authenticated;
grant insert on public.admin_audit_logs to authenticated;
