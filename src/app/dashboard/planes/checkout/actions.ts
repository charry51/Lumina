'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePlan(planId: string) {
  const supabase = await createClient()

  // Seguridad: obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Actualizar el plan en el perfil
  const { error } = await supabase
    .from('perfiles')
    .update({ 
      plan_id: planId,
      suscripcion_activa: true 
    })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/planes')
  
  return { success: true }
}
