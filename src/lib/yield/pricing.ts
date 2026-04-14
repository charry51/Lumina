export type ZonaType = 'standard' | 'gold' | 'vip'

export const ZONA_MULTIPLIERS: Record<ZonaType, number> = {
  standard: 1.0,
  gold: 1.5,
  vip: 2.5
}

// Precio base estimado por cada visualización (impacto), e.g., 5 céntimos
export const BASE_COST_PER_IMPACT = 0.05

export interface PricingParams {
  zona?: ZonaType
  duracionSegundos: number
  prioridad: number
  presupuestoTotal: number
}

/**
 * Calcula los impactos estimados (reproducciones completas) que obtendrá
 * una campaña dado un presupuesto total, la duración del media, su prioridad
 * y la zona donde se emitirá.
 */
export function calculateEstimatedImpacts({
  zona = 'standard',
  duracionSegundos,
  prioridad,
  presupuestoTotal
}: PricingParams): number {
  if (presupuestoTotal <= 0 || duracionSegundos <= 0) return 0

  const zonaMultiplier = ZONA_MULTIPLIERS[zona]
  
  // A mayor prioridad, más rápido gasta el budget (penalty de 10% por punto de prioridad)
  const priorityPenalty = 1 + (prioridad * 0.1) 
  
  // Si el video es largo, gasta más presupuesto por cada vez que se emite. (Base normalizada a 10s)
  const durationMultiplier = duracionSegundos / 10 

  // Coste real por reproducir UNA vez este medio
  const costPerImpact = BASE_COST_PER_IMPACT * zonaMultiplier * priorityPenalty * durationMultiplier
  
  return Math.floor(presupuestoTotal / costPerImpact)
}

/**
 * Función inversa: Sugiere un presupuesto mínimo si el usuario tiene
 * un objetivo en mente (ej: "Quiero 10.000 impactos")
 */
export function calculateSuggestedBudget(
  targetImpacts: number, 
  zona: ZonaType = 'standard', 
  duracionSegundos: number = 10,
  prioridad: number = 1
): number {
   if (targetImpacts <= 0) return 0

   const zonaMultiplier = ZONA_MULTIPLIERS[zona]
   const priorityPenalty = 1 + (prioridad * 0.1) 
   const durationMultiplier = duracionSegundos / 10

   const costPerImpact = BASE_COST_PER_IMPACT * zonaMultiplier * priorityPenalty * durationMultiplier
   
   return parseFloat((targetImpacts * costPerImpact).toFixed(2))
}

