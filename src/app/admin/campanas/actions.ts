'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function authorizeCampaignStatus(campaignId: string, newStatus: 'aprobada' | 'rechazada') {
  const supabase = await createClient()

  // BYPASS TEMPORAL DE EMERGENCIA PARA PRUEBAS
  // Actualizar estado de la campaña directamente
  const { error } = await supabase
    .from('campanas')
    .update({ estado: newStatus })
    .eq('id', campaignId)

  if (error) {
    console.error("Error updating campaign:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/campanas')
  revalidatePath('/dashboard')
  
  return { success: true }
}
