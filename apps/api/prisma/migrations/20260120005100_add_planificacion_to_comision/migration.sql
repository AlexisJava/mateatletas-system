-- AlterTable
ALTER TABLE "comisiones" ADD COLUMN     "planificacion_id" TEXT;

-- CreateIndex
CREATE INDEX "comisiones_planificacion_id_idx" ON "comisiones"("planificacion_id");

-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_planificacion_id_fkey" FOREIGN KEY ("planificacion_id") REFERENCES "planificaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
