-- =====================================================
-- LUMINA — Campaign Budget & Org Patch
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Añadir precio pactado a las campañas (para auditoría de ingresos)
ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS precio_pactado NUMERIC(10,2) DEFAULT 50.00;

-- 2. Asegurar que organizacion_id y ia_metadata existen
ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS organizacion_id UUID REFERENCES organizaciones(id),
ADD COLUMN IF NOT EXISTS ia_metadata JSONB DEFAULT '{}'::jsonb;

-- 3. AUTO-REPARACIÓN DE ORGANIZACIONES
-- Creamos una organización para cualquier usuario que no tenga una
DO $$
DECLARE
    r RECORD;
    new_org_id UUID;
BEGIN
    FOR r IN SELECT id FROM perfiles WHERE organizacion_id IS NULL LOOP
        INSERT INTO organizaciones (nombre) VALUES ('Organización de ' || r.id) RETURNING id INTO new_org_id;
        UPDATE perfiles SET organizacion_id = new_org_id WHERE id = r.id;
    END LOOP;
END $$;
