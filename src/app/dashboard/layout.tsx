import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Si estamos en este layout, verificamos que tenga suscripción o plan activo.
    // Excepto si la ruta actual YA es /dashboard/planes (y subrutas).
    // Nota: Como este Layout engloba TODO /dashboard, necesitamos ser cuidadosos.
    // Next.js layout runs on all children routes. We don't have access to pathname here easily in App Router unless we use headers() trick, but relying on page-level is safer if we just want it on /dashboard.
    // Actually, creating a layout means it wraps /dashboard/planes too!
  }

  return <>{children}</>
}
