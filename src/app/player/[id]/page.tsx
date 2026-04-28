import { createClient } from '@/lib/supabase/server'
import PlaylistRunner from './PlaylistRunner'

export const metadata = {
  title: 'LuminAdd Player v2.0',
  robots: 'noindex, nofollow',
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // Fetch campaigns that are:
  // 1. Approved
  // 2. Scheduled for today
  // 3. For this screen (or global)
  // 4. STILL HAVE BUDGET (impactos_reales < impactos_estimados)
  const { data: campanasData, error } = await supabase
    .from('campanas')
    .select(`
        id, 
        url_video, 
        nombre_campana, 
        hora_inicio, 
        hora_fin, 
        prioridad, 
        impactos_estimados, 
        impactos_reales
    `)
    .or(`pantalla_id.eq.${id},pantalla_id.is.null`)
    .in('estado', ['aprobada', 'pre_aprobada'])
    .lte('fecha_inicio', today)
    .gte('fecha_fin', today)
  
  if (error) {
    console.error("[Player Fetch Error]", error)
  }

  // Filter out campaigns that have reached their target
  // We leave a 5% margin for safety in high-concurrency environments
  const validCampaigns = campanasData?.filter(c => 
    c.impactos_reales < (c.impactos_estimados * 1.05) || c.impactos_estimados === 0
  ) || []

  return (
    <main className="w-screen h-screen bg-black overflow-hidden m-0 p-0 cursor-none">
      <PlaylistRunner 
        screenId={id} 
        playlist={validCampaigns.map(c => ({
            id: c.id,
            url_video: c.url_video,
            hora_inicio: c.hora_inicio,
            hora_fin: c.hora_fin,
            prioridad: c.prioridad || 1
        }))} 
      />
    </main>
  )
}


