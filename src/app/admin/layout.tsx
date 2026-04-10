import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar si es superadmin
  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilError || !perfil || perfil.rol !== 'superadmin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-[family-name:var(--font-geist-sans)]">
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-zinc-900 bg-black flex flex-col">
        <div className="p-6">
          <img src="/logo.png" alt="Lumina Admin" className="h-12 w-auto" />
          <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.3em] mt-2 block pl-1">Admin Panel</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
            Resumen Global
          </Link>
          <Link href="/admin/campanas" className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
            Gestión de Campañas
          </Link>
          <Link href="/admin/pantallas" className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
            Red de Pantallas
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-900">
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors">
            ← Volver a Cliente
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  )
}
