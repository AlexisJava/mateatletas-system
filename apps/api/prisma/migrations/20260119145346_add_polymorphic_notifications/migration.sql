-- CreateEnum
CREATE TYPE "prioridad_notificacion" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_PAGO_EXITOSO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_PAGO_FALLIDO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_SUSCRIPCION_PROXIMA_VENCER';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_SUSCRIPCION_RENOVADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_SUSCRIPCION_CANCELADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_SUSCRIPCION_PAUSADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_HIJO_INSCRITO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_CLASE_PROXIMA_HIJO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_CLASE_CANCELADA_HIJO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_LOGRO_HIJO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_REPORTE_PROGRESO_HIJO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_ALERTA_ASISTENCIA_HIJO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_MENSAJE_DOCENTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_NUEVO_MATERIAL';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_TAREA_ASIGNADA_HIJO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_PERIODO_INSCRIPCION_ABIERTO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'TUTOR_RECORDATORIO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_LOGRO_DESBLOQUEADO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_NIVEL_SUBIDO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_NUEVO_CONTENIDO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_CLASE_PROXIMA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_CLASE_CANCELADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_TAREA_ASIGNADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_TAREA_PROXIMA_VENCER';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_FEEDBACK_DOCENTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_RECOMPENSA_DIARIA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_RACHA_EN_RIESGO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_RACHA_PERDIDA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_DESAFIO_DISPONIBLE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_RANKING_ACTUALIZADO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_EVENTO_ESPECIAL';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_BIENVENIDA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ESTUDIANTE_RECORDATORIO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_CLASE_PROXIMA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_ASISTENCIA_PENDIENTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_ESTUDIANTE_ALERTA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_CLASE_CANCELADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_LOGRO_ESTUDIANTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_NUEVO_ESTUDIANTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_ESTUDIANTE_BAJA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_MENSAJE_TUTOR';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_TAREAS_PENDIENTES';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_EVALUACION_PENDIENTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_MATERIAL_ASIGNADO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_CLASE_REPROGRAMADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_REPORTE_MENSUAL';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_RECORDATORIO_PLANIFICACION';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_FEEDBACK_ADMIN';
ALTER TYPE "tipo_notificacion" ADD VALUE 'DOCENTE_RECORDATORIO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_NUEVO_PAGO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_PAGO_FALLIDO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_NUEVA_SUSCRIPCION';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_SUSCRIPCION_CANCELADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_NUEVO_USUARIO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_ALERTA_SISTEMA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_REPORTE_DIARIO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_CONTENIDO_PENDIENTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_SOLICITUD_SOPORTE';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_DOCENTE_INACTIVO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_CLASE_LLENA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_MIGRACION_COMPLETADA';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_BACKUP_COMPLETADO';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_AUDITORIA_SEGURIDAD';
ALTER TYPE "tipo_notificacion" ADD VALUE 'ADMIN_RECORDATORIO';

-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "admin_id" TEXT,
ADD COLUMN     "estudiante_id" TEXT,
ADD COLUMN     "expiraEn" TIMESTAMP(3),
ADD COLUMN     "prioridad" "prioridad_notificacion" NOT NULL DEFAULT 'MEDIA',
ADD COLUMN     "tutor_id" TEXT,
ALTER COLUMN "docente_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notificaciones_tutor_id_leida_idx" ON "notificaciones"("tutor_id", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_tutor_id_createdAt_idx" ON "notificaciones"("tutor_id", "createdAt");

-- CreateIndex
CREATE INDEX "notificaciones_estudiante_id_leida_idx" ON "notificaciones"("estudiante_id", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_estudiante_id_createdAt_idx" ON "notificaciones"("estudiante_id", "createdAt");

-- CreateIndex
CREATE INDEX "notificaciones_admin_id_leida_idx" ON "notificaciones"("admin_id", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_admin_id_createdAt_idx" ON "notificaciones"("admin_id", "createdAt");

-- CreateIndex
CREATE INDEX "notificaciones_expiraEn_idx" ON "notificaciones"("expiraEn");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
