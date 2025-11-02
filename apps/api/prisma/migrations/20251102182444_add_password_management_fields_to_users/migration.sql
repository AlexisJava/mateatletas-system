-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_ultimo_cambio" TIMESTAMP(3),
ADD COLUMN     "password_temporal" TEXT;

-- AlterTable
ALTER TABLE "docentes" ADD COLUMN     "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_ultimo_cambio" TIMESTAMP(3),
ADD COLUMN     "password_temporal" TEXT;

-- AlterTable
ALTER TABLE "tutores" ADD COLUMN     "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_ultimo_cambio" TIMESTAMP(3),
ADD COLUMN     "password_temporal" TEXT;
