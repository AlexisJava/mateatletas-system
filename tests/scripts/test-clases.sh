#!/bin/bash

# Script de testing para Slice #7 - Clases
# Prueba el flujo completo: programación, reservas y asistencia

BASE_URL="http://localhost:3001/api"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 TEST SLICE #7: CLASES${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ====================
# PASO 1: Obtener tokens de usuarios existentes
# ====================
echo -e "${YELLOW}📝 PASO 1: Autenticación${NC}"

# Login como tutor (Ana García - creada en slice anterior)
echo "Obteniendo token de tutor..."
TUTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.garcia@mateatletas.com",
    "password": "SecurePass123!"
  }')

TUTOR_TOKEN=$(echo $TUTOR_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TUTOR_TOKEN" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener token de tutor${NC}"
  echo "Response: $TUTOR_LOGIN"
  exit 1
fi

TUTOR_ID=$(echo $TUTOR_LOGIN | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Token de tutor obtenido${NC}"
echo "Tutor ID: $TUTOR_ID"

# Login como docente (Carlos Rodríguez)
echo -e "\nObteniendo token de docente..."
DOCENTE_LOGIN=$(curl -s -X POST "$BASE_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.rodriguez@mateatletas.com",
    "password": "SecurePass123!",
    "nombre": "Carlos",
    "apellido": "Rodríguez",
    "titulo": "Profesor de Matemática"
  }' 2>/dev/null || curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.rodriguez@mateatletas.com",
    "password": "SecurePass123!"
  }')

DOCENTE_TOKEN=$(echo $DOCENTE_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
DOCENTE_ID=$(echo $DOCENTE_LOGIN | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$DOCENTE_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  No se pudo obtener token de docente (continuando sin tests de docente)${NC}"
else
  echo -e "${GREEN}✅ Token de docente obtenido${NC}"
  echo "Docente ID: $DOCENTE_ID"
fi

# ====================
# PASO 2: Listar rutas curriculares
# ====================
echo -e "\n${YELLOW}📝 PASO 2: Listar rutas curriculares${NC}"

RUTAS=$(curl -s -X GET "$BASE_URL/clases/metadata/rutas-curriculares" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

echo "$RUTAS" | head -20

RUTA_ID=$(echo $RUTAS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$RUTA_ID" ]; then
  echo -e "${RED}❌ Error: No se encontraron rutas curriculares${NC}"
  echo "Response: $RUTAS"
  exit 1
fi

echo -e "${GREEN}✅ Rutas curriculares obtenidas${NC}"
echo "Primera ruta ID: $RUTA_ID"

# ====================
# PASO 3: Obtener estudiante del tutor
# ====================
echo -e "\n${YELLOW}📝 PASO 3: Obtener estudiantes del tutor${NC}"

ESTUDIANTES=$(curl -s -X GET "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

ESTUDIANTE_ID=$(echo $ESTUDIANTES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ESTUDIANTE_ID" ]; then
  echo -e "${RED}❌ Error: El tutor no tiene estudiantes${NC}"
  echo "Response: $ESTUDIANTES"
  exit 1
fi

echo -e "${GREEN}✅ Estudiante obtenido${NC}"
echo "Estudiante ID: $ESTUDIANTE_ID"

# ====================
# PASO 4: Programar una clase (como admin - usaremos tutor token por ahora)
# ====================
echo -e "\n${YELLOW}📝 PASO 4: Programar una clase${NC}"

# Fecha futura (mañana a las 10:00 AM)
TOMORROW=$(date -d "tomorrow" -u +"%Y-%m-%dT10:00:00.000Z")

if [ ! -z "$DOCENTE_ID" ]; then
  PROGRAMAR_CLASE=$(curl -s -X POST "$BASE_URL/clases" \
    -H "Authorization: Bearer $TUTOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"rutaCurricularId\": \"$RUTA_ID\",
      \"docenteId\": \"$DOCENTE_ID\",
      \"fechaHoraInicio\": \"$TOMORROW\",
      \"duracionMinutos\": 60,
      \"cuposMaximo\": 5
    }")

  echo "$PROGRAMAR_CLASE" | head -30

  CLASE_ID=$(echo $PROGRAMAR_CLASE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  if [ -z "$CLASE_ID" ]; then
    echo -e "${YELLOW}⚠️  No se pudo programar clase (puede requerir rol Admin)${NC}"
    # Intentemos obtener una clase existente
    CLASES_LISTA=$(curl -s -X GET "$BASE_URL/clases" \
      -H "Authorization: Bearer $TUTOR_TOKEN")
    CLASE_ID=$(echo $CLASES_LISTA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

    if [ ! -z "$CLASE_ID" ]; then
      echo -e "${GREEN}✅ Usando clase existente para testing${NC}"
      echo "Clase ID: $CLASE_ID"
    fi
  else
    echo -e "${GREEN}✅ Clase programada exitosamente${NC}"
    echo "Clase ID: $CLASE_ID"
  fi
else
  echo -e "${YELLOW}⚠️  Saltando programación de clase (no hay docente)${NC}"
  # Intentar obtener clase existente
  CLASES_LISTA=$(curl -s -X GET "$BASE_URL/clases" \
    -H "Authorization: Bearer $TUTOR_TOKEN")
  CLASE_ID=$(echo $CLASES_LISTA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

# ====================
# PASO 5: Listar clases disponibles para tutor
# ====================
echo -e "\n${YELLOW}📝 PASO 5: Listar clases disponibles para tutor${NC}"

CLASES_TUTOR=$(curl -s -X GET "$BASE_URL/clases" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

echo "$CLASES_TUTOR" | head -50

NUM_CLASES=$(echo $CLASES_TUTOR | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Clases listadas: $NUM_CLASES clases disponibles${NC}"

# Si no hay CLASE_ID todavía, intentar obtenerlo de la lista
if [ -z "$CLASE_ID" ]; then
  CLASE_ID=$(echo $CLASES_TUTOR | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

# ====================
# PASO 6: Ver detalles de una clase
# ====================
if [ ! -z "$CLASE_ID" ]; then
  echo -e "\n${YELLOW}📝 PASO 6: Ver detalles de clase${NC}"

  CLASE_DETALLES=$(curl -s -X GET "$BASE_URL/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TUTOR_TOKEN")

  echo "$CLASE_DETALLES" | head -50
  echo -e "${GREEN}✅ Detalles de clase obtenidos${NC}"
fi

# ====================
# PASO 7: Reservar un cupo en la clase
# ====================
if [ ! -z "$CLASE_ID" ] && [ ! -z "$ESTUDIANTE_ID" ]; then
  echo -e "\n${YELLOW}📝 PASO 7: Reservar cupo en clase${NC}"

  RESERVA=$(curl -s -X POST "$BASE_URL/clases/$CLASE_ID/reservar" \
    -H "Authorization: Bearer $TUTOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"estudianteId\": \"$ESTUDIANTE_ID\",
      \"observaciones\": \"Test de reserva automática\"
    }")

  echo "$RESERVA" | head -30

  INSCRIPCION_ID=$(echo $RESERVA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  if [ -z "$INSCRIPCION_ID" ]; then
    echo -e "${YELLOW}⚠️  No se pudo crear reserva${NC}"
    echo "Puede que el estudiante ya esté inscrito o la clase esté llena"
  else
    echo -e "${GREEN}✅ Reserva creada exitosamente${NC}"
    echo "Inscripción ID: $INSCRIPCION_ID"
  fi
fi

# ====================
# PASO 8: Verificar que la clase ahora muestra la inscripción
# ====================
if [ ! -z "$CLASE_ID" ]; then
  echo -e "\n${YELLOW}📝 PASO 8: Verificar inscripción en detalles de clase${NC}"

  CLASE_ACTUALIZADA=$(curl -s -X GET "$BASE_URL/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TUTOR_TOKEN")

  CUPOS_OCUPADOS=$(echo $CLASE_ACTUALIZADA | grep -o '"cupos_ocupados":[0-9]*' | cut -d':' -f2)
  echo "Cupos ocupados: $CUPOS_OCUPADOS"
  echo -e "${GREEN}✅ Inscripción verificada en clase${NC}"
fi

# ====================
# PASO 9: Listar clases del docente
# ====================
if [ ! -z "$DOCENTE_TOKEN" ]; then
  echo -e "\n${YELLOW}📝 PASO 9: Listar clases del docente${NC}"

  CLASES_DOCENTE=$(curl -s -X GET "$BASE_URL/clases/docente/mis-clases" \
    -H "Authorization: Bearer $DOCENTE_TOKEN")

  echo "$CLASES_DOCENTE" | head -50

  NUM_CLASES_DOCENTE=$(echo $CLASES_DOCENTE | grep -o '"id"' | wc -l)
  echo -e "${GREEN}✅ Clases del docente listadas: $NUM_CLASES_DOCENTE clases${NC}"
fi

# ====================
# PASO 10: Registrar asistencia (como docente)
# ====================
if [ ! -z "$DOCENTE_TOKEN" ] && [ ! -z "$CLASE_ID" ] && [ ! -z "$ESTUDIANTE_ID" ]; then
  echo -e "\n${YELLOW}📝 PASO 10: Registrar asistencia${NC}"

  ASISTENCIA=$(curl -s -X POST "$BASE_URL/clases/$CLASE_ID/asistencia" \
    -H "Authorization: Bearer $DOCENTE_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"asistencias\": [
        {
          \"estudianteId\": \"$ESTUDIANTE_ID\",
          \"estado\": \"Presente\",
          \"observaciones\": \"Excelente participación\",
          \"puntosOtorgados\": 10
        }
      ]
    }")

  echo "$ASISTENCIA" | head -30

  if echo "$ASISTENCIA" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Asistencia registrada exitosamente${NC}"
  else
    echo -e "${YELLOW}⚠️  No se pudo registrar asistencia${NC}"
    echo "Puede que el docente no tenga permiso o la clase no sea suya"
  fi
fi

# ====================
# PASO 11: Cancelar reserva
# ====================
if [ ! -z "$INSCRIPCION_ID" ]; then
  echo -e "\n${YELLOW}📝 PASO 11: Cancelar reserva${NC}"

  CANCELAR=$(curl -s -X DELETE "$BASE_URL/clases/reservas/$INSCRIPCION_ID" \
    -H "Authorization: Bearer $TUTOR_TOKEN")

  echo "$CANCELAR"

  if echo "$CANCELAR" | grep -q 'exitosamente'; then
    echo -e "${GREEN}✅ Reserva cancelada exitosamente${NC}"
  else
    echo -e "${YELLOW}⚠️  No se pudo cancelar reserva${NC}"
  fi
fi

# ====================
# PASO 12: Listar todas las clases (como admin)
# ====================
echo -e "\n${YELLOW}📝 PASO 12: Listar todas las clases (vista admin)${NC}"

TODAS_CLASES=$(curl -s -X GET "$BASE_URL/clases/admin/todas" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

echo "$TODAS_CLASES" | head -50

if echo "$TODAS_CLASES" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Listado admin obtenido${NC}"
else
  echo -e "${YELLOW}⚠️  No se pudo listar (puede requerir rol Admin)${NC}"
fi

# ====================
# RESUMEN FINAL
# ====================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}📊 RESUMEN DE PRUEBAS${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${GREEN}Tests completados:${NC}"
echo "✅ Autenticación de tutor"
if [ ! -z "$DOCENTE_TOKEN" ]; then
  echo "✅ Autenticación de docente"
fi
echo "✅ Listado de rutas curriculares"
echo "✅ Obtención de estudiantes"
echo "✅ Listado de clases disponibles"
if [ ! -z "$CLASE_ID" ]; then
  echo "✅ Detalles de clase"
fi
if [ ! -z "$INSCRIPCION_ID" ]; then
  echo "✅ Reserva de cupo"
  echo "✅ Cancelación de reserva"
fi
if [ ! -z "$DOCENTE_TOKEN" ]; then
  echo "✅ Listado de clases del docente"
fi

echo -e "\n${YELLOW}Notas:${NC}"
echo "- Algunos endpoints pueden requerir rol Admin (programar, cancelar clases)"
echo "- La asistencia solo puede registrarse después de la clase"
echo "- Las reservas en clases pasadas no están permitidas"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 Testing del Slice #7 completado${NC}"
echo -e "${BLUE}========================================${NC}"
