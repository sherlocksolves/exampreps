import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The Supabase project connection. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// (see .env.example) let you point this at a different project at build time
// if you ever need to — but the app ships with a working project's PUBLIC
// anon key baked in as a default, so it works out of the box on any host
// (Vercel, Netlify, etc.) without requiring environment variables to be set.
//
// This is safe to ship in the frontend bundle: the anon key alone grants
// nothing beyond what Row Level Security policies explicitly allow on the
// database itself (see supabase/migrations/). The service_role key must
// NEVER be imported into frontend code — it is not referenced anywhere in
// this project.
const FALLBACK_SUPABASE_URL = 'https://hpdohwdfyczehgoaiwsp.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZG9od2RmeWN6ZWhnb2Fpd3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODI5ODEsImV4cCI6MjEwMTg1ODk4MX0.Hp59JAQJ8L51K99nYU7ZE6yVKLoZRxNkc8HlVviqQgg';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const SUPABASE_URL = envUrl || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY = envAnonKey || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
