import { createBrowserClient } from '@supabase/ssr'

// Fallbacks prevent build-time prerender crash (no real requests happen at build time)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder',
  {
    auth: {
      persistSession: true,
      storageKey: 'forge-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
