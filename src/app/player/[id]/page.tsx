import { createClient } from '@/lib/supabase/server'
import PlaylistRunner from './PlaylistRunner'

// Optimizamos metadata para pantallas
export const metadata = {
  title: 'Lumina Player',
  robots: 'noindex, nofollow',
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // 2. Obtener campañas (Query robusta)
  const { data: campanasData, error: campError } = await supabase
    .from('campanas')
    .select('id, url_video, nombre_campana, hora_inicio, hora_fin, cliente_id, fecha_inicio, fecha_fin, estado')
    .or(`pantalla_id.eq.${id},pantalla_id.is.null`)
    .eq('estado', 'aprobada')
    .lte('fecha_inicio', today)
    .gte('fecha_fin', today)
  
  if (campError) {
    console.log("!!!DEBUG_PLAYER_ERROR!!!", campError);
  }

  // 3. Obtener prioridades de planes de los clientes de estas campañas (Sin JOIN directo)
  const clienteIds = Array.from(new Set(campanasData?.map(c => c.cliente_id) || []))
  
  const { data: perfilesData } = await supabase
    .from('perfiles')
    .select('id, planes(prioridad)')
    .in('id', clienteIds)

  // Mapeo de prioridades (Manejo de array o objeto de Supabase)
  const clientePrioridades = new Map(
    perfilesData?.map(p => {
       const planesObj: any = p.planes;
       const prioridad = Array.isArray(planesObj) ? planesObj[0]?.prioridad : planesObj?.prioridad;
       return [p.id, prioridad || 'estandar']
    }) || []
  )

  // 4. Lógica de Algoritmo de Prioridad
  let playlistItems: any[] = []

  campanasData?.forEach((camp: any) => {
    const prioridad = clientePrioridades.get(camp.cliente_id) || 'estandar'
    let multiplier = 1

    if (prioridad === 'maxima') multiplier = 4
    if (prioridad === 'alta') multiplier = 3
    if (prioridad === 'estandar') multiplier = 2
    if (prioridad === 'baja') multiplier = 1

    for (let i = 0; i < multiplier; i++) {
        playlistItems.push({
            id: camp.id,
            url_video: camp.url_video,
            hora_inicio: camp.hora_inicio,
            hora_fin: camp.hora_fin
        })
    }
  })

  // Mezclamos un poco la playlist para distribuir prioridades
  playlistItems = playlistItems.sort(() => Math.random() - 0.5)

  return (
    <main className="w-screen h-screen bg-black overflow-hidden m-0 p-0 cursor-none">
      <PlaylistRunner screenId={id} playlist={playlistItems} />
    </main>
  )
}
