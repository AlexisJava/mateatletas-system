warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- RenameIndex
ALTER INDEX "public"."solicitudes_canje_estudiante_id_idx" RENAME TO "idx_solicitudes_estudiante";

-- RenameIndex
ALTER INDEX "public"."solicitudes_canje_tutor_id_idx" RENAME TO "idx_solicitudes_tutor";

-- RenameIndex
ALTER INDEX "public"."solicitudes_canje_estado_idx" RENAME TO "idx_solicitudes_estado";

-- RenameIndex
ALTER INDEX "public"."solicitudes_canje_fecha_solicitud_idx" RENAME TO "idx_solicitudes_fecha";

