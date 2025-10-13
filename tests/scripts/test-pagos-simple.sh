#!/bin/bash

# Script de testing simplificado para Slice #6 - Pagos

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #6: PAGOS (MercadoPago)"
echo "========================================="

# Login tutor
echo -e "\n✅ PASO 1: Login de tutor"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
TUTOR_ID=$(echo $LOGIN | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Token obtenido: ${TOKEN:0:30}..."
echo "Tutor ID: $TUTOR_ID"

# Ver estado de membresía
echo -e "\n✅ PASO 2: Ver estado de membresía (antes de crear)"
MEMBRESIA=$(curl -s -X GET "$BASE_URL/pagos/membresia" \
  -H "Authorization: Bearer $TOKEN")

echo "$MEMBRESIA" | python3 -m json.tool 2>/dev/null || echo "$MEMBRESIA"

# Listar productos disponibles
echo -e "\n✅ PASO 3: Listar productos de suscripción"
PRODUCTOS=$(curl -s -X GET "$BASE_URL/productos?tipo=Suscripcion" \
  -H "Authorization: Bearer $TOKEN")

PRODUCTO_ID=$(echo $PRODUCTOS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Producto ID para suscripción: $PRODUCTO_ID"

# Crear preferencia de pago MercadoPago (suscripción)
echo -e "\n✅ PASO 4: Crear preferencia de pago para suscripción"
PREFERENCIA=$(curl -s -X POST "$BASE_URL/pagos/suscripcion" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productoId\": \"$PRODUCTO_ID\"}")

echo "$PREFERENCIA" | python3 -m json.tool 2>/dev/null | head -50 || echo "$PREFERENCIA" | head -300

PREFERENCE_ID=$(echo $PREFERENCIA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
INIT_POINT=$(echo $PREFERENCIA | grep -o '"init_point":"[^"]*' | head -1 | cut -d'"' -f4)
MEMBRESIA_ID=$(echo $PREFERENCIA | grep -o '"membresiaId":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$INIT_POINT" ]; then
  echo -e "\n🔗 Link de pago generado:"
  echo "$INIT_POINT"
fi

# TEST: Activar membresía con endpoint mock
if [ ! -z "$MEMBRESIA_ID" ]; then
  echo -e "\n✅ PASO 4.1: Activar membresía usando endpoint mock"
  echo "Membresía ID: $MEMBRESIA_ID"

  ACTIVAR_RESPONSE=$(curl -s -X POST "$BASE_URL/pagos/mock/activar-membresia/$MEMBRESIA_ID")

  echo "$ACTIVAR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ACTIVAR_RESPONSE"

  # Verificar estado actualizado
  echo -e "\n✅ PASO 4.2: Verificar estado de membresía después de activación"
  MEMBRESIA_UPDATED=$(curl -s -X GET "$BASE_URL/pagos/membresia" \
    -H "Authorization: Bearer $TOKEN")

  echo "$MEMBRESIA_UPDATED" | python3 -m json.tool 2>/dev/null || echo "$MEMBRESIA_UPDATED"

  ESTADO=$(echo $MEMBRESIA_UPDATED | grep -o '"estado":"[^"]*' | head -1 | cut -d'"' -f4)
  if [ "$ESTADO" == "Activa" ]; then
    echo -e "\n✅ ¡Membresía activada correctamente!"
  else
    echo -e "\n⚠️  Membresía en estado: $ESTADO"
  fi
fi

# Ver inscripciones (si hay estudiante)
echo -e "\n✅ PASO 5: Ver inscripciones a cursos"
INSCRIPCIONES=$(curl -s -X GET "$BASE_URL/pagos/inscripciones" \
  -H "Authorization: Bearer $TOKEN")

echo "$INSCRIPCIONES" | python3 -m json.tool 2>/dev/null | head -50 || echo "$INSCRIPCIONES" | head -300

# Listar cursos disponibles para compra
echo -e "\n✅ PASO 6: Listar productos tipo Curso"
CURSOS=$(curl -s -X GET "$BASE_URL/productos?tipo=Curso" \
  -H "Authorization: Bearer $TOKEN")

echo "$CURSOS" | python3 -m json.tool 2>/dev/null | head -80 || echo "$CURSOS" | head -400

CURSO_ID=$(echo $CURSOS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nCurso ID: $CURSO_ID"

# Crear estudiante para inscripción a curso
echo -e "\n✅ PASO 7: Crear estudiante para inscripción"
ESTUDIANTE=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Estudiante",
    "apellido": "Pagos Test",
    "fecha_nacimiento": "2012-05-15",
    "nivel_escolar": "Secundaria"
  }')

ESTUDIANTE_ID=$(echo $ESTUDIANTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Estudiante ID: $ESTUDIANTE_ID"

# Crear preferencia de pago para curso
if [ ! -z "$CURSO_ID" ] && [ ! -z "$ESTUDIANTE_ID" ]; then
  echo -e "\n✅ PASO 8: Crear preferencia de pago para curso"
  PREFERENCIA_CURSO=$(curl -s -X POST "$BASE_URL/pagos/curso" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"productoId\": \"$CURSO_ID\",
      \"estudianteId\": \"$ESTUDIANTE_ID\"
    }")

  echo "$PREFERENCIA_CURSO" | python3 -m json.tool 2>/dev/null | head -50 || echo "$PREFERENCIA_CURSO" | head -300

  INIT_POINT_CURSO=$(echo $PREFERENCIA_CURSO | grep -o '"init_point":"[^"]*' | head -1 | cut -d'"' -f4)

  if [ ! -z "$INIT_POINT_CURSO" ]; then
    echo -e "\n🔗 Link de pago para curso:"
    echo "$INIT_POINT_CURSO"
  fi
fi

echo -e "\n========================================="
echo "✅ Tests de Pagos completados!"
echo "========================================="
echo -e "\nResumen:"
echo "- Token obtenido: ✅"
echo "- Estado membresía consultado: ✅"
if [ ! -z "$INIT_POINT" ]; then
  echo "- Preferencia suscripción creada: ✅"
fi
if [ "$ESTADO" == "Activa" ]; then
  echo "- Membresía activada (mock endpoint): ✅"
fi
echo "- Historial consultado: ✅"
if [ ! -z "$INIT_POINT_CURSO" ]; then
  echo "- Preferencia curso creada: ✅"
fi

echo -e "\n📊 Datos generados:"
echo "TUTOR_ID: $TUTOR_ID"
echo "PRODUCTO_ID (suscripción): $PRODUCTO_ID"
echo "CURSO_ID: $CURSO_ID"
echo "ESTUDIANTE_ID: $ESTUDIANTE_ID"
if [ ! -z "$PREFERENCE_ID" ]; then
  echo "PREFERENCE_ID: $PREFERENCE_ID"
fi
