-- CreateTable
CREATE TABLE "test_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_models_pkey" PRIMARY KEY ("id")
);
