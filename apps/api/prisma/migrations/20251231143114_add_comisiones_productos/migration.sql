-- CreateEnum
CREATE TYPE "EstadoInscripcionComision" AS ENUM ('Pendiente', 'Confirmada', 'Cancelada', 'ListaEspera');

-- CreateTable
CREATE TABLE "comisiones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "producto_id" TEXT NOT NULL,
    "casa_id" TEXT,
    "docente_id" TEXT,
    "cupo_maximo" INTEGER,
    "horario" TEXT,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_comision" (
    "id" TEXT NOT NULL,
    "comision_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "estado" "EstadoInscripcionComision" NOT NULL DEFAULT 'Pendiente',
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_comision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comisiones_producto_id_idx" ON "comisiones"("producto_id");

-- CreateIndex
CREATE INDEX "comisiones_docente_id_idx" ON "comisiones"("docente_id");

-- CreateIndex
CREATE INDEX "comisiones_casa_id_idx" ON "comisiones"("casa_id");

-- CreateIndex
CREATE INDEX "comisiones_activo_idx" ON "comisiones"("activo");

-- CreateIndex
CREATE INDEX "inscripciones_comision_estudiante_id_idx" ON "inscripciones_comision"("estudiante_id");

-- CreateIndex
CREATE INDEX "inscripciones_comision_estado_idx" ON "inscripciones_comision"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_comision_comision_id_estudiante_id_key" ON "inscripciones_comision"("comision_id", "estudiante_id");

-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_casa_id_fkey" FOREIGN KEY ("casa_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_comision" ADD CONSTRAINT "inscripciones_comision_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_comision" ADD CONSTRAINT "inscripciones_comision_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
