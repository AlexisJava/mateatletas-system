-- Limpiar la tabla _prisma_migrations completamente
-- Ejecutar esto en Railway usando: railway run psql $DATABASE_URL -f clean-migrations-table.sql

-- Ver registros actuales
SELECT migration_name, started_at, finished_at FROM _prisma_migrations ORDER BY started_at;

-- Eliminar TODOS los registros (para empezar de cero)
DELETE FROM _prisma_migrations;

-- Verificar que está vacía
SELECT COUNT(*) as total_registros FROM _prisma_migrations;
