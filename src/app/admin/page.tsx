import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Analíticas básicas para el superadmin (conteos)
  const [{ count: totalCampanas }, { count: totalPantallas }] = await Promise.all([
    supabase.from('campanas').select('*', { count: 'exact', head: true }),
    supabase.from('pantallas').select('*', { count: 'exact', head: true })
  ])

  // Últimas campañas pendientes
  const { data: pendientes } = await supabase
    .from('campanas')
    .select('id, nombre_campana, estado, fecha_inicio')
    .eq('estado', 'pendiente_aprobacion')
    .limit(5)

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Visión Global</h1>
        <p className="text-zinc-500">Métricas principales de la red Lumina.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Pantallas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPantallas || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCampanas || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-[#D4AF37] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Pendientes Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4AF37]">{pendientes?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Campañas que requieren tu atención</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {pendientes && pendientes.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Campaña</th>
                  <th className="px-6 py-4">Fecha Solicitud</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pendientes.map(camp => (
                  <tr key={camp.id} className="hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium">{camp.nombre_campana}</td>
                    <td className="px-6 py-4">{camp.fecha_inicio}</td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold uppercase">
                        {camp.estado.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="p-8 text-center text-zinc-500">No hay campañas pendientes de aprobar.</div>
          )}
        </div>
      </div>
    </div>
  )
}
