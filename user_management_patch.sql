-- Permite que los superadmins actualicen el rol de cualquier usuario
CREATE POLICY "Superadmins pueden actualizar perfiles de todos" 
ON perfiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'superadmin'
  )
);
