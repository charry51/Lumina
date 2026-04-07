-- 1. Crear tabla de planes comerciales
CREATE TABLE planes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio_mensual DECIMAL(10,2) NOT NULL,
  max_campanas INTEGER NOT NULL,
  max_pantallas INTEGER NOT NULL,
  max_duracion_segundos INTEGER NOT NULL,
  prioridad TEXT CHECK (prioridad IN ('baja', 'estandar', 'alta', 'maxima')),
  color_hex TEXT
);

-- 2. Insertar los planes definidos en el documento de producto
INSERT INTO planes (id, nombre, precio_mensual, max_campanas, max_pantallas, max_duracion_segundos, prioridad, color_hex)
VALUES 
('basico', 'Plan Presencia', 29.00, 1, 1, 10, 'estandar', '#94a3b8'),
('local_plus', 'Plan Impacto', 59.00, 3, 3, 15, 'estandar', '#3b82f6'),
('multilocal', 'Plan Expansión', 129.00, 10, 10, 15, 'alta', '#8b5cf6'),
('premium', 'Plan Dominio', 249.00, 25, 50, 20, 'maxima', '#D4AF37');

-- 3. Actualizar la tabla de perfiles para incluir el plan
ALTER TABLE perfiles 
ADD COLUMN plan_id TEXT REFERENCES planes(id) DEFAULT 'basico',
ADD COLUMN suscripcion_activa BOOLEAN DEFAULT true;

-- 4. Actualizar todos los perfiles actuales al plan básico para que no de error
UPDATE perfiles SET plan_id = 'basico' WHERE plan_id IS NULL;
