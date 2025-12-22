-- Remove old content system: Modulo, Leccion, ProgresoLeccion
-- Remove old Studio system: CursoStudio, SemanaStudio, RecursoStudio, ComponenteCatalogo
-- Remove related enums

-- Step 1: Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS "progreso_lecciones" CASCADE;
DROP TABLE IF EXISTS "lecciones" CASCADE;
DROP TABLE IF EXISTS "modulos" CASCADE;

-- Step 2: Drop Studio tables
DROP TABLE IF EXISTS "semanas_studio" CASCADE;
DROP TABLE IF EXISTS "recursos_studio" CASCADE;
DROP TABLE IF EXISTS "cursos_studio" CASCADE;
DROP TABLE IF EXISTS "componentes_catalogo" CASCADE;

-- Step 3: Drop enums
DROP TYPE IF EXISTS "tipo_contenido" CASCADE;
DROP TYPE IF EXISTS "categoria_studio" CASCADE;
DROP TYPE IF EXISTS "tipo_experiencia_studio" CASCADE;
DROP TYPE IF EXISTS "materia_studio" CASCADE;
DROP TYPE IF EXISTS "estado_curso_studio" CASCADE;
DROP TYPE IF EXISTS "estado_semana_studio" CASCADE;
DROP TYPE IF EXISTS "tipo_recurso_studio" CASCADE;
DROP TYPE IF EXISTS "categoria_componente" CASCADE;
