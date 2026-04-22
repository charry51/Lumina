'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { 
    nombre?: string; 
    nombre_empresa?: string; 
    nif?: string; 
    telefono?: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'No autorizado' }
    }

    const { error } = await supabase
        .from('perfiles')
        .update(data)
        .eq('id', user.id)

    if (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/perfil')
    return { success: true }
}

export async function cancelPlan() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'No autorizado' }
    }

    const { error } = await supabase
        .from('perfiles')
        .update({ 
            plan_id: null, 
            suscripcion_activa: false 
        })
        .eq('id', user.id)

    if (error) {
        console.error("Error cancelling plan:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/perfil')
    return { success: true }
}
