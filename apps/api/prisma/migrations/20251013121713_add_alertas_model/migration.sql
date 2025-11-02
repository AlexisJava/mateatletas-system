-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_estudiante_id_idx" ON "alertas"("estudiante_id");

-- CreateIndex
CREATE INDEX "alertas_resuelta_idx" ON "alertas"("resuelta");

-- CreateIndex
CREATE INDEX "alertas_fecha_idx" ON "alertas"("fecha");

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
