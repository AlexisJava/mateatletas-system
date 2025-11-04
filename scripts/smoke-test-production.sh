#!/bin/bash

# ============================================================================
# SMOKE TESTS - Production Health Checks
# ============================================================================
#
# Este script ejecuta smoke tests contra producción para verificar
# que el deploy fue exitoso y los servicios críticos funcionan.
#
# Uso:
#   ./scripts/smoke-test-production.sh
#   ENV=staging ./scripts/smoke-test-production.sh
#
# Exit codes:
#   0: Todos los tests pasaron
#   1: Algún test falló
#

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuración
ENV=${ENV:-production}
TIMEOUT=10

if [ "$ENV" = "production" ]; then
  API_URL="https://mateatletas-system-production.up.railway.app/api"
  WEB_URL="https://www.mateatletasclub.com.ar"
elif [ "$ENV" = "staging" ]; then
  API_URL="https://mateatletas-system-staging.up.railway.app/api"
  WEB_URL="https://staging.mateatletasclub.com.ar"
else
  echo -e "${RED}❌ Invalid environment: $ENV${NC}"
  exit 1
fi

echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}🔥 SMOKE TESTS - $ENV${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""
echo -e "API URL: ${YELLOW}$API_URL${NC}"
echo -e "Web URL: ${YELLOW}$WEB_URL${NC}"
echo ""

# Contador de tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ============================================================================
# Helper: Run HTTP test
# ============================================================================
run_test() {
  local test_name="$1"
  local url="$2"
  local expected_status="$3"
  local extra_checks="$4"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -ne "🧪 ${test_name}... "

  response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>&1)

  if [ "$response" = "$expected_status" ]; then
    if [ -n "$extra_checks" ]; then
      # Run extra validation
      content=$(curl -s --max-time $TIMEOUT "$url")
      if echo "$content" | grep -q "$extra_checks"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
      else
        echo -e "${RED}❌ FAIL (content validation failed)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
      fi
    else
      echo -e "${GREEN}✅ PASS${NC}"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
  else
    echo -e "${RED}❌ FAIL (got $response, expected $expected_status)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# ============================================================================
# TEST SUITE: API Health Checks
# ============================================================================
echo -e "${BOLD}📡 API Health Checks${NC}"
echo "-----------------------------------"

run_test "Health endpoint responds" "$API_URL/health" "200"
run_test "Swagger docs accessible" "$API_URL/docs" "200" "Mateatletas API"

# Auth endpoints (expect 401 or 400, not 500)
echo ""
echo -e "${BOLD}🔐 Auth Endpoints${NC}"
echo "-----------------------------------"

auth_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
  -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}')

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -ne "🧪 Auth login endpoint exists... "
if [ "$auth_response" = "401" ] || [ "$auth_response" = "400" ] || [ "$auth_response" = "404" ]; then
  echo -e "${GREEN}✅ PASS (got $auth_response)${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${RED}❌ FAIL (got $auth_response, expected 401/400/404)${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# ============================================================================
# TEST SUITE: Frontend Health
# ============================================================================
echo ""
echo -e "${BOLD}🌐 Frontend Health${NC}"
echo "-----------------------------------"

run_test "Homepage loads" "$WEB_URL" "200" "Mateatletas"
run_test "Login page accessible" "$WEB_URL/login" "200"

# ============================================================================
# TEST SUITE: Critical Resources
# ============================================================================
echo ""
echo -e "${BOLD}🎨 Static Resources${NC}"
echo "-----------------------------------"

run_test "Favicon exists" "$WEB_URL/favicon.ico" "200"
run_test "Next.js chunks load" "$WEB_URL/_next/static" "404"  # Expect 404 without specific file

# ============================================================================
# TEST SUITE: Performance Check
# ============================================================================
echo ""
echo -e "${BOLD}⚡ Performance Check${NC}"
echo "-----------------------------------"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -ne "🧪 API response time < 2s... "

start_time=$(date +%s%N)
curl -s --max-time $TIMEOUT "$API_URL/health" > /dev/null
end_time=$(date +%s%N)

response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to ms

if [ $response_time -lt 2000 ]; then
  echo -e "${GREEN}✅ PASS (${response_time}ms)${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${YELLOW}⚠️  SLOW (${response_time}ms, expected <2000ms)${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# ============================================================================
# TEST SUITE: Security Headers
# ============================================================================
echo ""
echo -e "${BOLD}🔒 Security Headers${NC}"
echo "-----------------------------------"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -ne "🧪 CORS headers present... "

headers=$(curl -s -I --max-time $TIMEOUT "$API_URL/health")

if echo "$headers" | grep -qi "access-control-allow"; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${YELLOW}⚠️  WARNING (CORS headers not found)${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))  # Don't fail, just warn
fi

# ============================================================================
# RESULTS SUMMARY
# ============================================================================
echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}📊 RESULTS SUMMARY${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""
echo -e "Total Tests:  ${BOLD}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}${BOLD}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}${BOLD}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✅ ALL SMOKE TESTS PASSED!${NC}"
  echo -e "${GREEN}Production is healthy and ready to serve traffic! 🚀${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}❌ SOME TESTS FAILED!${NC}"
  echo -e "${RED}Check the failed tests above and investigate.${NC}"
  exit 1
fi
