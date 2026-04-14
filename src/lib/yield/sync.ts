'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Función para sincronizar y actualizar el precio_emision de una pantalla
 * basado en la demanda actual (Multiplicador_Demanda).
 */
export async function syncScreenPrice(pantallaId: string) {
  const supabase = await createClient()
  
  // 1. Obtener datos base de la pantalla
  const { data: pantalla } = await supabase
    .from('pantallas')
    .select('zona, precio_base_zona')
    .eq('id', pantallaId)
    .single()

  if (!pantalla) return

  // 2. Calcular Multiplicador de Demanda basado en campañas activas
  // Contamos campañas que están aprobadas o pre-aprobadas
  const { count } = await supabase
    .from('campanas')
    .select('*', { count: 'exact', head: true })
    .eq('pantalla_id', pantallaId)
    .in('estado', ['aprobada', 'pre_aprobada', 'activa'])

  const activeCampaigns = count || 0
  
  // Multiplicador_Demanda: +15% por cada campaña activa que compite por tiempo
  const demandMultiplier = 1 + (activeCampaigns * 0.15) 

  const basePrice = pantalla.precio_base_zona || 50.00
  const finalPrice = parseFloat((basePrice * demandMultiplier).toFixed(2))

  // 3. Persistir el nuevo precio dinámico para que los nuevos compradores lo vean
  await supabase
    .from('pantallas')
    .update({ precio_emision: finalPrice })
    .eq('id', pantallaId)
}
