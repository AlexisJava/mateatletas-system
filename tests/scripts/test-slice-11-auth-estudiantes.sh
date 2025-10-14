#!/bin/bash

# Script de testing para SLICE #11: Autenticación de Estudiantes
# Tests E2E completos del flujo de autenticación

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:3001"
TEST_EMAIL="estudiante1@test.com"
TEST_PASSWORD="estudiante123"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      SLICE #11: Testing Auth de Estudiantes E2E          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Contador de tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Función para ejecutar test
run_test() {
  local test_name=$1
  local test_command=$2

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "${YELLOW}[TEST $TOTAL_TESTS]${NC} $test_name"

  if eval "$test_command"; then
    echo -e "${GREEN}✅ PASSED${NC}\n"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "${RED}❌ FAILED${NC}\n"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FASE 1: Testing Backend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Login con credenciales válidas
run_test "Login estudiante con credenciales válidas" \
  "curl -s -X POST ${API_URL}/auth/estudiante/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}' \
    | jq -e '.access_token and .user.role == \"estudiante\"' > /dev/null"

# Capturar token para siguientes tests
TOKEN=$(curl -s -X POST ${API_URL}/auth/estudiante/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}" \
  | jq -r '.access_token')

echo -e "${GREEN}Token obtenido:${NC} ${TOKEN:0:20}..."
echo ""

# Test 2: Login con credenciales inválidas
run_test "Login estudiante con contraseña incorrecta (debe fallar)" \
  "! curl -s -X POST ${API_URL}/auth/estudiante/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"${TEST_EMAIL}\",\"password\":\"wrongpassword\"}' \
    | jq -e '.access_token' > /dev/null"

# Test 3: Login con email inexistente
run_test "Login estudiante con email inexistente (debe fallar)" \
  "! curl -s -X POST ${API_URL}/auth/estudiante/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"noexiste@test.com\",\"password\":\"${TEST_PASSWORD}\"}' \
    | jq -e '.access_token' > /dev/null"

# Test 4: Verificar perfil del estudiante
run_test "Obtener perfil del estudiante autenticado" \
  "curl -s -X GET ${API_URL}/auth/profile \
    -H 'Authorization: Bearer ${TOKEN}' \
    | jq -e '.role == \"estudiante\" and .email == \"${TEST_EMAIL}\"' > /dev/null"

# Test 5: Verificar que el token incluye información correcta
run_test "Verificar que el usuario tiene equipo asignado" \
  "curl -s -X GET ${API_URL}/auth/profile \
    -H 'Authorization: Bearer ${TOKEN}' \
    | jq -e '.equipo' > /dev/null"

# Test 6: Verificar puntos y nivel del estudiante
run_test "Verificar puntos y nivel del estudiante" \
  "curl -s -X GET ${API_URL}/auth/profile \
    -H 'Authorization: Bearer ${TOKEN}' \
    | jq -e '.puntos_totales >= 0 and .nivel_actual >= 1' > /dev/null"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FASE 2: Testing Seeds${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 7-11: Verificar que los 5 estudiantes seed pueden hacer login
for i in {1..5}; do
  EMAIL="estudiante${i}@test.com"
  run_test "Login con estudiante${i}@test.com" \
    "curl -s -X POST ${API_URL}/auth/estudiante/login \
      -H 'Content-Type: application/json' \
      -d '{\"email\":\"${EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}' \
      | jq -e '.access_token' > /dev/null"
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FASE 3: Testing Seguridad${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 12: Verificar que un tutor NO puede usar el endpoint de estudiante
TUTOR_EMAIL="tutor@test.com"
TUTOR_PASSWORD="tutor123"

run_test "Tutor no puede usar endpoint de estudiante (debe fallar)" \
  "! curl -s -X POST ${API_URL}/auth/estudiante/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"${TUTOR_EMAIL}\",\"password\":\"${TUTOR_PASSWORD}\"}' \
    | jq -e '.access_token' > /dev/null"

# Test 13: Verificar que token inválido es rechazado
run_test "Token inválido es rechazado" \
  "! curl -s -X GET ${API_URL}/auth/profile \
    -H 'Authorization: Bearer tokeninvalido123' \
    | jq -e '.id' > /dev/null"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  RESUMEN DE TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Total de tests ejecutados: ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Tests exitosos: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Tests fallidos: ${RED}${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                 ✅ TODOS LOS TESTS PASARON                ║${NC}"
  echo -e "${GREEN}║           SLICE #11 COMPLETADO AL 100%                    ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║              ❌ ALGUNOS TESTS FALLARON                    ║${NC}"
  echo -e "${RED}║          Revisar logs arriba para detalles                ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
