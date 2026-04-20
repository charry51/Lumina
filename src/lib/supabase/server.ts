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
    // HARDCORE DIAGNOSTIC: List EVERY SINGLE ENV VAR keys
    const allEnvNames = Object.keys(process.env);
    
    // Check for Vercel System variables specifically to identify PROJ and ENV
    const vercelContext = {
      project: process.env.VERCEL_PROJECT_ID || 'Unknown',
      env: process.env.VERCEL_ENV || 'Unknown',
      owner: process.env.VERCEL_GIT_REPO_OWNER || 'Unknown',
      repo: process.env.VERCEL_GIT_REPO_SLUG || 'Unknown',
      domain: process.env.VERCEL_URL || 'Unknown'
    };

    const missingInfo = [];
    if (!url) missingInfo.push('NEXT_PUBLIC_SUPABASE_URL missing');
    if (!key) missingInfo.push('SERVICE_ROLE_KEY missing');

    const errorMsg = `
CRITICAL ERROR: Environment variables are invisible to the server.
- Errors: ${missingInfo.join(' | ')}
- Context: Project=${vercelContext.project}, Env=${vercelContext.env}, Domain=${vercelContext.domain}
- Visible Variables Map: [${allEnvNames.sort().join(', ')}]
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
