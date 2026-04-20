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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  /**
   * CRITICAL FIX: Next.js (especially v16/Turbopack) prunes environment variables 
   * that are not EXPLICITLY referenced by their full literal name.
   * Using process.env[dynamicName] results in 'undefined' in production.
   */
  const key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY || 
    process.env.SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missingInfo = [];
    if (!url) missingInfo.push('NEXT_PUBLIC_SUPABASE_URL missing');
    if (!key) missingInfo.push('SERVICE_ROLE_KEY missing (Static reference failed)');

    const errorMsg = `
CRITICAL ERROR: Environment variables are invisible to the server.
- Project Context: ${process.env.VERCEL_URL || 'Vercel Production'}
- Key Status: SUPABASE_SERVICE_ROLE_KEY is ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'DEFINED' : 'UNDEFINED'}
- Error: ${missingInfo.join(' | ')}
    `.trim();

    console.error('CRITICAL:', errorMsg);
    throw new Error(errorMsg);
  }

  // NOTE: SERVICE_ROLE_KEY bypasses RLS. Use ONLY in server context.
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      },
    }
  )
}
