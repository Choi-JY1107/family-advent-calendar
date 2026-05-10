import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  if (!url || !anonKey) {
    throw new Error(
      'Supabase env vars missing. Copy .env.example to .env and fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
    )
  }
  client = createClient(url, anonKey)
  return client
}
