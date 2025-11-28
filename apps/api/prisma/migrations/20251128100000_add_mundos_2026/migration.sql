-- ============================================================================
-- SLICE 2: MUNDOS - Sistema de Mundos STEAM 2026
-- ============================================================================
-- Crea el modelo Mundo con sus 3 instancias (Matematica, Programacion, Ciencias)
-- y los enums MundoTipo y NivelInterno
-- ============================================================================

-- CreateEnum: MundoTipo
CREATE TYPE "mundo_tipo" AS ENUM ('MATEMATICA', 'PROGRAMACION', 'CIENCIAS');

-- CreateEnum: NivelInterno
CREATE TYPE "nivel_interno" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO', 'OLIMPICO');

-- CreateTable: mundos
CREATE TABLE "mundos" (
    "id" TEXT NOT NULL,
    "tipo" "mundo_tipo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT NOT NULL,
    "color_primary" TEXT NOT NULL,
    "color_secondary" TEXT NOT NULL,
    "color_accent" TEXT NOT NULL,
    "gradiente" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mundos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: tipo unico
CREATE UNIQUE INDEX "mundos_tipo_key" ON "mundos"("tipo");

-- CreateIndex: nombre unico
CREATE UNIQUE INDEX "mundos_nombre_key" ON "mundos"("nombre");
