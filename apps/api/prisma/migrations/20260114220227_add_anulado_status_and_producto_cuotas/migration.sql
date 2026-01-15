-- AlterEnum
ALTER TYPE "estado_pago" ADD VALUE 'Anulado';

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "max_cuotas" INTEGER,
ADD COLUMN     "permite_cuotas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "precio_contado" DECIMAL(10,2);
