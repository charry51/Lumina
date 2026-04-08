-- 1. Tabla de Logs (Proof of Play)
DROP TABLE IF EXISTS reproducciones_logs CASCADE;

CREATE TABLE reproducciones_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campana_id UUID REFERENCES campanas(id) ON DELETE CASCADE,
    pantalla_id UUID REFERENCES pantallas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad para insert (cualquiera autenticado puede, e insertamos desde Server Actions)
ALTER TABLE reproducciones_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inserción libre de logs" 
ON reproducciones_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Lectura de logs pública" 
ON reproducciones_logs FOR SELECT 
USING (true);

-- 2. Modificaciones en Campañas (Programación Horaria Scheduling)
ALTER TABLE campanas ADD COLUMN IF NOT EXISTS hora_inicio TIME WITHOUT TIME ZONE DEFAULT '00:00:00';
ALTER TABLE campanas ADD COLUMN IF NOT EXISTS hora_fin TIME WITHOUT TIME ZONE DEFAULT '23:59:59';
