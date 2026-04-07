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

  // Buscar todas las campañas válidas de esta pantalla
  // Ahora mismo filtraremos sin mirar fechas para simplificar, pero ordenadas por prioridad o fecha.
  const { data: campanas, error } = await supabase
    .from('campanas')
    .select('id, url_video, nombre_campana')
    .eq('pantalla_id', id)
    // .eq('estado', 'aprobada') // Descomenta si usas 'estado' estrictamente
  
  if (error) {
    console.error("Error fetching campanas for screen:", error)
    // Dejamos que el cliente reciba un array vacío y muestre el estado de espera
  }

  const playlist = campanas?.map(c => c.url_video).filter(Boolean) || []

  return (
    <main className="w-screen h-screen bg-black overflow-hidden m-0 p-0 cursor-none">
      <PlaylistRunner playlist={playlist} />
    </main>
  )
}
