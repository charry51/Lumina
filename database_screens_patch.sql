-- =====================================================
-- LUMINADDDD — Screen & Plan Expansion Patch
-- =====================================================

-- 1. Añadir columna de ubicación física (si no existe)
ALTER TABLE pantallas 
ADD COLUMN IF NOT EXISTS ubicacion TEXT;

-- 2. Ampliar el límite de pantallas del plan "Presencia Pro" (de 1 a 5)
-- Esto permite a los pequeños hosts registrar múltiples TVs en su local
UPDATE planes 
SET max_pantallas = 5 
WHERE id = 'presencia';

-- 3. Asegurar que las coordenadas lat/long están disponibles 
-- (ya se añadieron antes, pero lo aseguramos para el mapa)
ALTER TABLE pantallas 
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);
