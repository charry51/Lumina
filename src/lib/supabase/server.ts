import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL: Supabase environment variables are missing!');
    // Return a dummy client that will fail on calls but won't crash the server during initialization
    return createServerClient('https://missing.supabase.co', 'missing', {
        cookies: { getAll() { return [] }, setAll() {} }
    });
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored
          }
        },
      },
    }
  )
}export async function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('CRITICAL: Supabase Admin environment variables are missing!');
    throw new Error('Admin client configuration missing');
  }

  // NOTE: SERVICE_ROLE_KEY bypasses RLS. Use ONLY in server components/actions.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() { return [] }, // Admin client doesn't need to read user cookies for auth bypass
        setAll() {}
      },
    }
  )
}
