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

  // Le pedimos a Supabase las pantallas vinculadas a las campañas del usuario (Privacidad)
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('*, campanas!inner(cliente_id)')
    .eq('campanas.cliente_id', user?.id)

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
    <div className="p-8 min-h-screen bg-background text-foreground font-sans">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Lumina Logo" className="h-10 w-auto" />
          <div className="pt-2">
            <h1 className="text-3xl font-heading uppercase tracking-tighter text-gradient font-black">LUMINA</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary font-mono uppercase tracking-[2px]">Nivel {profile?.planes?.nombre || 'Básico'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/planes">
             <Button variant="ghost" className="text-zinc-400 hover:text-primary hover:bg-primary/5">Plan y Facturación</Button>
          </Link>
          <span className="text-sm text-zinc-500 hidden md:inline-block border-r border-border pr-4 italic font-mono">
            {user?.email}
          </span>
          <Link href="/dashboard/nueva">
            <button className="cyber-button-cyan">+ Nueva Emisión</button>
          </Link>
          <form action={logout}>
            <Button variant="outline" type="submit" className="border-border hover:bg-muted">Salir</Button>
          </form>
        </div>
      </header>
      
      <div className="mb-12">
        <h2 className="text-xl font-heading mb-6 flex items-center gap-2 uppercase tracking-widest text-sm text-gradient">
           <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_#00d2ff]"></span>
           Monitor de Nodos en Red
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pantallas && pantallas.length > 0 ? (
            pantallas.map((pantalla: any) => (
              <div key={pantalla.id} className="cyber-card p-6 flex flex-col justify-between group">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-heading text-zinc-100 group-hover:text-primary transition-colors uppercase">{pantalla.nombre}</h3>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full tracking-tighter ${
                      pantalla.estado === 'activa' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}>
                      {pantalla.estado}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans line-clamp-1">{pantalla.ubicacion}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{pantalla.ciudad}</span>
                  </div>
                  <Link href={`/player/${pantalla.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="h-7 text-[9px] uppercase font-bold border-primary/20 hover:bg-primary hover:text-black transition-all">
                      Player
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center cyber-card border-dashed">
              <p className="text-muted-foreground italic text-sm">No se encontraron pantallas en tu red.</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-heading mb-6 flex items-center gap-2 uppercase tracking-widest text-sm text-gradient">
           <span className="w-1 h-6 bg-secondary rounded-full shadow-[0_0_10px_#6c5ce7]"></span>
           Contenidos en Emisión
        </h2>
        <div className="cyber-card overflow-hidden shadow-2xl">
          {misCampanas && misCampanas.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1a1a2e]/50 border-b border-border">
                <tr>
                  <th className="cyber-table-header">Campaña</th>
                  <th className="cyber-table-header">Destino</th>
                  <th className="cyber-table-header">Periodo</th>
                  <th className="cyber-table-header">Impactos (PoP)</th>
                  <th className="cyber-table-header">Estado</th>
                  <th className="cyber-table-header text-right">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {misCampanas.map((camp: any) => (
                  <tr key={camp.id} className="cyber-table-row">
                    <td className="px-6 py-4 font-heading text-zinc-100 uppercase text-xs">{camp.nombre_campana}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">{camp.pantallas?.nombre || 'General'}</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-[10px] whitespace-nowrap">{camp.fecha_inicio} » {camp.fecha_fin}</td>
                    <td className="px-6 py-4">
                        <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 text-[10px] uppercase">
                            {profile?.plan_id === 'presencia' ? '0' : (camp.reproducciones_logs?.[0]?.count || 0)} pings
                        </span>
                        {profile?.plan_id === 'presencia' && (
                          <p className="text-[8px] text-zinc-500 mt-1 uppercase tracking-tighter">🔒 Mejora a Impacto para ver datos</p>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
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
              <p className="text-muted-foreground italic mb-6 text-sm">No tienes ninguna campaña activa.</p>
              <Link href="/dashboard/nueva">
                <button className="cyber-button-cyan shadow-lg">Crear Primera Campaña</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
