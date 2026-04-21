-- LUMINA: Smart Onboarding Patch
-- Añadir geolocalización a la tabla de vinculación

ALTER TABLE pairing_codes 
ADD COLUMN IF NOT EXISTS latitud NUMERIC,
ADD COLUMN IF NOT EXISTS longitud NUMERIC;

-- Comentario para el equipo
COMMENT ON COLUMN pairing_codes.latitud IS 'Latitud capturada por el navegador de la TV al generar el código';
COMMENT ON COLUMN pairing_codes.longitud IS 'Longitud capturada por el navegador de la TV al generar el código';
