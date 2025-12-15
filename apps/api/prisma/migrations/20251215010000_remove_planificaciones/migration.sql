-- Remove Planificaciones (Sistema nunca implementado)

-- Drop foreign key constraints first
ALTER TABLE "progreso_estudiante_actividad" DROP CONSTRAINT IF EXISTS "progreso_estudiante_actividad_estudiante_id_fkey";
ALTER TABLE "progreso_estudiante_actividad" DROP CONSTRAINT IF EXISTS "progreso_estudiante_actividad_actividad_id_fkey";
ALTER TABLE "progreso_estudiante_actividad" DROP CONSTRAINT IF EXISTS "progreso_estudiante_actividad_asignacion_id_fkey";

ALTER TABLE "asignaciones_actividad_estudiante" DROP CONSTRAINT IF EXISTS "asignaciones_actividad_estudiante_asignacion_docente_id_fkey";
ALTER TABLE "asignaciones_actividad_estudiante" DROP CONSTRAINT IF EXISTS "asignaciones_actividad_estudiante_actividad_id_fkey";
ALTER TABLE "asignaciones_actividad_estudiante" DROP CONSTRAINT IF EXISTS "asignaciones_actividad_estudiante_clase_grupo_id_fkey";

ALTER TABLE "asignaciones_docente" DROP CONSTRAINT IF EXISTS "asignaciones_docente_planificacion_id_fkey";
ALTER TABLE "asignaciones_docente" DROP CONSTRAINT IF EXISTS "asignaciones_docente_clase_grupo_id_fkey";
ALTER TABLE "asignaciones_docente" DROP CONSTRAINT IF EXISTS "asignaciones_docente_docente_id_fkey";

ALTER TABLE "actividades_semanales" DROP CONSTRAINT IF EXISTS "actividades_semanales_planificacion_id_fkey";

ALTER TABLE "planificaciones_mensuales" DROP CONSTRAINT IF EXISTS "planificaciones_mensuales_grupo_id_fkey";

-- Drop tables in correct order (children first)
DROP TABLE IF EXISTS "progreso_estudiante_actividad";
DROP TABLE IF EXISTS "asignaciones_actividad_estudiante";
DROP TABLE IF EXISTS "asignaciones_docente";
DROP TABLE IF EXISTS "actividades_semanales";
DROP TABLE IF EXISTS "planificaciones_mensuales";

-- Drop enums
DROP TYPE IF EXISTS "estado_asignacion";
DROP TYPE IF EXISTS "nivel_dificultad";
DROP TYPE IF EXISTS "estado_planificacion";
