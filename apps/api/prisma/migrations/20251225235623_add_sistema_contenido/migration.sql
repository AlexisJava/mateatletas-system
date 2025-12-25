-- CreateEnum
CREATE TYPE "estado_contenido" AS ENUM ('BORRADOR', 'PUBLICADO', 'ARCHIVADO');

-- DropEnum
DROP TYPE "public"."TipoContenido";

-- CreateTable
CREATE TABLE "contenidos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "casa_tipo" "casa_tipo" NOT NULL,
    "mundo_tipo" "mundo_tipo" NOT NULL,
    "estado" "estado_contenido" NOT NULL DEFAULT 'BORRADOR',
    "creador_id" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_portada" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "duracion_minutos" INTEGER,
    "fecha_publicacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slides" (
    "id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido_json" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_contenidos" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "slide_actual" INTEGER NOT NULL DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "tiempo_total_segundos" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actividad" TIMESTAMP(3) NOT NULL,
    "fecha_completitud" TIMESTAMP(3),

    CONSTRAINT "progreso_contenidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_contenidos_casa_mundo_estado" ON "contenidos"("casa_tipo", "mundo_tipo", "estado");

-- CreateIndex
CREATE INDEX "idx_contenidos_creador" ON "contenidos"("creador_id");

-- CreateIndex
CREATE INDEX "idx_contenidos_estado" ON "contenidos"("estado");

-- CreateIndex
CREATE INDEX "idx_slides_contenido" ON "slides"("contenido_id");

-- CreateIndex
CREATE INDEX "idx_slides_orden" ON "slides"("orden");

-- CreateIndex
CREATE INDEX "idx_progreso_estudiante" ON "progreso_contenidos"("estudiante_id");

-- CreateIndex
CREATE INDEX "idx_progreso_contenido" ON "progreso_contenidos"("contenido_id");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_contenidos_estudiante_id_contenido_id_key" ON "progreso_contenidos"("estudiante_id", "contenido_id");

-- AddForeignKey
ALTER TABLE "contenidos" ADD CONSTRAINT "contenidos_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slides" ADD CONSTRAINT "slides_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_contenidos" ADD CONSTRAINT "progreso_contenidos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_contenidos" ADD CONSTRAINT "progreso_contenidos_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
