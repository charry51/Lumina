-- 1. Asegurar columnas de 'email' y 'nombre' en perfiles
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS nombre TEXT;

-- 2. Actualizar el trigger para sincronizar email y nombre desde la metadata de Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol, email, nombre)
  VALUES (
    new.id, 
    'cliente', 
    new.email,
    new.raw_user_meta_data->>'nombre' -- Esto captura el nombre si lo pasamos al registrarse
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sincronizar emails existentes a la tabla perfiles (para usuarios antiguos)
UPDATE perfiles
SET email = auth.users.email
FROM auth.users
WHERE perfiles.id = auth.users.id AND perfiles.email IS NULL;

-- 3. Reestructuración de Planes

-- Asegurar que la tabla planes tenga las columnas necesarias (en caso de que se haya creado sin ellas antes)
ALTER TABLE planes 
ADD COLUMN IF NOT EXISTS prioridad TEXT,
ADD COLUMN IF NOT EXISTS frecuencia_relativa INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS color_hex TEXT;

-- Borramos los planes antiguos para recrearlos limpiamente
TRUNCATE TABLE planes CASCADE;

-- Insertamos la nueva jerarquía de planes (respetando los IDs originales y añadiendo los nuevos)
INSERT INTO planes (id, nombre, precio_mensual, max_campanas, max_pantallas, max_duracion_segundos, prioridad, frecuencia_relativa, color_hex)
VALUES 
('presencia', 'Plan Presencia', 79.00, 1, 1, 10, 'baja', 1, '#94a3b8'),
('presencia_pro', 'Plan Presencia Pro', 149.00, 5, 5, 12, 'estandar', 2, '#64748b'),
('impacto_senior', 'Plan Impacto Senior', 299.00, 10, 15, 15, 'alta', 3, '#1d4ed8'),
('dominio', 'Plan Dominio', 899.00, 9999, 9999, 30, 'maxima', 4, '#D4AF37');

-- Actualizar perfiles a un plan existente si se han quedado huerfanos o con un plan invalido
UPDATE perfiles 
SET plan_id = 'presencia' 
WHERE plan_id NOT IN (SELECT id FROM planes) OR plan_id IS NULL;

-- ACTIVAR LA SUSCRIPCIÓN PARA TODOS LOS USUARIOS EXISTENTES
-- Esto soluciona el error que te devuelve a la pantalla de "Planes" constantemente
UPDATE perfiles 
SET suscripcion_activa = true;

-- Asegurar que la columna tenga un default coherente para los nuevos registros
ALTER TABLE perfiles ALTER COLUMN suscripcion_activa SET DEFAULT true;
ALTER TABLE perfiles ALTER COLUMN plan_id SET DEFAULT 'presencia';
