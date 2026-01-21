-- ============================================================================
-- MIGRACIÓN: Vista Unificada de Facturación (SSOT)
-- ============================================================================
--
-- CONTEXTO:
-- Existen dos fuentes de datos de facturación que necesitan unificarse:
--
-- 1. SuscripcionFamiliar + PagoSuscripcion (Sistema 2026 - MercadoPago)
--    - Fuente automática: tutores pagan via MercadoPago
--    - Tabla: suscripciones_familiares + pagos_suscripcion
--
-- 2. InscripcionMensual (Sistema Legacy - Pagos Manuales)
--    - Fuente manual: admin registra pagos en efectivo/transferencia
--    - Tabla: inscripciones_mensuales
--
-- ESTA VISTA UNIFICA AMBAS FUENTES para:
-- - Dashboard de finanzas: métricas consolidadas
-- - Reportes de ingresos: sin duplicación
-- - Verificación de morosidad: visión completa
--
-- ============================================================================

-- Vista de facturación unificada
CREATE OR REPLACE VIEW facturacion_unificada AS

-- ==============================
-- FUENTE 1: Pagos de Suscripción (MercadoPago)
-- ==============================
SELECT
    ps.id AS id,
    'SUSCRIPCION' AS fuente,
    sf.tutor_id,
    NULL::text AS estudiante_id,  -- Suscripción es a nivel familia
    CONCAT(
        EXTRACT(YEAR FROM ps.periodo_inicio)::text,
        '-',
        LPAD(EXTRACT(MONTH FROM ps.periodo_inicio)::int::text, 2, '0')
    ) AS periodo,
    EXTRACT(YEAR FROM ps.periodo_inicio)::int AS anio,
    EXTRACT(MONTH FROM ps.periodo_inicio)::int AS mes,
    ps.monto AS monto,
    -- Mapeo de estado MercadoPago a EstadoPago
    CASE
        WHEN ps.mp_status = 'approved' THEN 'Pagado'
        WHEN ps.mp_status = 'pending' THEN 'Pendiente'
        WHEN ps.mp_status = 'rejected' THEN 'Anulado'
        WHEN ps.mp_status = 'refunded' THEN 'Anulado'
        ELSE 'Pendiente'
    END AS estado_pago,
    'MercadoPago' AS metodo_pago,
    ps.mp_payment_id AS referencia_externa,
    NULL::text AS comprobante_url,
    NULL::text AS observaciones,
    ps.created_at AS fecha_creacion,
    ps.created_at AS fecha_pago,
    sf.id AS suscripcion_familiar_id,
    NULL::text AS inscripcion_mensual_id
FROM pagos_suscripcion ps
INNER JOIN suscripciones_familiares sf ON ps.suscripcion_id = sf.id

UNION ALL

-- ==============================
-- FUENTE 2: Pagos Manuales (Efectivo/Transferencia)
-- ==============================
SELECT
    im.id AS id,
    'MANUAL' AS fuente,
    im.tutor_id,
    im.estudiante_id,
    im.periodo,
    im.anio,
    im.mes,
    im.precio_final AS monto,
    im.estado_pago::text AS estado_pago,
    COALESCE(im.metodo_pago, 'Manual') AS metodo_pago,
    NULL::text AS referencia_externa,
    im.comprobante_url,
    im.observaciones,
    im."createdAt" AS fecha_creacion,
    im.fecha_pago,
    NULL::text AS suscripcion_familiar_id,
    im.id AS inscripcion_mensual_id
FROM inscripciones_mensuales im;

-- ============================================================================
-- ÍNDICES SUGERIDOS
-- ============================================================================
-- Nota: Las vistas no soportan índices directamente, pero las tablas base ya
-- tienen los índices necesarios:
-- - inscripciones_mensuales: idx on (tutor_id, periodo), (estado_pago), (periodo)
-- - pagos_suscripcion: idx on (suscripcion_id), (periodo_inicio)
-- - suscripciones_familiares: idx on (tutor_id), (estado)

-- ============================================================================
-- COMENTARIO
-- ============================================================================
COMMENT ON VIEW facturacion_unificada IS
'Vista unificada de facturación que combina:
- PagoSuscripcion (MercadoPago automático)
- InscripcionMensual (pagos manuales admin)
Usar esta vista para todas las métricas financieras del dashboard.';
