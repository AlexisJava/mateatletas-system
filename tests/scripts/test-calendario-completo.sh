#!/bin/bash

# ========================================
# TEST COMPLETO DEL SISTEMA DE CALENDARIO
# ========================================
# Prueba TODOS los endpoints del calendario de forma exhaustiva
# - Tareas (CRUD completo)
# - Recordatorios (CRUD completo)
# - Notas (CRUD completo)
# - Vistas (Agenda y Semana)
# - Estadísticas

set -e

BASE_URL="http://localhost:3001/api"
FAILED_TESTS=0
PASSED_TESTS=0

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED_TESTS++))
    fi
}

# Función para verificar respuesta HTTP
check_http_status() {
    local expected=$1
    local actual=$2
    local test_name=$3

    if [ "$actual" -eq "$expected" ]; then
        print_result 0 "$test_name (HTTP $actual)"
    else
        print_result 1 "$test_name (esperado: $expected, recibido: $actual)"
    fi
}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  TEST COMPLETO DEL SISTEMA DE CALENDARIO${NC}"
echo -e "${BLUE}================================================${NC}\n"

# ========================================
# 1. AUTENTICACIÓN
# ========================================
echo -e "${YELLOW}[1/10] Autenticación...${NC}"

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"docente@test.com","password":"Test123!"}')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

check_http_status 200 "$HTTP_CODE" "Login exitoso"

TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERROR: No se pudo obtener el token${NC}"
    exit 1
fi

echo -e "  ${GREEN}Token obtenido${NC}\n"

# ========================================
# 2. CREAR TAREA
# ========================================
echo -e "${YELLOW}[2/10] Crear Tarea...${NC}"

TAREA_DATA='{
  "titulo": "Test Tarea Masiva",
  "descripcion": "Descripción de la tarea de prueba",
  "tipo": "TAREA",
  "fecha_inicio": "2025-10-17T10:00:00.000Z",
  "fecha_fin": "2025-10-17T12:00:00.000Z",
  "es_todo_el_dia": false,
  "estado": "PENDIENTE",
  "prioridad": "ALTA",
  "porcentaje_completado": 0,
  "etiquetas": ["test", "calendario"]
}'

CREATE_TAREA_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/eventos/tareas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$TAREA_DATA")

HTTP_CODE=$(echo "$CREATE_TAREA_RESPONSE" | tail -n1)
BODY=$(echo "$CREATE_TAREA_RESPONSE" | sed '$d')

check_http_status 201 "$HTTP_CODE" "Crear tarea"

TAREA_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TAREA_ID" ]; then
    echo -e "${RED}ERROR: No se pudo obtener el ID de la tarea${NC}"
    exit 1
fi

echo -e "  ${GREEN}Tarea creada con ID: $TAREA_ID${NC}\n"

# ========================================
# 3. CREAR RECORDATORIO
# ========================================
echo -e "${YELLOW}[3/10] Crear Recordatorio...${NC}"

RECORDATORIO_DATA='{
  "titulo": "Test Recordatorio Masivo",
  "descripcion": "Descripción del recordatorio de prueba",
  "tipo": "RECORDATORIO",
  "fecha_inicio": "2025-10-18T15:00:00.000Z",
  "fecha_fin": "2025-10-18T15:30:00.000Z",
  "es_todo_el_dia": false,
  "completado": false,
  "color": "#3b82f6"
}'

CREATE_RECORDATORIO_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/eventos/recordatorios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$RECORDATORIO_DATA")

HTTP_CODE=$(echo "$CREATE_RECORDATORIO_RESPONSE" | tail -n1)
BODY=$(echo "$CREATE_RECORDATORIO_RESPONSE" | sed '$d')

check_http_status 201 "$HTTP_CODE" "Crear recordatorio"

RECORDATORIO_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo -e "  ${GREEN}Recordatorio creado con ID: $RECORDATORIO_ID${NC}\n"

# ========================================
# 4. CREAR NOTA
# ========================================
echo -e "${YELLOW}[4/10] Crear Nota...${NC}"

NOTA_DATA='{
  "titulo": "Test Nota Masiva",
  "descripcion": "Nota de prueba exhaustiva",
  "tipo": "NOTA",
  "fecha_inicio": "2025-10-19T00:00:00.000Z",
  "fecha_fin": "2025-10-19T23:59:59.999Z",
  "es_todo_el_dia": true,
  "contenido": "Este es el contenido detallado de la nota de prueba. Incluye información importante para validar el sistema.",
  "categoria": "Testing",
  "color": "#8b5cf6"
}'

CREATE_NOTA_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/eventos/notas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NOTA_DATA")

HTTP_CODE=$(echo "$CREATE_NOTA_RESPONSE" | tail -n1)
BODY=$(echo "$CREATE_NOTA_RESPONSE" | sed '$d')

check_http_status 201 "$HTTP_CODE" "Crear nota"

NOTA_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo -e "  ${GREEN}Nota creada con ID: $NOTA_ID${NC}\n"

# ========================================
# 5. OBTENER TODOS LOS EVENTOS
# ========================================
echo -e "${YELLOW}[5/10] Obtener Todos los Eventos...${NC}"

GET_ALL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/eventos" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$GET_ALL_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Obtener todos los eventos"

echo ""

# ========================================
# 6. OBTENER VISTA AGENDA
# ========================================
echo -e "${YELLOW}[6/10] Obtener Vista Agenda...${NC}"

VISTA_AGENDA_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/eventos/vista-agenda" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$VISTA_AGENDA_RESPONSE" | tail -n1)
BODY=$(echo "$VISTA_AGENDA_RESPONSE" | sed '$d')

check_http_status 200 "$HTTP_CODE" "Obtener vista agenda"

# Verificar que tenga los campos esperados
if echo "$BODY" | grep -q "\"hoy\"" && \
   echo "$BODY" | grep -q "\"manana\"" && \
   echo "$BODY" | grep -q "\"proximos7Dias\"" && \
   echo "$BODY" | grep -q "\"masAdelante\""; then
    print_result 0 "Vista agenda tiene estructura correcta"
else
    print_result 1 "Vista agenda no tiene estructura correcta"
fi

echo ""

# ========================================
# 7. OBTENER VISTA SEMANA
# ========================================
echo -e "${YELLOW}[7/10] Obtener Vista Semana...${NC}"

VISTA_SEMANA_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/eventos/vista-semana" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$VISTA_SEMANA_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Obtener vista semana"

echo ""

# ========================================
# 8. OBTENER ESTADÍSTICAS
# ========================================
echo -e "${YELLOW}[8/10] Obtener Estadísticas...${NC}"

ESTADISTICAS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/eventos/estadisticas" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$ESTADISTICAS_RESPONSE" | tail -n1)
BODY=$(echo "$ESTADISTICAS_RESPONSE" | sed '$d')

check_http_status 200 "$HTTP_CODE" "Obtener estadísticas"

# Verificar que tenga los campos esperados
if echo "$BODY" | grep -q "\"total\"" && \
   echo "$BODY" | grep -q "\"tareas\"" && \
   echo "$BODY" | grep -q "\"recordatorios\"" && \
   echo "$BODY" | grep -q "\"notas\""; then
    print_result 0 "Estadísticas tienen estructura correcta"
else
    print_result 1 "Estadísticas no tienen estructura correcta"
fi

echo ""

# ========================================
# 9. ACTUALIZAR EVENTOS
# ========================================
echo -e "${YELLOW}[9/10] Actualizar Eventos...${NC}"

# Actualizar tarea
UPDATE_TAREA_DATA='{
  "titulo": "Test Tarea Actualizada",
  "estado": "EN_PROGRESO",
  "porcentaje_completado": 50
}'

UPDATE_TAREA_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/eventos/tareas/$TAREA_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_TAREA_DATA")

HTTP_CODE=$(echo "$UPDATE_TAREA_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Actualizar tarea"

# Actualizar recordatorio
UPDATE_RECORDATORIO_DATA='{
  "completado": true
}'

UPDATE_RECORDATORIO_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/eventos/recordatorios/$RECORDATORIO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_RECORDATORIO_DATA")

HTTP_CODE=$(echo "$UPDATE_RECORDATORIO_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Actualizar recordatorio"

# Actualizar nota
UPDATE_NOTA_DATA='{
  "contenido": "Contenido actualizado de la nota de prueba"
}'

UPDATE_NOTA_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/eventos/notas/$NOTA_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_NOTA_DATA")

HTTP_CODE=$(echo "$UPDATE_NOTA_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Actualizar nota"

echo ""

# ========================================
# 10. ELIMINAR EVENTOS
# ========================================
echo -e "${YELLOW}[10/10] Eliminar Eventos...${NC}"

# Eliminar tarea
DELETE_TAREA_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/eventos/$TAREA_ID" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$DELETE_TAREA_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Eliminar tarea"

# Eliminar recordatorio
DELETE_RECORDATORIO_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/eventos/$RECORDATORIO_ID" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$DELETE_RECORDATORIO_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Eliminar recordatorio"

# Eliminar nota
DELETE_NOTA_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/eventos/$NOTA_ID" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$DELETE_NOTA_RESPONSE" | tail -n1)

check_http_status 200 "$HTTP_CODE" "Eliminar nota"

echo ""

# ========================================
# RESUMEN FINAL
# ========================================
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}              RESUMEN DE TESTS${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✓ Tests exitosos:${NC} $PASSED_TESTS"
echo -e "${RED}✗ Tests fallidos:${NC} $FAILED_TESTS"
echo -e "${BLUE}================================================${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 TODOS LOS TESTS PASARON EXITOSAMENTE${NC}\n"
    exit 0
else
    echo -e "\n${RED}❌ ALGUNOS TESTS FALLARON${NC}\n"
    exit 1
fi
