#!/bin/bash

# ============================================================
# Script de Setup para Tests E2E
# Crea los datos necesarios para ejecutar los tests de Playwright
# ============================================================

API_URL="http://localhost:3001/api"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup de Datos para Tests E2E - SLICE #14        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Registrar Admin si no existe
echo -e "${YELLOW}▶ Step 1: Registrar/Login Admin${NC}"
ADMIN_REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.test@mateatletas.com",
    "password": "Admin123!",
    "nombre": "Admin",
    "apellido": "Test"
  }')

if echo "$ADMIN_REGISTER" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Admin registrado${NC}"
fi

# Login como Admin
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.test@mateatletas.com",
    "password": "Admin123!"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Admin login exitoso${NC}"
else
  echo -e "${RED}❌ Error en admin login${NC}"
  echo "$ADMIN_RESPONSE"
  exit 1
fi

# 2. Crear o verificar docente de prueba
echo -e "${YELLOW}▶ Step 2: Crear docente de prueba${NC}"
DOCENTE_RESPONSE=$(curl -s -X POST "$API_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente.test@mateatletas.com",
    "password": "Docente123!",
    "nombre": "Test",
    "apellido": "Docente",
    "telefono": "+52 123 456 7890",
    "titulo_profesional": "Lic. en Matemáticas",
    "biografia": "Docente de prueba para tests E2E",
    "especialidades": ["Álgebra", "Geometría"]
  }')

if echo "$DOCENTE_RESPONSE" | grep -q '"id"'; then
  DOCENTE_ID=$(echo "$DOCENTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/')
  echo -e "${GREEN}✅ Docente creado: $DOCENTE_ID${NC}"
else
  echo -e "${YELLOW}⚠️  Docente puede ya existir, intentando login...${NC}"
fi

# 3. Verificar login del docente
echo -e "${YELLOW}▶ Step 3: Verificar login del docente${NC}"
DOCENTE_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente.test@mateatletas.com",
    "password": "Docente123!"
  }')

DOCENTE_TOKEN=$(echo "$DOCENTE_LOGIN" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')

if [ -n "$DOCENTE_TOKEN" ]; then
  echo -e "${GREEN}✅ Docente login exitoso${NC}"
else
  echo -e "${RED}❌ Error en docente login${NC}"
  echo "$DOCENTE_LOGIN"
  exit 1
fi

# 4. Crear datos de prueba: Ruta Curricular
echo -e "${YELLOW}▶ Step 4: Crear ruta curricular${NC}"
RUTA_RESPONSE=$(curl -s -X GET "$API_URL/clases/metadata/rutas-curriculares")
RUTA_ID=$(echo "$RUTA_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/')

if [ -z "$RUTA_ID" ]; then
  echo -e "${YELLOW}⚠️  No hay rutas, creando una...${NC}"
  RUTA_CREATE=$(curl -s -X POST "$API_URL/admin/rutas-curriculares" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "nombre": "Test Álgebra",
      "descripcion": "Ruta de prueba para tests E2E",
      "nivel": "Intermedio",
      "color": "#FF6B35"
    }')
  RUTA_ID=$(echo "$RUTA_CREATE" | grep -o '"id":"[^"]*"' | sed 's/"id":"\(.*\)"/\1/')
fi

echo -e "${GREEN}✅ Ruta curricular: $RUTA_ID${NC}"

# 5. Crear clases de prueba
echo -e "${YELLOW}▶ Step 5: Crear clases de prueba${NC}"

# Clase 1: Hoy
CLASE1=$(curl -s -X POST "$API_URL/clases" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"titulo\": \"Clase Test 1 - Hoy\",
    \"descripcion\": \"Clase de prueba para tests E2E\",
    \"fecha_hora_inicio\": \"$(date -u +'%Y-%m-%dT10:00:00.000Z')\",
    \"duracion_minutos\": 60,
    \"cupo_maximo\": 10,
    \"ruta_curricular_id\": \"$RUTA_ID\"
  }")

if echo "$CLASE1" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Clase 1 creada (hoy)${NC}"
fi

# Clase 2: Mañana
CLASE2=$(curl -s -X POST "$API_URL/clases" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"titulo\": \"Clase Test 2 - Mañana\",
    \"descripcion\": \"Clase de prueba para tests E2E\",
    \"fecha_hora_inicio\": \"$(date -u -d '+1 day' +'%Y-%m-%dT14:00:00.000Z')\",
    \"duracion_minutos\": 90,
    \"cupo_maximo\": 15,
    \"ruta_curricular_id\": \"$RUTA_ID\"
  }")

if echo "$CLASE2" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Clase 2 creada (mañana)${NC}"
fi

# 6. Crear estudiante y asistencia con observación
echo -e "${YELLOW}▶ Step 6: Crear estudiante y observación${NC}"

ESTUDIANTE=$(curl -s -X POST "$API_URL/estudiantes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Test",
    "fecha_nacimiento": "2010-05-15",
    "nivel_escolar": "Secundaria",
    "tutor_nombre": "Test Tutor",
    "tutor_email": "tutor.test@test.com",
    "tutor_telefono": "+52 111 222 3333"
  }')

ESTUDIANTE_ID=$(echo "$ESTUDIANTE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\(.*\)"/\1/')

if [ -n "$ESTUDIANTE_ID" ]; then
  echo -e "${GREEN}✅ Estudiante creado: $ESTUDIANTE_ID${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Completado Exitosamente                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Credenciales del Docente de Prueba:${NC}"
echo -e "  Email: ${YELLOW}docente.test@mateatletas.com${NC}"
echo -e "  Password: ${YELLOW}Docente123!${NC}"
echo ""
echo -e "${BLUE}Ahora puedes ejecutar los tests E2E:${NC}"
echo -e "  ${GREEN}npm run test:e2e${NC}"
echo -e "  ${GREEN}npm run test:e2e:ui${NC}"
echo -e "  ${GREEN}npm run test:e2e:headed${NC}"
echo ""
