-- 1. Asegurar que perfiles tenga el email y sincronizarlo
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE perfiles SET email = au.email FROM auth.users au WHERE perfiles.id = au.id;

-- 2. Ampliar información en la tabla de códigos de vinculación temporal
ALTER TABLE pairing_codes 
ADD COLUMN IF NOT EXISTS capturado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS resolucion TEXT,
ADD COLUMN IF NOT EXISTS es_tactil BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tamano_pulgadas_estimado INTEGER;

-- 3. Reforzamos la tabla de pantallas definitivas
ALTER TABLE pantallas
ADD COLUMN IF NOT EXISTS tamano_pulgadas INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS resolucion TEXT,
ADD COLUMN IF NOT EXISTS es_tactil BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sospechoso BOOLEAN DEFAULT false;

-- Comentarios explicativos
COMMENT ON COLUMN pantallas.tamano_pulgadas IS 'El tamaño físico aproximado de la pantalla (impacta multiplicador de ingresos)';
COMMENT ON COLUMN pantallas.sospechoso IS 'True si el sistema ha detectado resoluciones diminutas o indicadores inusuales (ej. móvil/tablet)';
