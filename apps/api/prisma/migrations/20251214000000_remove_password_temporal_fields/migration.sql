-- Migration: remove_password_temporal_fields
-- Description: Remove legacy password management fields for security hardening
-- Date: 2024-12-14
--
-- These fields are being removed as part of a security cleanup:
-- - password_temporal: Was used for temporary passwords during password reset
-- - debe_cambiar_password: Was used to force password change on first login
--
-- The new architecture uses token-based password reset which is more secure.

-- Remove from Tutor table
ALTER TABLE "Tutor" DROP COLUMN IF EXISTS "password_temporal";
ALTER TABLE "Tutor" DROP COLUMN IF EXISTS "debe_cambiar_password";

-- Remove from Estudiante table
ALTER TABLE "Estudiante" DROP COLUMN IF EXISTS "password_temporal";
ALTER TABLE "Estudiante" DROP COLUMN IF EXISTS "debe_cambiar_password";

-- Remove from Docente table
ALTER TABLE "Docente" DROP COLUMN IF EXISTS "password_temporal";
ALTER TABLE "Docente" DROP COLUMN IF EXISTS "debe_cambiar_password";

-- Remove from Admin table
ALTER TABLE "Admin" DROP COLUMN IF EXISTS "password_temporal";
ALTER TABLE "Admin" DROP COLUMN IF EXISTS "debe_cambiar_password";
