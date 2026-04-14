'use server'

import { createClient } from '@/lib/supabase/server'

export async function logPlayback(campanaId: string, pantallaId: string) {
  const supabase = await createClient()

  // 1. Get screen organization for integrity
  const { data: pantalla } = await supabase
    .from('pantallas')
    .select('organizacion_id')
    .eq('id', pantallaId)
    .single()

  if (!pantalla?.organizacion_id) {
    console.error("Screen has no organization assigned")
    return { success: false, error: "Screen organization mismatch" }
  }

  // 2. Register "Proof of Play" (Verificadas)
  // This triggers the database update of impactos_reales
  const { error: errorPoP } = await supabase
    .from('reproducciones_verificadas')
    .insert({
      campana_id: campanaId,
      pantalla_id: pantallaId,
      organizacion_id: pantalla.organizacion_id
    })

  if (errorPoP) {
    console.error("Error logging PoP:", errorPoP)
    return { success: false, error: errorPoP.message }
  }

  // 3. Keep legacy log for backup audit if needed (Optional)
  try {
    await supabase.from('logs_reproduccion').insert({
      campana_id: campanaId,
      pantalla_id: pantallaId,
      organizacion_id: pantalla.organizacion_id,
      timestamp: new Date().toISOString()
    })
  } catch (e) {}

  return { success: true }
}
