-- Migration: Add Password Reset and Session Tables
-- Date: 2024-12-18
-- Description: Tables for password reset flow and session management

-- ============================================================================
-- Table: password_reset_tokens
-- Purpose: Store password reset tokens with SHA256 hash
-- ============================================================================
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "user_type" VARCHAR(20) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- Indexes for password_reset_tokens
CREATE INDEX IF NOT EXISTS "idx_password_reset_email" ON "password_reset_tokens"("email");
CREATE INDEX IF NOT EXISTS "idx_password_reset_token" ON "password_reset_tokens"("token");
CREATE INDEX IF NOT EXISTS "idx_password_reset_expires" ON "password_reset_tokens"("expires_at");

-- ============================================================================
-- Table: refresh_token_sessions
-- Purpose: Track active refresh token sessions for session management UI
-- ============================================================================
CREATE TABLE IF NOT EXISTS "refresh_token_sessions" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" UUID NOT NULL,
    "user_type" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_reason" VARCHAR(50),

    CONSTRAINT "refresh_token_sessions_pkey" PRIMARY KEY ("id")
);

-- Indexes for refresh_token_sessions
CREATE INDEX IF NOT EXISTS "idx_refresh_session_user" ON "refresh_token_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_refresh_session_expires" ON "refresh_token_sessions"("expires_at");
