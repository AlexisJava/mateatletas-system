#!/bin/bash

###############################################################################
# Test Script - Phase 1 Frontend: Módulo Catálogo
#
# Tests para:
# - GET /api/productos (todos los productos)
# - GET /api/productos/cursos (solo cursos)
# - GET /api/productos/suscripciones (solo suscripciones)
#
# Este script valida que el frontend puede consumir correctamente
# los endpoints del catálogo.
###############################################################################

API_URL="http://localhost:3001/api"
TOKEN=""

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
echo -e "${BLUE}║  TEST PHASE 1 - MÓDULO CATÁLOGO (Frontend Integration)    ║${NC}"
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
        if [ -n "$TOKEN" ]; then
            response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json")
        else
            response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
                -H "Content-Type: application/json")
        fi
    else
        if [ -n "$TOKEN" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $http_code"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
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
# STEP 1: Autenticación (obtener token)
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
    echo -e "${RED}✗ Login falló - Creando tutor de prueba...${NC}"

    # Registrar tutor de prueba
    REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "tutor1@test.com",
            "password": "password123",
            "nombre": "Test",
            "apellido": "Tutor",
            "telefono": "555-0001"
        }')

    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')

    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ Registro exitoso${NC}"
        echo "Token: ${TOKEN:0:20}..."
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ No se pudo obtener token${NC}"
        echo "$REGISTER_RESPONSE" | jq '.'
        exit 1
    fi
fi

echo ""

###############################################################################
# STEP 2: Obtener todos los productos
###############################################################################
echo -e "${BLUE}═══ STEP 2: GET /productos (Catálogo completo) ═══${NC}"
echo ""

test_endpoint \
    "Obtener todos los productos" \
    "GET" \
    "/productos" \
    200

###############################################################################
# STEP 3: Filtrar solo cursos
###############################################################################
echo -e "${BLUE}═══ STEP 3: GET /productos/cursos (Solo cursos) ═══${NC}"
echo ""

test_endpoint \
    "Obtener solo cursos" \
    "GET" \
    "/productos/cursos" \
    200

###############################################################################
# STEP 4: Filtrar solo suscripciones
###############################################################################
echo -e "${BLUE}═══ STEP 4: GET /productos/suscripciones (Solo suscripciones) ═══${NC}"
echo ""

test_endpoint \
    "Obtener solo suscripciones" \
    "GET" \
    "/productos/suscripciones" \
    200

###############################################################################
# STEP 5: Validar estructura de datos
###############################################################################
echo -e "${BLUE}═══ STEP 5: Validación de estructura de datos ═══${NC}"
echo ""

PRODUCTOS_RESPONSE=$(curl -s -X GET "$API_URL/productos" \
    -H "Content-Type: application/json")

# Verificar que sea un array
if echo "$PRODUCTOS_RESPONSE" | jq -e '. | type == "array"' > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC} - Respuesta es un array"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Respuesta no es un array"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Verificar que tiene productos
PRODUCT_COUNT=$(echo "$PRODUCTOS_RESPONSE" | jq '. | length')
if [ "$PRODUCT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Se encontraron $PRODUCT_COUNT productos"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - No se encontraron productos"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Verificar estructura del primer producto
FIRST_PRODUCT=$(echo "$PRODUCTOS_RESPONSE" | jq '.[0]')

required_fields=("id" "nombre" "descripcion" "precio" "tipo" "activo")
for field in "${required_fields[@]}"; do
    if echo "$FIRST_PRODUCT" | jq -e ".$field" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC} - Campo '$field' existe"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - Campo '$field' no existe"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
done

echo ""
echo "Ejemplo de producto:"
echo "$FIRST_PRODUCT" | jq '.'

echo ""

###############################################################################
# STEP 6: Verificar tipos de producto
###############################################################################
echo -e "${BLUE}═══ STEP 6: Verificación de tipos de producto ═══${NC}"
echo ""

CURSOS_RESPONSE=$(curl -s -X GET "$API_URL/productos/cursos" \
    -H "Content-Type: application/json")

SUSCRIPCIONES_RESPONSE=$(curl -s -X GET "$API_URL/productos/suscripciones" \
    -H "Content-Type: application/json")

CURSOS_COUNT=$(echo "$CURSOS_RESPONSE" | jq '. | length')
SUSCRIPCIONES_COUNT=$(echo "$SUSCRIPCIONES_RESPONSE" | jq '. | length')

echo -e "${GREEN}✓${NC} Cursos encontrados: $CURSOS_COUNT"
echo -e "${GREEN}✓${NC} Suscripciones encontradas: $SUSCRIPCIONES_COUNT"
TESTS_PASSED=$((TESTS_PASSED + 2))

# Verificar que todos los cursos tienen tipo="Curso"
INVALID_CURSOS=$(echo "$CURSOS_RESPONSE" | jq '[.[] | select(.tipo != "Curso")] | length')
if [ "$INVALID_CURSOS" -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Todos los items en /cursos son tipo 'Curso'"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - $INVALID_CURSOS items no son tipo 'Curso'"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Verificar que todas las suscripciones tienen tipo="Suscripcion"
INVALID_SUSCRIPCIONES=$(echo "$SUSCRIPCIONES_RESPONSE" | jq '[.[] | select(.tipo != "Suscripcion")] | length')
if [ "$INVALID_SUSCRIPCIONES" -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Todos los items en /suscripciones son tipo 'Suscripcion'"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - $INVALID_SUSCRIPCIONES items no son tipo 'Suscripcion'"
    TESTS_FAILED=$((TESTS_FAILED + 1))
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
    echo -e "${GREEN}║  ✓ TODOS LOS TESTS PASARON - MÓDULO CATÁLOGO OK          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ ALGUNOS TESTS FALLARON - REVISAR MÓDULO CATÁLOGO      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
