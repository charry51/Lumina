'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function authorizeCampaignStatus(campaignId: string, newStatus: 'aprobada' | 'rechazada') {
  const supabase = await createClient()

  // Seguridad: Asegurar que quien ejecuta esto tiene rol de superadmin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'superadmin') {
    return { success: false, error: 'Permisos insuficientes' }
  }

  // Actualizar estado de la campaña
  const { error } = await supabase
    .from('campanas')
    .update({ estado: newStatus })
    .eq('id', campaignId)

  if (error) {
    console.error("Error updating campaign:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/campanas')
  revalidatePath('/dashboard') // Para que el cliente lo vea reflejado
  
  return { success: true }
}
