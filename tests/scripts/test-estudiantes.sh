#!/bin/bash

# Script de testing para Slice #2 - Módulo de Estudiantes
# Este script prueba todos los endpoints CRUD de estudiantes

echo "========================================="
echo "  TEST: Módulo de Estudiantes (Slice #2)"
echo "========================================="
echo ""

API_URL="http://localhost:3001/api"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# PASO 1: Registrar un nuevo tutor
echo -e "${YELLOW}1. Registrando nuevo tutor de prueba...${NC}"
TEST_EMAIL="test-$(date +%s)@test.com"
TEST_PASSWORD="Test123!"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "nombre": "Test",
    "apellido": "User"
  }')

echo "Respuesta: $REGISTER_RESPONSE"

# Verificar que el registro fue exitoso
if echo "$REGISTER_RESPONSE" | grep -q "Tutor registrado exitosamente"; then
    print_result 0 "Tutor registrado correctamente"
else
    print_result 1 "Error al registrar tutor"
    exit 1
fi
echo ""

# PASO 2: Login para obtener token
echo -e "${YELLOW}2. Haciendo login para obtener token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

echo "Respuesta: $LOGIN_RESPONSE"

# Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Error: No se pudo obtener el token de autenticación${NC}"
    echo "Respuesta completa: $LOGIN_RESPONSE"
    exit 1
fi

print_result 0 "Login exitoso"
echo "Token: ${TOKEN:0:20}..."
echo ""

# PASO 3: Verificar que no hay estudiantes
echo -e "${YELLOW}3. Verificando lista inicial de estudiantes (debe estar vacía)...${NC}"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta: $LIST_RESPONSE"

ESTUDIANTES_COUNT=$(echo $LIST_RESPONSE | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)

if [ "$ESTUDIANTES_COUNT" == "0" ]; then
    print_result 0 "Lista inicial vacía (correcto)"
else
    print_result 1 "Lista inicial no está vacía"
fi
echo ""

# PASO 4: Crear primer estudiante
echo -e "${YELLOW}4. Creando primer estudiante...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellido": "Test",
    "fecha_nacimiento": "2015-03-15",
    "nivel_escolar": "Primaria"
  }')

echo "Respuesta: $CREATE_RESPONSE"

ESTUDIANTE_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$ESTUDIANTE_ID" ]; then
    print_result 1 "Error al crear estudiante"
    echo "Respuesta completa: $CREATE_RESPONSE"
else
    print_result 0 "Estudiante creado con ID: $ESTUDIANTE_ID"
fi
echo ""

# PASO 5: Obtener lista de estudiantes (debe tener 1)
echo -e "${YELLOW}5. Verificando que el estudiante aparece en la lista...${NC}"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN")

ESTUDIANTES_COUNT=$(echo $LIST_RESPONSE | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)

if [ "$ESTUDIANTES_COUNT" == "1" ]; then
    print_result 0 "Estudiante aparece en la lista (count: 1)"
else
    print_result 1 "Error: Se esperaba 1 estudiante, se encontraron $ESTUDIANTES_COUNT"
fi
echo ""

# PASO 6: Obtener estudiante por ID
if [ ! -z "$ESTUDIANTE_ID" ]; then
    echo -e "${YELLOW}6. Obteniendo estudiante por ID...${NC}"
    GET_RESPONSE=$(curl -s -X GET "$API_URL/estudiantes/$ESTUDIANTE_ID" \
      -H "Authorization: Bearer $TOKEN")

    echo "Respuesta: $GET_RESPONSE"

    GET_ID=$(echo $GET_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

    if [ "$GET_ID" == "$ESTUDIANTE_ID" ]; then
        print_result 0 "Estudiante obtenido correctamente"
    else
        print_result 1 "Error al obtener estudiante"
    fi
    echo ""

    # PASO 7: Actualizar estudiante
    echo -e "${YELLOW}7. Actualizando estudiante...${NC}"
    UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/estudiantes/$ESTUDIANTE_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "nombre": "María Actualizada"
      }')

    echo "Respuesta: $UPDATE_RESPONSE"

    UPDATED_NAME=$(echo $UPDATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['nombre'])" 2>/dev/null)

    if [ "$UPDATED_NAME" == "María Actualizada" ]; then
        print_result 0 "Estudiante actualizado correctamente"
    else
        print_result 1 "Error al actualizar estudiante"
    fi
    echo ""

    # PASO 8: Eliminar estudiante
    echo -e "${YELLOW}8. Eliminando estudiante...${NC}"
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/estudiantes/$ESTUDIANTE_ID" \
      -H "Authorization: Bearer $TOKEN")

    echo "Respuesta: $DELETE_RESPONSE"

    # Verificar que la lista está vacía nuevamente
    LIST_RESPONSE=$(curl -s -X GET "$API_URL/estudiantes" \
      -H "Authorization: Bearer $TOKEN")

    ESTUDIANTES_COUNT=$(echo $LIST_RESPONSE | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)

    if [ "$ESTUDIANTES_COUNT" == "0" ]; then
        print_result 0 "Estudiante eliminado correctamente (lista vacía)"
    else
        print_result 1 "Error: Estudiante no fue eliminado"
    fi
fi

echo ""
echo "========================================="
echo "  FIN DEL TEST"
echo "========================================="
