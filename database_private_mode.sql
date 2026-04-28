-- =====================================================
-- LUMINADDDD — Private Mode (Corporate)
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Añadir columna de visibilidad a pantallas
ALTER TABLE pantallas 
ADD COLUMN IF NOT EXISTS es_publica BOOLEAN DEFAULT TRUE;

-- 2. Actualizar las políticas de RLS para el Marketplace Híbrido
-- El objetivo es que cualquier usuario pueda ver las pantallas públicas de otros,
-- pero que las privadas solo sean visibles para su dueño (organización).

DROP POLICY IF EXISTS "Usuarios ven pantallas de su org" ON pantallas;
DROP POLICY IF EXISTS "Acceso hibrido marketplace" ON pantallas;

CREATE POLICY "Acceso hibrido marketplace" ON pantallas
FOR ALL USING (
  es_publica = true 
  OR organizacion_id IN (
    SELECT organizacion_id FROM perfiles WHERE id = auth.uid()
  )
);

-- NOTA: Esto garantiza que al crear una campaña, el selector solo muestre
-- lo que es público O lo que te pertenece.
