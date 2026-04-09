import { createClient } from '@/lib/supabase/server'

/**
 * LUMINA — Yield Management Engine
 * Calcula el valor real de una pantalla basado en su ocupación actual.
 */

export async function calculateDynamicPrice(pantallaId: string) {
  const supabase = await createClient()

  // 1. Obtener datos de la pantalla y sus campañas activas
  const { data: pantalla } = await supabase
    .from('pantallas')
    .select('precio_base, capacidad_maxima')
    .eq('id', pantallaId)
    .single()

  if (!pantalla) return null

  // 2. Contar campañas aprobadas o en emisión
  const { count } = await supabase
    .from('campanas')
    .select('id', { count: 'exact', head: true })
    .eq('pantalla_id', pantallaId)
    .in('estado', ['aprobada', 'pre_aprobada', 'emitiendo'])

  const ocupacion = count || 0
  const ratio = ocupacion / (pantalla.capacidad_maxima || 10)
  
  let multiplicador = 1.0

  // Algoritmo de Yield:
  if (ratio >= 0.8) {
    multiplicador = 1.6 // +60% (Saturación)
  } else if (ratio >= 0.6) {
    multiplicador = 1.35 // +35% (Alta demanda)
  } else if (ratio >= 0.4) {
    multiplicador = 1.15 // +15% (Creciendo)
  }

  const nuevoPrecio = (pantalla.precio_base || 50) * multiplicador

  return {
    precio: Number(nuevoPrecio.toFixed(2)),
    ocupacion,
    ratio,
    multiplicador
  }
}

/**
 * Sincroniza el precio de emisión en la base de datos
 */
export async function syncScreenPrice(pantallaId: string) {
  const supabase = await createClient()
  const result = await calculateDynamicPrice(pantallaId)

  if (result) {
    await supabase
      .from('pantallas')
      .update({ precio_emision: result.precio })
      .eq('id', pantallaId)
    
    console.log(`[Lumina Yield] Pantalla ${pantallaId}: Nuevo precio ${result.precio}€ (Ocupación: ${result.ocupacion})`)
  }
}
