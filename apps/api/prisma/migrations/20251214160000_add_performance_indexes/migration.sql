-- CreateIndex: Performance indexes para rankings y listados
-- Estudiante: índice para ranking global por puntos
CREATE INDEX IF NOT EXISTS "idx_estudiantes_puntos_ranking" ON "estudiantes"("puntos_totales" DESC);

-- Estudiante: índice compuesto para ranking por casa (columna real: casa_id)
CREATE INDEX IF NOT EXISTS "idx_estudiantes_casa_ranking" ON "estudiantes"("casa_id", "puntos_totales" DESC);

-- Estudiante: índice para listados de estudiantes por tutor
CREATE INDEX IF NOT EXISTS "idx_estudiantes_tutor_listado" ON "estudiantes"("tutor_id", "apellido");

-- Mundo: índice para filtrar mundos activos
CREATE INDEX IF NOT EXISTS "idx_mundos_activo" ON "mundos"("activo");

-- AsistenciaClaseGrupo: índice para filtrar por estado
CREATE INDEX IF NOT EXISTS "idx_asistencias_estado" ON "asistencias_clase_grupo"("estado");

-- Logro: índices para agrupaciones y filtros de gamificación
CREATE INDEX IF NOT EXISTS "idx_logros_categoria" ON "logros_gamificacion"("categoria");
CREATE INDEX IF NOT EXISTS "idx_logros_rareza" ON "logros_gamificacion"("rareza");
CREATE INDEX IF NOT EXISTS "idx_logros_activo" ON "logros_gamificacion"("activo");
