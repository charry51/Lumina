-- =====================================================
-- LUMINADDDD — Revenue Share System
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Crear tabla de perfiles de hosts (dueños de locales)
CREATE TABLE IF NOT EXISTS hosts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id     UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  pantalla_id   UUID REFERENCES pantallas(id) ON DELETE CASCADE,
  nombre_local  TEXT NOT NULL,
  iban          TEXT,                          -- Cuenta para cobrar
  porcentaje    NUMERIC(5,2) NOT NULL DEFAULT 25.00,  -- % de comisión (ej: 25.00 = 25%)
  saldo_pendiente NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Acumulado pendiente de pago
  saldo_pagado    NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Histórico pagado
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pantalla_id)  -- Una pantalla, un host
);

-- 2. Crear tabla de transacciones de comisiones (auditoría)
CREATE TABLE IF NOT EXISTS comisiones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id       UUID REFERENCES hosts(id) ON DELETE CASCADE,
  campana_id    UUID REFERENCES campanas(id) ON DELETE SET NULL,
  pantalla_id   UUID REFERENCES pantallas(id) ON DELETE SET NULL,
  importe_total NUMERIC(10,2) NOT NULL,        -- Lo que pagó el anunciante
  comision      NUMERIC(10,2) NOT NULL,        -- Lo que le toca al host
  porcentaje    NUMERIC(5,2) NOT NULL,
  estado        TEXT NOT NULL DEFAULT 'pendiente',  -- pendiente | pagada
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activar RLS
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comisiones ENABLE ROW LEVEL SECURITY;

-- 4. Políticas: El host solo ve sus propios datos
DROP POLICY IF EXISTS "Hosts ven sus propios datos" ON hosts;
CREATE POLICY "Hosts ven sus propios datos" ON hosts
FOR ALL USING (perfil_id = auth.uid());

DROP POLICY IF EXISTS "Hosts ven sus comisiones" ON comisiones;
CREATE POLICY "Hosts ven sus comisiones" ON comisiones
FOR SELECT USING (
  host_id IN (SELECT id FROM hosts WHERE perfil_id = auth.uid())
);

-- 5. Los superadmins ven todo
DROP POLICY IF EXISTS "Admins ven todos los hosts" ON hosts;
CREATE POLICY "Admins ven todos los hosts" ON hosts
FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'superadmin')
);

DROP POLICY IF EXISTS "Admins ven todas las comisiones" ON comisiones;
CREATE POLICY "Admins ven todas las comisiones" ON comisiones
FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'superadmin')
);

-- 6. Añadir campo precio a pantallas (para calcular el CPM / precio base de emisión)
ALTER TABLE pantallas 
ADD COLUMN IF NOT EXISTS precio_emision NUMERIC(10,2) DEFAULT 50.00;  -- Precio base por campaña aprobada

-- 7. Añadir campo de rol 'host' al enum si es TEXT
-- (En Supabase el campo 'rol' suele ser TEXT, no enum, así que solo insertar 'host' es suficiente)
