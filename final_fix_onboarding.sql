-- 1. Asegurar que los NUEVOS usuarios NO tengan plan por defecto
-- Esto garantiza que al registrarse (y solo al registrarse) el sistema
-- los obligue a pasar por la pantalla de selección de planes.
ALTER TABLE perfiles ALTER COLUMN plan_id DROP DEFAULT;
ALTER TABLE perfiles ALTER COLUMN suscripcion_activa SET DEFAULT false;

-- 2. Asegurar que el trigger de nuevos usuarios lo respete
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol, email, nombre, plan_id, suscripcion_activa)
  VALUES (
    new.id, 
    'cliente', 
    new.email,
    new.raw_user_meta_data->>'nombre',
    NULL, -- Forzar que tengan que elegir plan
    false -- Forzar que tengan que "pagar"
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Arreglar a los usuarios EXISTENTES (como el tuyo actual)
-- Si un usuario ya tiene un plan válido asignado, le activamos la suscripción
-- para que NUNCA MÁS se le vuelva a pedir al iniciar sesión.
UPDATE perfiles 
SET suscripcion_activa = true 
WHERE plan_id IS NOT NULL;
