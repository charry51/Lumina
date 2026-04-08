import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'
import { DeleteCampaignButton } from './DeleteCampaignButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Recuperar sesión activa
  const { data: { user } } = await supabase.auth.getUser()

  // Le pedimos a Supabase las pantallas
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('*')

  // Le pedimos a Supabase el perfil con info del plan
  const { data: profile } = await supabase
    .from('perfiles')
    .select('*, planes(nombre)')
    .eq('id', user?.id)
    .single()

  // FORZAR ONBOARDING
  if (!profile?.plan_id || profile?.suscripcion_activa === false) {
     redirect('/dashboard/planes')
  }

  // Le pedimos a Supabase LAS CAMPAÑAS DE ESTE CLIENTE
  const { data: misCampanas, error: errorCampanas } = await supabase
    .from('campanas')
    .select('*, pantallas(nombre), reproducciones_logs(count)')
    .eq('cliente_id', user?.id)
    .order('created_at', { ascending: false })

  if (error || errorCampanas) {
    return (
      <div className="p-8 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
        <h1 className="text-2xl font-bold mb-4">Error cargando datos</h1>
        <p>{error?.message || errorCampanas?.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Lumina Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{profile?.planes?.nombre || 'Plan Básico'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/planes">
             <Button variant="ghost" className="text-zinc-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5">Mejorar Plan</Button>
          </Link>
          <span className="text-sm text-zinc-500 hidden md:inline-block border-r border-zinc-800 pr-4 italic">
            {user?.email}
          </span>
          <Link href="/dashboard/nueva">
            <Button className="bg-[#D4AF37] hover:bg-[#b08d24] text-black font-bold">+ Nueva Campaña</Button>
          </Link>
          <form action={logout}>
            <Button variant="outline" type="submit" className="border-zinc-700 hover:bg-zinc-800">Salir</Button>
          </form>
        </div>
      </header>
      
      <div className="mb-12">
        <h2 className="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
           <span className="w-1 h-6 bg-[#D4AF37] rounded-full"></span>
           Mis Pantallas Disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pantallas && pantallas.length > 0 ? (
            pantallas.map((pantalla: any) => (
              <Card key={pantalla.id} className="bg-zinc-900 border-zinc-800 hover:border-[#D4AF37]/30 transition-all group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-zinc-100 group-hover:text-[#D4AF37] transition-colors">{pantalla.nombre}</CardTitle>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      pantalla.estado === 'activa' 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}>
                      {pantalla.estado}
                    </span>
                  </div>
                  <CardDescription className="text-zinc-500">{pantalla.ubicacion}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{pantalla.ciudad}</span>
                  </div>
                  <Link href={`/player/${pantalla.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black transition-all">
                      Abrir Reproductor
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
              <p className="text-zinc-600 italic">No se encontraron pantallas en tu red.</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
           <span className="w-1 h-6 bg-[#D4AF37] rounded-full"></span>
           Mis Campañas
        </h2>
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
          {misCampanas && misCampanas.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-900 text-zinc-400 font-medium border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Destino</th>
                  <th className="px-6 py-4">Duración</th>
                  <th className="px-6 py-4">Impactos Reales</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {misCampanas.map((camp: any) => (
                  <tr key={camp.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-100">{camp.nombre_campana}</td>
                    <td className="px-6 py-4 text-zinc-400">{camp.pantallas?.nombre || 'General'}</td>
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{camp.fecha_inicio} a {camp.fecha_fin}</td>
                    <td className="px-6 py-4">
                        <span className="font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                            {camp.reproducciones_logs?.[0]?.count || 0} hits
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        camp.estado === 'aprobada' ? 'bg-green-500/10 text-green-400' :
                        camp.estado === 'rechazada' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {camp.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <DeleteCampaignButton campaignId={camp.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-zinc-600 italic mb-4 text-lg">No tienes ninguna campaña activa.</p>
              <Link href="/dashboard/nueva">
                <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900">Crear mi primera campaña</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
