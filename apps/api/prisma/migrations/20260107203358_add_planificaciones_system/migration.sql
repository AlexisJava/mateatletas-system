/*
  Warnings:

  - You are about to drop the column `creado_en` on the `asignaciones_planificacion` table. All the data in the column will be lost.
  - You are about to drop the column `activa` on the `planificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `actualizado_en` on the `planificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `planificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `semanas_total` on the `planificaciones` table. All the data in the column will be lost.
  - You are about to drop the `progresos_semanales_estudiante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semanas_activas_planificacion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `asignaciones_planificacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidad_clases` to the `planificaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `casa_tipo` to the `planificaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mundo_tipo` to the `planificaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `planificaciones` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "tipo_contenido" AS ENUM ('LECCION', 'TAREA', 'MICROLECCION', 'EVALUACION', 'JUEGO', 'SIMULACION', 'RECURSO');

-- AlterEnum
ALTER TYPE "estado_tarea" ADD VALUE 'VENCIDA';

-- DropForeignKey
ALTER TABLE "public"."progresos_semanales_estudiante" DROP CONSTRAINT "progresos_semanales_estudiante_asignacion_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."progresos_semanales_estudiante" DROP CONSTRAINT "progresos_semanales_estudiante_estudiante_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."semanas_activas_planificacion" DROP CONSTRAINT "semanas_activas_planificacion_asignacion_id_fkey";

-- AlterTable
ALTER TABLE "asignaciones_planificacion" DROP COLUMN "creado_en",
ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "contenidos" ADD COLUMN     "juego_codigo" TEXT,
ADD COLUMN     "tipo" "tipo_contenido" NOT NULL DEFAULT 'MICROLECCION';

-- AlterTable
ALTER TABLE "planificaciones" DROP COLUMN "activa",
DROP COLUMN "actualizado_en",
DROP COLUMN "creado_en",
DROP COLUMN "semanas_total",
ADD COLUMN     "cantidad_clases" INTEGER NOT NULL,
ADD COLUMN     "casa_tipo" "casa_tipo" NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duracion_clase_dias" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "estado" "estado_contenido" NOT NULL DEFAULT 'BORRADOR',
ADD COLUMN     "mundo_tipo" "mundo_tipo" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."progresos_semanales_estudiante";

-- DropTable
DROP TABLE "public"."semanas_activas_planificacion";

-- CreateTable
CREATE TABLE "clases_planificacion" (
    "id" TEXT NOT NULL,
    "planificacion_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "teoria_id" TEXT NOT NULL,
    "practica_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clases_planificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas_clase" (
    "id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "obligatoria" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tareas_clase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_clase_grupo" (
    "id" TEXT NOT NULL,
    "asignacion_id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "teoria_activa" BOOLEAN NOT NULL DEFAULT false,
    "practica_activa" BOOLEAN NOT NULL DEFAULT false,
    "activada_en" TIMESTAMP(3),
    "completada_en" TIMESTAMP(3),

    CONSTRAINT "estados_clase_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas_asignadas" (
    "id" TEXT NOT NULL,
    "asignacion_id" TEXT NOT NULL,
    "tarea_clase_id" TEXT NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tareas_asignadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresos_clase_estudiante" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "teoria_completada" BOOLEAN NOT NULL DEFAULT false,
    "teoria_completada_en" TIMESTAMP(3),
    "practica_completada" BOOLEAN NOT NULL DEFAULT false,
    "practica_completada_en" TIMESTAMP(3),
    "tiempo_teoria_segundos" INTEGER NOT NULL DEFAULT 0,
    "tiempo_practica_segundos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "progresos_clase_estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresos_tarea_estudiante" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tarea_asignada_id" TEXT NOT NULL,
    "estado" "estado_tarea" NOT NULL DEFAULT 'PENDIENTE',
    "iniciada_en" TIMESTAMP(3),
    "completada_en" TIMESTAMP(3),
    "tiempo_total_segundos" INTEGER NOT NULL DEFAULT 0,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "calificacion" DOUBLE PRECISION,

    CONSTRAINT "progresos_tarea_estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clases_planificacion_teoria_id_idx" ON "clases_planificacion"("teoria_id");

-- CreateIndex
CREATE INDEX "clases_planificacion_practica_id_idx" ON "clases_planificacion"("practica_id");

-- CreateIndex
CREATE UNIQUE INDEX "clases_planificacion_planificacion_id_numero_key" ON "clases_planificacion"("planificacion_id", "numero");

-- CreateIndex
CREATE INDEX "tareas_clase_contenido_id_idx" ON "tareas_clase"("contenido_id");

-- CreateIndex
CREATE UNIQUE INDEX "tareas_clase_clase_id_contenido_id_key" ON "tareas_clase"("clase_id", "contenido_id");

-- CreateIndex
CREATE INDEX "estados_clase_grupo_clase_id_idx" ON "estados_clase_grupo"("clase_id");

-- CreateIndex
CREATE UNIQUE INDEX "estados_clase_grupo_asignacion_id_clase_id_key" ON "estados_clase_grupo"("asignacion_id", "clase_id");

-- CreateIndex
CREATE INDEX "tareas_asignadas_tarea_clase_id_idx" ON "tareas_asignadas"("tarea_clase_id");

-- CreateIndex
CREATE UNIQUE INDEX "tareas_asignadas_asignacion_id_tarea_clase_id_key" ON "tareas_asignadas"("asignacion_id", "tarea_clase_id");

-- CreateIndex
CREATE INDEX "progresos_clase_estudiante_clase_id_idx" ON "progresos_clase_estudiante"("clase_id");

-- CreateIndex
CREATE UNIQUE INDEX "progresos_clase_estudiante_estudiante_id_clase_id_key" ON "progresos_clase_estudiante"("estudiante_id", "clase_id");

-- CreateIndex
CREATE INDEX "progresos_tarea_estudiante_tarea_asignada_id_idx" ON "progresos_tarea_estudiante"("tarea_asignada_id");

-- CreateIndex
CREATE UNIQUE INDEX "progresos_tarea_estudiante_estudiante_id_tarea_asignada_id_key" ON "progresos_tarea_estudiante"("estudiante_id", "tarea_asignada_id");

-- CreateIndex
CREATE INDEX "asignaciones_planificacion_clase_grupo_id_idx" ON "asignaciones_planificacion"("clase_grupo_id");

-- CreateIndex
CREATE INDEX "idx_contenidos_tipo" ON "contenidos"("tipo");

-- CreateIndex
CREATE INDEX "planificaciones_casa_tipo_mundo_tipo_idx" ON "planificaciones"("casa_tipo", "mundo_tipo");

-- CreateIndex
CREATE INDEX "planificaciones_estado_idx" ON "planificaciones"("estado");

-- AddForeignKey
ALTER TABLE "clases_planificacion" ADD CONSTRAINT "clases_planificacion_planificacion_id_fkey" FOREIGN KEY ("planificacion_id") REFERENCES "planificaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases_planificacion" ADD CONSTRAINT "clases_planificacion_teoria_id_fkey" FOREIGN KEY ("teoria_id") REFERENCES "contenidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases_planificacion" ADD CONSTRAINT "clases_planificacion_practica_id_fkey" FOREIGN KEY ("practica_id") REFERENCES "contenidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_clase" ADD CONSTRAINT "tareas_clase_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases_planificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_clase" ADD CONSTRAINT "tareas_clase_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_clase_grupo" ADD CONSTRAINT "estados_clase_grupo_asignacion_id_fkey" FOREIGN KEY ("asignacion_id") REFERENCES "asignaciones_planificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_clase_grupo" ADD CONSTRAINT "estados_clase_grupo_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases_planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_asignadas" ADD CONSTRAINT "tareas_asignadas_asignacion_id_fkey" FOREIGN KEY ("asignacion_id") REFERENCES "asignaciones_planificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_asignadas" ADD CONSTRAINT "tareas_asignadas_tarea_clase_id_fkey" FOREIGN KEY ("tarea_clase_id") REFERENCES "tareas_clase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos_clase_estudiante" ADD CONSTRAINT "progresos_clase_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos_clase_estudiante" ADD CONSTRAINT "progresos_clase_estudiante_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases_planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos_tarea_estudiante" ADD CONSTRAINT "progresos_tarea_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos_tarea_estudiante" ADD CONSTRAINT "progresos_tarea_estudiante_tarea_asignada_id_fkey" FOREIGN KEY ("tarea_asignada_id") REFERENCES "tareas_asignadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
