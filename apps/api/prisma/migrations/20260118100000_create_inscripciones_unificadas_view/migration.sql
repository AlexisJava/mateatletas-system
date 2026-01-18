-- Vista unificada de inscripciones a ClaseGrupos
-- Combina inscripciones manuales (admin/becas) con inscripciones via suscripción (tutor)
--
-- PROBLEMA RESUELTO:
-- - inscripciones_clase_grupo: Admin crea manualmente (becas, casos especiales)
-- - inscripciones_actividad: Tutor crea via suscripción familiar 2026
-- Sin esta vista, el docente NO ve estudiantes inscritos via suscripción familiar.
--
-- USO:
-- - LECTURA: Usar esta vista (inscripciones_unificadas)
-- - ESCRITURA MANUAL: Usar inscripciones_clase_grupo (admin/becas)
-- - ESCRITURA SUSCRIPCIÓN: Usar inscripciones_actividad (suscripción 2026)

CREATE OR REPLACE VIEW inscripciones_unificadas AS

-- Fuente 1: Inscripciones manuales (admin/becas)
SELECT
  icg.id,
  icg.estudiante_id,
  icg.clase_grupo_id,
  icg.tutor_id,
  icg.fecha_inscripcion,
  icg.fecha_baja,
  icg.tipo_acceso::text AS tipo_acceso,
  icg.observaciones,
  icg."createdAt" AS created_at,
  icg."updatedAt" AS updated_at,
  'MANUAL'::text AS fuente,
  NULL::text AS suscripcion_familiar_id,
  NULL::text AS producto_id,
  NULL::text AS tier,
  CASE
    WHEN icg.fecha_baja IS NULL THEN 'ACTIVA'
    ELSE 'CANCELADA'
  END::text AS estado
FROM inscripciones_clase_grupo icg

UNION ALL

-- Fuente 2: Inscripciones via suscripción familiar 2026
SELECT
  ia.id,
  ia.estudiante_id,
  ia.clase_grupo_id,
  sf.tutor_id,
  ia.fecha_inicio AS fecha_inscripcion,
  ia.fecha_fin AS fecha_baja,
  CASE
    WHEN ia.tier = 'STEAM_SINCRONICO' THEN 'SINCRONICO'
    ELSE 'ASINCRONICO'
  END::text AS tipo_acceso,
  NULL::text AS observaciones,
  ia.created_at,
  ia.updated_at,
  'SUSCRIPCION_2026'::text AS fuente,
  ia.suscripcion_familiar_id,
  ia.producto_id,
  ia.tier::text AS tier,
  ia.estado::text AS estado
FROM inscripciones_actividad ia
INNER JOIN suscripciones_familiares sf ON ia.suscripcion_familiar_id = sf.id
WHERE ia.clase_grupo_id IS NOT NULL;  -- Solo inscripciones a ClaseGrupos, no Comisiones

-- Comentario de documentación
COMMENT ON VIEW inscripciones_unificadas IS
'Vista unificada que combina inscripciones manuales (admin/becas) con inscripciones via suscripción familiar 2026.
Usar esta vista en lugar de consultar inscripciones_clase_grupo directamente para LECTURA.
Campos importantes:
- fuente: MANUAL o SUSCRIPCION_2026
- estado: ACTIVA, CANCELADA, o PAUSADA
- tipo_acceso: SINCRONICO o ASINCRONICO';
