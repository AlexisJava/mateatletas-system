-- Migration: Remove Legacy Logros Models
-- Description: Elimina las tablas LogroCurso y LogroDesbloqueado deprecadas
-- Part of: Mateatletas 2026 Refactor - FASE 1 (Limpieza)

-- DropForeignKey (si existen)
ALTER TABLE "lecciones" DROP CONSTRAINT IF EXISTS "lecciones_logro_desbloqueable_id_fkey";

-- DropForeignKey de logros_desbloqueados
ALTER TABLE "logros_desbloqueados" DROP CONSTRAINT IF EXISTS "logros_desbloqueados_docente_id_fkey";
ALTER TABLE "logros_desbloqueados" DROP CONSTRAINT IF EXISTS "logros_desbloqueados_estudiante_id_fkey";
ALTER TABLE "logros_desbloqueados" DROP CONSTRAINT IF EXISTS "logros_desbloqueados_logro_id_fkey";

-- DropIndex (indices de logros_desbloqueados)
DROP INDEX IF EXISTS "logros_desbloqueados_estudiante_id_idx";
DROP INDEX IF EXISTS "logros_desbloqueados_logro_id_idx";
DROP INDEX IF EXISTS "logros_desbloqueados_fecha_obtenido_idx";
DROP INDEX IF EXISTS "logros_desbloqueados_estudiante_id_logro_id_key";

-- DropColumn de lecciones (si existe)
ALTER TABLE "lecciones" DROP COLUMN IF EXISTS "logro_desbloqueable_id";

-- DropTable
DROP TABLE IF EXISTS "logros_desbloqueados";
DROP TABLE IF EXISTS "logros_curso";
