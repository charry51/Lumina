-- 1. Crear tabla de planes comerciales (Actualizada v3.0)
CREATE TABLE IF NOT EXISTS planes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio_mensual DECIMAL(10,2) NOT NULL,
  max_campanas INTEGER NOT NULL,
  max_pantallas INTEGER NOT NULL,
  max_duracion_segundos INTEGER NOT NULL,
  prioridad TEXT CHECK (prioridad IN ('baja', 'estandar', 'alta', 'maxima')),
  frecuencia_relativa INTEGER DEFAULT 1, -- 1x, 2x, 3x, 4x
  color_hex TEXT
);

-- BORRAR DATOS ANTIGUOS PARA LIMPIEZA
TRUNCATE TABLE planes CASCADE;

-- 2. Insertar los nuevos planes definidos en las notas manuscritas
INSERT INTO planes (id, nombre, precio_mensual, max_campanas, max_pantallas, max_duracion_segundos, prioridad, frecuencia_relativa, color_hex)
VALUES 
('presencia', 'Plan Presencia', 79.00, 1, 1, 10, 'baja', 1, '#94a3b8'),
('impacto', 'Plan Impacto', 199.00, 5, 3, 15, 'estandar', 2, '#3b82f6'),
('expansion', 'Plan Expansión', 449.00, 999, 10, 20, 'alta', 3, '#8b5cf6'),
('dominio', 'Plan Dominio', 899.00, 9999, 9999, 30, 'maxima', 4, '#D4AF37');

-- 3. Asegurar que los perfiles tengan el plan correcto
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES planes(id) DEFAULT 'presencia',
ADD COLUMN IF NOT EXISTS suscripcion_activa BOOLEAN DEFAULT true;

UPDATE perfiles SET plan_id = 'presencia' WHERE plan_id IS NULL OR plan_id = 'basico';
