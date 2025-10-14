#!/bin/bash

# ============================================
# SLICE #12: GAMIFICACIÓN COMPLETA - TEST E2E
# ============================================
# Tests all gamification functionality:
# - Dashboard stats
# - Logros system
# - Puntos system
# - Ranking (equipo & global)
# - Progreso por rutas
# - Otorgar puntos (docentes)
# - Historial de puntos
# ============================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
API_URL="http://localhost:3001/api"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
print_test() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗${NC} $2"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    if [ ! -z "$3" ]; then
      echo -e "  ${YELLOW}Response:${NC} $3"
    fi
  fi
}

# Function to print section
print_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SLICE #12: GAMIFICACIÓN COMPLETA   ║${NC}"
echo -e "${BLUE}║          E2E Testing Suite            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"

# ============================================
# 1. LOGIN ESTUDIANTE
# ============================================
print_section "1. AUTENTICACIÓN ESTUDIANTE"

# Login estudiante1@test.com / estudiante123
ESTUDIANTE_LOGIN=$(curl -s -X POST "$API_URL/auth/estudiante/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante1@test.com",
    "password": "estudiante123"
  }')

ESTUDIANTE_TOKEN=$(echo $ESTUDIANTE_LOGIN | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
ESTUDIANTE_ID=$(echo $ESTUDIANTE_LOGIN | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$ESTUDIANTE_TOKEN" ] && [ ! -z "$ESTUDIANTE_ID" ]; then
  print_test 0 "Login estudiante exitoso"
  echo -e "  ${YELLOW}Token:${NC} ${ESTUDIANTE_TOKEN:0:20}..."
  echo -e "  ${YELLOW}ID:${NC} $ESTUDIANTE_ID"
else
  print_test 1 "Login estudiante fallido" "$ESTUDIANTE_LOGIN"
  exit 1
fi

# ============================================
# 2. LOGIN DOCENTE
# ============================================
print_section "2. AUTENTICACIÓN DOCENTE"

# Login docente@test.com / docente123
DOCENTE_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente@test.com",
    "password": "docente123"
  }')

DOCENTE_TOKEN=$(echo $DOCENTE_LOGIN | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
DOCENTE_ID=$(echo $DOCENTE_LOGIN | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$DOCENTE_TOKEN" ] && [ ! -z "$DOCENTE_ID" ]; then
  print_test 0 "Login docente exitoso"
  echo -e "  ${YELLOW}Token:${NC} ${DOCENTE_TOKEN:0:20}..."
  echo -e "  ${YELLOW}ID:${NC} $DOCENTE_ID"
else
  print_test 1 "Login docente fallido" "$DOCENTE_LOGIN"
  exit 1
fi

# ============================================
# 3. DASHBOARD ESTUDIANTE
# ============================================
print_section "3. DASHBOARD ESTUDIANTE"

DASHBOARD=$(curl -s -X GET "$API_URL/gamificacion/dashboard/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

PUNTOS=$(echo $DASHBOARD | grep -o '"puntosToales":[0-9]*' | cut -d':' -f2)
CLASES_ASISTIDAS=$(echo $DASHBOARD | grep -o '"clasesAsistidas":[0-9]*' | cut -d':' -f2)
RACHA=$(echo $DASHBOARD | grep -o '"racha":[0-9]*' | cut -d':' -f2)

if [ ! -z "$PUNTOS" ]; then
  print_test 0 "Dashboard cargado correctamente"
  echo -e "  ${YELLOW}Puntos totales:${NC} $PUNTOS"
  echo -e "  ${YELLOW}Clases asistidas:${NC} $CLASES_ASISTIDAS"
  echo -e "  ${YELLOW}Racha:${NC} $RACHA días"
else
  print_test 1 "Error al cargar dashboard" "$DASHBOARD"
fi

# ============================================
# 4. LOGROS
# ============================================
print_section "4. LOGROS DEL ESTUDIANTE"

LOGROS=$(curl -s -X GET "$API_URL/gamificacion/logros/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

LOGROS_COUNT=$(echo $LOGROS | grep -o '"id":' | wc -l)
LOGROS_DESBLOQUEADOS=$(echo $LOGROS | grep -o '"desbloqueado":true' | wc -l)

if [ $LOGROS_COUNT -gt 0 ]; then
  print_test 0 "Logros cargados: $LOGROS_COUNT total, $LOGROS_DESBLOQUEADOS desbloqueados"
else
  print_test 1 "Error al cargar logros" "$LOGROS"
fi

# ============================================
# 5. PUNTOS
# ============================================
print_section "5. PUNTOS DEL ESTUDIANTE"

PUNTOS_DETAIL=$(curl -s -X GET "$API_URL/gamificacion/puntos/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

PUNTOS_TOTAL=$(echo $PUNTOS_DETAIL | grep -o '"total":[0-9]*' | cut -d':' -f2)
PUNTOS_ASISTENCIA=$(echo $PUNTOS_DETAIL | grep -o '"asistencia":[0-9]*' | cut -d':' -f2)

if [ ! -z "$PUNTOS_TOTAL" ]; then
  print_test 0 "Puntos detallados cargados"
  echo -e "  ${YELLOW}Total:${NC} $PUNTOS_TOTAL pts"
  echo -e "  ${YELLOW}Por asistencia:${NC} $PUNTOS_ASISTENCIA pts"
else
  print_test 1 "Error al cargar puntos" "$PUNTOS_DETAIL"
fi

# ============================================
# 6. RANKING
# ============================================
print_section "6. RANKING DEL ESTUDIANTE"

RANKING=$(curl -s -X GET "$API_URL/gamificacion/ranking/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

POSICION_EQUIPO=$(echo $RANKING | grep -o '"posicionEquipo":[0-9]*' | cut -d':' -f2)
POSICION_GLOBAL=$(echo $RANKING | grep -o '"posicionGlobal":[0-9]*' | cut -d':' -f2)

if [ ! -z "$POSICION_GLOBAL" ]; then
  print_test 0 "Ranking cargado correctamente"
  echo -e "  ${YELLOW}Posición en equipo:${NC} #$POSICION_EQUIPO"
  echo -e "  ${YELLOW}Posición global:${NC} #$POSICION_GLOBAL"
else
  print_test 1 "Error al cargar ranking" "$RANKING"
fi

# ============================================
# 7. PROGRESO POR RUTAS
# ============================================
print_section "7. PROGRESO POR RUTAS CURRICULARES"

PROGRESO=$(curl -s -X GET "$API_URL/gamificacion/progreso/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

RUTAS_COUNT=$(echo $PROGRESO | grep -o '"ruta":' | wc -l)

if [ $RUTAS_COUNT -eq 6 ]; then
  print_test 0 "Progreso cargado: 6 rutas curriculares"
else
  print_test 1 "Error al cargar progreso (esperado 6 rutas, obtenido $RUTAS_COUNT)" "$PROGRESO"
fi

# ============================================
# 8. HISTORIAL DE PUNTOS
# ============================================
print_section "8. HISTORIAL DE PUNTOS"

HISTORIAL=$(curl -s -X GET "$API_URL/gamificacion/historial/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

# El historial puede estar vacío al inicio
if [[ $HISTORIAL == *"["* ]]; then
  print_test 0 "Historial cargado correctamente (puede estar vacío)"
else
  print_test 1 "Error al cargar historial" "$HISTORIAL"
fi

# ============================================
# 9. ACCIONES PUNTUABLES (DOCENTE)
# ============================================
print_section "9. ACCIONES PUNTUABLES DISPONIBLES"

ACCIONES=$(curl -s -X GET "$API_URL/gamificacion/acciones" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

ACCIONES_COUNT=$(echo $ACCIONES | grep -o '"id":' | wc -l)

if [ $ACCIONES_COUNT -gt 0 ]; then
  print_test 0 "Acciones puntuables cargadas: $ACCIONES_COUNT disponibles"

  # Extraer la primera acción para usarla en el test de otorgar puntos
  PRIMERA_ACCION_ID=$(echo $ACCIONES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  PRIMERA_ACCION_NOMBRE=$(echo $ACCIONES | grep -o '"nombre":"[^"]*"' | head -1 | cut -d'"' -f4)
  PRIMERA_ACCION_PUNTOS=$(echo $ACCIONES | grep -o '"puntos":[0-9]*' | head -1 | cut -d':' -f2)

  echo -e "  ${YELLOW}Primera acción:${NC} $PRIMERA_ACCION_NOMBRE (+$PRIMERA_ACCION_PUNTOS pts)"
else
  print_test 1 "Error al cargar acciones" "$ACCIONES"
  echo -e "  ${YELLOW}⚠ Advertencia:${NC} No hay acciones seeded. Ejecuta el seed para crear acciones."
fi

# ============================================
# 10. OTORGAR PUNTOS (DOCENTE)
# ============================================
print_section "10. OTORGAR PUNTOS A ESTUDIANTE"

if [ ! -z "$PRIMERA_ACCION_ID" ]; then
  # Guardar puntos actuales del estudiante
  PUNTOS_ANTES=$PUNTOS_TOTAL

  # Otorgar puntos
  OTORGAR_RESPONSE=$(curl -s -X POST "$API_URL/gamificacion/puntos" \
    -H "Authorization: Bearer $DOCENTE_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"estudianteId\": \"$ESTUDIANTE_ID\",
      \"accionId\": \"$PRIMERA_ACCION_ID\",
      \"contexto\": \"Test E2E: Excelente participación\"
    }")

  if [[ $OTORGAR_RESPONSE == *"success"* ]]; then
    print_test 0 "Puntos otorgados exitosamente"
    echo -e "  ${YELLOW}Acción:${NC} $PRIMERA_ACCION_NOMBRE"
    echo -e "  ${YELLOW}Puntos:${NC} +$PRIMERA_ACCION_PUNTOS pts"

    # Verificar que los puntos se actualizaron
    sleep 1
    PUNTOS_DESPUES=$(curl -s -X GET "$API_URL/gamificacion/puntos/$ESTUDIANTE_ID" \
      -H "Authorization: Bearer $ESTUDIANTE_TOKEN" | grep -o '"total":[0-9]*' | cut -d':' -f2)

    if [ "$PUNTOS_DESPUES" -gt "$PUNTOS_ANTES" ]; then
      print_test 0 "Puntos actualizados correctamente: $PUNTOS_ANTES → $PUNTOS_DESPUES pts"
    else
      print_test 1 "Los puntos no se actualizaron correctamente"
    fi
  else
    print_test 1 "Error al otorgar puntos" "$OTORGAR_RESPONSE"
  fi
else
  echo -e "${YELLOW}⊗ Test omitido - No hay acciones puntuables disponibles${NC}"
  TOTAL_TESTS=$((TOTAL_TESTS + 2))
fi

# ============================================
# 11. HISTORIAL DESPUÉS DE OTORGAR PUNTOS
# ============================================
print_section "11. VERIFICAR HISTORIAL ACTUALIZADO"

if [ ! -z "$PRIMERA_ACCION_ID" ]; then
  HISTORIAL_NUEVO=$(curl -s -X GET "$API_URL/gamificacion/historial/$ESTUDIANTE_ID" \
    -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

  HISTORIAL_COUNT=$(echo $HISTORIAL_NUEVO | grep -o '"id":' | wc -l)

  if [ $HISTORIAL_COUNT -gt 0 ]; then
    print_test 0 "Historial actualizado: $HISTORIAL_COUNT registros"
  else
    print_test 1 "El historial está vacío" "$HISTORIAL_NUEVO"
  fi
else
  echo -e "${YELLOW}⊗ Test omitido - Dependía del test anterior${NC}"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

# ============================================
# 12. PERMISOS: ESTUDIANTE NO PUEDE OTORGAR PUNTOS
# ============================================
print_section "12. CONTROL DE PERMISOS"

if [ ! -z "$PRIMERA_ACCION_ID" ]; then
  PERMISO_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/gamificacion/puntos" \
    -H "Authorization: Bearer $ESTUDIANTE_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"estudianteId\": \"$ESTUDIANTE_ID\",
      \"accionId\": \"$PRIMERA_ACCION_ID\"
    }")

  if [ "$PERMISO_TEST" == "403" ] || [ "$PERMISO_TEST" == "401" ]; then
    print_test 0 "Estudiante NO puede otorgar puntos (correcto)"
  else
    print_test 1 "ERROR: Estudiante puede otorgar puntos (código HTTP: $PERMISO_TEST)"
  fi
else
  echo -e "${YELLOW}⊗ Test omitido - No hay acciones puntuables disponibles${NC}"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

# ============================================
# 13. DASHBOARD ACTUALIZADO
# ============================================
print_section "13. DASHBOARD ACTUALIZADO"

DASHBOARD_FINAL=$(curl -s -X GET "$API_URL/gamificacion/dashboard/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN")

PUNTOS_FINAL=$(echo $DASHBOARD_FINAL | grep -o '"puntosToales":[0-9]*' | cut -d':' -f2)

if [ ! -z "$PUNTOS_FINAL" ] && [ "$PUNTOS_FINAL" -ge "$PUNTOS" ]; then
  print_test 0 "Dashboard muestra puntos actualizados: $PUNTOS_FINAL pts"
else
  print_test 1 "Error en dashboard final" "$DASHBOARD_FINAL"
fi

# ============================================
# RESUMEN FINAL
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}              RESUMEN FINAL              ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Total de tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "${GREEN}✓ Pasados: $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}✗ Fallidos: $FAILED_TESTS${NC}"
else
  echo -e "${GREEN}✗ Fallidos: 0${NC}"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║     ✓ TODOS LOS TESTS PASARON ✓      ║${NC}"
  echo -e "${GREEN}║   SLICE #12 FUNCIONANDO 100%  🎉     ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════╗${NC}"
  echo -e "${RED}║      ✗ ALGUNOS TESTS FALLARON ✗      ║${NC}"
  echo -e "${RED}║      Revisa los errores arriba        ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════╝${NC}"
  exit 1
fi
