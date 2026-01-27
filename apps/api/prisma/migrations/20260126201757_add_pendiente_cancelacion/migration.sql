-- AlterEnum
ALTER TYPE "estado_suscripcion_familiar" ADD VALUE 'PENDIENTE_CANCELACION';

-- AlterTable
ALTER TABLE "suscripciones_familiares" ADD COLUMN     "fecha_solicitud_cancelacion" TIMESTAMP(3),
ADD COLUMN     "motivo_cancelacion" TEXT;
