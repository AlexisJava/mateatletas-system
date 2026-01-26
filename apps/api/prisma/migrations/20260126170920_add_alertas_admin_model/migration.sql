-- CreateEnum
CREATE TYPE "TipoAlertaAdmin" AS ENUM ('NUEVA_SUSCRIPCION', 'SUSCRIPCION_CANCELADA', 'PAGO_FALLIDO', 'ESTUDIANTE_INACTIVO', 'FRAUDE_DETECTADO', 'WEBHOOK_FALLIDO', 'SISTEMA', 'SUSCRIPCION_GRACE_PERIOD');

-- CreateTable
CREATE TABLE "alertas_admin" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlertaAdmin" NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "prioridad" "prioridad_notificacion" NOT NULL DEFAULT 'MEDIA',
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "resuelta_por_id" TEXT,
    "fecha_resolucion" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_admin_tipo_idx" ON "alertas_admin"("tipo");

-- CreateIndex
CREATE INDEX "alertas_admin_prioridad_idx" ON "alertas_admin"("prioridad");

-- CreateIndex
CREATE INDEX "alertas_admin_resuelta_idx" ON "alertas_admin"("resuelta");

-- CreateIndex
CREATE INDEX "alertas_admin_created_at_idx" ON "alertas_admin"("created_at");
