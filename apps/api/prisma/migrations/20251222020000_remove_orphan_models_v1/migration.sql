-- Remove orphan models: AccionPuntuable, EstudianteMundoNivel, TestUbicacionResultado, NivelConfig
-- Also removes NivelInterno enum and updates PuntoObtenido to use tipo_accion instead of accion_id FK

-- Step 1: Add new column tipo_accion to puntos_obtenidos (with default for existing rows)
ALTER TABLE "puntos_obtenidos" ADD COLUMN "tipo_accion" TEXT NOT NULL DEFAULT 'ASISTENCIA';

-- Step 2: Migrate existing data - set tipo_accion based on accion name
UPDATE "puntos_obtenidos" po
SET "tipo_accion" = COALESCE(
  (SELECT UPPER(REPLACE(a.nombre, ' ', '_')) FROM "acciones_puntuables" a WHERE a.id = po.accion_id),
  'ASISTENCIA'
);

-- Step 3: Drop the foreign key constraint and accion_id column
ALTER TABLE "puntos_obtenidos" DROP CONSTRAINT IF EXISTS "puntos_obtenidos_accion_id_fkey";
ALTER TABLE "puntos_obtenidos" DROP COLUMN IF EXISTS "accion_id";

-- Step 4: Create new index for tipo_accion
CREATE INDEX IF NOT EXISTS "puntos_obtenidos_tipo_accion_idx" ON "puntos_obtenidos"("tipo_accion");

-- Step 5: Drop orphan tables (order matters due to potential FKs)
DROP TABLE IF EXISTS "test_ubicacion_resultados" CASCADE;
DROP TABLE IF EXISTS "estudiante_mundo_niveles" CASCADE;
DROP TABLE IF EXISTS "acciones_puntuables" CASCADE;
DROP TABLE IF EXISTS "niveles_config" CASCADE;

-- Step 6: Drop unused enum
DROP TYPE IF EXISTS "nivel_interno" CASCADE;
