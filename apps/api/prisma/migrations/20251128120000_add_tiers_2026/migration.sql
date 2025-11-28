-- CreateEnum: TierNombre
CREATE TYPE "tier_nombre" AS ENUM ('ARCADE', 'ARCADE_PLUS', 'PRO');

-- CreateTable: Tier
CREATE TABLE "tiers" (
    "id" TEXT NOT NULL,
    "nombre" "tier_nombre" NOT NULL,
    "precio_mensual" INTEGER NOT NULL,
    "mundos_async" INTEGER NOT NULL,
    "mundos_sync" INTEGER NOT NULL,
    "tiene_docente" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique nombre
CREATE UNIQUE INDEX "tiers_nombre_key" ON "tiers"("nombre");

-- AlterTable: Add tier_id to EstudianteInscripcion2026
ALTER TABLE "estudiantes_inscripciones_2026" ADD COLUMN "tier_id" TEXT;

-- CreateIndex: tier_id index
CREATE INDEX "estudiantes_inscripciones_2026_tier_id_idx" ON "estudiantes_inscripciones_2026"("tier_id");

-- AddForeignKey: EstudianteInscripcion2026 -> Tier
ALTER TABLE "estudiantes_inscripciones_2026" ADD CONSTRAINT "estudiantes_inscripciones_2026_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CambioTierPendiente
CREATE TABLE "cambios_tier_pendientes" (
    "id" TEXT NOT NULL,
    "estudiante_inscripcion_id" TEXT NOT NULL,
    "tier_actual_id" TEXT NOT NULL,
    "tier_nuevo_id" TEXT NOT NULL,
    "tipo_cambio" TEXT NOT NULL,
    "fecha_efectiva" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "aplicacion_inmediata" BOOLEAN NOT NULL DEFAULT false,
    "aplicado_en" TIMESTAMP(3),
    "cancelado_en" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambios_tier_pendientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: cambios_tier_pendientes indexes
CREATE INDEX "cambios_tier_pendientes_estudiante_inscripcion_id_idx" ON "cambios_tier_pendientes"("estudiante_inscripcion_id");
CREATE INDEX "cambios_tier_pendientes_estado_idx" ON "cambios_tier_pendientes"("estado");
CREATE INDEX "cambios_tier_pendientes_fecha_efectiva_idx" ON "cambios_tier_pendientes"("fecha_efectiva");

-- AddForeignKey: CambioTierPendiente -> EstudianteInscripcion2026
ALTER TABLE "cambios_tier_pendientes" ADD CONSTRAINT "cambios_tier_pendientes_estudiante_inscripcion_id_fkey" FOREIGN KEY ("estudiante_inscripcion_id") REFERENCES "estudiantes_inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CambioTierPendiente -> Tier (tier_actual)
ALTER TABLE "cambios_tier_pendientes" ADD CONSTRAINT "cambios_tier_pendientes_tier_actual_id_fkey" FOREIGN KEY ("tier_actual_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CambioTierPendiente -> Tier (tier_nuevo)
ALTER TABLE "cambios_tier_pendientes" ADD CONSTRAINT "cambios_tier_pendientes_tier_nuevo_id_fkey" FOREIGN KEY ("tier_nuevo_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
