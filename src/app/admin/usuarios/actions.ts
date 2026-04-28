'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const supabase = await createClient()

    // 1. Verificar que el que llama sea superadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'No autenticado' }

    const { data: perfilCaller } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfilCaller?.rol !== 'superadmin') {
      return { success: false, message: 'No tienes permisos suficientes' }
    }

    // 2. Actualizar el rol
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: newRole })
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating role:', err)
    return { success: false, message: err.message }
  }
}

export async function updateUserPlan(userId: string, newPlanId: string) {
  try {
    const supabase = await createClient()

    // 1. Verificar que el que llama sea superadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'No autenticado' }

    const { data: perfilCaller } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfilCaller?.rol !== 'superadmin') {
      return { success: false, message: 'No tienes permisos suficientes' }
    }

    // 2. Actualizar el plan
    const { error } = await supabase
      .from('perfiles')
      .update({ plan_id: newPlanId })
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating plan:', err)
    return { success: false, message: err.message }
  }
}
