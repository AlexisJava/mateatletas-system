-- AlterTable - Add LiveKit fields to Comision
ALTER TABLE "comisiones" ADD COLUMN     "estado_clase" "estado_clase" NOT NULL DEFAULT 'Programada',
ADD COLUMN     "finalizada_en" TIMESTAMP(3),
ADD COLUMN     "iniciada_en" TIMESTAMP(3),
ADD COLUMN     "livekit_room_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "comisiones_livekit_room_name_key" ON "comisiones"("livekit_room_name");

-- CreateIndex
CREATE INDEX "comisiones_estado_clase_idx" ON "comisiones"("estado_clase");

-- CreateIndex
CREATE INDEX "comisiones_livekit_room_name_idx" ON "comisiones"("livekit_room_name");
