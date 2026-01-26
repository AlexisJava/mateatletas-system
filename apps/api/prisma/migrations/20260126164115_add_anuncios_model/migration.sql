-- CreateEnum
CREATE TYPE "TipoAnuncio" AS ENUM ('INFORMATIVO', 'IMPORTANTE', 'URGENTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_SUSCRIPCION_REACTIVADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_BECA_ASIGNADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_CAMBIO_TIER';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_COMISION_ASIGNADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_ASIGNACION_ESTRATEGICA';

-- CreateTable
CREATE TABLE "anuncios" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "comision_id" TEXT,
    "titulo" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "TipoAnuncio" NOT NULL DEFAULT 'INFORMATIVO',
    "fecha_expiracion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anuncios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anuncios_docente_id_idx" ON "anuncios"("docente_id");

-- CreateIndex
CREATE INDEX "anuncios_comision_id_idx" ON "anuncios"("comision_id");

-- CreateIndex
CREATE INDEX "anuncios_tipo_idx" ON "anuncios"("tipo");

-- CreateIndex
CREATE INDEX "anuncios_activo_idx" ON "anuncios"("activo");

-- CreateIndex
CREATE INDEX "anuncios_fecha_expiracion_idx" ON "anuncios"("fecha_expiracion");

-- CreateIndex
CREATE INDEX "anuncios_created_at_idx" ON "anuncios"("created_at");

-- AddForeignKey
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
