ALTER TABLE perfiles 
ALTER COLUMN suscripcion_activa SET DEFAULT false;

-- Desactivamos a todos los clientes que no tengan plan
UPDATE perfiles
SET suscripcion_activa = false
WHERE plan_id IS NULL AND rol = 'cliente';
