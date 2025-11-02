-- CreateEnum
CREATE TYPE "EstadoClase" AS ENUM ('Programada', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('Presente', 'Ausente', 'Justificado');

-- CreateTable
CREATE TABLE "rutas_curriculares" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rutas_curriculares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clases" (
    "id" TEXT NOT NULL,
    "ruta_curricular_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "estado" "EstadoClase" NOT NULL DEFAULT 'Programada',
    "cupos_maximo" INTEGER NOT NULL,
    "cupos_ocupados" INTEGER NOT NULL DEFAULT 0,
    "producto_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_clase" (
    "id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_clase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observaciones" TEXT,
    "puntos_otorgados" INTEGER NOT NULL DEFAULT 0,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rutas_curriculares_nombre_key" ON "rutas_curriculares"("nombre");

-- CreateIndex
CREATE INDEX "clases_docente_id_idx" ON "clases"("docente_id");

-- CreateIndex
CREATE INDEX "clases_fecha_hora_inicio_idx" ON "clases"("fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "clases_estado_idx" ON "clases"("estado");

-- CreateIndex
CREATE INDEX "clases_producto_id_idx" ON "clases"("producto_id");

-- CreateIndex
CREATE INDEX "inscripciones_clase_estudiante_id_idx" ON "inscripciones_clase"("estudiante_id");

-- CreateIndex
CREATE INDEX "inscripciones_clase_tutor_id_idx" ON "inscripciones_clase"("tutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_clase_clase_id_estudiante_id_key" ON "inscripciones_clase"("clase_id", "estudiante_id");

-- CreateIndex
CREATE INDEX "asistencias_estudiante_id_idx" ON "asistencias"("estudiante_id");

-- CreateIndex
CREATE INDEX "asistencias_estado_idx" ON "asistencias"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_clase_id_estudiante_id_key" ON "asistencias"("clase_id", "estudiante_id");

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_ruta_curricular_id_fkey" FOREIGN KEY ("ruta_curricular_id") REFERENCES "rutas_curriculares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase" ADD CONSTRAINT "inscripciones_clase_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase" ADD CONSTRAINT "inscripciones_clase_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase" ADD CONSTRAINT "inscripciones_clase_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
