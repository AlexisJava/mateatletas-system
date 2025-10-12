#!/bin/bash

# ============================================================
# Test Script para Módulo de Equipos (Slice #3)
# ============================================================
# Este script prueba todos los endpoints del módulo de Equipos
# Requiere un tutor autenticado con JWT token
# ============================================================

set -e # Detener en errores

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://localhost:3001/api"
TOKEN=""

# IDs generados durante los tests
EQUIPO_ID_1=""
EQUIPO_ID_2=""

# ============================================================
# Funciones auxiliares
# ============================================================

print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ============================================================
# 1. Registrar un nuevo tutor de prueba
# ============================================================

print_header "1. Registrar tutor de prueba"

TEST_EMAIL="test-equipos-$(date +%s)@test.com"
TEST_PASSWORD="Test123@"

print_info "Registrando tutor: $TEST_EMAIL..."

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "nombre": "Test",
    "apellido": "Equipos"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "registrado exitosamente"; then
  print_success "Tutor registrado correctamente"
else
  print_error "Error al registrar tutor"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

# ============================================================
# 2. Obtener token de autenticación
# ============================================================

print_header "2. Autenticación"

print_info "Iniciando sesión con $TEST_EMAIL..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  print_success "Token obtenido correctamente"
  echo "Token: ${TOKEN:0:20}..."
else
  print_error "No se pudo obtener el token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

# ============================================================
# 3. Crear equipos de prueba
# ============================================================

print_header "3. Crear equipos"

# Nombres únicos para evitar conflictos
TIMESTAMP=$(date +%s)
EQUIPO_NAME_1="Fénix-Test-$TIMESTAMP"
EQUIPO_NAME_2="Dragón-Test-$TIMESTAMP"

# Crear Equipo 1: Fénix
print_info "Creando equipo '$EQUIPO_NAME_1'..."

EQUIPO_1=$(curl -s -X POST "$API_URL/equipos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "'$EQUIPO_NAME_1'",
    "color_primario": "#FF6B35",
    "color_secundario": "#F7B801"
  }')

EQUIPO_ID_1=$(echo $EQUIPO_1 | jq -r '.id')

if [ "$EQUIPO_ID_1" != "null" ] && [ -n "$EQUIPO_ID_1" ]; then
  print_success "Equipo '$EQUIPO_NAME_1' creado con ID: $EQUIPO_ID_1"
else
  print_error "Error al crear equipo '$EQUIPO_NAME_1'"
  echo "Response: $EQUIPO_1"
  exit 1
fi

# Crear Equipo 2: Dragón
print_info "Creando equipo '$EQUIPO_NAME_2'..."

EQUIPO_2=$(curl -s -X POST "$API_URL/equipos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "'$EQUIPO_NAME_2'",
    "color_primario": "#00D9FF",
    "color_secundario": "#2A1A5E"
  }')

EQUIPO_ID_2=$(echo $EQUIPO_2 | jq -r '.id')

if [ "$EQUIPO_ID_2" != "null" ] && [ -n "$EQUIPO_ID_2" ]; then
  print_success "Equipo '$EQUIPO_NAME_2' creado con ID: $EQUIPO_ID_2"
else
  print_error "Error al crear equipo '$EQUIPO_NAME_2'"
  echo "Response: $EQUIPO_2"
  exit 1
fi

# ============================================================
# 4. Listar equipos
# ============================================================

print_header "4. Listar equipos"

print_info "Obteniendo lista de equipos..."

EQUIPOS_LIST=$(curl -s -X GET "$API_URL/equipos" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_EQUIPOS=$(echo $EQUIPOS_LIST | jq '.metadata.total')

if [ "$TOTAL_EQUIPOS" -ge 2 ]; then
  print_success "Lista de equipos obtenida: $TOTAL_EQUIPOS equipos"
else
  print_error "Error al listar equipos o no se encontraron los creados"
  echo "Response: $EQUIPOS_LIST"
  exit 1
fi

# ============================================================
# 5. Obtener equipo por ID
# ============================================================

print_header "5. Obtener equipo por ID"

print_info "Obteniendo detalles del equipo Fénix..."

EQUIPO_DETAIL=$(curl -s -X GET "$API_URL/equipos/$EQUIPO_ID_1" \
  -H "Authorization: Bearer $TOKEN")

NOMBRE_EQUIPO=$(echo $EQUIPO_DETAIL | jq -r '.nombre')

if [ "$NOMBRE_EQUIPO" == "Fénix" ]; then
  print_success "Detalles del equipo obtenidos correctamente"
else
  print_error "Error al obtener detalles del equipo"
  echo "Response: $EQUIPO_DETAIL"
  exit 1
fi

# ============================================================
# 5. Actualizar equipo
# ============================================================

print_header "5. Actualizar equipo"

print_info "Actualizando nombre del equipo Fénix..."

EQUIPO_UPDATED=$(curl -s -X PATCH "$API_URL/equipos/$EQUIPO_ID_1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Fénix Dorado"
  }')

NOMBRE_ACTUALIZADO=$(echo $EQUIPO_UPDATED | jq -r '.nombre')

if [ "$NOMBRE_ACTUALIZADO" == "Fénix Dorado" ]; then
  print_success "Equipo actualizado correctamente a 'Fénix Dorado'"
else
  print_error "Error al actualizar equipo"
  echo "Response: $EQUIPO_UPDATED"
  exit 1
fi

# ============================================================
# 6. Obtener estadísticas
# ============================================================

print_header "6. Estadísticas de equipos"

print_info "Obteniendo estadísticas generales..."

ESTADISTICAS=$(curl -s -X GET "$API_URL/equipos/estadisticas" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_EQUIPOS_STATS=$(echo $ESTADISTICAS | jq '.totalEquipos')

if [ "$TOTAL_EQUIPOS_STATS" -ge 2 ]; then
  print_success "Estadísticas obtenidas: $TOTAL_EQUIPOS_STATS equipos en total"
  echo "Ranking de equipos:"
  echo $ESTADISTICAS | jq '.ranking[] | "\(.posicion). \(.nombre) - \(.puntos_totales) puntos"'
else
  print_error "Error al obtener estadísticas"
  echo "Response: $ESTADISTICAS"
  exit 1
fi

# ============================================================
# 7. Recalcular puntos
# ============================================================

print_header "7. Recalcular puntos de equipo"

print_info "Recalculando puntos del equipo Fénix Dorado..."

EQUIPO_RECALC=$(curl -s -X POST "$API_URL/equipos/$EQUIPO_ID_1/recalcular-puntos" \
  -H "Authorization: Bearer $TOKEN")

PUNTOS_RECALC=$(echo $EQUIPO_RECALC | jq '.puntos_totales')

if [ "$PUNTOS_RECALC" != "null" ]; then
  print_success "Puntos recalculados correctamente: $PUNTOS_RECALC puntos"
else
  print_error "Error al recalcular puntos"
  echo "Response: $EQUIPO_RECALC"
  exit 1
fi

# ============================================================
# 8. Filtrar equipos (search)
# ============================================================

print_header "8. Filtrar equipos por búsqueda"

print_info "Buscando equipos que contengan 'Fénix'..."

EQUIPOS_SEARCH=$(curl -s -X GET "$API_URL/equipos?search=Fénix" \
  -H "Authorization: Bearer $TOKEN")

ENCONTRADOS=$(echo $EQUIPOS_SEARCH | jq '.data | length')

if [ "$ENCONTRADOS" -ge 1 ]; then
  print_success "Búsqueda exitosa: $ENCONTRADOS equipo(s) encontrado(s)"
else
  print_error "Error en búsqueda o no se encontraron resultados"
  echo "Response: $EQUIPOS_SEARCH"
  exit 1
fi

# ============================================================
# 9. Ordenar equipos
# ============================================================

print_header "9. Ordenar equipos"

print_info "Obteniendo equipos ordenados por puntos (desc)..."

EQUIPOS_SORTED=$(curl -s -X GET "$API_URL/equipos?sortBy=puntos_totales&order=desc" \
  -H "Authorization: Bearer $TOKEN")

PRIMER_EQUIPO_NOMBRE=$(echo $EQUIPOS_SORTED | jq -r '.data[0].nombre')

if [ -n "$PRIMER_EQUIPO_NOMBRE" ]; then
  print_success "Equipos ordenados correctamente. Primero: $PRIMER_EQUIPO_NOMBRE"
else
  print_error "Error al ordenar equipos"
  echo "Response: $EQUIPOS_SORTED"
  exit 1
fi

# ============================================================
# 10. Eliminar equipos
# ============================================================

print_header "10. Eliminar equipos"

# Eliminar Equipo 1
print_info "Eliminando equipo 'Fénix Dorado'..."

DELETE_1=$(curl -s -X DELETE "$API_URL/equipos/$EQUIPO_ID_1" \
  -H "Authorization: Bearer $TOKEN")

MESSAGE_1=$(echo $DELETE_1 | jq -r '.message')

if [[ "$MESSAGE_1" == *"eliminado"* ]]; then
  print_success "Equipo 'Fénix Dorado' eliminado correctamente"
else
  print_error "Error al eliminar equipo 'Fénix Dorado'"
  echo "Response: $DELETE_1"
  exit 1
fi

# Eliminar Equipo 2
print_info "Eliminando equipo 'Dragón'..."

DELETE_2=$(curl -s -X DELETE "$API_URL/equipos/$EQUIPO_ID_2" \
  -H "Authorization: Bearer $TOKEN")

MESSAGE_2=$(echo $DELETE_2 | jq -r '.message')

if [[ "$MESSAGE_2" == *"eliminado"* ]]; then
  print_success "Equipo 'Dragón' eliminado correctamente"
else
  print_error "Error al eliminar equipo 'Dragón'"
  echo "Response: $DELETE_2"
  exit 1
fi

# ============================================================
# Resumen final
# ============================================================

print_header "✅ TODOS LOS TESTS PASARON CORRECTAMENTE"

echo -e "${GREEN}Resumen:${NC}"
echo "✅ Autenticación funcionando"
echo "✅ Crear equipos funcionando"
echo "✅ Listar equipos funcionando"
echo "✅ Obtener equipo por ID funcionando"
echo "✅ Actualizar equipo funcionando"
echo "✅ Estadísticas funcionando"
echo "✅ Recalcular puntos funcionando"
echo "✅ Filtrar equipos funcionando"
echo "✅ Ordenar equipos funcionando"
echo "✅ Eliminar equipos funcionando"

echo -e "\n${GREEN}🎉 ¡Módulo de Equipos completamente funcional!${NC}\n"
