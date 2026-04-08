'use server'

import { createClient } from '@/lib/supabase/server'

export async function logPlayback(campanaId: string, pantallaId: string) {
  const supabase = await createClient()

  // Guardar log "Proof of Play"
  const { error } = await supabase
    .from('reproducciones_logs')
    .insert({
      campana_id: campanaId,
      pantalla_id: pantallaId
    })

  if (error) {
    console.error("Error logging playback:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
