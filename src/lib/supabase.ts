import { createClient } from '@supabase/supabase-js';

// The URL + publishable key are safe in client code — they ship in the bundle no
// matter what, and the database is protected by row-level security (each user can
// only ever read/write their own workspace row). Env vars override when present.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://gsgwhagsgxyztpmrphqg.supabase.co';
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_Yiy8coBQwERhcc_VvekhNA_fJJue0Fg';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const WORKSPACE_TABLE = 'youthos_workspaces';
