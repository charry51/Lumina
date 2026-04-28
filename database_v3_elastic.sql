-- LUMINADDDD v2.0 - Phase 3: Elastic Player & Budget Tracking

-- 1. Añadir contador de impactos reales a las campañas
ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS impactos_reales INTEGER DEFAULT 0;

-- 2. Función para incrementar el contador de impactos y calcular comisiones (v3.1 con Bono IA)
CREATE OR REPLACE FUNCTION increment_campaign_impacts()
RETURNS TRIGGER AS $$
    DECLARE
    v_cost_per_hit DECIMAL(10,5);
    v_host_id UUID;
    v_host_porcentaje DECIMAL(5,2);
    v_modulo_ia BOOLEAN;
    v_comision DECIMAL(10,5);
    v_presupuesto_total DECIMAL(10,2);
    v_impactos_estimados INTEGER;
    v_pantalla_org_id UUID;
BEGIN
    -- 1. Incrementar contador de la campaña
    UPDATE campanas
    SET impactos_reales = impactos_reales + 1
    WHERE id = NEW.campana_id
    RETURNING presupuesto_total, impactos_estimados INTO v_presupuesto_total, v_impactos_estimados;
    
    -- 2. Calcular coste por impacto (CPM prorrateado)
    IF v_impactos_estimados > 0 THEN
        v_cost_per_hit := v_presupuesto_total / v_impactos_estimados;
        
        -- 3. Buscar el host asociado a esta pantalla y el dueño de la pantalla
        SELECT h.id, h.porcentaje, h.modulo_ia_activo, p.organizacion_id 
        INTO v_host_id, v_host_porcentaje, v_modulo_ia, v_pantalla_org_id
        FROM hosts h
        JOIN pantallas p ON p.id = h.pantalla_id
        WHERE h.pantalla_id = NEW.pantalla_id;
        
        -- 4. Si hay host Y no es autopublicidad ( advertiser_org != screen_org ), generar comisión
        IF v_host_id IS NOT NULL AND (NEW.organizacion_id IS DISTINCT FROM v_pantalla_org_id) THEN
            -- APLICAR BONO IA
            IF v_modulo_ia = true AND v_host_porcentaje < 30.00 THEN
                v_host_porcentaje := 30.00;
            END IF;

            v_comision := v_cost_per_hit * (COALESCE(v_host_porcentaje, 25.00) / 100);
            
            INSERT INTO comisiones (
                host_id, 
                campana_id, 
                pantalla_id, 
                importe_total, 
                comision, 
                porcentaje
            ) VALUES (
                v_host_id, 
                NEW.campana_id, 
                NEW.pantalla_id, 
                v_cost_per_hit, 
                v_comision, 
                COALESCE(v_host_porcentaje, 25.00)
            );
            
            -- 5. Actualizar saldo del host
            UPDATE hosts 
            SET saldo_pendiente = saldo_pendiente + v_comision
            WHERE id = v_host_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para ejecutar la función al insertar en reproducciones_verificadas
DROP TRIGGER IF EXISTS tr_update_impacts ON reproducciones_verificadas;
CREATE TRIGGER tr_update_impacts
AFTER INSERT ON reproducciones_verificadas
FOR EACH ROW
EXECUTE FUNCTION increment_campaign_impacts();

-- 4. Índice para optimizar consultas del player
CREATE INDEX IF NOT EXISTS idx_campanas_screen_active 
ON campanas (pantalla_id, estado, fecha_inicio, fecha_fin) 
WHERE estado = 'aprobada';
