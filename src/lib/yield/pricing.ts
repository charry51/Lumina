export type ZonaType = 'standard' | 'gold' | 'vip'

export const ZONA_MULTIPLIERS: Record<ZonaType, number> = {
  standard: 1.0, 
  gold: 1.5,
  vip: 2.5
}

// Multiplicadores por franja horaria (Handwritten Note)
// Pico: 1.5x (18:00 - 21:00)
// Valle: 0.5x (Resto o baja demanda)
export function getTimeMultiplier(hour: number): number {
  if (hour >= 18 && hour <= 21) return 1.5
  if (hour >= 0 && hour <= 6) return 0.5 // Madrugada muy baja
  return 1.0
}

export type ScreenType = 'bar' | 'gimnasio' | 'restaurante' | 'calle' | 'centro_comercial' | 'calle_principal'
export type DensityLevel = 'bajo' | 'medio' | 'alto' | 'muy_alto'

export const SCREEN_TYPE_MULTIPLIERS: Record<ScreenType, number> = {
  bar: 0.5,
  gimnasio: 1.0,
  restaurante: 1.2,
  calle: 1.5,
  centro_comercial: 2.0,
  calle_principal: 2.5
}

export const DENSITY_MULTIPLIERS: Record<DensityLevel, number> = {
  bajo: 0.8,
  medio: 1.0,
  alto: 1.2,
  muy_alto: 1.5
}

// Precio base estimado por cada visualización (impacto), e.g., 5 céntimos
export const BASE_COST_PER_IMPACT = 0.05

export interface PricingParams {
  zona?: ZonaType
  tipoPantalla?: ScreenType
  densidadNivel?: DensityLevel
  duracionSegundos: number
  prioridad: number
  presupuestoTotal: number
  frecuenciaRelativa?: number // 1x, 2x, 3x, 4x según plan
}

/**
 * Calcula los impactos estimados (reproducciones completas) que obtendrá
 * una campaña dado un presupuesto total, la duración del media, su prioridad
 * y la zona donde se emitirá.
 */
export function calculateEstimatedImpacts({
  zona = 'standard',
  tipoPantalla = 'gimnasio',
  densidadNivel = 'medio',
  duracionSegundos,
  prioridad,
  presupuestoTotal,
  frecuenciaRelativa = 1
}: PricingParams): number {
  if (presupuestoTotal <= 0 || duracionSegundos <= 0) return 0

  const zonaMultiplier = ZONA_MULTIPLIERS[zona]
  const typeMultiplier = SCREEN_TYPE_MULTIPLIERS[tipoPantalla]
  const densityMultiplier = DENSITY_MULTIPLIERS[densidadNivel]
  
  // A mayor prioridad, más rápido gasta el budget (penalty de 10% por punto de prioridad)
  const priorityPenalty = 1 + (prioridad * 0.1) 
  
  // Si el video es largo, gasta más presupuesto por cada vez que se emite. (Base normalizada a 10s)
  const durationMultiplier = duracionSegundos / 10 

  // Promedio ponderado del multiplicador de tiempo (asumiendo reparto uniforme día/noche)
  const avgTimeMultiplier = 0.93

  const costPerImpact = BASE_COST_PER_IMPACT * 
                        zonaMultiplier * 
                        typeMultiplier * 
                        densityMultiplier * 
                        priorityPenalty * 
                        durationMultiplier * 
                        avgTimeMultiplier
  
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
   const avgTimeMultiplier = 0.93

   const costPerImpact = BASE_COST_PER_IMPACT * zonaMultiplier * priorityPenalty * durationMultiplier * avgTimeMultiplier
   
   return parseFloat((targetImpacts * costPerImpact).toFixed(2))
}

