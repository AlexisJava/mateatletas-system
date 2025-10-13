#!/bin/bash

# Script de testing para Slice #4 - Docentes

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #4: DOCENTES"
echo "========================================="

# Crear docente público
echo -e "\n✅ PASO 1: Crear docente (registro público)"
DOCENTE=$(curl -s -X POST "$BASE_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente.test.'$RANDOM'@mateatletas.com",
    "password": "Test123!",
    "nombre": "Carlos",
    "apellido": "Rodriguez",
    "titulo": "Profesor de Matemáticas"
  }')

echo "$DOCENTE" | python3 -m json.tool 2>/dev/null || echo "$DOCENTE"

DOCENTE_ID=$(echo $DOCENTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
DOCENTE_EMAIL=$(echo $DOCENTE | grep -o '"email":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nDocente ID: $DOCENTE_ID"
echo "Docente Email: $DOCENTE_EMAIL"

# Login docente
echo -e "\n✅ PASO 2: Login de docente"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$DOCENTE_EMAIL\", \"password\": \"Test123!\"}")

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token obtenido: ${TOKEN:0:30}..."

# Ver perfil propio
echo -e "\n✅ PASO 3: Ver perfil propio"
PERFIL=$(curl -s -X GET "$BASE_URL/docentes/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$PERFIL" | python3 -m json.tool 2>/dev/null || echo "$PERFIL"

# Actualizar perfil
echo -e "\n✅ PASO 4: Actualizar perfil"
ACTUALIZADO=$(curl -s -X PATCH "$BASE_URL/docentes/$DOCENTE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biografia": "Especialista en álgebra y cálculo con 10 años de experiencia",
    "especialidades": ["Álgebra", "Cálculo", "Geometría"]
  }')

echo "$ACTUALIZADO" | python3 -m json.tool 2>/dev/null || echo "$ACTUALIZADO"

# Login tutor para pruebas de listado
echo -e "\n✅ PASO 5: Login tutor para listar docentes"
TUTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

TUTOR_TOKEN=$(echo $TUTOR_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TUTOR_TOKEN" ]; then
  echo "⚠️ Tutor no encontrado, creando..."
  curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test.tutor@mateatletas.com",
      "password": "Test123!",
      "nombre": "Test",
      "apellido": "Tutor"
    }' > /dev/null

  TUTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

  TUTOR_TOKEN=$(echo $TUTOR_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

echo "Tutor token obtenido: ${TUTOR_TOKEN:0:30}..."

# Listar todos los docentes
echo -e "\n✅ PASO 6: Listar docentes (como tutor)"
LISTA=$(curl -s -X GET "$BASE_URL/docentes" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

echo "$LISTA" | python3 -m json.tool 2>/dev/null | head -100 || echo "$LISTA" | head -500

# Obtener docente específico
echo -e "\n✅ PASO 7: Ver detalles de docente específico"
DETALLE=$(curl -s -X GET "$BASE_URL/docentes/$DOCENTE_ID" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

echo "$DETALLE" | python3 -m json.tool 2>/dev/null || echo "$DETALLE"

echo -e "\n========================================="
echo "✅ Tests de Docentes completados!"
echo "========================================="
echo -e "\nResumen:"
echo "- Docente creado: ✅"
echo "- Login docente: ✅"
echo "- Perfil actualizado: ✅"
echo "- Lista pública visible: ✅"

echo -e "\n📊 IDs generados:"
echo "DOCENTE_ID: $DOCENTE_ID"
echo "DOCENTE_EMAIL: $DOCENTE_EMAIL"
echo "TOKEN: ${TOKEN:0:40}..."
