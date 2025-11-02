-- AlterTable: Agregar campos de gestión de password a tutores
ALTER TABLE "tutores"
ADD COLUMN IF NOT EXISTS "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "password_temporal" TEXT,
ADD COLUMN IF NOT EXISTS "fecha_ultimo_cambio" TIMESTAMP(3);

-- AlterTable: Agregar campos de gestión de password a admins
ALTER TABLE "admins"
ADD COLUMN IF NOT EXISTS "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "password_temporal" TEXT,
ADD COLUMN IF NOT EXISTS "fecha_ultimo_cambio" TIMESTAMP(3);

-- AlterTable: Agregar campos de gestión de password a docentes
ALTER TABLE "docentes"
ADD COLUMN IF NOT EXISTS "password_temporal" TEXT,
ADD COLUMN IF NOT EXISTS "fecha_ultimo_cambio" TIMESTAMP(3);
-- Nota: docentes ya tiene debe_cambiar_password desde migración 20251012231854
