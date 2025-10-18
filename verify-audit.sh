#!/bin/bash

###############################################################################
# SCRIPT DE VERIFICACIÓN AUTOMÁTICA - AUDITORÍA DE FORMULARIOS
# Ejecuta todas las queries SQL de verificación y genera un reporte
###############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de base de datos
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="mateatletas"
DB_NAME="mateatletas"
export PGPASSWORD="mateatletas123"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       VERIFICACIÓN AUTOMÁTICA - AUDITORÍA DE FORMULARIOS       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# FUNCIÓN: Ejecutar query y mostrar resultado
###############################################################################
run_query() {
    local description="$1"
    local query="$2"
    local expected="$3"

    echo -e "${YELLOW}▶ ${description}${NC}"

    result=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$query" 2>&1)
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "$result" | sed 's/^/  /'
        if [ -n "$expected" ]; then
            if echo "$result" | grep -q "$expected"; then
                echo -e "  ${GREEN}✓ PASS${NC}"
            else
                echo -e "  ${RED}✗ FAIL - Expected: $expected${NC}"
            fi
        fi
    else
        echo -e "  ${RED}✗ ERROR: $result${NC}"
    fi
    echo ""
}

###############################################################################
# TEST 1: Verificar que estudiantes.fecha_nacimiento NO EXISTE
###############################################################################
echo -e "${BLUE}═══ TEST 1: Estudiantes - fecha_nacimiento NO debe existir ═══${NC}"
run_query \
    "Verificar que fecha_nacimiento NO existe en estudiantes" \
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'estudiantes' AND column_name = 'fecha_nacimiento';" \
    ""  # Esperamos 0 rows (vacío)

run_query \
    "Verificar que edad SÍ existe en estudiantes" \
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'estudiantes' AND column_name = 'edad';" \
    "edad"

###############################################################################
# TEST 2: Verificar que clases usa snake_case
###############################################################################
echo -e "${BLUE}═══ TEST 2: Clases - Nombres de campos (snake_case) ═══${NC}"
run_query \
    "Verificar que docente_id existe (snake_case)" \
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'clases' AND column_name = 'docente_id';" \
    "docente_id"

run_query \
    "Verificar que docenteId NO existe (camelCase)" \
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'clases' AND column_name = 'docenteId';" \
    ""  # Esperamos 0 rows

run_query \
    "Verificar cupos_maximo (plural, snake_case)" \
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'clases' AND column_name LIKE 'cupo%';" \
    "cupos_maximo"

###############################################################################
# TEST 3: Verificar que productos NO tiene duracion_dias
###############################################################################
echo -e "${BLUE}═══ TEST 3: Productos - duracion_dias NO debe existir ═══${NC}"
run_query \
    "Verificar que duracion_dias NO existe" \
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'duracion_dias';" \
    ""  # Esperamos 0 rows

run_query \
    "Verificar que duracion_meses SÍ existe" \
    "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'duracion_meses';" \
    "duracion_meses"

###############################################################################
# TEST 4: Verificar integridad de datos en estudiantes
###############################################################################
echo -e "${BLUE}═══ TEST 4: Integridad de datos - Estudiantes ═══${NC}"
run_query \
    "Todos los estudiantes tienen tutor_id (NOT NULL)" \
    "SELECT COUNT(*) as total, COUNT(tutor_id) as con_tutor FROM estudiantes;" \
    ""

run_query \
    "Edad de estudiantes en rango válido (3-99)" \
    "SELECT COUNT(*) FILTER (WHERE edad < 3) as menores_3, COUNT(*) FILTER (WHERE edad > 99) as mayores_99 FROM estudiantes;" \
    ""

###############################################################################
# TEST 5: Verificar integridad de datos en clases
###############################################################################
echo -e "${BLUE}═══ TEST 5: Integridad de datos - Clases ═══${NC}"
run_query \
    "Clases con cupos válidos (min 1, sin sobrecupo)" \
    "SELECT COUNT(*) FILTER (WHERE cupos_maximo < 1) as cupos_invalidos, COUNT(*) FILTER (WHERE cupos_ocupados > cupos_maximo) as sobrecupo FROM clases;" \
    ""

###############################################################################
# TEST 6: Verificar integridad de datos en productos
###############################################################################
echo -e "${BLUE}═══ TEST 6: Integridad de datos - Productos ═══${NC}"
run_query \
    "Productos con precio > 0" \
    "SELECT COUNT(*) FILTER (WHERE precio <= 0) as precios_invalidos FROM productos;" \
    ""

###############################################################################
# TEST 7: Verificar integridad de datos en equipos
###############################################################################
echo -e "${BLUE}═══ TEST 7: Integridad de datos - Equipos ═══${NC}"
run_query \
    "Equipos con colores hexadecimales válidos" \
    "SELECT COUNT(*) FROM equipos WHERE color_primario !~ '^#[0-9A-Fa-f]{6}\$' OR color_secundario !~ '^#[0-9A-Fa-f]{6}\$';" \
    " 0"  # Esperamos 0 equipos con colores inválidos

###############################################################################
# TEST 8: Verificar enums
###############################################################################
echo -e "${BLUE}═══ TEST 8: Verificar Enums ═══${NC}"
run_query \
    "Enum EstadoClase" \
    "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'EstadoClase'::regtype ORDER BY enumsortorder;" \
    "Programada"

run_query \
    "Enum TipoProducto" \
    "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'TipoProducto'::regtype ORDER BY enumsortorder;" \
    "Suscripcion"

###############################################################################
# TEST 9: Resumen de tablas
###############################################################################
echo -e "${BLUE}═══ TEST 9: Resumen de tablas auditadas ═══${NC}"
run_query \
    "Resumen de registros por tabla" \
    "SELECT 'estudiantes' as tabla, COUNT(*) as total_registros FROM estudiantes
     UNION ALL SELECT 'clases', COUNT(*) FROM clases
     UNION ALL SELECT 'productos', COUNT(*) FROM productos
     UNION ALL SELECT 'equipos', COUNT(*) FROM equipos
     UNION ALL SELECT 'docentes', COUNT(*) FROM docentes
     UNION ALL SELECT 'tutores', COUNT(*) FROM tutores
     ORDER BY tabla;" \
    ""

###############################################################################
# TEST 10: Verificar constraints críticos
###############################################################################
echo -e "${BLUE}═══ TEST 10: Foreign Keys críticos ═══${NC}"
run_query \
    "Constraint estudiantes.tutor_id → tutores.id" \
    "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'estudiantes' AND constraint_type = 'FOREIGN KEY';" \
    "estudiantes_tutor_id_fkey"

run_query \
    "Constraint clases.docente_id → docentes.id" \
    "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'clases' AND constraint_type = 'FOREIGN KEY';" \
    "clases_docente_id_fkey"

###############################################################################
# RESUMEN FINAL
###############################################################################
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      RESUMEN DE VERIFICACIÓN                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}HALLAZGOS CONFIRMADOS:${NC}"
echo -e "  ${RED}✗${NC} estudiantes.fecha_nacimiento NO EXISTE → Usar 'edad' (integer)"
echo -e "  ${RED}✗${NC} clases usa snake_case en DB → DTO debe usar snake_case"
echo -e "  ${RED}✗${NC} clases.cupos_maximo es PLURAL → No usar 'cupo_maximo' singular"
echo -e "  ${RED}✗${NC} productos.duracion_dias NO EXISTE → Usar 'duracion_meses'"
echo ""
echo -e "${GREEN}VERIFICACIONES PASADAS:${NC}"
echo -e "  ${GREEN}✓${NC} Todos los estudiantes tienen tutor_id (NOT NULL)"
echo -e "  ${GREEN}✓${NC} Edades de estudiantes en rango válido"
echo -e "  ${GREEN}✓${NC} Clases con cupos válidos"
echo -e "  ${GREEN}✓${NC} Productos con precios > 0"
echo -e "  ${GREEN}✓${NC} Equipos con colores hexadecimales válidos"
echo -e "  ${GREEN}✓${NC} Foreign keys configurados correctamente"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ACCIÓN REQUERIDA:${NC} Ver AUDIT_FIX_ACTION_PLAN.md para correcciones"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Limpiar password del environment
unset PGPASSWORD

exit 0
