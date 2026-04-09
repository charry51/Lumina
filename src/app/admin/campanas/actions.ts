'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function authorizeCampaignStatus(campaignId: string, newStatus: 'aprobada' | 'rechazada') {
  const supabase = await createClient()

  // 1. Obtener datos de la campaña (necesitamos la pantalla y el precio)
  const { data: campana } = await supabase
    .from('campanas')
    .select('id, pantalla_id, nombre_campana')
    .eq('id', campaignId)
    .single()

  // 2. Actualizar el estado de la campaña
  const { error } = await supabase
    .from('campanas')
    .update({ estado: newStatus })
    .eq('id', campaignId)

  if (error) {
    console.error("Error actualizando campaña:", error)
    return { success: false, error: error.message }
  }

  // 3. Si se APRUEBA: calcular y registrar la comisión del host
  if (newStatus === 'aprobada' && campana?.pantalla_id) {
    try {
      // Buscar si la pantalla tiene un host asignado
      const { data: host } = await supabase
        .from('hosts')
        .select('id, porcentaje, saldo_pendiente')
        .eq('pantalla_id', campana.pantalla_id)
        .single()

      if (host) {
        // Obtener el precio base de emisión de la pantalla
        const { data: pantalla } = await supabase
          .from('pantallas')
          .select('precio_emision, nombre')
          .eq('id', campana.pantalla_id)
          .single()

        const precioBase = pantalla?.precio_emision || 50.00
        const comisionImporte = precioBase * (host.porcentaje / 100)

        // Registrar la transacción de comisión
        await supabase.from('comisiones').insert({
          host_id: host.id,
          campana_id: campaignId,
          pantalla_id: campana.pantalla_id,
          importe_total: precioBase,
          comision: comisionImporte,
          porcentaje: host.porcentaje,
          estado: 'pendiente'
        })

        // Actualizar el saldo pendiente del host
        await supabase
          .from('hosts')
          .update({ saldo_pendiente: (host.saldo_pendiente || 0) + comisionImporte })
          .eq('id', host.id)

        console.log(`[Lumina Revenue] Comisión de ${comisionImporte.toFixed(2)}€ generada para host ${host.id}`)
      }
    } catch (revenueError) {
      // El error de revenue no bloquea la aprobación: solo lo logueamos
      console.error('[Lumina Revenue] Error calculando comisión:', revenueError)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/campanas')
  revalidatePath('/dashboard')

  return { success: true }
}
