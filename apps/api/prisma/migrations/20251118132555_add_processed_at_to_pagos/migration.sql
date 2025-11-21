-- AddProcessedAtToPagos
-- Agregar campo processed_at para idempotencia en webhooks de pagos

-- Agregar processed_at a colonia_pagos
ALTER TABLE "colonia_pagos" ADD COLUMN "processed_at" TIMESTAMP(3);

-- Crear índices para optimizar búsquedas por processed_at
CREATE INDEX "colonia_pagos_processed_at_idx" ON "colonia_pagos"("processed_at");
