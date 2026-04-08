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

  // 1. Obtener datos de campañas y sus planes
  const { data: campanasData, error } = await supabase
    .from('campanas')
    .select(`
      id, 
      url_video, 
      nombre_campana,
      hora_inicio,
      hora_fin,
      perfiles (
        planes ( prioridad )
      )
    `)
    .eq('pantalla_id', id)
    // .eq('estado', 'aprobada') // En pro, descomentar para que salgan solo aprobadas
  
  if (error) {
    console.error("Error fetching campanas for screen:", error)
  }

  // 2. Lógica de Algoritmo de Prioridad y Scheduling Básico Temporal
  // Mapeamos a un formato más limpio para el cliente
  // Multiplicador: Máxima(4), Alta(3), Estandar(2), Baja(1)
  let playlistItems: any[] = []

  campanasData?.forEach((camp: any) => {
    // Si necesitas validar las horas exactas aquí (Server-Side)
    // podriamos hacerlo con date-fns, pero para simplificar lo inyectamos al cliente
    const prioridad = camp.perfiles?.planes?.prioridad || 'estandar'
    let multiplier = 1

    if (prioridad === 'maxima') multiplier = 4
    if (prioridad === 'alta') multiplier = 3
    if (prioridad === 'estandar') multiplier = 2

    // Inyectamos N veces la campaña en la lista según su prioridad (Algoritmo Básico)
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
