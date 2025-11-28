-- CreateEnum: OnboardingEstado
CREATE TYPE "onboarding_estado" AS ENUM ('PENDIENTE', 'SELECCION_MUNDOS', 'TEST_UBICACION', 'CONFIRMACION_CASA', 'CREACION_AVATAR', 'COMPLETADO');

-- AlterTable: Add onboarding fields to EstudianteInscripcion2026
ALTER TABLE "estudiantes_inscripciones_2026" ADD COLUMN "onboarding_estado" "onboarding_estado" NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE "estudiantes_inscripciones_2026" ADD COLUMN "onboarding_completado_at" TIMESTAMP(3);
ALTER TABLE "estudiantes_inscripciones_2026" ADD COLUMN "avatar_config" JSONB;
ALTER TABLE "estudiantes_inscripciones_2026" ADD COLUMN "mundos_seleccionados" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable: EstudianteMundoNivel
CREATE TABLE "estudiante_mundo_niveles" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "mundo_id" TEXT NOT NULL,
    "nivel_interno" "nivel_interno" NOT NULL DEFAULT 'BASICO',
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiante_mundo_niveles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TestUbicacionResultado
CREATE TABLE "test_ubicacion_resultados" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "mundo_id" TEXT NOT NULL,
    "preguntas_total" INTEGER NOT NULL,
    "respuestas_correctas" INTEGER NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "nivel_asignado" "nivel_interno" NOT NULL,
    "casa_original_id" TEXT,
    "casa_asignada_id" TEXT,
    "bajo_de_casa" BOOLEAN NOT NULL DEFAULT false,
    "fecha_completado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_ubicacion_resultados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: EstudianteMundoNivel indexes
CREATE UNIQUE INDEX "estudiante_mundo_niveles_estudiante_id_mundo_id_key" ON "estudiante_mundo_niveles"("estudiante_id", "mundo_id");
CREATE INDEX "estudiante_mundo_niveles_estudiante_id_idx" ON "estudiante_mundo_niveles"("estudiante_id");
CREATE INDEX "estudiante_mundo_niveles_mundo_id_idx" ON "estudiante_mundo_niveles"("mundo_id");

-- CreateIndex: TestUbicacionResultado indexes
CREATE INDEX "test_ubicacion_resultados_estudiante_id_idx" ON "test_ubicacion_resultados"("estudiante_id");
CREATE INDEX "test_ubicacion_resultados_mundo_id_idx" ON "test_ubicacion_resultados"("mundo_id");

-- AddForeignKey: EstudianteMundoNivel -> Estudiante
ALTER TABLE "estudiante_mundo_niveles" ADD CONSTRAINT "estudiante_mundo_niveles_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: EstudianteMundoNivel -> Mundo
ALTER TABLE "estudiante_mundo_niveles" ADD CONSTRAINT "estudiante_mundo_niveles_mundo_id_fkey" FOREIGN KEY ("mundo_id") REFERENCES "mundos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: TestUbicacionResultado -> Estudiante
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: TestUbicacionResultado -> Mundo
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_mundo_id_fkey" FOREIGN KEY ("mundo_id") REFERENCES "mundos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: TestUbicacionResultado -> Casa (original)
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_casa_original_id_fkey" FOREIGN KEY ("casa_original_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: TestUbicacionResultado -> Casa (asignada)
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_casa_asignada_id_fkey" FOREIGN KEY ("casa_asignada_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
