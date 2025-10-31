-- Revertir migración: equipo_id vuelve a apuntar a equipos (gamificación)
--
-- Razón: Los grupos de clases ya están correctamente asignados vía inscripciones_clase_grupo
-- El campo equipo_id es solo para gamificación (equipos: Fénix, Dragón, Tigre, Águila)

BEGIN;

-- 1. Verificar estado actual ANTES del cambio
SELECT
  'ESTADO ANTES DE REVERTIR' as paso,
  COUNT(*) as total_estudiantes,
  COUNT(equipo_id) as con_equipo_id
FROM estudiantes;

-- 2. Eliminar la constraint actual (apunta a grupos)
ALTER TABLE estudiantes
DROP CONSTRAINT IF EXISTS estudiantes_equipo_id_fkey;

-- 3. Limpiar equipo_id (ponerlo NULL para todos)
-- Ya que fue asignado incorrectamente a grupos
UPDATE estudiantes
SET equipo_id = NULL;

-- 4. Recrear la constraint original apuntando a equipos (gamificación)
ALTER TABLE estudiantes
ADD CONSTRAINT estudiantes_equipo_id_fkey
FOREIGN KEY (equipo_id) REFERENCES equipos(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- 5. Verificar estado DESPUÉS del cambio
SELECT
  'ESTADO DESPUÉS DE REVERTIR' as paso,
  COUNT(*) as total_estudiantes,
  COUNT(equipo_id) as con_equipo_id
FROM estudiantes;

-- 6. Verificar que inscripciones_clase_grupo está intacta
SELECT
  'VERIFICACIÓN: Inscripciones intactas' as paso,
  COUNT(DISTINCT estudiante_id) as estudiantes_con_inscripciones,
  COUNT(*) as total_inscripciones
FROM inscripciones_clase_grupo
WHERE fecha_baja IS NULL;

COMMIT;

-- Mensaje final
SELECT
  '✅ REVERSIÓN COMPLETADA' as status,
  'equipo_id ahora apunta a equipos (gamificación)' as detalle_1,
  'Grupos de clases siguen en inscripciones_clase_grupo' as detalle_2;
