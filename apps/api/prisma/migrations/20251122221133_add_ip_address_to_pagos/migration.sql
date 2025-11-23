-- AlterTable
-- Add ip_address field to pagos_inscripciones_2026 for fraud detection
ALTER TABLE "pagos_inscripciones_2026" ADD COLUMN "ip_address" TEXT;
