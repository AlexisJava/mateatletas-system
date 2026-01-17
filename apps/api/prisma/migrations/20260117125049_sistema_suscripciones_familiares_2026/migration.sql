-- CreateEnum
CREATE TYPE "subtipo_mundo" AS ENUM ('GENERAL', 'OLIMPICA');

-- CreateEnum
CREATE TYPE "nivel_olimpiada" AS ENUM ('NANDU_N1', 'NANDU_N2', 'OMA_N1', 'OMA_N2', 'OMA_N3');

-- CreateEnum
CREATE TYPE "estado_suscripcion_familiar" AS ENUM ('PENDING', 'AUTHORIZED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "estado_inscripcion_actividad" AS ENUM ('ACTIVA', 'PAUSADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_cambio_inscripcion" AS ENUM ('ALTA', 'BAJA', 'CAMBIO_HORARIO', 'CAMBIO_PRODUCTO', 'CAMBIO_TIER');

-- CreateEnum
CREATE TYPE "modalidad_pago_curso" AS ENUM ('CONTADO', 'CUOTAS');

-- CreateEnum
CREATE TYPE "estado_pago_curso" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'FAILED', 'REFUNDED');

-- AlterEnum
ALTER TYPE "TipoProducto" ADD VALUE 'Club';

-- AlterTable
ALTER TABLE "clase_grupos" ADD COLUMN     "producto_id" TEXT;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "casa" "casa_tipo",
ADD COLUMN     "edad_maxima" INTEGER,
ADD COLUMN     "edad_minima" INTEGER,
ADD COLUMN     "mundo" "mundo_tipo",
ADD COLUMN     "nivel_olimpiada" "nivel_olimpiada",
ADD COLUMN     "orden_display" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permite_excepciones" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subtipo_mundo" "subtipo_mundo",
ADD COLUMN     "visible_en_landing" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "suscripciones_familiares" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "preapproval_id" TEXT,
    "preapproval_plan_id" TEXT,
    "estado" "estado_suscripcion_familiar" NOT NULL DEFAULT 'PENDING',
    "tier" "tier_nombre" NOT NULL DEFAULT 'STEAM_LIBROS',
    "monto_mensual" INTEGER NOT NULL DEFAULT 0,
    "fecha_proximo_cobro" TIMESTAMP(3),
    "fecha_gracia" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suscripciones_familiares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_actividad" (
    "id" TEXT NOT NULL,
    "suscripcion_familiar_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "clase_grupo_id" TEXT,
    "comision_id" TEXT,
    "estado" "estado_inscripcion_actividad" NOT NULL DEFAULT 'ACTIVA',
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambios_inscripcion" (
    "id" TEXT NOT NULL,
    "suscripcion_familiar_id" TEXT NOT NULL,
    "tipo" "tipo_cambio_inscripcion" NOT NULL,
    "inscripcion_anterior_id" TEXT,
    "inscripcion_nueva_id" TEXT,
    "solicitado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aplica_desde" TIMESTAMP(3) NOT NULL,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "monto_anterior" INTEGER NOT NULL,
    "monto_nuevo" INTEGER NOT NULL,
    "detalle" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambios_inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_curso" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "comision_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "modalidad" "modalidad_pago_curso" NOT NULL,
    "monto_total" INTEGER NOT NULL,
    "monto_por_cuota" INTEGER,
    "cantidad_cuotas" INTEGER,
    "cuotas_pagadas" INTEGER NOT NULL DEFAULT 0,
    "payment_id" TEXT,
    "preapproval_id" TEXT,
    "estado" "estado_pago_curso" NOT NULL DEFAULT 'PENDING',
    "fecha_pago" TIMESTAMP(3),
    "fecha_proximo_cobro" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_curso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_familiares_tutor_id_key" ON "suscripciones_familiares"("tutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_familiares_preapproval_id_key" ON "suscripciones_familiares"("preapproval_id");

-- CreateIndex
CREATE INDEX "suscripciones_familiares_estado_idx" ON "suscripciones_familiares"("estado");

-- CreateIndex
CREATE INDEX "suscripciones_familiares_fecha_proximo_cobro_idx" ON "suscripciones_familiares"("fecha_proximo_cobro");

-- CreateIndex
CREATE INDEX "inscripciones_actividad_suscripcion_familiar_id_idx" ON "inscripciones_actividad"("suscripcion_familiar_id");

-- CreateIndex
CREATE INDEX "inscripciones_actividad_estudiante_id_idx" ON "inscripciones_actividad"("estudiante_id");

-- CreateIndex
CREATE INDEX "inscripciones_actividad_estado_idx" ON "inscripciones_actividad"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_actividad_estudiante_id_producto_id_clase_gru_key" ON "inscripciones_actividad"("estudiante_id", "producto_id", "clase_grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_actividad_estudiante_id_comision_id_key" ON "inscripciones_actividad"("estudiante_id", "comision_id");

-- CreateIndex
CREATE INDEX "cambios_inscripcion_suscripcion_familiar_id_idx" ON "cambios_inscripcion"("suscripcion_familiar_id");

-- CreateIndex
CREATE INDEX "cambios_inscripcion_aplica_desde_procesado_idx" ON "cambios_inscripcion"("aplica_desde", "procesado");

-- CreateIndex
CREATE INDEX "pagos_curso_tutor_id_idx" ON "pagos_curso"("tutor_id");

-- CreateIndex
CREATE INDEX "pagos_curso_estado_idx" ON "pagos_curso"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_curso_estudiante_id_comision_id_key" ON "pagos_curso"("estudiante_id", "comision_id");

-- CreateIndex
CREATE INDEX "clase_grupos_producto_id_idx" ON "clase_grupos"("producto_id");

-- CreateIndex
CREATE INDEX "productos_tipo_activo_idx" ON "productos"("tipo", "activo");

-- CreateIndex
CREATE INDEX "productos_casa_mundo_idx" ON "productos"("casa", "mundo");

-- CreateIndex
CREATE INDEX "productos_visible_en_landing_activo_idx" ON "productos"("visible_en_landing", "activo");

-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones_familiares" ADD CONSTRAINT "suscripciones_familiares_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_actividad" ADD CONSTRAINT "inscripciones_actividad_suscripcion_familiar_id_fkey" FOREIGN KEY ("suscripcion_familiar_id") REFERENCES "suscripciones_familiares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_actividad" ADD CONSTRAINT "inscripciones_actividad_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_actividad" ADD CONSTRAINT "inscripciones_actividad_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_actividad" ADD CONSTRAINT "inscripciones_actividad_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_actividad" ADD CONSTRAINT "inscripciones_actividad_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_inscripcion" ADD CONSTRAINT "cambios_inscripcion_suscripcion_familiar_id_fkey" FOREIGN KEY ("suscripcion_familiar_id") REFERENCES "suscripciones_familiares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_curso" ADD CONSTRAINT "pagos_curso_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_curso" ADD CONSTRAINT "pagos_curso_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_curso" ADD CONSTRAINT "pagos_curso_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_curso" ADD CONSTRAINT "pagos_curso_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
