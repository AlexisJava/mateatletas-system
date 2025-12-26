/*
  Migración: Slide → NodoContenido (estructura jerárquica)

  Esta migración convierte el sistema de slides lineales a un árbol jerárquico:
  - Los slides existentes se migran como nodos raíz (parentId = NULL)
  - El campo contenidoJson ahora es opcional (NULL para contenedores)
  - Se agrega campo bloqueado para nodos Teoría/Práctica/Evaluación
  - Se agrega relación recursiva parent/hijos

  IMPORTANTE: Los datos de slides existentes se preservan como nodos.
*/

-- 1. Crear la nueva tabla nodos_contenido
CREATE TABLE "nodos_contenido" (
    "id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "titulo" TEXT NOT NULL,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "contenido_json" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodos_contenido_pkey" PRIMARY KEY ("id")
);

-- 2. Crear índices
CREATE INDEX "idx_nodos_contenido" ON "nodos_contenido"("contenido_id");
CREATE INDEX "idx_nodos_parent" ON "nodos_contenido"("parent_id");
CREATE INDEX "idx_nodos_orden" ON "nodos_contenido"("orden");

-- 3. Agregar foreign keys
ALTER TABLE "nodos_contenido" ADD CONSTRAINT "nodos_contenido_contenido_id_fkey"
    FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nodos_contenido" ADD CONSTRAINT "nodos_contenido_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "nodos_contenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Migrar datos existentes de slides a nodos_contenido
-- Los slides existentes se convierten en nodos raíz (sin parent)
INSERT INTO "nodos_contenido" ("id", "contenido_id", "parent_id", "titulo", "bloqueado", "orden", "contenido_json", "createdAt", "updatedAt")
SELECT
    "id",
    "contenido_id",
    NULL,  -- parent_id = NULL (nodos raíz)
    "titulo",
    false,  -- bloqueado = false (no son nodos estructurales)
    "orden",
    "contenido_json",
    "createdAt",
    "updatedAt"
FROM "public"."slides";

-- 5. Actualizar progreso_contenidos: agregar nueva columna y mapear datos
ALTER TABLE "progreso_contenidos" ADD COLUMN "nodo_actual_id" TEXT;

-- Mapear slide_actual (índice) al primer nodo correspondiente del contenido
-- Esto es una aproximación: el índice 0 se mapea al primer nodo, etc.
UPDATE "progreso_contenidos" pc
SET "nodo_actual_id" = (
    SELECT nc."id"
    FROM "nodos_contenido" nc
    WHERE nc."contenido_id" = pc."contenido_id"
    ORDER BY nc."orden"
    OFFSET pc."slide_actual"
    LIMIT 1
)
WHERE pc."slide_actual" IS NOT NULL;

-- 6. Eliminar columna vieja de progreso_contenidos
ALTER TABLE "progreso_contenidos" DROP COLUMN "slide_actual";

-- 7. Eliminar foreign key y tabla slides
ALTER TABLE "public"."slides" DROP CONSTRAINT IF EXISTS "slides_contenido_id_fkey";
DROP TABLE "public"."slides";
