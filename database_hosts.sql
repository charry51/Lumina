-- CREACIÓN DE TABLAS PARA EL ECOSISTEMA DE HOSTS --

-- 1. Tabla de Hosts (Vinculación Usuario-Pantalla para monetización)
CREATE TABLE IF NOT EXISTS public.hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    pantalla_id UUID REFERENCES public.pantallas(id) ON DELETE CASCADE,
    nombre_local TEXT,
    porcentaje DECIMAL(5,2) DEFAULT 25.00, -- Comisión del host (%)
    saldo_pendiente DECIMAL(10,2) DEFAULT 0,
    saldo_pagado DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(perfil_id, pantalla_id)
);

-- 2. Tabla de Comisiones (Histórico de ganancias por impacto)
CREATE TABLE IF NOT EXISTS public.comisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES public.hosts(id) ON DELETE CASCADE,
    campana_id UUID REFERENCES public.campanas(id) ON DELETE SET NULL,
    pantalla_id UUID REFERENCES public.pantallas(id) ON DELETE CASCADE,
    importe_bruto DECIMAL(10,4), -- Lo que paga el anunciante por este impacto
    importe_host DECIMAL(10,4),  -- Lo que gana el host (importe_bruto * porcentaje / 100)
    estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'liquidado'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Políticas de Seguridad (RLS)
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comisiones ENABLE ROW LEVEL SECURITY;

-- Los hosts solo pueden ver sus propios registros
CREATE POLICY "Hosts can view their own relationship" 
ON public.hosts FOR SELECT 
USING (auth.uid() = perfil_id);

-- Los hosts solo pueden ver sus propias comisiones
CREATE POLICY "Hosts can view their own commissions" 
ON public.comisiones FOR SELECT 
USING (
    host_id IN (
        SELECT id FROM public.hosts WHERE perfil_id = auth.uid()
    )
);

-- Los superadmins pueden ver todo
CREATE POLICY "Superadmins can view all hosts" 
ON public.hosts FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'superadmin'
    )
);

CREATE POLICY "Superadmins can view all commissions" 
ON public.comisiones FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'superadmin'
    )
);

-- 4. Ampliación de la tabla pantallas para soportar monetización (si no se aplicó el parche aún)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantallas' AND column_name='es_publica') THEN
        ALTER TABLE public.pantallas ADD COLUMN es_publica BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantallas' AND column_name='precio_base') THEN
        ALTER TABLE public.pantallas ADD COLUMN precio_base DECIMAL(10,2) DEFAULT 50.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantallas' AND column_name='precio_emision') THEN
        ALTER TABLE public.pantallas ADD COLUMN precio_emision DECIMAL(10,2) DEFAULT 50.00;
    END IF;
END $$;
