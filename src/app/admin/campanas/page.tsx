import { createClient } from '@/lib/supabase/server'
import { ActionButtons } from './ActionButtons'

export default async function GestionCampanasPage() {
  const supabase = await createClient()

  const { data: campanas, error } = await supabase
    .from('campanas')
    .select(`
      id, 
      nombre_campana, 
      estado, 
      fecha_inicio, 
      url_video,
      pantallas ( nombre, ubicacion )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Gestión de Campañas</h1>
        <p className="text-zinc-500">Administra, aprueba o rechaza el contenido subido por los clientes.</p>
      </header>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-950 text-zinc-400 font-medium">
            <tr>
              <th className="px-6 py-4">Campaña</th>
              <th className="px-6 py-4">Pantalla Destino</th>
              <th className="px-6 py-4">Fechas</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Visualización</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-zinc-300">
            {campanas?.map((camp: any) => (
              <tr key={camp.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4 font-medium text-white">{camp.nombre_campana}</td>
                <td className="px-6 py-4">
                  {camp.pantallas ? `${camp.pantallas.nombre} (${camp.pantallas.ubicacion})` : 'No asignada'}
                </td>
                <td className="px-6 py-4">{camp.fecha_inicio}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    camp.estado === 'aprobada' ? 'bg-green-500/10 text-green-400' :
                    camp.estado === 'rechazada' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {camp.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href={camp.url_video} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                    Ver Creatividad
                  </a>
                </td>
                <td className="px-6 py-4 text-right">
                  {camp.estado === 'pendiente_aprobacion' ? (
                    <ActionButtons campanaId={camp.id} />
                  ) : (
                    <span className="text-zinc-600 text-xs mt-2 italic">Procesada</span>
                  )}
                </td>
              </tr>
            ))}
            {(!campanas || campanas.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No hay campañas registradas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
