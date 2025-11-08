-- AlterTable
ALTER TABLE "tutores" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tutores_username_key" ON "tutores"("username");
