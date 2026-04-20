import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  // Dynamic import of next/headers to prevent client-side bundling errors
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL: Supabase environment variables are missing!');
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
}

export async function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('CRITICAL: Supabase Admin environment variables are missing!');
    throw new Error('Admin client configuration missing');
  }

  // NOTE: SERVICE_ROLE_KEY bypasses RLS. Use ONLY in server context.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      },
    }
  )
}
