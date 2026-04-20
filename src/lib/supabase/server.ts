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

  for (const name of keyNames) {
    const val = process.env[name];
    if (val) {
      key = val;
      break; 
    }
  }

  if (!url || !key) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!key) {
      // DIAGNOSTIC SCAN: Find ALL environment variable names that look like keys
      // This is safe because we only return the NAMES, not the secrets.
      const allEnvNames = Object.keys(process.env);
      const suspiciousNames = allEnvNames.filter(name => 
        name.includes('SUPABASE') || 
        name.includes('KEY') || 
        name.includes('SECRET') || 
        name.includes('ROLE')
      );
      
      missing.push(`Key not found. Diagnóstico de nombres disponibles en Vercel: [${suspiciousNames.length > 0 ? suspiciousNames.join(', ') : 'Ninguna variable encontrada'}]`);
    }
    
    const errorMsg = `Admin client configuration missing: [${missing.join(' | ')}]`;
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
