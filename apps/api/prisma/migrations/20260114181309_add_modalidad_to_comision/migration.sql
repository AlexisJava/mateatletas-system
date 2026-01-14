-- AlterTable
ALTER TABLE "comisiones" ADD COLUMN     "modalidad" "tipo_acceso_inscripcion" NOT NULL DEFAULT 'SINCRONICO';

-- CreateIndex
CREATE INDEX "comisiones_modalidad_idx" ON "comisiones"("modalidad");
