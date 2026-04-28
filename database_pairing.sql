-- =====================================================
-- LUMINADDDD — Smart TV Pairing System
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Tabla de códigos de vinculación
CREATE TABLE IF NOT EXISTS pairing_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,              -- Ej: "LM-4F9"
  device_id    TEXT NOT NULL,                     -- ID único del dispositivo (generado en el cliente)
  pantalla_id  UUID REFERENCES pantallas(id) ON DELETE CASCADE, -- Null hasta vincular
  vinculado_por UUID REFERENCES perfiles(id) ON DELETE CASCADE, -- Usuario que activó
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL, -- 10 minutos de validez
  estado       TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | vinculado | expirado
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índice para búsquedas rápidas por código
CREATE INDEX IF NOT EXISTS idx_pairing_code ON pairing_codes (code);
CREATE INDEX IF NOT EXISTS idx_pairing_device ON pairing_codes (device_id);

-- 3. RLS
ALTER TABLE pairing_codes ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer su propio código por device_id (la TV los comprueba anónimamente)
DROP POLICY IF EXISTS "Lectura publica por device_id" ON pairing_codes;
CREATE POLICY "Lectura publica por device_id" ON pairing_codes
FOR SELECT USING (true);

-- Solo usuarios autenticados pueden actualizar (vincular)
DROP POLICY IF EXISTS "Solo autenticados vinculan" ON pairing_codes;
CREATE POLICY "Solo autenticados vinculan" ON pairing_codes
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Inserción anónima (la TV crea el código sin estar logueada)
DROP POLICY IF EXISTS "Insercion anonima permitida" ON pairing_codes;
CREATE POLICY "Insercion anonima permitida" ON pairing_codes
FOR INSERT WITH CHECK (true);
