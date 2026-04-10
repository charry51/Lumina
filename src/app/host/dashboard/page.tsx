import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Tv, TrendingUp, Wallet, History, ChevronRight } from 'lucide-react'

import { PairingForm } from '@/app/admin/pantallas/PairingForm'

export default async function HostDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ screenId?: string; action?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener todos los registros de host vinculados a este perfil
  const { data: hosts } = await supabase
    .from('hosts')
    .select('*, pantallas(id, nombre, ciudad, estado, precio_emision, ubicacion)')
    .eq('perfil_id', user.id)

  const hasScreens = hosts && hosts.length > 0
  const isAddingScreen = params.action === 'vincular'

  // VISTA DE ONBOARDING (Si no tiene pantallas o pulsó "Vincular otra")
  if (!hasScreens || isAddingScreen) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-foreground p-8 font-sans flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
            <header className="mb-10 text-center">
                <Link href="/host/dashboard" className="inline-block mb-4 text-[10px] text-zinc-500 hover:text-primary transition-colors uppercase tracking-[3px]">← Volver al Dashboard</Link>
                <h1 className="text-4xl font-heading font-black text-gradient mb-2">VINCULAR TV</h1>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[3px]">Añade un nuevo nodo de emisión a tu cuenta</p>
            </header>

            <div className="cyber-card p-8 bg-zinc-900/50 backdrop-blur-xl border-primary/20">
                <PairingForm />
            </div>

            <p className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                ¿Necesitas ayuda técnica? lumina.app/soporte
            </p>
        </div>
      </div>
    )
  }

  // Selección de la pantalla actual (por URL o la primera de la lista)
  const selectedHostId = params.screenId
  const hostData = selectedHostId 
    ? (hosts.find(h => h.id === selectedHostId) || hosts[0])
    : hosts[0]

  // Obtener historial de comisiones para la pantalla seleccionada
  const { data: comisiones } = await supabase
    .from('comisiones')
    .select('*, campanas(nombre_campana)')
    .eq('host_id', hostData.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalGenerado = (hostData.saldo_pendiente || 0) + (hostData.saldo_pagado || 0)
  const pantalla = hostData.pantallas as any

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      {/* Header Premium */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-heading font-black text-gradient tracking-tighter">LUMINA</h1>
            <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">HOST PORTAL</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[4px]">Gestión de Nodos y Activos</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/host/dashboard?action=vincular"
            className="inline-flex items-center justify-center rounded-md bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:bg-primary/80 px-6 h-11 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Vincular Nueva TV
          </Link>
          <div className="h-10 w-px bg-zinc-800 hidden sm:block mx-2" />
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Cuenta Activa</p>
            <p className="text-xs text-zinc-200 font-medium">{user.email}</p>
          </div>
        </div>
      </header>

      {/* Selector de Pantallas (Siempre visible si hay pantallas) */}
      <section className="mb-8 p-4 bg-zinc-900/40 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Tus Pantallas ({hosts.length})</p>
              <Link href="/host/dashboard?action=vincular" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-tighter">
                  + Vincular otra pantalla
              </Link>
          </div>
          <div className="flex flex-wrap gap-2">
              {hosts.map((h: any) => (
                  <Link 
                    key={h.id} 
                    href={`/host/dashboard?screenId=${h.id}`}
                    className={`px-4 py-2 rounded-lg border text-xs font-heading transition-all ${
                      h.id === hostData.id 
                          ? 'bg-primary/10 border-primary/50 text-white shadow-[0_0_15px_rgba(0,210,255,0.05)]' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                  >
                        {h.pantallas?.nombre}
                  </Link>
              ))}
          </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Columna Izquierda: Info de Pantalla */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Ficha Técnica de la Pantalla */}
          <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-heading uppercase tracking-widest text-gradient flex items-center gap-2">
                <Tv className="w-4 h-4 text-primary" /> Detalles del Nodo
                </h2>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                pantalla?.estado === 'activa'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                {pantalla?.estado || 'Inactiva'}
                </span>
            </div>
            
            <div className="cyber-card p-8 bg-zinc-900/30 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2 italic">Identificador</p>
                <p className="text-zinc-100 font-heading text-lg uppercase leading-tight">{pantalla?.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Tu Saldo Acumulado</p>
                  <p className="text-2xl font-black text-primary">{totalGenerado.toFixed(2)}€</p>
                  <p className="text-[10px] text-zinc-600 mt-1 italic leading-tight">
                    * Recibes un 25% de comisión por cada anuncio en pantallas públicas.
                  </p>
                </div>
                <div>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2 italic">Ciudad</p>
                <p className="text-zinc-100 font-heading text-lg uppercase leading-tight">{pantalla?.ciudad || '—'}</p>
                </div>
                <div className="col-span-1 md:col-span-1">
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2 italic">Ubicación Fina</p>
                <p className="text-zinc-400 text-xs uppercase leading-tight">{pantalla?.ubicacion || 'No especificada'}</p>
                </div>
                <div>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2 italic">Revenue Share</p>
                <p className="text-primary font-mono font-bold text-2xl">{hostData.porcentaje}%</p>
                </div>
            </div>
          </section>

          {/* Historial de Comisiones */}
          <section>
            <h2 className="text-sm font-heading uppercase tracking-widest mb-4 text-gradient flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Historial de Emisiones
            </h2>
            <div className="cyber-card overflow-hidden bg-zinc-900/20 backdrop-blur-md">
              {comisiones && comisiones.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] uppercase font-mono text-zinc-500">Campaña</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-mono text-zinc-500">Ingreso Total</th>
                      <th className="px-6 py-4 text-[10px] uppercase font-mono text-zinc-500">Tu Parte</th>
                      <th className="px-6 py-4 text-right text-[10px] uppercase font-mono text-zinc-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comisiones.map((com: any) => (
                      <tr key={com.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-heading text-zinc-100 uppercase text-[11px] tracking-wide">
                          {com.campanas?.nombre_campana || 'Campaña eliminada'}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{com.importe_bruto?.toFixed(2)}€</td>
                        <td className="px-6 py-4 font-mono text-primary font-bold text-xs">+{com.importe_host?.toFixed(2)}€</td>
                        <td className="px-6 py-4 text-right text-zinc-500 font-mono text-[10px]">
                          {new Date(com.created_at).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center">
                  <History className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
                    Esperando actividad publicitaria en este nodo...
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Columna Derecha: Finanzas Globales de esta pantalla */}
        <div className="space-y-6">
            <h2 className="text-sm font-heading uppercase tracking-widest text-gradient flex items-center gap-2">
                <Wallet className="w-4 h-4 text-secondary" /> Billetera del Nodo
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
                {[
                    { label: 'Total Acumulado', value: `${totalGenerado.toFixed(2)}€`, icon: TrendingUp, color: 'text-zinc-100', bg: 'bg-zinc-900/50' },
                    { label: 'Saldo Pendiente', value: `${(hostData.saldo_pendiente || 0).toFixed(2)}€`, icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-400/5' },
                    { label: 'Cobrado con éxito', value: `${(hostData.saldo_pagado || 0).toFixed(2)}€`, icon: ChevronRight, color: 'text-green-400', bg: 'bg-green-400/5' },
                ].map((item) => (
                    <div key={item.label} className={`cyber-card p-6 ${item.bg} border-white/5`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{item.label}</p>
                            <item.icon className={`w-4 h-4 ${item.color} opacity-40`} />
                        </div>
                        <p className={`text-4xl font-mono font-bold tracking-tighter ${item.color}`}>{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 font-mono uppercase leading-relaxed">
                    Las liquidaciones se realizan automáticamente al alcanzar los 50.00€. 
                    Asegúrate de tener tus datos de facturación actualizados en el perfil.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
