-- AddProcessedAtToPagos
-- Agregar campo processed_at para idempotencia en webhooks de pagos

-- Agregar processed_at a colonia_pagos
ALTER TABLE "colonia_pagos" ADD COLUMN "processed_at" TIMESTAMP(3);

-- Agregar processed_at a pagos_inscripciones_2026
ALTER TABLE "pagos_inscripciones_2026" ADD COLUMN "processed_at" TIMESTAMP(3);

-- Crear índices para optimizar búsquedas por processed_at
CREATE INDEX "colonia_pagos_processed_at_idx" ON "colonia_pagos"("processed_at");
CREATE INDEX "pagos_inscripciones_2026_processed_at_idx" ON "pagos_inscripciones_2026"("processed_at");
