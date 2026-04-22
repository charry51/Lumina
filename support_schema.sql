-- TABLA PRINCIPAL DE TICKETS
CREATE TABLE IF NOT EXISTS soporte_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    asunto TEXT NOT NULL,
    categoria TEXT NOT NULL, -- Hardware, Facturacion, Contenido, Error, Otros
    prioridad TEXT NOT NULL DEFAULT 'MEDIA', -- BAJA, MEDIA, ALTA, URGENTE
    estado TEXT NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, EN_PROCESO, RESUELTO, CERRADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE MENSAJES (CONVERSACIÓN)
CREATE TABLE IF NOT EXISTS soporte_mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES soporte_tickets(id) ON DELETE CASCADE,
    remitente_id UUID NOT NULL REFERENCES auth.users(id),
    mensaje TEXT NOT NULL,
    archivo_url TEXT, -- URL de la foto en Supabase Storage
    es_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: SEGURIDAD PARA TICKETS
ALTER TABLE soporte_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios tickets" 
ON soporte_tickets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios tickets" 
ON soporte_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todos los tickets" 
ON soporte_tickets FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'superadmin'
));

CREATE POLICY "Admins pueden actualizar tickets" 
ON soporte_tickets FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'superadmin'
));

-- RLS: SEGURIDAD PARA MENSAJES
ALTER TABLE soporte_mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver mensajes de sus tickets" 
ON soporte_mensajes FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM soporte_tickets 
    WHERE id = ticket_id AND user_id = auth.uid()
));

CREATE POLICY "Usuarios pueden enviar mensajes a sus tickets" 
ON soporte_mensajes FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM soporte_tickets 
    WHERE id = ticket_id AND user_id = auth.uid()
));

CREATE POLICY "Admins pueden ver y enviar todos los mensajes" 
ON soporte_mensajes FOR ALL 
USING (EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'superadmin'
));

-- NOTA: El STORAGE BUCKET 'support-attachments' debe crearse manualmente en el dashboard de Supabase 
-- con políticas de lectura pública y escritura para usuarios autenticados.
