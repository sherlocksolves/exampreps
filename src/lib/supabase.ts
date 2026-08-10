import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The Supabase project is configured entirely through build-time environment
// variables (see .env.example). Only the PUBLIC anon key is ever used here —
// it is safe to ship in the frontend bundle because every table is protected
// by Row Level Security policies enforced on the database itself.
//
// The service role key must NEVER be imported into frontend code. It is not
// referenced anywhere in this project.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  // Fails loudly in dev/build logs rather than silently falling back to a
  // broken client. The site still renders (see App.tsx loading/error states)
  // but no data can be read or written until these are set.
  // eslint-disable-next-line no-console
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables. ' +
      'Copy .env.example to .env.local and fill in your project values.'
  );
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.invalid',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);
