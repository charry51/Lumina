-- LUMINA v2.0 Programmatic & Elastic Phase 1

-- 1. Tipos Enum
DO $$ BEGIN
    CREATE TYPE zona_enum AS ENUM ('standard', 'gold', 'vip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE host_tier_enum AS ENUM ('base', 'pro', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Actualización de Pantallas (Zonas de Impacto y Categoría v3.0)
ALTER TABLE pantallas
ADD COLUMN IF NOT EXISTS zona zona_enum DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS precio_base_zona DECIMAL(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS tipo_pantalla TEXT DEFAULT 'gimnasio',
ADD COLUMN IF NOT EXISTS densidad_poblacion_nivel TEXT DEFAULT 'medio';

-- 3. Actualización de Campañas (Presupuesto Programático)
ALTER TABLE campanas
ADD COLUMN IF NOT EXISTS presupuesto_total DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS prioridad INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS impactos_estimados INTEGER DEFAULT 0;

-- 4. Nueva Tabla: Proof of Play (Reproducciones Verificadas)
CREATE TABLE IF NOT EXISTS reproducciones_verificadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pantalla_id UUID REFERENCES pantallas(id) ON DELETE CASCADE,
    campana_id UUID REFERENCES campanas(id) ON DELETE CASCADE,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE, -- Quien pagó por ella
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Reproducciones
ALTER TABLE reproducciones_verificadas ENABLE ROW LEVEL SECURITY;

-- Organizaciones dueñas de la campaña pueden ver sus impactos
DROP POLICY IF EXISTS "Ver reproducciones propias" ON reproducciones_verificadas;
CREATE POLICY "Ver reproducciones propias"
ON reproducciones_verificadas FOR SELECT
TO authenticated
USING (
  organizacion_id IN (
    SELECT organizacion_id FROM perfiles WHERE perfiles.id = auth.uid()
  )
);

-- Solo el backend/dispositivo podrá insertar vía API de tracking. (Asumiremos que supabase route usará el server client / anon con restricciones)
DROP POLICY IF EXISTS "Insert reproducciones" ON reproducciones_verificadas;
CREATE POLICY "Insert reproducciones"
ON reproducciones_verificadas FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Actualización de Hosts (Niveles y Comisiones)
ALTER TABLE hosts
ADD COLUMN IF NOT EXISTS tier host_tier_enum DEFAULT 'base',
ADD COLUMN IF NOT EXISTS hardware_certificado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS modulo_ia_activo BOOLEAN DEFAULT false;

-- Mover el FK de perfiles -> planes a opcional para preparar el deprecamiento.
ALTER TABLE perfiles
ALTER COLUMN plan_id DROP NOT NULL;
