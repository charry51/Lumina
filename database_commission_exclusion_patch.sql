-- LUMINADDDD: Patch de Exclusión de Autopublicidad
-- Evita que los hosts cobren comisión por anuncios de su propia organización

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
    -- 1. Incrementar contador de la campaña (Sube siempre para estadísticas)
    UPDATE campanas
    SET impactos_reales = impactos_reales + 1
    WHERE id = NEW.campana_id
    RETURNING presupuesto_total, impactos_estimados INTO v_presupuesto_total, v_impactos_estimados;
    
    -- 2. Calcular coste por impacto
    IF v_impactos_estimados > 0 THEN
        v_cost_per_hit := v_presupuesto_total / v_impactos_estimados;
        
        -- 3. Buscar el host y el dueño de la pantalla para comparar con el anunciante
        SELECT h.id, h.porcentaje, h.modulo_ia_activo, p.organizacion_id 
        INTO v_host_id, v_host_porcentaje, v_modulo_ia, v_pantalla_org_id
        FROM hosts h
        JOIN pantallas p ON p.id = h.pantalla_id
        WHERE h.pantalla_id = NEW.pantalla_id;
        
        -- 4. REGLA DE EXCLUSIÓN: Solo pagar si el anunciante (NEW.organizacion_id) 
        -- es DIFERENTE al dueño de la pantalla (v_pantalla_org_id)
        IF v_host_id IS NOT NULL AND (NEW.organizacion_id IS DISTINCT FROM v_pantalla_org_id) THEN
            
            -- Aplicar Bono IA si corresponde
            IF v_modulo_ia = true AND v_host_porcentaje < 30.00 THEN
                v_host_porcentaje := 30.00;
            END IF;

            v_comision := v_cost_per_hit * (COALESCE(v_host_porcentaje, 25.00) / 100);
            
            INSERT INTO comisiones (
                host_id, campana_id, pantalla_id, importe_total, comision, porcentaje
            ) VALUES (
                v_host_id, NEW.campana_id, NEW.pantalla_id, v_cost_per_hit, v_comision, COALESCE(v_host_porcentaje, 25.00)
            );
            
            -- Actualizar saldo acumulado del host
            UPDATE hosts 
            SET saldo_pendiente = saldo_pendiente + v_comision
            WHERE id = v_host_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
