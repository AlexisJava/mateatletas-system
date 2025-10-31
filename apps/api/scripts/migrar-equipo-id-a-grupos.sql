-- Migración para cambiar equipo_id de apuntar a equipos → grupos
--
-- Problema: equipo_id tiene FK hacia equipos (gamificación)
-- Solución: Cambiar FK para que apunte a grupos (clases reales)

BEGIN;

-- 1. Eliminar la constraint existente
ALTER TABLE estudiantes
DROP CONSTRAINT IF EXISTS estudiantes_equipo_id_fkey;

-- 2. Limpiar valores de equipo_id que apuntan a equipos de gamificación
-- (Ponemos NULL para luego asignarlos correctamente a grupos)
UPDATE estudiantes
SET equipo_id = NULL
WHERE equipo_id IN (SELECT id FROM equipos);

-- 3. Crear la nueva constraint apuntando a grupos
ALTER TABLE estudiantes
ADD CONSTRAINT estudiantes_equipo_id_fkey
FOREIGN KEY (equipo_id) REFERENCES grupos(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

COMMIT;

-- Verificación
SELECT
  'FK actualizada correctamente' as status,
  COUNT(*) as estudiantes_sin_grupo
FROM estudiantes
WHERE equipo_id IS NULL;
