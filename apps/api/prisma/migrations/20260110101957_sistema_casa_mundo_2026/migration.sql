-- CreateEnum
CREATE TYPE "tipo_asignacion_docente" AS ENUM ('CLASE_GRUPOS', 'COMISIONES', 'AMBOS');

-- CreateEnum
CREATE TYPE "tipo_acceso_inscripcion" AS ENUM ('SINCRONICO', 'ASINCRONICO');

-- AlterTable
ALTER TABLE "comisiones" ADD COLUMN     "grupo_id" TEXT;

-- AlterTable
ALTER TABLE "docentes" ADD COLUMN     "tipo_asignacion" "tipo_asignacion_docente" NOT NULL DEFAULT 'CLASE_GRUPOS';

-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "casa_tipo" "casa_tipo",
ADD COLUMN     "mundo_tipo" "mundo_tipo";

-- AlterTable
ALTER TABLE "inscripciones_clase_grupo" ADD COLUMN     "tipo_acceso" "tipo_acceso_inscripcion" NOT NULL DEFAULT 'SINCRONICO';

-- CreateTable
CREATE TABLE "docentes_casas" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "casa_tipo" "casa_tipo" NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docentes_casas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes_mundos" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "mundo_tipo" "mundo_tipo" NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docentes_mundos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "docentes_casas_docente_id_idx" ON "docentes_casas"("docente_id");

-- CreateIndex
CREATE INDEX "docentes_casas_casa_tipo_idx" ON "docentes_casas"("casa_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_casas_docente_id_casa_tipo_key" ON "docentes_casas"("docente_id", "casa_tipo");

-- CreateIndex
CREATE INDEX "docentes_mundos_docente_id_idx" ON "docentes_mundos"("docente_id");

-- CreateIndex
CREATE INDEX "docentes_mundos_mundo_tipo_idx" ON "docentes_mundos"("mundo_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_mundos_docente_id_mundo_tipo_key" ON "docentes_mundos"("docente_id", "mundo_tipo");

-- CreateIndex
CREATE INDEX "comisiones_grupo_id_idx" ON "comisiones"("grupo_id");

-- CreateIndex
CREATE INDEX "grupos_casa_tipo_idx" ON "grupos"("casa_tipo");

-- CreateIndex
CREATE INDEX "grupos_mundo_tipo_idx" ON "grupos"("mundo_tipo");

-- CreateIndex
CREATE INDEX "inscripciones_clase_grupo_tipo_acceso_idx" ON "inscripciones_clase_grupo"("tipo_acceso");

-- AddForeignKey
ALTER TABLE "docentes_casas" ADD CONSTRAINT "docentes_casas_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_mundos" ADD CONSTRAINT "docentes_mundos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
