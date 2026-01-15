-- CreateEnum
CREATE TYPE "dlq_status" AS ENUM ('PENDING', 'PROCESSING', 'RESOLVED', 'ABANDONED');

-- CreateTable
CREATE TABLE "webhook_failed" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "webhook_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error_message" TEXT NOT NULL,
    "error_stack" TEXT,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "status" "dlq_status" NOT NULL DEFAULT 'PENDING',
    "last_retry_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_failed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_failed_status_created_at_idx" ON "webhook_failed"("status", "created_at");

-- CreateIndex
CREATE INDEX "webhook_failed_payment_id_idx" ON "webhook_failed"("payment_id");
