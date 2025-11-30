-- Mateatletas Studio: Sistema de creación de cursos
-- Documentación: docs/MATEATLETAS_STUDIO.md
-- Documentación: docs/PLAN_CONSTRUCCION_STUDIO.md

-- CreateEnum
CREATE TYPE "categoria_studio" AS ENUM ('EXPERIENCIA', 'CURRICULAR');

-- CreateEnum
CREATE TYPE "tipo_experiencia_studio" AS ENUM ('NARRATIVO', 'EXPEDICION', 'LABORATORIO', 'SIMULACION', 'PROYECTO', 'DESAFIO');

-- CreateEnum
CREATE TYPE "materia_studio" AS ENUM ('MATEMATICA_ESCOLAR', 'FISICA', 'QUIMICA', 'PROGRAMACION');

-- CreateEnum
CREATE TYPE "estado_curso_studio" AS ENUM ('DRAFT', 'EN_PROGRESO', 'EN_REVISION', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "estado_semana_studio" AS ENUM ('VACIA', 'COMPLETA');

-- CreateEnum
CREATE TYPE "tipo_recurso_studio" AS ENUM ('IMAGEN', 'AUDIO', 'VIDEO', 'DOCUMENTO');

-- CreateTable
CREATE TABLE "cursos_studio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "categoria_studio" NOT NULL,
    "mundo" "mundo_tipo" NOT NULL,
    "casa" "casa_tipo" NOT NULL,
    "tier_minimo" "tier_nombre" NOT NULL,
    "tipo_experiencia" "tipo_experiencia_studio",
    "materia" "materia_studio",
    "estetica_base" TEXT NOT NULL,
    "estetica_variante" TEXT,
    "cantidad_semanas" INTEGER NOT NULL,
    "actividades_por_semana" INTEGER NOT NULL,
    "estado" "estado_curso_studio" NOT NULL DEFAULT 'DRAFT',
    "landing_mundo" BOOLEAN NOT NULL DEFAULT false,
    "landing_home" BOOLEAN NOT NULL DEFAULT false,
    "catalogo_interno" BOOLEAN NOT NULL DEFAULT false,
    "notificar_upgrade" BOOLEAN NOT NULL DEFAULT false,
    "fecha_venta" TIMESTAMP(3),
    "fecha_disponible" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semanas_studio" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT,
    "descripcion" TEXT,
    "contenido" JSONB,
    "estado" "estado_semana_studio" NOT NULL DEFAULT 'VACIA',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semanas_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos_studio" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "tipo" "tipo_recurso_studio" NOT NULL,
    "nombre" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "tamanio_bytes" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recursos_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges_custom_studio" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "en_biblioteca" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_custom_studio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: cursos_studio
CREATE INDEX "cursos_studio_categoria_idx" ON "cursos_studio"("categoria");
CREATE INDEX "cursos_studio_mundo_idx" ON "cursos_studio"("mundo");
CREATE INDEX "cursos_studio_casa_idx" ON "cursos_studio"("casa");
CREATE INDEX "cursos_studio_estado_idx" ON "cursos_studio"("estado");

-- CreateIndex: semanas_studio
CREATE UNIQUE INDEX "semanas_studio_curso_id_numero_key" ON "semanas_studio"("curso_id", "numero");
CREATE INDEX "semanas_studio_curso_id_idx" ON "semanas_studio"("curso_id");
CREATE INDEX "semanas_studio_estado_idx" ON "semanas_studio"("estado");

-- CreateIndex: recursos_studio
CREATE INDEX "recursos_studio_curso_id_idx" ON "recursos_studio"("curso_id");
CREATE INDEX "recursos_studio_tipo_idx" ON "recursos_studio"("tipo");

-- CreateIndex: badges_custom_studio
CREATE INDEX "badges_custom_studio_curso_id_idx" ON "badges_custom_studio"("curso_id");
CREATE INDEX "badges_custom_studio_en_biblioteca_idx" ON "badges_custom_studio"("en_biblioteca");

-- AddForeignKey
ALTER TABLE "semanas_studio" ADD CONSTRAINT "semanas_studio_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos_studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos_studio" ADD CONSTRAINT "recursos_studio_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos_studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
