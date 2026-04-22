-- Parche para agregar la columna 'nombre' a la tabla perfiles
-- Ejecuta este script en el editor SQL de Supabase

ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS nombre TEXT;
