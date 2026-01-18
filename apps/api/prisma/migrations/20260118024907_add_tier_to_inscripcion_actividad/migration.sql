-- AlterTable
ALTER TABLE "inscripciones_actividad" ADD COLUMN     "tier" "tier_nombre";

-- Migrate existing data: Copy tier from suscripcion_familiar to each inscripcion
-- This ensures backward compatibility during the transition period
UPDATE inscripciones_actividad ia
SET tier = sf.tier
FROM suscripciones_familiares sf
WHERE ia.suscripcion_familiar_id = sf.id
AND ia.tier IS NULL;
