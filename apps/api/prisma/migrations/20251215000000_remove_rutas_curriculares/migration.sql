-- AlterTable: Remove ruta_curricular_id from Clase
ALTER TABLE "clases" DROP COLUMN IF EXISTS "ruta_curricular_id";

-- AlterTable: Remove ruta_curricular_id from ClaseGrupo  
ALTER TABLE "clase_grupos" DROP COLUMN IF EXISTS "ruta_curricular_id";

-- DropTable: Remove RutaCurricular table
DROP TABLE IF EXISTS "rutas_curriculares";
