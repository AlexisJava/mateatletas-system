-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "planificacion_id" TEXT;

-- CreateIndex
CREATE INDEX "productos_planificacion_id_idx" ON "productos"("planificacion_id");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_planificacion_id_fkey" FOREIGN KEY ("planificacion_id") REFERENCES "planificaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
