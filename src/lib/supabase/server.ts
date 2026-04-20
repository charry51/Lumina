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
  
  // ROBUST KEY CHECK: Look for common variations of the service role key
  const keyNames = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY', 'SERVICE_ROLE_KEY'];
  let key = '';
  const foundNames: string[] = [];

  for (const name of keyNames) {
    const val = process.env[name];
    if (val) {
      key = val;
      foundNames.push(name);
      break; // Use the first one found
    }
  }

  if (!url || !key) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!key) missing.push(`Key not found (tried: ${keyNames.join(', ')})`);
    
    const errorMsg = `Admin client configuration missing: [${missing.join(', ')}]`;
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
