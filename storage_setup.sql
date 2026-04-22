-- 1. CREAR EL BUCKET (Si no existe ya)
-- Nota: En Supabase, esto inserta en la tabla de metadatos de storage
INSERT INTO storage.buckets (id, name, public)
SELECT 'support-attachments', 'support-attachments', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'support-attachments'
);

-- 2. POLÍTICAS DE RLS PARA EL BUCKET 'support-attachments'

-- ELIMINAR POLÍTICAS PREVIAS POR SEGURIDAD (Opcional si quieres resetear)
-- DROP POLICY IF EXISTS "Permitir subida a usuarios autenticados" ON storage.objects;
-- DROP POLICY IF EXISTS "Permitir lectura pública de adjuntos" ON storage.objects;

-- POLÍTICA: Permitir que usuarios autenticados suban archivos a la carpeta 'tickets/'
CREATE POLICY "Permitir subida a usuarios autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'support-attachments' AND
    (storage.foldername(name))[1] = 'tickets'
);

-- POLÍTICA: Permitir que los usuarios vean los archivos (Lectura pública o Autenticada)
-- Si el bucket es PUBLIC, esta política a veces no es necesaria dependiendo de la versión,
-- Pero es mejor tenerla para asegurar el acceso a los objetos.
CREATE POLICY "Permitir lectura de adjuntos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'support-attachments');

-- POLÍTICA: Permitir que los usuarios borren sus propios archivos (Opcional, para limpieza)
CREATE POLICY "Permitir borrado a usuarios autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'support-attachments');
