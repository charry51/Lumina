'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  // 1. Obtener la campaña para saber la URL del archivo
  const { data: campana } = await supabase
    .from('campanas')
    .select('url_video')
    .eq('id', campaignId)
    .single()

  // 2. Borrar de la base de datos (RLS debería encargarse de que solo borre lo suyo o sea admin)
  const { error } = await supabase
    .from('campanas')
    .delete()
    .eq('id', campaignId)

  if (error) {
    console.error("Error deleting campaign:", error)
    return { success: false, error: error.message }
  }

  // 3. Opcional: Borrar el archivo de Storage si ya no se usa
  // Para simplificar esta fase, lo mantenemos en storage (limpieza posterior)

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  revalidatePath('/admin/campanas')
  
  return { success: true }
}
