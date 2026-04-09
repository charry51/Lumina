-- 1. Crear tabla de organizaciones
CREATE TABLE IF NOT EXISTS organizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modificar tablas existentes para incluir organization_id
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id),
ADD COLUMN IF NOT EXISTS prueba_fin TIMESTAMP WITH TIME ZONE;

ALTER TABLE pantallas 
ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id);

ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id);

-- 3. Crear tabla de logs (Proof of Play)
CREATE TABLE IF NOT EXISTS logs_reproduccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pantalla_id UUID REFERENCES pantallas(id) ON DELETE SET NULL,
  campana_id UUID REFERENCES campanas(id) ON DELETE SET NULL,
  organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
  file_hash TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 4. Habilitar RLS en la nueva tabla de logs
ALTER TABLE logs_reproduccion ENABLE ROW LEVEL SECURITY;

-- 5. Ejemplo de Políticas RLS Multi-tenant
-- Estas asumen que el usuario tiene su organizacion_id cargado en su perfil

-- Política para campanas
DROP POLICY IF EXISTS "Usuarios ven campanas de su org" ON campanas;
CREATE POLICY "Usuarios ven campanas de su org" ON campanas
FOR ALL USING (
  organizacion_id IN (
    SELECT organizacion_id FROM perfiles WHERE id = auth.uid()
  )
);

-- Política para pantallas
DROP POLICY IF EXISTS "Usuarios ven pantallas de su org" ON pantallas;
CREATE POLICY "Usuarios ven pantallas de su org" ON pantallas
FOR ALL USING (
  organizacion_id IN (
    SELECT organizacion_id FROM perfiles WHERE id = auth.uid()
  )
);

-- Política para logs
DROP POLICY IF EXISTS "Usuarios ven logs de su org" ON logs_reproduccion;
CREATE POLICY "Usuarios ven logs de su org" ON logs_reproduccion
FOR SELECT USING (
  organizacion_id IN (
    SELECT organizacion_id FROM perfiles WHERE id = auth.uid()
  )
);

-- 6. Actualizar tabla de planes con los precios Market-Ready
-- PRIMERO: Desvinculamos usuarios de planes antiguos para evitar errores de integridad
UPDATE perfiles SET plan_id = NULL WHERE plan_id IN ('starter', 'business', 'enterprise', 'agency', 'basico', 'local_plus', 'multilocal', 'premium');

-- SEGUNDO: Borramos absolutamente todos los planes antiguos para evitar duplicados en la UI
DELETE FROM planes WHERE id IN ('starter', 'business', 'enterprise', 'agency', 'basico', 'local_plus', 'multilocal', 'premium');

-- TERCERO: Insertamos solo los 4 niveles oficiales solicitado
INSERT INTO planes (id, nombre, precio_mensual, max_campanas, max_pantallas, max_duracion_segundos, prioridad, color_hex)
VALUES 
('presencia', 'Presencia Pro', 79.00, 3, 1, 10, 'baja', '#94a3b8'),
('impacto', 'Impacto Senior', 199.00, 5, 3, 15, 'estandar', '#00d2ff'),
('expansion', 'Expansión Elite', 449.00, 20, 10, 20, 'alta', '#6c5ce7'),
('dominio', 'Dominio Imperial', 899.00, 999, 999, 60, 'maxima', '#f8f9fa')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  precio_mensual = EXCLUDED.precio_mensual,
  max_pantallas = EXCLUDED.max_pantallas,
  max_campanas = EXCLUDED.max_campanas,
  prioridad = EXCLUDED.prioridad;

-- ACTUALIZACIÓN FINAL: Forzamos el flujo de onboarding para nuevos usuarios
-- Eliminamos el plan por defecto para que tengan que elegir uno en /planes
ALTER TABLE perfiles ALTER COLUMN plan_id DROP DEFAULT;
ALTER TABLE perfiles ALTER COLUMN suscripcion_activa SET DEFAULT false;

-- RE-IMPLEMENTACIÓN DE TRIGGER: Garantiza que el INSERT de perfiles no use valores antiguos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol, plan_id, suscripcion_activa)
  VALUES (new.id, 'cliente', NULL, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
