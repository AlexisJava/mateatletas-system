#!/bin/bash

###############################################################################
# Test Script - Phase 1 Frontend: Módulo Pagos
#
# Tests para:
# - POST /api/pagos/suscripcion (crear preferencia para suscripción)
# - POST /api/pagos/curso (crear preferencia para curso)
# - GET /api/pagos/membresia (obtener membresía actual)
# - Validación de estructura de PreferenciaPago
#
# Este script valida que el frontend puede consumir correctamente
# los endpoints de pagos y MercadoPago.
###############################################################################

API_URL="http://localhost:3001/api"
TOKEN=""
TUTOR_ID=""
ESTUDIANTE_ID=""
PRODUCTO_SUSCRIPCION_ID=""
PRODUCTO_CURSO_ID=""

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
echo -e "${BLUE}║  TEST PHASE 1 - MÓDULO PAGOS (Frontend Integration)       ║${NC}"
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
TUTOR_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login exitoso${NC}"
    echo "Token: ${TOKEN:0:20}..."
    echo "Tutor ID: $TUTOR_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Login falló${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
    exit 1
fi

echo ""

###############################################################################
# STEP 2: Obtener productos (para tener IDs)
###############################################################################
echo -e "${BLUE}═══ STEP 2: Obtener IDs de productos ═══${NC}"
echo ""

PRODUCTOS_RESPONSE=$(curl -s -X GET "$API_URL/productos" \
    -H "Content-Type: application/json")

PRODUCTO_SUSCRIPCION_ID=$(echo "$PRODUCTOS_RESPONSE" | jq -r '.[] | select(.tipo == "Suscripcion") | .id' | head -n1)
PRODUCTO_CURSO_ID=$(echo "$PRODUCTOS_RESPONSE" | jq -r '.[] | select(.tipo == "Curso") | .id' | head -n1)

if [ -n "$PRODUCTO_SUSCRIPCION_ID" ] && [ "$PRODUCTO_SUSCRIPCION_ID" != "null" ]; then
    echo -e "${GREEN}✓ Suscripción encontrada:${NC} $PRODUCTO_SUSCRIPCION_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ No se encontró producto tipo Suscripcion${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

if [ -n "$PRODUCTO_CURSO_ID" ] && [ "$PRODUCTO_CURSO_ID" != "null" ]; then
    echo -e "${GREEN}✓ Curso encontrado:${NC} $PRODUCTO_CURSO_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ No se encontró producto tipo Curso${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

###############################################################################
# STEP 3: Crear estudiante de prueba
###############################################################################
echo -e "${BLUE}═══ STEP 3: Crear estudiante de prueba ═══${NC}"
echo ""

ESTUDIANTE_RESPONSE=$(curl -s -X POST "$API_URL/estudiantes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "nombre": "Juan",
        "apellido": "Pérez",
        "fecha_nacimiento": "2010-05-15",
        "grado_escolar": "5to Primaria"
    }')

ESTUDIANTE_ID=$(echo "$ESTUDIANTE_RESPONSE" | jq -r '.id')

if [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
    echo -e "${GREEN}✓ Estudiante creado:${NC} $ESTUDIANTE_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ Estudiante no creado, intentando obtener existente...${NC}"

    ESTUDIANTES_RESPONSE=$(curl -s -X GET "$API_URL/estudiantes" \
        -H "Authorization: Bearer $TOKEN")

    ESTUDIANTE_ID=$(echo "$ESTUDIANTES_RESPONSE" | jq -r '.[0].id')

    if [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
        echo -e "${GREEN}✓ Estudiante existente encontrado:${NC} $ESTUDIANTE_ID"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ No se pudo obtener estudiante${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""

###############################################################################
# STEP 4: Crear preferencia de pago para suscripción
###############################################################################
echo -e "${BLUE}═══ STEP 4: POST /pagos/suscripcion (Crear preferencia) ═══${NC}"
echo ""

PREFERENCIA_RESPONSE=$(test_endpoint \
    "Crear preferencia de pago para suscripción" \
    "POST" \
    "/pagos/suscripcion" \
    201 \
    "{\"producto_id\": \"$PRODUCTO_SUSCRIPCION_ID\"}")

# Validar estructura de PreferenciaPago
PREFERENCIA_ID=$(echo "$PREFERENCIA_RESPONSE" | jq -r '.id')
INIT_POINT=$(echo "$PREFERENCIA_RESPONSE" | jq -r '.init_point')

if [ -n "$PREFERENCIA_ID" ] && [ "$PREFERENCIA_ID" != "null" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Campo 'id' existe: $PREFERENCIA_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Campo 'id' no existe"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

if [ -n "$INIT_POINT" ] && [ "$INIT_POINT" != "null" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Campo 'init_point' existe"
    echo "  URL: $INIT_POINT"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Campo 'init_point' no existe"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

###############################################################################
# STEP 5: Crear preferencia de pago para curso
###############################################################################
echo -e "${BLUE}═══ STEP 5: POST /pagos/curso (Crear preferencia) ═══${NC}"
echo ""

if [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
    PREFERENCIA_CURSO_RESPONSE=$(test_endpoint \
        "Crear preferencia de pago para curso" \
        "POST" \
        "/pagos/curso" \
        201 \
        "{\"producto_id\": \"$PRODUCTO_CURSO_ID\", \"estudiante_id\": \"$ESTUDIANTE_ID\"}")

    # Validar estructura
    PREFERENCIA_CURSO_ID=$(echo "$PREFERENCIA_CURSO_RESPONSE" | jq -r '.id')
    INIT_POINT_CURSO=$(echo "$PREFERENCIA_CURSO_RESPONSE" | jq -r '.init_point')

    if [ -n "$PREFERENCIA_CURSO_ID" ] && [ "$PREFERENCIA_CURSO_ID" != "null" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Preferencia de curso creada: $PREFERENCIA_CURSO_ID"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - No se pudo crear preferencia de curso"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No hay estudiante disponible para test de curso"
fi

echo ""

###############################################################################
# STEP 6: Obtener membresía actual (debe ser 404 si no hay)
###############################################################################
echo -e "${BLUE}═══ STEP 6: GET /pagos/membresia (Obtener membresía) ═══${NC}"
echo ""

MEMBRESIA_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/pagos/membresia" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

MEMBRESIA_HTTP_CODE=$(echo "$MEMBRESIA_RESPONSE" | tail -n1)
MEMBRESIA_BODY=$(echo "$MEMBRESIA_RESPONSE" | sed '$d')

if [ "$MEMBRESIA_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Membresía encontrada (Status: 200)"
    echo "$MEMBRESIA_BODY" | jq '.'
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Validar estructura
    MEMBRESIA_ESTADO=$(echo "$MEMBRESIA_BODY" | jq -r '.estado')
    echo -e "${GREEN}✓${NC} Estado de membresía: $MEMBRESIA_ESTADO"

elif [ "$MEMBRESIA_HTTP_CODE" -eq 404 ]; then
    echo -e "${GREEN}✓ PASS${NC} - No tiene membresía activa (Status: 404)"
    echo "  Esto es correcto para un tutor nuevo"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - Status inesperado: $MEMBRESIA_HTTP_CODE"
    echo "$MEMBRESIA_BODY" | jq '.'
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

###############################################################################
# STEP 7: Validar que las preferencias contienen URLs válidas
###############################################################################
echo -e "${BLUE}═══ STEP 7: Validación de URLs de MercadoPago ═══${NC}"
echo ""

if [[ "$INIT_POINT" =~ ^https?:// ]]; then
    echo -e "${GREEN}✓ PASS${NC} - init_point es una URL válida"
    echo "  $INIT_POINT"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - init_point no es una URL válida: $INIT_POINT"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

if [ -n "$INIT_POINT_CURSO" ]; then
    if [[ "$INIT_POINT_CURSO" =~ ^https?:// ]]; then
        echo -e "${GREEN}✓ PASS${NC} - init_point de curso es una URL válida"
        echo "  $INIT_POINT_CURSO"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - init_point de curso no es una URL válida: $INIT_POINT_CURSO"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""

###############################################################################
# STEP 8: Test de error - Producto inexistente
###############################################################################
echo -e "${BLUE}═══ STEP 8: Test de error (Producto inexistente) ═══${NC}"
echo ""

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/pagos/suscripcion" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"producto_id": "00000000-0000-0000-0000-000000000000"}')

ERROR_HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)

if [ "$ERROR_HTTP_CODE" -ge 400 ] && [ "$ERROR_HTTP_CODE" -lt 500 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Manejo correcto de error (Status: $ERROR_HTTP_CODE)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC} - No manejó el error correctamente (Status: $ERROR_HTTP_CODE)"
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
    echo -e "${GREEN}║  ✓ TODOS LOS TESTS PASARON - MÓDULO PAGOS OK             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ ALGUNOS TESTS FALLARON - REVISAR MÓDULO PAGOS         ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
