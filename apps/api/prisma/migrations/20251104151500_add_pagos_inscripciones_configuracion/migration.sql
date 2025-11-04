-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('NINGUNO', 'MULTIPLE_ACTIVIDADES', 'HERMANOS_BASICO', 'HERMANOS_MULTIPLE', 'AACREA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('Pendiente', 'Pagado', 'Vencido', 'Parcial', 'Becado');

-- CreateTable
CREATE TABLE "configuracion_precios" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "precio_club_matematicas" DECIMAL(10,2) NOT NULL DEFAULT 50000,
    "precio_cursos_especializados" DECIMAL(10,2) NOT NULL DEFAULT 55000,
    "precio_multiple_actividades" DECIMAL(10,2) NOT NULL DEFAULT 44000,
    "precio_hermanos_basico" DECIMAL(10,2) NOT NULL DEFAULT 44000,
    "precio_hermanos_multiple" DECIMAL(10,2) NOT NULL DEFAULT 38000,
    "descuento_aacrea_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "descuento_aacrea_activo" BOOLEAN NOT NULL DEFAULT true,
    "dia_vencimiento" INTEGER NOT NULL DEFAULT 15,
    "dias_antes_recordatorio" INTEGER NOT NULL DEFAULT 5,
    "notificaciones_activas" BOOLEAN NOT NULL DEFAULT true,
    "actualizado_por_admin_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_cambio_precios" (
    "id" TEXT NOT NULL,
    "configuracion_id" TEXT NOT NULL,
    "valores_anteriores" JSONB NOT NULL,
    "valores_nuevos" JSONB NOT NULL,
    "motivo_cambio" TEXT,
    "admin_id" TEXT NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_cambio_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_mensuales" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "descuento_aplicado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_final" DECIMAL(10,2) NOT NULL,
    "tipo_descuento" "TipoDescuento" NOT NULL,
    "detalle_calculo" TEXT NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'Pendiente',
    "fecha_vencimiento" TIMESTAMP(3),
    "fecha_pago" TIMESTAMP(3),
    "metodo_pago" TEXT,
    "comprobante_url" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_cambio_precios_configuracion_id_idx" ON "historial_cambio_precios"("configuracion_id");

-- CreateIndex
CREATE INDEX "historial_cambio_precios_fecha_cambio_idx" ON "historial_cambio_precios"("fecha_cambio");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_estudiante_id_idx" ON "inscripciones_mensuales"("estudiante_id");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_tutor_id_idx" ON "inscripciones_mensuales"("tutor_id");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_periodo_idx" ON "inscripciones_mensuales"("periodo");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_estado_pago_idx" ON "inscripciones_mensuales"("estado_pago");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_mensuales_estudiante_id_producto_id_periodo_key" ON "inscripciones_mensuales"("estudiante_id", "producto_id", "periodo");

-- AddForeignKey
ALTER TABLE "historial_cambio_precios" ADD CONSTRAINT "historial_cambio_precios_configuracion_id_fkey" FOREIGN KEY ("configuracion_id") REFERENCES "configuracion_precios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mensuales" ADD CONSTRAINT "inscripciones_mensuales_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mensuales" ADD CONSTRAINT "inscripciones_mensuales_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mensuales" ADD CONSTRAINT "inscripciones_mensuales_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
