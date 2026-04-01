import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().split(/\s/)[0];
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().split(/\s/)[0];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env var"
  );
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
