#!/bin/bash

###############################################################################
# Test Script - Phase 1 Frontend: Módulo Clases y Reservas
#
# Tests para:
# - GET /api/clases (obtener clases disponibles)
# - GET /api/clases/metadata/rutas-curriculares (obtener rutas)
# - POST /api/clases/:id/reservar (reservar clase)
# - GET /api/clases/mis-reservas (obtener mis reservas)
# - DELETE /api/clases/reservas/:id (cancelar reserva)
#
# Este script valida que el frontend puede consumir correctamente
# los endpoints de clases y reservas.
###############################################################################

API_URL="http://localhost:3001/api"
TOKEN=""
ESTUDIANTE_ID=""
CLASE_ID=""
RESERVA_ID=""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de tests
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TEST PHASE 1 - MÓDULO CLASES (Frontend Integration)      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Función auxiliar para tests
###############################################################################
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"

    echo -e "${YELLOW}→ Testing:${NC} $name"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $http_code"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        echo "$body"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} - Expected: $expected_status, Got: $http_code"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        return 1
    fi
}

###############################################################################
# STEP 1: Autenticación
###############################################################################
echo -e "${BLUE}═══ STEP 1: Autenticación ═══${NC}"
echo ""

# Login como tutor de prueba
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "tutor1@test.com",
        "password": "password123"
    }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login exitoso${NC}"
    echo "Token: ${TOKEN:0:20}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Login falló${NC}"
    exit 1
fi

echo ""

###############################################################################
# STEP 2: Obtener rutas curriculares
###############################################################################
echo -e "${BLUE}═══ STEP 2: GET /clases/metadata/rutas-curriculares ═══${NC}"
echo ""

RUTAS_RESPONSE=$(test_endpoint \
    "Obtener rutas curriculares" \
    "GET" \
    "/clases/metadata/rutas-curriculares" \
    200)

# Validar que es un array
if echo "$RUTAS_RESPONSE" | jq -e '. | type == "array"' > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC} - Respuesta es un array"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Respuesta no es un array"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Contar rutas
RUTAS_COUNT=$(echo "$RUTAS_RESPONSE" | jq '. | length')
echo -e "${GREEN}✓${NC} Se encontraron $RUTAS_COUNT rutas curriculares"

# Validar estructura de primera ruta
if [ "$RUTAS_COUNT" -gt 0 ]; then
    PRIMERA_RUTA=$(echo "$RUTAS_RESPONSE" | jq '.[0]')

    required_fields=("id" "nombre" "color")
    for field in "${required_fields[@]}"; do
        if echo "$PRIMERA_RUTA" | jq -e ".$field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - Campo '$field' existe"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ FAIL${NC} - Campo '$field' no existe"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    done

    echo ""
    echo "Ejemplo de ruta:"
    echo "$PRIMERA_RUTA" | jq '.'
fi

echo ""

###############################################################################
# STEP 3: Obtener clases disponibles
###############################################################################
echo -e "${BLUE}═══ STEP 3: GET /clases (Obtener clases disponibles) ═══${NC}"
echo ""

CLASES_RESPONSE=$(test_endpoint \
    "Obtener clases disponibles" \
    "GET" \
    "/clases" \
    200)

# Validar que es un array
if echo "$CLASES_RESPONSE" | jq -e '. | type == "array"' > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC} - Respuesta es un array"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Respuesta no es un array"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Contar clases
CLASES_COUNT=$(echo "$CLASES_RESPONSE" | jq '. | length')
echo -e "${GREEN}✓${NC} Se encontraron $CLASES_COUNT clases disponibles"

if [ "$CLASES_COUNT" -gt 0 ]; then
    # Guardar ID de primera clase para reservar después
    CLASE_ID=$(echo "$CLASES_RESPONSE" | jq -r '.[0].id')
    echo -e "${GREEN}✓${NC} ID de clase para reservar: $CLASE_ID"

    # Validar estructura de primera clase
    PRIMERA_CLASE=$(echo "$CLASES_RESPONSE" | jq '.[0]')

    required_fields=("id" "titulo" "fechaHora" "cupoMaximo" "cupoDisponible" "estado")
    for field in "${required_fields[@]}"; do
        if echo "$PRIMERA_CLASE" | jq -e ".$field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - Campo '$field' existe"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ FAIL${NC} - Campo '$field' no existe"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    done

    echo ""
    echo "Ejemplo de clase:"
    echo "$PRIMERA_CLASE" | jq '.'
else
    echo -e "${YELLOW}⚠ WARNING${NC} - No hay clases disponibles para testear reservas"
fi

echo ""

###############################################################################
# STEP 4: Obtener o crear estudiante
###############################################################################
echo -e "${BLUE}═══ STEP 4: Obtener/crear estudiante para reservar ═══${NC}"
echo ""

ESTUDIANTES_RESPONSE=$(curl -s -X GET "$API_URL/estudiantes" \
    -H "Authorization: Bearer $TOKEN")

ESTUDIANTE_ID=$(echo "$ESTUDIANTES_RESPONSE" | jq -r '.[0].id')

if [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
    echo -e "${GREEN}✓ Estudiante encontrado:${NC} $ESTUDIANTE_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ Creando estudiante...${NC}"

    ESTUDIANTE_RESPONSE=$(curl -s -X POST "$API_URL/estudiantes" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "nombre": "Pedro",
            "apellido": "López",
            "fecha_nacimiento": "2012-03-20",
            "grado_escolar": "3ro Primaria"
        }')

    ESTUDIANTE_ID=$(echo "$ESTUDIANTE_RESPONSE" | jq -r '.id')

    if [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
        echo -e "${GREEN}✓ Estudiante creado:${NC} $ESTUDIANTE_ID"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ No se pudo crear estudiante${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""

###############################################################################
# STEP 5: Reservar una clase
###############################################################################
echo -e "${BLUE}═══ STEP 5: POST /clases/:id/reservar (Reservar clase) ═══${NC}"
echo ""

if [ -n "$CLASE_ID" ] && [ "$CLASE_ID" != "null" ] && [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
    RESERVA_RESPONSE=$(test_endpoint \
        "Reservar clase para estudiante" \
        "POST" \
        "/clases/$CLASE_ID/reservar" \
        201 \
        "{\"estudianteId\": \"$ESTUDIANTE_ID\"}")

    # Obtener ID de reserva
    RESERVA_ID=$(echo "$RESERVA_RESPONSE" | jq -r '.id')

    if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Reserva creada: $RESERVA_ID"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Validar estructura de reserva
        required_fields=("id" "claseId" "estudianteId" "tutorId")
        for field in "${required_fields[@]}"; do
            if echo "$RESERVA_RESPONSE" | jq -e ".$field" > /dev/null 2>&1; then
                echo -e "${GREEN}✓ PASS${NC} - Campo '$field' existe en reserva"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo -e "${RED}✗ FAIL${NC} - Campo '$field' no existe en reserva"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
        done
    else
        echo -e "${RED}✗ FAIL${NC} - No se obtuvo ID de reserva"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No hay clase o estudiante disponible"
fi

echo ""

###############################################################################
# STEP 6: Obtener mis reservas
###############################################################################
echo -e "${BLUE}═══ STEP 6: GET /clases/mis-reservas (Mis reservas) ═══${NC}"
echo ""

MIS_RESERVAS_RESPONSE=$(test_endpoint \
    "Obtener mis reservas" \
    "GET" \
    "/clases/mis-reservas" \
    200)

# Validar que es un array
if echo "$MIS_RESERVAS_RESPONSE" | jq -e '. | type == "array"' > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC} - Respuesta es un array"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Respuesta no es un array"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

MIS_RESERVAS_COUNT=$(echo "$MIS_RESERVAS_RESPONSE" | jq '. | length')
echo -e "${GREEN}✓${NC} Total de reservas: $MIS_RESERVAS_COUNT"

# Verificar que incluye la reserva recién creada
if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
    FOUND_RESERVA=$(echo "$MIS_RESERVAS_RESPONSE" | jq --arg id "$RESERVA_ID" '.[] | select(.id == $id)')

    if [ -n "$FOUND_RESERVA" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Reserva recién creada está en la lista"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - Reserva recién creada NO está en la lista"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""

###############################################################################
# STEP 7: Filtrar clases por ruta curricular
###############################################################################
echo -e "${BLUE}═══ STEP 7: GET /clases?rutaCurricularId=X (Filtrar por ruta) ═══${NC}"
echo ""

if [ "$RUTAS_COUNT" -gt 0 ]; then
    PRIMERA_RUTA_ID=$(echo "$RUTAS_RESPONSE" | jq -r '.[0].id')

    CLASES_FILTRADAS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/clases?rutaCurricularId=$PRIMERA_RUTA_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")

    FILTRADAS_HTTP_CODE=$(echo "$CLASES_FILTRADAS_RESPONSE" | tail -n1)
    FILTRADAS_BODY=$(echo "$CLASES_FILTRADAS_RESPONSE" | sed '$d')

    if [ "$FILTRADAS_HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} - Filtro por ruta funciona (Status: 200)"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        FILTRADAS_COUNT=$(echo "$FILTRADAS_BODY" | jq '. | length')
        echo -e "${GREEN}✓${NC} Clases encontradas con filtro: $FILTRADAS_COUNT"

        # Verificar que todas pertenecen a la ruta
        INVALID_CLASES=$(echo "$FILTRADAS_BODY" | jq --arg ruta "$PRIMERA_RUTA_ID" '[.[] | select(.rutaCurricularId != $ruta)] | length')

        if [ "$INVALID_CLASES" -eq 0 ]; then
            echo -e "${GREEN}✓ PASS${NC} - Todas las clases pertenecen a la ruta filtrada"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ FAIL${NC} - $INVALID_CLASES clases no pertenecen a la ruta"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Error al filtrar (Status: $FILTRADAS_HTTP_CODE)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No hay rutas para filtrar"
fi

echo ""

###############################################################################
# STEP 8: Cancelar reserva
###############################################################################
echo -e "${BLUE}═══ STEP 8: DELETE /clases/reservas/:id (Cancelar reserva) ═══${NC}"
echo ""

if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
    test_endpoint \
        "Cancelar reserva" \
        "DELETE" \
        "/clases/reservas/$RESERVA_ID" \
        200

    # Verificar que ya no está en mis reservas
    RESERVAS_AFTER=$(curl -s -X GET "$API_URL/clases/mis-reservas" \
        -H "Authorization: Bearer $TOKEN")

    FOUND_AFTER=$(echo "$RESERVAS_AFTER" | jq --arg id "$RESERVA_ID" '.[] | select(.id == $id)')

    if [ -z "$FOUND_AFTER" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Reserva eliminada correctamente de la lista"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - Reserva aún aparece en la lista"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No hay reserva para cancelar"
fi

echo ""

###############################################################################
# STEP 9: Test de error - Reservar con cupo lleno
###############################################################################
echo -e "${BLUE}═══ STEP 9: Test de validación (Reservar sin cupo) ═══${NC}"
echo ""

# Buscar una clase sin cupo disponible
CLASE_SIN_CUPO=$(echo "$CLASES_RESPONSE" | jq -r '.[] | select(.cupoDisponible == 0) | .id' | head -n1)

if [ -n "$CLASE_SIN_CUPO" ] && [ "$CLASE_SIN_CUPO" != "null" ]; then
    ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/clases/$CLASE_SIN_CUPO/reservar" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"estudianteId\": \"$ESTUDIANTE_ID\"}")

    ERROR_HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)

    if [ "$ERROR_HTTP_CODE" -ge 400 ] && [ "$ERROR_HTTP_CODE" -lt 500 ]; then
        echo -e "${GREEN}✓ PASS${NC} - Rechaza reserva sin cupo (Status: $ERROR_HTTP_CODE)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - No validó cupo correctamente (Status: $ERROR_HTTP_CODE)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No hay clases sin cupo para testear"
fi

echo ""

###############################################################################
# Resumen final
###############################################################################
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     RESUMEN DE TESTS                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Tests ejecutados: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Tests exitosos:   $TESTS_PASSED${NC}"
echo -e "${RED}Tests fallidos:   $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ TODOS LOS TESTS PASARON - MÓDULO CLASES OK            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ ALGUNOS TESTS FALLARON - REVISAR MÓDULO CLASES        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
