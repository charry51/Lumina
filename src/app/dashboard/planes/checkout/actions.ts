'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePlan(planId: string) {
  const supabase = await createClient()

  // Seguridad: obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Si es el plan presencia, activamos el trial de 30 días
  const updateData: any = {
    plan_id: planId,
    suscripcion_activa: true
  }

  if (planId === 'presencia') {
    const trialDate = new Date()
    trialDate.setDate(trialDate.getDate() + 30)
    updateData.prueba_fin = trialDate.toISOString()
  }

  const { error } = await supabase
    .from('perfiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error("Error updating plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/planes')
  
  return { success: true }
}
