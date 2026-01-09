-- DropForeignKey
ALTER TABLE "public"."contenidos" DROP CONSTRAINT "contenidos_creador_id_fkey";

-- AlterTable
ALTER TABLE "contenidos" ALTER COLUMN "creador_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contenidos" ADD CONSTRAINT "contenidos_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
