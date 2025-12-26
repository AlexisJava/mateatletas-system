-- CreateIndex
CREATE INDEX "idx_progreso_nodo_actual" ON "progreso_contenidos"("nodo_actual_id");

-- AddForeignKey
ALTER TABLE "progreso_contenidos" ADD CONSTRAINT "progreso_contenidos_nodo_actual_id_fkey" FOREIGN KEY ("nodo_actual_id") REFERENCES "nodos_contenido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
