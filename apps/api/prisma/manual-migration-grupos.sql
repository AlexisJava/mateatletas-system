-- ============================================================================
-- MIGRACIÓN MANUAL: Agregar modelo Grupo y refactorizar planificaciones
-- ============================================================================
-- Esta migración transforma el modelo de datos para separar conceptos:
-- - Grupo (concepto pedagógico: B1, B2, B3)
-- - ClaseGrupo/Comision (instancia operativa: horario + docente)
-- ============================================================================

BEGIN;

-- Paso 1: Crear tabla grupos
CREATE TABLE IF NOT EXISTS "grupos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL UNIQUE,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "edad_minima" INTEGER,
    "edad_maxima" INTEGER,
    "sector_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grupos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "grupos_codigo_idx" ON "grupos"("codigo");
CREATE INDEX IF NOT EXISTS "grupos_activo_idx" ON "grupos"("activo");

-- Paso 2: Insertar grupos básicos (B1, B2, B3)
INSERT INTO "grupos" ("id", "codigo", "nombre", "descripcion", "edad_minima", "edad_maxima", "activo")
VALUES
    (gen_random_uuid()::text, 'B1', 'Básico 1', 'Grupo básico nivel 1 - Fundamentos matemáticos iniciales', 6, 7, true),
    (gen_random_uuid()::text, 'B2', 'Básico 2', 'Grupo básico nivel 2 - Desarrollo de habilidades matemáticas', 8, 9, true),
    (gen_random_uuid()::text, 'B3', 'Básico 3', 'Grupo básico nivel 3 - Consolidación de conceptos', 10, 11, true)
ON CONFLICT ("codigo") DO NOTHING;

-- Paso 3: Agregar columna grupo_id en clase_grupos
ALTER TABLE "clase_grupos" ADD COLUMN IF NOT EXISTS "grupo_id" TEXT;

-- Paso 4: Poblar grupo_id basándose en el codigo existente
UPDATE "clase_grupos" cg
SET "grupo_id" = g."id"
FROM "grupos" g
WHERE cg."codigo" = g."codigo";

-- Paso 5: Hacer grupo_id NOT NULL y agregar foreign key
ALTER TABLE "clase_grupos" ALTER COLUMN "grupo_id" SET NOT NULL;
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_grupo_id_fkey"
    FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Paso 6: Agregar índice en grupo_id
CREATE INDEX IF NOT EXISTS "clase_grupos_grupo_id_idx" ON "clase_grupos"("grupo_id");

-- Paso 7: Agregar columna grupo_id en planificaciones_mensuales
ALTER TABLE "planificaciones_mensuales" ADD COLUMN IF NOT EXISTS "grupo_id" TEXT;

-- Paso 8: Poblar grupo_id basándose en codigo_grupo existente (si hay registros)
UPDATE "planificaciones_mensuales" pm
SET "grupo_id" = g."id"
FROM "grupos" g
WHERE pm."codigo_grupo" = g."codigo";

-- Paso 9: Hacer grupo_id NOT NULL (si hay registros sin grupo_id, esto fallará)
-- Si no hay planificaciones aún, esto no afectará
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "planificaciones_mensuales" WHERE "grupo_id" IS NULL) THEN
        RAISE EXCEPTION 'Existen planificaciones sin grupo_id. Revisar datos antes de aplicar NOT NULL.';
    END IF;
    ALTER TABLE "planificaciones_mensuales" ALTER COLUMN "grupo_id" SET NOT NULL;
END $$;

-- Paso 10: Agregar foreign key y constraint unique
ALTER TABLE "planificaciones_mensuales" ADD CONSTRAINT "planificaciones_mensuales_grupo_id_fkey"
    FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Paso 11: Eliminar constraint único anterior (codigo_grupo, mes, anio)
ALTER TABLE "planificaciones_mensuales" DROP CONSTRAINT IF EXISTS "planificaciones_mensuales_codigo_grupo_mes_anio_key";

-- Paso 12: Agregar nuevo constraint único (grupo_id, mes, anio)
ALTER TABLE "planificaciones_mensuales" ADD CONSTRAINT "planificaciones_mensuales_grupo_id_mes_anio_key"
    UNIQUE ("grupo_id", "mes", "anio");

-- Paso 13: Eliminar índice anterior y crear nuevo
DROP INDEX IF EXISTS "planificaciones_mensuales_codigo_grupo_mes_anio_idx";
CREATE INDEX IF NOT EXISTS "planificaciones_mensuales_grupo_id_mes_anio_idx" ON "planificaciones_mensuales"("grupo_id", "mes", "anio");

-- Paso 14: (OPCIONAL) Eliminar columna codigo_grupo de planificaciones_mensuales
-- COMENTADO por seguridad - descomentar cuando estés seguro
-- ALTER TABLE "planificaciones_mensuales" DROP COLUMN "codigo_grupo";

COMMIT;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
-- Verificación sugerida:
-- SELECT * FROM grupos;
-- SELECT id, codigo, grupo_id FROM clase_grupos;
-- SELECT id, codigo_grupo, grupo_id FROM planificaciones_mensuales;
-- ============================================================================
