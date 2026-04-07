-- 1. Crear tabla de perfiles
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('superadmin', 'comercial', 'cliente', 'gestor_local')),
  nombre_empresa TEXT,
  nif TEXT,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger para crear perfil automáticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol)
  VALUES (new.id, 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Políticas RLS para perfiles
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON perfiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON perfiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Superadmins pueden ver todo" 
ON perfiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'superadmin'
  )
);
