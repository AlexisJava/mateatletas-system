-- CreateTable: audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "user_type" TEXT,
    "user_email" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "description" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "request_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: secret_rotations
CREATE TABLE IF NOT EXISTS "secret_rotations" (
    "id" TEXT NOT NULL,
    "secret_type" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "secret_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "rotated_at" TIMESTAMP(3),
    "rotated_by" TEXT,
    "notes" TEXT,

    CONSTRAINT "secret_rotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");
CREATE INDEX IF NOT EXISTS "audit_logs_category_idx" ON "audit_logs"("category");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs"("severity");

CREATE INDEX IF NOT EXISTS "secret_rotations_secret_type_idx" ON "secret_rotations"("secret_type");
CREATE INDEX IF NOT EXISTS "secret_rotations_status_idx" ON "secret_rotations"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "secret_rotations_secret_type_version_key" ON "secret_rotations"("secret_type", "version");