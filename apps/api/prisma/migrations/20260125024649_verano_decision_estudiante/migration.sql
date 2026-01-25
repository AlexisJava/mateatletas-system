-- CreateEnum
CREATE TYPE "decision_verano" AS ENUM ('COLONIA', 'CONTINUIDAD', 'PENDIENTE');

-- AlterEnum
ALTER TYPE "estado_suscripcion_familiar" ADD VALUE 'CONTINUIDAD';

-- AlterTable
ALTER TABLE "suscripciones_familiares" ADD COLUMN     "monto_original" INTEGER;

-- CreateTable
CREATE TABLE "decisiones_verano_estudiante" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "suscripcion_familiar_id" TEXT NOT NULL,
    "clase_grupo_colonia_id" TEXT,
    "anio" INTEGER NOT NULL,
    "decision" "decision_verano" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_decision" TIMESTAMP(3),
    "matricula_colonia_pagada" BOOLEAN NOT NULL DEFAULT false,
    "motivo_admin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decisiones_verano_estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "decisiones_verano_estudiante_suscripcion_familiar_id_idx" ON "decisiones_verano_estudiante"("suscripcion_familiar_id");

-- CreateIndex
CREATE INDEX "decisiones_verano_estudiante_anio_decision_idx" ON "decisiones_verano_estudiante"("anio", "decision");

-- CreateIndex
CREATE UNIQUE INDEX "decisiones_verano_estudiante_estudiante_id_anio_key" ON "decisiones_verano_estudiante"("estudiante_id", "anio");

-- AddForeignKey
ALTER TABLE "decisiones_verano_estudiante" ADD CONSTRAINT "decisiones_verano_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisiones_verano_estudiante" ADD CONSTRAINT "decisiones_verano_estudiante_suscripcion_familiar_id_fkey" FOREIGN KEY ("suscripcion_familiar_id") REFERENCES "suscripciones_familiares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisiones_verano_estudiante" ADD CONSTRAINT "decisiones_verano_estudiante_clase_grupo_colonia_id_fkey" FOREIGN KEY ("clase_grupo_colonia_id") REFERENCES "clase_grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
