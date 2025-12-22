-- Migration: remove_puntos_totales
-- SUB-FASE 1.3.D: Eliminar campo puntos_totales de Estudiante
-- Los puntos ahora se gestionan en RecursosEstudiante.xp_total

-- PASO 1: Verificar que los datos ya fueron migrados a RecursosEstudiante
-- (Esto fue hecho en SUB-FASE 1.3.A)

-- PASO 2: Eliminar índices que dependen del campo
DROP INDEX IF EXISTS "idx_estudiantes_puntos_ranking";
DROP INDEX IF EXISTS "idx_estudiantes_casa_ranking";

-- PASO 3: Eliminar el campo puntos_totales
ALTER TABLE "estudiantes" DROP COLUMN IF EXISTS "puntos_totales";
