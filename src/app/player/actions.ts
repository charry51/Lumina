'use server'

import { createClient } from '@/lib/supabase/server'

export async function logPlayback(campanaId: string, pantallaId: string) {
  const supabase = await createClient()

  // 1. Obtener la organización de la pantalla para mantener la integridad del multi-tenancy
  const { data: pantalla } = await supabase
    .from('pantallas')
    .select('organizacion_id')
    .eq('id', pantallaId)
    .single()

  if (!pantalla?.organizacion_id) {
    console.error("Screen has no organization assigned")
    return { success: false, error: "Screen organization mismatch" }
  }

  // 2. Guardar log "Proof of Play" (Inmutable)
  const { error } = await supabase
    .from('logs_reproduccion')
    .insert({
      campana_id: campanaId,
      pantalla_id: pantallaId,
      organizacion_id: pantalla.organizacion_id,
      timestamp: new Date().toISOString()
    })

  if (error) {
    console.error("Error logging playback:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
