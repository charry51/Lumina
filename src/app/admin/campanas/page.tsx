import { createClient } from '@/lib/supabase/server'
import { ActionButtons } from './ActionButtons'
import { CampaignPreview } from './CampaignPreview'

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
    return <div className="p-8 text-red-500 bg-red-950/20 border border-red-900 rounded-lg">Error: {error.message}</div>
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <header className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-zinc-100 italic tracking-tight">GESTIÓN DE <span className="text-[#D4AF37] NOT-italic">CAMPAÑAS</span></h1>
        <p className="text-zinc-500">Administra, aprueba o rechaza el contenido subido por los clientes.</p>
      </header>

      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900 text-zinc-400 font-medium border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Campaña</th>
              <th className="px-6 py-4">Pantalla Destino</th>
              <th className="px-6 py-4">Fechas</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Visualización</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-zinc-300">
            {campanas?.map((camp: any) => (
              <tr key={camp.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{camp.nombre_campana}</td>
                <td className="px-6 py-4">
                  {camp.pantallas ? (
                    <div className="flex flex-col">
                        <span className="text-zinc-200">{camp.pantallas.nombre}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{camp.pantallas.ubicacion}</span>
                    </div>
                  ) : 'No asignada'}
                </td>
                <td className="px-6 py-4 text-zinc-500">{camp.fecha_inicio}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    camp.estado === 'aprobada' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    camp.estado === 'rechazada' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {camp.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <CampaignPreview url={camp.url_video} nombre={camp.nombre_campana} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 items-center">
                    {camp.estado !== 'pendiente_aprobacion' && (
                        <span className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.2em] pr-2 border-r border-zinc-800 h-4 flex items-center">PROCESADA</span>
                    )}
                    <ActionButtons campanaId={camp.id} estado={camp.estado} />
                  </div>
                </td>
              </tr>
            ))}
            {(!campanas || campanas.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-600 bg-zinc-950">
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
