#!/bin/bash

# Script para crear/verificar estudiante de prueba
# y obtener token de autenticación

API_URL="http://localhost:3001/api"

echo "=========================================="
echo "SETUP: Estudiante de Prueba"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Intentando login con estudiante existente...${NC}"
echo ""

# Intentar login
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@mateatletas.com",
    "password": "estudiante123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠ Estudiante no existe, creando uno nuevo...${NC}"
  echo ""

  # Registrar nuevo estudiante
  REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "estudiante@mateatletas.com",
      "password": "estudiante123",
      "nombre": "Estudiante",
      "apellido": "Demo"
    }')

  TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ ERROR: No se pudo crear/obtener token${NC}"
  echo "Respuesta:"
  echo $LOGIN_RESPONSE
  echo $REGISTER_RESPONSE
  exit 1
fi

echo -e "${GREEN}✓ Token obtenido exitosamente${NC}"
echo ""

# Obtener info del usuario
USER_INFO=$(curl -s -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo $USER_INFO | grep -o '"id":"[^"]*' | cut -d'"' -f4)
USER_EMAIL=$(echo $USER_INFO | grep -o '"email":"[^"]*' | cut -d'"' -f4)
USER_NOMBRE=$(echo $USER_INFO | grep -o '"nombre":"[^"]*' | cut -d'"' -f4)
USER_ROLE=$(echo $USER_INFO | grep -o '"role":"[^"]*' | cut -d'"' -f4)

echo "=========================================="
echo "INFORMACIÓN DEL ESTUDIANTE"
echo "=========================================="
echo ""
echo -e "${BLUE}ID:${NC} $USER_ID"
echo -e "${BLUE}Email:${NC} $USER_EMAIL"
echo -e "${BLUE}Nombre:${NC} $USER_NOMBRE"
echo -e "${BLUE}Rol:${NC} $USER_ROLE"
echo ""
echo -e "${GREEN}Token (primeros 50 chars):${NC} ${TOKEN:0:50}..."
echo ""

echo "=========================================="
echo "INSTRUCCIONES PARA ENTRAR AL PORTAL"
echo "=========================================="
echo ""
echo "1. Abre tu navegador en:"
echo -e "   ${GREEN}http://localhost:3000/login${NC}"
echo ""
echo "2. Ingresa estas credenciales:"
echo -e "   Email:    ${GREEN}estudiante@mateatletas.com${NC}"
echo -e "   Password: ${GREEN}estudiante123${NC}"
echo ""
echo "3. Una vez logueado, ve a:"
echo -e "   ${GREEN}http://localhost:3000/estudiante/cursos${NC}"
echo ""
echo "=========================================="
echo ""

# Verificar que hay cursos disponibles
echo -e "${BLUE}Verificando cursos disponibles...${NC}"
CURSOS=$(curl -s "$API_URL/productos?tipo=Curso")
CURSOS_COUNT=$(echo $CURSOS | grep -o '"id"' | wc -l)

echo -e "Cursos encontrados: ${GREEN}$CURSOS_COUNT${NC}"
echo ""

if [ "$CURSOS_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠ No hay cursos en el catálogo.${NC}"
  echo "Crea uno desde el panel de admin primero:"
  echo "http://localhost:3000/admin/productos"
else
  echo -e "${GREEN}✓ Todo listo para empezar!${NC}"
fi

echo ""
echo "=========================================="
