-- CreateEnum
CREATE TYPE "TipoActividadFeed" AS ENUM ('LECCION_COMPLETADA', 'CLASE_COMPLETADA', 'TAREA_COMPLETADA', 'TAREA_PERFECTA', 'PLANIFICACION_COMPLETADA', 'LOGRO_DESBLOQUEADO', 'NIVEL_SUBIDO', 'RACHA_EXTENDIDA');

-- CreateTable
CREATE TABLE "actividad_feed" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tipo" "TipoActividadFeed" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "xp_ganado" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "casa_id" TEXT,

    CONSTRAINT "actividad_feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reacciones_feed" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reacciones_feed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actividad_feed_estudiante_id_idx" ON "actividad_feed"("estudiante_id");

-- CreateIndex
CREATE INDEX "actividad_feed_casa_id_idx" ON "actividad_feed"("casa_id");

-- CreateIndex
CREATE INDEX "actividad_feed_tipo_idx" ON "actividad_feed"("tipo");

-- CreateIndex
CREATE INDEX "actividad_feed_creado_en_idx" ON "actividad_feed"("creado_en");

-- CreateIndex
CREATE INDEX "reacciones_feed_actividad_id_idx" ON "reacciones_feed"("actividad_id");

-- CreateIndex
CREATE INDEX "reacciones_feed_estudiante_id_idx" ON "reacciones_feed"("estudiante_id");

-- CreateIndex
CREATE UNIQUE INDEX "reacciones_feed_actividad_id_estudiante_id_emoji_key" ON "reacciones_feed"("actividad_id", "estudiante_id", "emoji");

-- AddForeignKey
ALTER TABLE "actividad_feed" ADD CONSTRAINT "actividad_feed_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_feed" ADD CONSTRAINT "actividad_feed_casa_id_fkey" FOREIGN KEY ("casa_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones_feed" ADD CONSTRAINT "reacciones_feed_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad_feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones_feed" ADD CONSTRAINT "reacciones_feed_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
