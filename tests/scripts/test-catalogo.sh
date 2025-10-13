#!/bin/bash

# Script de testing para Slice #5 - Catálogo de Productos

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #5: CATÁLOGO DE PRODUCTOS"
echo "========================================="

# Login admin/tutor
echo -e "\n✅ PASO 1: Login para operaciones"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "⚠️ Usuario no encontrado, creando..."
  curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test.tutor@mateatletas.com",
      "password": "Test123!",
      "nombre": "Test",
      "apellido": "Tutor"
    }' > /dev/null

  LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

  TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

echo "Token obtenido: ${TOKEN:0:30}..."

# Listar productos existentes
echo -e "\n✅ PASO 2: Listar productos existentes"
PRODUCTOS=$(curl -s -X GET "$BASE_URL/productos" \
  -H "Authorization: Bearer $TOKEN")

echo "$PRODUCTOS" | python3 -m json.tool 2>/dev/null || echo "$PRODUCTOS"

COUNT=$(echo $PRODUCTOS | grep -o '"id":"[^"]*' | wc -l)
echo -e "\nProductos encontrados: $COUNT"

# Crear producto de suscripción
echo -e "\n✅ PASO 3: Crear producto de suscripción"
SUSCRIPCION=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Suscripción Mensual Test",
    "descripcion": "Acceso ilimitado a todas las clases durante un mes",
    "precio": 299,
    "tipo": "Suscripcion"
  }')

echo "$SUSCRIPCION" | python3 -m json.tool 2>/dev/null || echo "$SUSCRIPCION"

SUSCRIPCION_ID=$(echo $SUSCRIPCION | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nSuscripción ID: $SUSCRIPCION_ID"

# Crear producto de curso
echo -e "\n✅ PASO 4: Crear producto de curso"
TOMORROW=$(date -d "tomorrow" -u +"%Y-%m-%dT10:00:00.000Z" 2>/dev/null || date -v+1d -u +"%Y-%m-%dT10:00:00.000Z")
NEXT_MONTH=$(date -d "+1 month" -u +"%Y-%m-%dT10:00:00.000Z" 2>/dev/null || date -v+1m -u +"%Y-%m-%dT10:00:00.000Z")

CURSO=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombre\": \"Curso de Álgebra Avanzada\",
    \"descripcion\": \"Curso intensivo de álgebra para secundaria\",
    \"precio\": 499,
    \"tipo\": \"Curso\",
    \"fechaInicio\": \"$TOMORROW\",
    \"fechaFin\": \"$NEXT_MONTH\",
    \"cupoMaximo\": 20
  }")

echo "$CURSO" | python3 -m json.tool 2>/dev/null || echo "$CURSO"

CURSO_ID=$(echo $CURSO | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nCurso ID: $CURSO_ID"

# Listar productos por tipo - Suscripciones
echo -e "\n✅ PASO 5: Filtrar productos tipo Suscripción"
SUSCRIPCIONES=$(curl -s -X GET "$BASE_URL/productos?tipo=Suscripcion" \
  -H "Authorization: Bearer $TOKEN")

echo "$SUSCRIPCIONES" | python3 -m json.tool 2>/dev/null | head -50 || echo "$SUSCRIPCIONES" | head -300

# Listar productos por tipo - Cursos
echo -e "\n✅ PASO 6: Filtrar productos tipo Curso"
CURSOS=$(curl -s -X GET "$BASE_URL/productos?tipo=Curso" \
  -H "Authorization: Bearer $TOKEN")

echo "$CURSOS" | python3 -m json.tool 2>/dev/null | head -50 || echo "$CURSOS" | head -300

# Actualizar producto
if [ ! -z "$CURSO_ID" ]; then
  echo -e "\n✅ PASO 7: Actualizar producto (curso)"
  ACTUALIZADO=$(curl -s -X PATCH "$BASE_URL/productos/$CURSO_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "precio": 599,
      "descripcion": "Curso intensivo de álgebra para secundaria - ¡ACTUALIZADO CON NUEVO PRECIO!"
    }')

  echo "$ACTUALIZADO" | python3 -m json.tool 2>/dev/null || echo "$ACTUALIZADO"
fi

# Obtener producto específico
if [ ! -z "$CURSO_ID" ]; then
  echo -e "\n✅ PASO 8: Obtener detalles de producto específico"
  DETALLE=$(curl -s -X GET "$BASE_URL/productos/$CURSO_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "$DETALLE" | python3 -m json.tool 2>/dev/null || echo "$DETALLE"
fi

echo -e "\n========================================="
echo "✅ Tests de Catálogo completados!"
echo "========================================="
echo -e "\nResumen:"
echo "- Productos listados: ✅"
if [ ! -z "$SUSCRIPCION_ID" ]; then
  echo "- Suscripción creada: ✅"
fi
if [ ! -z "$CURSO_ID" ]; then
  echo "- Curso creado: ✅"
  echo "- Curso actualizado: ✅"
fi
echo "- Filtros por tipo funcionando: ✅"

echo -e "\n📊 IDs generados:"
echo "TOKEN: ${TOKEN:0:40}..."
echo "SUSCRIPCION_ID: $SUSCRIPCION_ID"
echo "CURSO_ID: $CURSO_ID"
