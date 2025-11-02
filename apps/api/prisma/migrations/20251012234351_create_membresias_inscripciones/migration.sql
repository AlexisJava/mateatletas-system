-- CreateEnum
CREATE TYPE "EstadoMembresia" AS ENUM ('Pendiente', 'Activa', 'Atrasada', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoInscripcionCurso" AS ENUM ('PreInscrito', 'Activo', 'Finalizado');

-- CreateTable
CREATE TABLE "membresias" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'Pendiente',
    "fecha_inicio" TIMESTAMP(3),
    "fecha_proximo_pago" TIMESTAMP(3),
    "preferencia_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_curso" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "estado" "EstadoInscripcionCurso" NOT NULL DEFAULT 'PreInscrito',
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferencia_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_curso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membresias_tutor_id_estado_idx" ON "membresias"("tutor_id", "estado");

-- CreateIndex
CREATE INDEX "membresias_preferencia_id_idx" ON "membresias"("preferencia_id");

-- CreateIndex
CREATE INDEX "inscripciones_curso_estudiante_id_estado_idx" ON "inscripciones_curso"("estudiante_id", "estado");

-- CreateIndex
CREATE INDEX "inscripciones_curso_preferencia_id_idx" ON "inscripciones_curso"("preferencia_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_curso_estudiante_id_producto_id_key" ON "inscripciones_curso"("estudiante_id", "producto_id");

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_curso" ADD CONSTRAINT "inscripciones_curso_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_curso" ADD CONSTRAINT "inscripciones_curso_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
