-- ============================================================================
-- AUDIT VERIFICATION QUERIES
-- Queries SQL para verificar manualmente las inconsistencias encontradas
-- ============================================================================

-- Conectar a la base de datos:
-- PGPASSWORD=mateatletas123 psql -h localhost -p 5432 -U mateatletas -d mateatletas

-- ============================================================================
-- 1. ESTUDIANTES - Verificar estructura de la tabla
-- ============================================================================

\echo '=== TABLA ESTUDIANTES ==='

-- Ver todas las columnas de la tabla estudiantes
\d estudiantes

-- Verificar que NO existe columna fecha_nacimiento
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes'
  AND column_name = 'fecha_nacimiento';
-- Resultado esperado: 0 rows (confirma que NO existe)

-- Verificar que SÍ existe columna edad
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes'
  AND column_name = 'edad';
-- Resultado esperado: edad | integer | NO

-- Verificar que tutor_id es NOT NULL (requerido)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes'
  AND column_name = 'tutor_id';
-- Resultado esperado: tutor_id | text | NO

-- Ver todos los estudiantes actuales (verificar datos reales)
SELECT id, nombre, apellido, edad, nivel_escolar, tutor_id, equipo_id
FROM estudiantes
LIMIT 5;

-- ============================================================================
-- 2. CLASES - Verificar nombres de columnas
-- ============================================================================

\echo '=== TABLA CLASES ==='

-- Ver todas las columnas de la tabla clases
\d clases

-- Verificar naming de columnas (snake_case vs camelCase)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clases'
  AND column_name IN (
    'docente_id',
    'docenteId',
    'sector_id',
    'sectorId',
    'fecha_hora_inicio',
    'fechaHoraInicio',
    'duracion_minutos',
    'duracionMinutos',
    'cupo_maximo',
    'cupo_maximo',
    'cupos_maximo',
    'cuposMaximo'
  )
ORDER BY column_name;
-- Resultado esperado: Solo versiones en snake_case

-- Verificar si es cupo_maximo (singular) o cupos_maximo (plural)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'clases'
  AND column_name LIKE 'cupo%';
-- Resultado esperado: cupos_maximo (plural)

-- Ver todas las clases actuales
SELECT id, nombre, docente_id, sector_id, fecha_hora_inicio,
       duracion_minutos, cupos_maximo, estado
FROM clases
LIMIT 5;

-- ============================================================================
-- 3. PRODUCTOS - Verificar campos deprecated
-- ============================================================================

\echo '=== TABLA PRODUCTOS ==='

-- Ver todas las columnas de la tabla productos
\d productos

-- Verificar que NO existe columna duracion_dias
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'productos'
  AND column_name = 'duracion_dias';
-- Resultado esperado: 0 rows (confirma que NO existe)

-- Verificar que SÍ existe duracion_meses
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'productos'
  AND column_name = 'duracion_meses';
-- Resultado esperado: duracion_meses | integer | 1

-- Ver todos los productos actuales
SELECT id, nombre, tipo, precio, duracion_meses, fecha_inicio, fecha_fin, cupo_maximo
FROM productos
LIMIT 5;

-- ============================================================================
-- 4. TUTORES - Verificar estructura para login/register
-- ============================================================================

\echo '=== TABLA TUTORES ==='

-- Ver todas las columnas de la tabla tutores
\d tutores

-- Verificar campos requeridos para login
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tutores'
  AND column_name IN ('email', 'password_hash', 'nombre', 'apellido', 'dni', 'telefono')
ORDER BY column_name;

-- Ver todos los tutores actuales (sin mostrar password_hash)
SELECT id, email, nombre, apellido, dni, telefono, fecha_registro
FROM tutores
LIMIT 5;

-- ============================================================================
-- 5. DOCENTES - Verificar estructura
-- ============================================================================

\echo '=== TABLA DOCENTES ==='

-- Ver todas las columnas de la tabla docentes
\d docentes

-- Verificar campos JSONB (arrays)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'docentes'
  AND data_type = 'jsonb'
ORDER BY column_name;
-- Resultado esperado: disponibilidad_horaria, especialidades, nivel_educativo, roles

-- Ver todos los docentes actuales
SELECT id, email, nombre, apellido, titulo, experiencia_anos, estado
FROM docentes
LIMIT 5;

-- ============================================================================
-- 6. EQUIPOS - Verificar estructura (debe estar perfecto)
-- ============================================================================

\echo '=== TABLA EQUIPOS ==='

-- Ver todas las columnas de la tabla equipos
\d equipos

-- Verificar campos requeridos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'equipos'
  AND column_name IN ('nombre', 'color_primario', 'color_secundario', 'icono_url')
ORDER BY column_name;

-- Ver todos los equipos actuales
SELECT id, nombre, color_primario, color_secundario, icono_url, puntos_totales
FROM equipos
ORDER BY puntos_totales DESC;

-- ============================================================================
-- 7. VERIFICACIÓN CRUZADA - Relaciones y constraints
-- ============================================================================

\echo '=== VERIFICACIÓN DE RELACIONES ==='

-- Verificar constraint de estudiantes -> tutores (debe ser NOT NULL)
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'estudiantes'
  AND kcu.column_name = 'tutor_id';

-- Verificar constraint de clases -> docentes
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'clases'
  AND kcu.column_name = 'docente_id';

-- ============================================================================
-- 8. TESTS DE INTEGRIDAD - Verificar que los datos actuales son válidos
-- ============================================================================

\echo '=== TESTS DE INTEGRIDAD ==='

-- Test 1: Todos los estudiantes tienen tutor_id válido
SELECT COUNT(*) as total_estudiantes,
       COUNT(tutor_id) as estudiantes_con_tutor,
       COUNT(*) - COUNT(tutor_id) as estudiantes_sin_tutor
FROM estudiantes;
-- Resultado esperado: estudiantes_sin_tutor = 0

-- Test 2: Todos los estudiantes tienen edad válida (3-99)
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE edad < 3) as menores_3,
       COUNT(*) FILTER (WHERE edad > 99) as mayores_99,
       MIN(edad) as edad_minima,
       MAX(edad) as edad_maxima,
       ROUND(AVG(edad), 2) as edad_promedio
FROM estudiantes;

-- Test 3: Todas las clases tienen cupos válidos
SELECT COUNT(*) as total_clases,
       COUNT(*) FILTER (WHERE cupos_maximo < 1) as cupos_invalidos,
       COUNT(*) FILTER (WHERE cupos_ocupados > cupos_maximo) as sobrecupo
FROM clases;
-- Resultado esperado: cupos_invalidos = 0, sobrecupo = 0

-- Test 4: Todos los productos tienen precio > 0
SELECT COUNT(*) as total_productos,
       COUNT(*) FILTER (WHERE precio <= 0) as precios_invalidos,
       MIN(precio) as precio_minimo,
       MAX(precio) as precio_maximo
FROM productos;
-- Resultado esperado: precios_invalidos = 0

-- Test 5: Todos los equipos tienen colores hexadecimales válidos
SELECT id, nombre, color_primario, color_secundario
FROM equipos
WHERE color_primario !~ '^#[0-9A-Fa-f]{6}$'
   OR color_secundario !~ '^#[0-9A-Fa-f]{6}$';
-- Resultado esperado: 0 rows

-- ============================================================================
-- 9. VALIDACIÓN DE ENUMS - Verificar valores permitidos
-- ============================================================================

\echo '=== VALIDACIÓN DE ENUMS ==='

-- Verificar enum EstadoClase
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'EstadoClase'::regtype
ORDER BY enumsortorder;
-- Resultado esperado: Programada, EnCurso, Finalizada, Cancelada

-- Verificar enum TipoProducto
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'TipoProducto'::regtype
ORDER BY enumsortorder;
-- Resultado esperado: Suscripcion, Curso, Recurso

-- Verificar distribución de nivel_escolar en estudiantes
SELECT nivel_escolar, COUNT(*) as cantidad
FROM estudiantes
GROUP BY nivel_escolar
ORDER BY cantidad DESC;
-- Resultado esperado: Solo Primaria, Secundaria, Universidad

-- Verificar distribución de tipo en productos
SELECT tipo, COUNT(*) as cantidad
FROM productos
GROUP BY tipo
ORDER BY cantidad DESC;

-- ============================================================================
-- 10. AUDITORÍA DE TIMESTAMPS
-- ============================================================================

\echo '=== AUDITORÍA DE TIMESTAMPS ==='

-- Verificar que todos los registros tienen createdAt y updatedAt
SELECT 'estudiantes' as tabla,
       COUNT(*) as total,
       COUNT("createdAt") as con_createdat,
       COUNT("updatedAt") as con_updatedat
FROM estudiantes
UNION ALL
SELECT 'clases', COUNT(*), COUNT("createdAt"), COUNT("updatedAt") FROM clases
UNION ALL
SELECT 'productos', COUNT(*), COUNT("createdAt"), COUNT("updatedAt") FROM productos
UNION ALL
SELECT 'equipos', COUNT(*), COUNT("createdAt"), COUNT("updatedAt") FROM equipos
UNION ALL
SELECT 'docentes', COUNT(*), COUNT("createdAt"), COUNT("updatedAt") FROM docentes
UNION ALL
SELECT 'tutores', COUNT(*), COUNT("createdAt"), COUNT("updatedAt") FROM tutores;

-- ============================================================================
-- 11. QUERY FINAL - Resumen completo de la auditoría
-- ============================================================================

\echo '=== RESUMEN DE AUDITORÍA ==='

SELECT
  'estudiantes' as tabla,
  COUNT(*) as total_registros,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'estudiantes') as total_columnas
FROM estudiantes
UNION ALL
SELECT 'clases', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clases') FROM clases
UNION ALL
SELECT 'productos', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'productos') FROM productos
UNION ALL
SELECT 'equipos', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'equipos') FROM equipos
UNION ALL
SELECT 'docentes', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'docentes') FROM docentes
UNION ALL
SELECT 'tutores', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tutores') FROM tutores
ORDER BY tabla;

-- ============================================================================
-- FIN DE LAS QUERIES DE VERIFICACIÓN
-- ============================================================================

\echo ''
\echo '======================================================================'
\echo 'AUDITORÍA COMPLETADA'
\echo '======================================================================'
\echo ''
\echo 'HALLAZGOS CRÍTICOS CONFIRMADOS:'
\echo '1. estudiantes.fecha_nacimiento NO EXISTE (debe ser edad)'
\echo '2. clases usa snake_case en DB (docente_id, no docenteId)'
\echo '3. clases.cupos_maximo es PLURAL (no singular cupo_maximo)'
\echo '4. productos.duracion_dias NO EXISTE (usar duracion_meses)'
\echo ''
\echo 'Ver reporte completo en: FRONTEND_DATABASE_AUDIT_REPORT.md'
\echo '======================================================================'
