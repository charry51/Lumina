-- Recuperar perfiles perdidos
-- Si algún usuario antiguo perdió su perfil debido a actualizaciones previas,
-- esto le vuelve a crear su perfil automáticamente usando sus datos de registro.
-- Además, les activa el plan por defecto para que no se queden en un bucle.

INSERT INTO public.perfiles (id, rol, email, nombre, plan_id, suscripcion_activa)
SELECT 
  id, 
  'cliente', 
  email, 
  raw_user_meta_data->>'nombre', 
  'presencia', 
  true
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.perfiles);
