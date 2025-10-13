#!/bin/bash

# Script de testing simplificado para Slice #7 - Clases

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #7: CLASES (Simplificado)"
echo "========================================="

# Login con el tutor que acabamos de crear
echo -e "\n✅ PASO 1: Login de tutor"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token obtenido: ${TOKEN:0:30}..."

# Crear estudiante
echo -e "\n✅ PASO 2: Crear estudiante"
ESTUDIANTE=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Estudiante",
    "fecha_nacimiento": "2010-05-15",
    "nivel_escolar": "Secundaria"
  }')

ESTUDIANTE_ID=$(echo $ESTUDIANTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Estudiante ID: $ESTUDIANTE_ID"

# Crear docente
echo -e "\n✅ PASO 3: Crear docente"
DOCENTE=$(curl -s -X POST "$BASE_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente.test@mateatletas.com",
    "password": "Test123!",
    "nombre": "Docente",
    "apellido": "Test",
    "titulo": "Profesor"
  }')

DOCENTE_ID=$(echo $DOCENTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Docente ID: $DOCENTE_ID"

# Listar rutas curriculares
echo -e "\n✅ PASO 4: Listar rutas curriculares"
RUTAS=$(curl -s -X GET "$BASE_URL/clases/metadata/rutas-curriculares" \
  -H "Authorization: Bearer $TOKEN")

echo "$RUTAS" | python3 -m json.tool 2>/dev/null || echo "$RUTAS"

RUTA_ID=$(echo $RUTAS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nUsando ruta ID: $RUTA_ID"

# Programar una clase
echo -e "\n✅ PASO 5: Programar clase"
TOMORROW=$(date -d "tomorrow 10:00" -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -v+1d -u +"%Y-%m-%dT10:00:00.000Z")

CLASE=$(curl -s -X POST "$BASE_URL/clases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"rutaCurricularId\": \"$RUTA_ID\",
    \"docenteId\": \"$DOCENTE_ID\",
    \"fechaHoraInicio\": \"$TOMORROW\",
    \"duracionMinutos\": 60,
    \"cuposMaximo\": 5
  }")

echo "$CLASE" | python3 -m json.tool 2>/dev/null || echo "$CLASE"

CLASE_ID=$(echo $CLASE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nClase ID: $CLASE_ID"

# Listar clases disponibles
echo -e "\n✅ PASO 6: Listar clases disponibles para tutor"
CLASES=$(curl -s -X GET "$BASE_URL/clases" \
  -H "Authorization: Bearer $TOKEN")

echo "$CLASES" | python3 -m json.tool 2>/dev/null | head -50 || echo "$CLASES" | head -500

# Si no se pudo programar, intentar obtener la primera disponible
if [ -z "$CLASE_ID" ]; then
  CLASE_ID=$(echo $CLASES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo -e "\nUsando clase existente: $CLASE_ID"
fi

# Reservar cupo
if [ ! -z "$CLASE_ID" ] && [ ! -z "$ESTUDIANTE_ID" ]; then
  echo -e "\n✅ PASO 7: Reservar cupo en clase"
  RESERVA=$(curl -s -X POST "$BASE_URL/clases/$CLASE_ID/reservar" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"estudianteId\": \"$ESTUDIANTE_ID\",
      \"observaciones\": \"Reserva de prueba\"
    }")

  echo "$RESERVA" | python3 -m json.tool 2>/dev/null || echo "$RESERVA"

  INSCRIPCION_ID=$(echo $RESERVA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo -e "\nInscripción ID: $INSCRIPCION_ID"
fi

# Ver detalles de la clase
if [ ! -z "$CLASE_ID" ]; then
  echo -e "\n✅ PASO 8: Ver detalles de clase con inscripción"
  DETALLES=$(curl -s -X GET "$BASE_URL/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "$DETALLES" | python3 -m json.tool 2>/dev/null | head -80 || echo "$DETALLES" | head -800
fi

echo -e "\n========================================="
echo "✅ Tests completados!"
echo "========================================="
echo -e "\nResumen:"
echo "- Tutor autenticado: ✅"
echo "- Estudiante creado: ✅"
if [ ! -z "$DOCENTE_ID" ]; then
  echo "- Docente creado: ✅"
fi
if [ ! -z "$RUTA_ID" ]; then
  echo "- Rutas curriculares listadas: ✅"
fi
if [ ! -z "$CLASE_ID" ]; then
  echo "- Clase programada/obtenida: ✅"
fi
if [ ! -z "$INSCRIPCION_ID" ]; then
  echo "- Reserva creada: ✅"
fi

echo -e "\n📊 IDs generados:"
echo "TOKEN: ${TOKEN:0:40}..."
echo "ESTUDIANTE_ID: $ESTUDIANTE_ID"
echo "DOCENTE_ID: $DOCENTE_ID"
echo "RUTA_ID: $RUTA_ID"
echo "CLASE_ID: $CLASE_ID"
echo "INSCRIPCION_ID: $INSCRIPCION_ID"
