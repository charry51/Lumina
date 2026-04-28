/**
 * LUMINADDDD — AI Content Validator (Mock Service)
 * Simula la integración con Google Cloud Video Intelligence API
 */

export type IAResult = {
  status: 'safe' | 'flagged' | 'rejected';
  score: number; // 0 a 1 (1 = muy peligroso)
  labels: string[];
  reason?: string;
}

export async function analyzeVideo(videoUrl: string, duration?: number): Promise<IAResult> {
  console.log(`[LUMINADDDD IA] Iniciando escaneo de seguridad: ${videoUrl} (${duration}s)`);
  
  // Simulamos un retraso de procesamiento de red de 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // --- NEW: Duration Policy Check (AI Simulated) ---
  if (duration !== undefined && (duration < 5 || duration > 30.5)) {
    return {
      status: 'rejected',
      score: 1.0,
      labels: ['policy_violation', 'invalid_duration'],
      reason: `La duración del video (${Math.round(duration)}s) no cumple con el protocolo LUMINADDDD (5-30s).`
    };
  }
  // --------------------------------------------------

  // Heurística de ejemplo: 
  // Si el nombre del archivo contiene palabras clave, simulamos detección
  const lowerUrl = videoUrl.toLowerCase();
  
  if (lowerUrl.includes('test_danger')) {
    return {
      status: 'rejected',
      score: 0.98,
      labels: ['violencia_explicita', 'armas'],
      reason: 'Contenido prohibido detectado por IA (Violencia)'
    };
  }

  if (lowerUrl.includes('test_suspicious')) {
    return {
      status: 'flagged',
      score: 0.65,
      labels: ['alcohol', 'tabaco'],
      reason: 'Contenido sensible detectado: revisión manual recomendada'
    };
  }

  // Comportamiento por defecto: El vídeo es seguro
  return {
    status: 'safe',
    score: 0.02,
    labels: ['publico_general', 'comercial', 'seguro'],
  };
}
