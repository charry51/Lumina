import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { PairingForm } from '@/app/admin/pantallas/PairingForm'

export default async function HostDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener todos los registros de host vinculados a este perfil
  const { data: hosts } = await supabase
    .from('hosts')
    .select('*, pantallas(id, nombre, ciudad, estado, precio_emision)')
    .eq('perfil_id', user.id)

  const hasScreens = hosts && hosts.length > 0

  if (!hasScreens) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-foreground p-8 font-sans flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-heading font-black text-gradient mb-2">BIENVENIDO A LUMINA</h1>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[3px]">Convierte tu local en ingresos publicitarios</p>
            </header>

            <div className="cyber-card p-8 bg-zinc-900/50 backdrop-blur-xl border-primary/20">
                <div className="mb-6">
                    <h2 className="text-lg font-heading text-zinc-100 uppercase mb-2">Vincular mi primera pantalla</h2>
                    <p className="text-zinc-500 text-xs">Asegúrate de que tu TV muestra el código de vinculación (LM-XXX) entrando en lumina.app/vincular desde ella.</p>
                </div>
                <PairingForm />
            </div>

            <p className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                ¿Necesitas ayuda? lumina.app/soporte
            </p>
        </div>
      </div>
    )
  }

  // Si tiene pantallas, usamos la primera para el dashboard simplificado actual
  const hostData = hosts[0]

  // Obtener historial de comisiones
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
      {/* Header */}
      <header className="mb-10 border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-gradient">LUMINA</h1>
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-[3px] mt-1">Portal del Propietario</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
          <p className="text-[10px] text-primary font-mono uppercase tracking-widest mt-1">Perfil Host Activo</p>
        </div>
      </header>

      {/* Tarjeta de la Pantalla */}
      <section className="mb-10">
        <h2 className="text-sm font-heading uppercase tracking-widest mb-4 text-gradient flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_#00d2ff]"></span>
          Tu Pantalla
        </h2>
        <div className="cyber-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Nombre</p>
            <p className="text-zinc-100 font-heading text-lg uppercase">{pantalla?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Ciudad</p>
            <p className="text-zinc-100 font-heading text-lg uppercase">{pantalla?.ciudad || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Estado</p>
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              pantalla?.estado === 'activa'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-zinc-800 text-zinc-500'
            }`}>
              {pantalla?.estado || 'Inactiva'}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Tu Comisión</p>
            <p className="text-primary font-mono font-bold text-xl">{hostData.porcentaje}%</p>
          </div>
        </div>
      </section>

      {/* Resumen Financiero */}
      <section className="mb-10">
        <h2 className="text-sm font-heading uppercase tracking-widest mb-4 text-gradient flex items-center gap-2">
          <span className="w-1 h-5 bg-secondary rounded-full shadow-[0_0_10px_#6c5ce7]"></span>
          Resumen de Ingresos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Total Generado', value: `${totalGenerado.toFixed(2)}€`, color: 'text-zinc-100' },
            { label: 'Pendiente de Cobro', value: `${(hostData.saldo_pendiente || 0).toFixed(2)}€`, color: 'text-yellow-400' },
            { label: 'Ya Cobrado', value: `${(hostData.saldo_pagado || 0).toFixed(2)}€`, color: 'text-green-400' },
          ].map((item) => (
            <div key={item.label} className="cyber-card p-6">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">{item.label}</p>
              <p className={`text-3xl font-mono font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Historial de Comisiones */}
      <section>
        <h2 className="text-sm font-heading uppercase tracking-widest mb-4 text-gradient flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_#00d2ff]"></span>
          Historial de Comisiones
        </h2>
        <div className="cyber-card overflow-hidden">
          {comisiones && comisiones.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="cyber-table-header">Campaña</th>
                  <th className="cyber-table-header">Precio Emisión</th>
                  <th className="cyber-table-header">Tu Comisión ({hostData.porcentaje}%)</th>
                  <th className="cyber-table-header">Estado</th>
                  <th className="cyber-table-header">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {comisiones.map((com: any) => (
                  <tr key={com.id} className="cyber-table-row">
                    <td className="px-6 py-4 font-heading text-zinc-100 uppercase text-xs">
                      {com.campanas?.nombre_campana || 'Campaña eliminada'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{com.importe_total?.toFixed(2)}€</td>
                    <td className="px-6 py-4 font-mono text-primary font-bold text-xs">{com.comision?.toFixed(2)}€</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                        com.estado === 'pagada'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {com.estado === 'pagada' ? '✓ Pagada' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-[10px]">
                      {new Date(com.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-sm italic">
                Aún no hay comisiones registradas. Se generarán automáticamente cuando se aprueben campañas en tu pantalla.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
