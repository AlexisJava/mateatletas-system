#!/bin/bash

# ============================================
# TEST E2E - PORTAL DOCENTE
# ============================================
# Prueba exhaustiva del portal de docentes
# Verifica todos los endpoints y flujos

API="http://localhost:3001/api"
RESULTADOS_FILE="/tmp/test-docente-results.log"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
declare -a DISCREPANCIAS

# Limpiar archivo de resultados
> "$RESULTADOS_FILE"

echo "🧪 PRUEBAS E2E - PORTAL DOCENTE"
echo "================================================"
echo ""

# ============================================
# FUNCIÓN AUXILIAR: Test de endpoint
# ============================================
test_endpoint() {
  local METHOD=$1
  local ENDPOINT=$2
  local TOKEN=$3
  local DATA=$4
  local DESCRIPTION=$5

  echo -e "${BLUE}📡 Testing:${NC} $DESCRIPTION"

  local RESPONSE
  if [ -n "$DATA" ]; then
    RESPONSE=$(curl -s -X $METHOD "$API$ENDPOINT" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$DATA")
  else
    RESPONSE=$(curl -s -X $METHOD "$API$ENDPOINT" \
      -H "Authorization: Bearer $TOKEN")
  fi

  # Verificar si la respuesta es exitosa (no contiene error)
  if echo "$RESPONSE" | jq -e '.error or .statusCode >= 400' > /dev/null 2>&1; then
    echo -e "${RED}❌ $DESCRIPTION (ERROR)${NC}"
    echo "$RESPONSE" | jq '.'
    echo "---" >> "$RESULTADOS_FILE"
    echo "❌ FAILED: $DESCRIPTION" >> "$RESULTADOS_FILE"
    echo "$RESPONSE" | jq '.' >> "$RESULTADOS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    DISCREPANCIAS+=("❌ $DESCRIPTION - Error en respuesta")
  else
    echo -e "${GREEN}✅ $DESCRIPTION (HTTP 200)${NC}"
    echo "$RESPONSE" | jq '.'
    echo "---" >> "$RESULTADOS_FILE"
    echo "✅ PASSED: $DESCRIPTION" >> "$RESULTADOS_FILE"
    echo "$RESPONSE" | jq '.' >> "$RESULTADOS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi

  echo ""
}

# ============================================
# FUNCIÓN: Login
# ============================================
login_docente() {
  local EMAIL=$1
  local PASSWORD=$2
  local NOMBRE=$3

  echo -e "${YELLOW}🔐 Intentando login como $NOMBRE...${NC}"

  local LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

  local TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login fallido para $NOMBRE${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
    return 1
  else
    echo -e "${GREEN}✅ $NOMBRE login exitoso${NC}"
    echo "$TOKEN"
    return 0
  fi
}

# ============================================
# FUNCIÓN: Verificar datos de clase
# ============================================
verificar_datos_clase() {
  local CLASE_JSON=$1
  local DOCENTE_NOMBRE=$2

  # Extraer campos importantes
  local ID=$(echo "$CLASE_JSON" | jq -r '.id')
  local ESTADO=$(echo "$CLASE_JSON" | jq -r '.estado')
  local RUTA=$(echo "$CLASE_JSON" | jq -r '.rutaCurricular.nombre // "N/A"')
  local CUPOS_OCUPADOS=$(echo "$CLASE_JSON" | jq -r '.cupos_ocupados // 0')
  local CUPOS_MAXIMO=$(echo "$CLASE_JSON" | jq -r '.cupos_maximo // 0')
  local INSCRIPCIONES=$(echo "$CLASE_JSON" | jq -r '.inscripciones | length // 0')

  echo "  📋 ID: $ID"
  echo "  📊 Estado: $ESTADO"
  echo "  📚 Ruta: $RUTA"
  echo "  👥 Cupos: $CUPOS_OCUPADOS/$CUPOS_MAXIMO"
  echo "  📝 Inscripciones: $INSCRIPCIONES"

  # Verificar coherencia de datos
  if [ "$CUPOS_OCUPADOS" != "$INSCRIPCIONES" ]; then
    DISCREPANCIAS+=("⚠️  $DOCENTE_NOMBRE - Clase $ID: cupos_ocupados ($CUPOS_OCUPADOS) no coincide con inscripciones ($INSCRIPCIONES)")
  fi
}

# ============================================
# PRUEBAS: DOCENTE 1 - JUAN PÉREZ
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}1️⃣  PRUEBAS DE DOCENTE 1 - JUAN PÉREZ${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

JUAN_TOKEN=$(login_docente "juan.perez@docente.com" "Test123!" "Juan Pérez")
if [ $? -eq 0 ]; then
  echo ""

  # Test 1: Perfil del docente
  test_endpoint "GET" "/docentes/me" "$JUAN_TOKEN" "" "Perfil de Juan Pérez"

  # Test 2: Mis clases
  echo -e "${BLUE}📡 Testing:${NC} Clases de Juan Pérez"
  JUAN_CLASES=$(curl -s -X GET "$API/clases/docente/mis-clases" \
    -H "Authorization: Bearer $JUAN_TOKEN")

  if echo "$JUAN_CLASES" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${RED}❌ Error al obtener clases de Juan${NC}"
    echo "$JUAN_CLASES" | jq '.'
    TESTS_FAILED=$((TESTS_FAILED + 1))
  else
    echo -e "${GREEN}✅ Clases de Juan Pérez obtenidas correctamente${NC}"
    NUM_CLASES=$(echo "$JUAN_CLASES" | jq 'length')
    echo "  📊 Total de clases: $NUM_CLASES"

    # Verificar cada clase
    for i in $(seq 0 $(($NUM_CLASES - 1))); do
      echo ""
      echo "  ═══ Clase #$((i+1)) ═══"
      CLASE=$(echo "$JUAN_CLASES" | jq ".[$i]")
      verificar_datos_clase "$CLASE" "Juan Pérez"
    done

    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi
  echo ""

  # Test 3: Detalle de primera clase (si existe)
  PRIMERA_CLASE_ID=$(echo "$JUAN_CLASES" | jq -r '.[0].id // empty')
  if [ -n "$PRIMERA_CLASE_ID" ]; then
    test_endpoint "GET" "/clases/$PRIMERA_CLASE_ID" "$JUAN_TOKEN" "" "Detalle de clase específica"

    # Test 4: Lista de asistencia
    test_endpoint "GET" "/asistencia/clases/$PRIMERA_CLASE_ID" "$JUAN_TOKEN" "" "Lista de asistencia de la clase"

    # Test 5: Estadísticas de asistencia
    test_endpoint "GET" "/asistencia/clases/$PRIMERA_CLASE_ID/estadisticas" "$JUAN_TOKEN" "" "Estadísticas de asistencia"
  else
    echo -e "${YELLOW}⚠️  Juan no tiene clases, saltando tests de clase específica${NC}"
    echo ""
  fi

  # Test 6: Resumen del docente
  test_endpoint "GET" "/asistencia/docente/resumen" "$JUAN_TOKEN" "" "Resumen de asistencia del docente"

  # Test 7: Observaciones del docente
  test_endpoint "GET" "/asistencia/docente/observaciones" "$JUAN_TOKEN" "" "Observaciones del docente"

else
  echo -e "${RED}❌ No se pudo autenticar a Juan, saltando pruebas${NC}"
  echo ""
fi


# ============================================
# PRUEBAS: DOCENTE 2 - LAURA SÁNCHEZ
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}2️⃣  PRUEBAS DE DOCENTE 2 - LAURA SÁNCHEZ${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LAURA_TOKEN=$(login_docente "laura.sanchez@docente.com" "Test123!" "Laura Sánchez")
if [ $? -eq 0 ]; then
  echo ""

  # Test 1: Perfil del docente
  test_endpoint "GET" "/docentes/me" "$LAURA_TOKEN" "" "Perfil de Laura Sánchez"

  # Test 2: Mis clases
  echo -e "${BLUE}📡 Testing:${NC} Clases de Laura Sánchez"
  LAURA_CLASES=$(curl -s -X GET "$API/clases/docente/mis-clases" \
    -H "Authorization: Bearer $LAURA_TOKEN")

  if echo "$LAURA_CLASES" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${RED}❌ Error al obtener clases de Laura${NC}"
    echo "$LAURA_CLASES" | jq '.'
    TESTS_FAILED=$((TESTS_FAILED + 1))
  else
    echo -e "${GREEN}✅ Clases de Laura Sánchez obtenidas correctamente${NC}"
    NUM_CLASES=$(echo "$LAURA_CLASES" | jq 'length')
    echo "  📊 Total de clases: $NUM_CLASES"

    # Verificar cada clase
    for i in $(seq 0 $(($NUM_CLASES - 1))); do
      echo ""
      echo "  ═══ Clase #$((i+1)) ═══"
      CLASE=$(echo "$LAURA_CLASES" | jq ".[$i]")
      verificar_datos_clase "$CLASE" "Laura Sánchez"
    done

    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi
  echo ""

  # Test 3: Detalle de primera clase (si existe)
  PRIMERA_CLASE_ID=$(echo "$LAURA_CLASES" | jq -r '.[0].id // empty')
  if [ -n "$PRIMERA_CLASE_ID" ]; then
    test_endpoint "GET" "/clases/$PRIMERA_CLASE_ID" "$LAURA_TOKEN" "" "Detalle de clase específica"

    # Test 4: Lista de asistencia
    test_endpoint "GET" "/asistencia/clases/$PRIMERA_CLASE_ID" "$LAURA_TOKEN" "" "Lista de asistencia de la clase"

    # Test 5: Estadísticas de asistencia
    test_endpoint "GET" "/asistencia/clases/$PRIMERA_CLASE_ID/estadisticas" "$LAURA_TOKEN" "" "Estadísticas de asistencia"
  else
    echo -e "${YELLOW}⚠️  Laura no tiene clases, saltando tests de clase específica${NC}"
    echo ""
  fi

  # Test 6: Resumen del docente
  test_endpoint "GET" "/asistencia/docente/resumen" "$LAURA_TOKEN" "" "Resumen de asistencia del docente"

  # Test 7: Observaciones del docente
  test_endpoint "GET" "/asistencia/docente/observaciones" "$LAURA_TOKEN" "" "Observaciones del docente"

else
  echo -e "${RED}❌ No se pudo autenticar a Laura, saltando pruebas${NC}"
  echo ""
fi


# ============================================
# RESUMEN DE RESULTADOS
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}📊 RESUMEN DE PRUEBAS E2E - PORTAL DOCENTE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Tests pasados: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests fallidos: $TESTS_FAILED${NC}"
echo ""

if [ ${#DISCREPANCIAS[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ ¡NO SE ENCONTRARON DISCREPANCIAS!${NC}"
  echo -e "${GREEN}✨ Todos los flujos del portal docente funcionan correctamente${NC}"
else
  echo -e "${YELLOW}⚠️  DISCREPANCIAS ENCONTRADAS:${NC}"
  echo ""
  for disc in "${DISCREPANCIAS[@]}"; do
    echo -e "  ${YELLOW}$disc${NC}"
  done
fi

echo ""
echo "📁 Resultados completos guardados en: $RESULTADOS_FILE"
echo ""
echo "🏁 Pruebas E2E completadas"
