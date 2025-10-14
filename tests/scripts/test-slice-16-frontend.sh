#!/bin/bash

# SLICE #16 - Cursos Frontend Testing Script
# Tests para verificar la implementación completa del frontend

echo "=========================================="
echo "SLICE #16: Cursos Frontend E2E Tests"
echo "=========================================="
echo ""

API_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local token=$3
  local data=$4
  local test_name=$5

  echo -n "Testing: $test_name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" = "PATCH" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" =~ ^(200|201)$ ]]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    ((PASSED++))
    echo "$body"
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    echo "$body"
    ((FAILED++))
    return 1
  fi
}

echo "=========================================="
echo "STEP 1: Preparación - Login Admin"
echo "=========================================="
echo ""

# Login Admin
admin_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mateatletas.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo $admin_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}ERROR: No se pudo obtener token de admin${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Admin token obtenido${NC}"
echo ""

echo "=========================================="
echo "STEP 2: Preparación - Login Estudiante"
echo "=========================================="
echo ""

# Login Estudiante
estudiante_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@mateatletas.com",
    "password": "estudiante123"
  }')

ESTUDIANTE_TOKEN=$(echo $estudiante_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ESTUDIANTE_TOKEN" ]; then
  echo -e "${YELLOW}⚠ Warning: No se pudo obtener token de estudiante${NC}"
  echo "Creando estudiante de prueba..."

  # Crear estudiante
  register_response=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "estudiante-test@mateatletas.com",
      "password": "test123",
      "nombre": "Estudiante",
      "apellido": "Test"
    }')

  ESTUDIANTE_TOKEN=$(echo $register_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

echo -e "${GREEN}✓ Estudiante token obtenido${NC}"
echo ""

echo "=========================================="
echo "STEP 3: Obtener Curso de Prueba"
echo "=========================================="
echo ""

# Listar productos para obtener un curso
productos_response=$(test_endpoint "GET" "/productos?tipo=Curso" "$ADMIN_TOKEN" "" "Listar cursos")

# Extraer primer curso ID (asumiendo que existe al menos uno del seed)
CURSO_ID=$(echo "$productos_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CURSO_ID" ]; then
  echo -e "${RED}ERROR: No se encontró ningún curso. Ejecuta el seed primero.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Curso ID: $CURSO_ID${NC}"
echo ""

echo "=========================================="
echo "STEP 4: Admin - Crear Módulo"
echo "=========================================="
echo ""

modulo_response=$(test_endpoint "POST" "/cursos/productos/$CURSO_ID/modulos" "$ADMIN_TOKEN" '{
  "titulo": "Módulo de Prueba Frontend",
  "descripcion": "Testing del frontend SLICE #16",
  "orden": 1,
  "publicado": true
}' "Crear módulo")

MODULO_ID=$(echo "$modulo_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$MODULO_ID" ]; then
  echo -e "${RED}ERROR: No se pudo crear el módulo${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Módulo ID: $MODULO_ID${NC}"
echo ""

echo "=========================================="
echo "STEP 5: Admin - Listar Módulos del Curso"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/productos/$CURSO_ID/modulos" "$ADMIN_TOKEN" "" "Listar módulos del curso"
echo ""

echo "=========================================="
echo "STEP 6: Admin - Crear Lección de Video"
echo "=========================================="
echo ""

leccion_video_response=$(test_endpoint "POST" "/cursos/modulos/$MODULO_ID/lecciones" "$ADMIN_TOKEN" '{
  "titulo": "Introducción en Video",
  "descripcion": "Video de introducción al tema",
  "tipo_contenido": "Video",
  "contenido": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  "orden": 1,
  "duracion_estimada_minutos": 10,
  "puntos": 10,
  "publicado": true
}' "Crear lección de video")

LECCION_VIDEO_ID=$(echo "$leccion_video_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Lección Video ID: $LECCION_VIDEO_ID${NC}"
echo ""

echo "=========================================="
echo "STEP 7: Admin - Crear Lección de Texto"
echo "=========================================="
echo ""

leccion_texto_response=$(test_endpoint "POST" "/cursos/modulos/$MODULO_ID/lecciones" "$ADMIN_TOKEN" '{
  "titulo": "Conceptos Básicos",
  "descripcion": "Lectura sobre conceptos fundamentales",
  "tipo_contenido": "Texto",
  "contenido": {
    "texto": "Esta es una lección de texto con conceptos fundamentales.\n\nPunto 1: Fundamentos\nPunto 2: Aplicaciones\nPunto 3: Práctica"
  },
  "orden": 2,
  "duracion_estimada_minutos": 15,
  "puntos": 15,
  "publicado": true,
  "leccion_prerequisito_id": "'$LECCION_VIDEO_ID'"
}' "Crear lección de texto con prerequisito")

LECCION_TEXTO_ID=$(echo "$leccion_texto_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Lección Texto ID: $LECCION_TEXTO_ID${NC}"
echo ""

echo "=========================================="
echo "STEP 8: Admin - Crear Lección de Quiz"
echo "=========================================="
echo ""

leccion_quiz_response=$(test_endpoint "POST" "/cursos/modulos/$MODULO_ID/lecciones" "$ADMIN_TOKEN" '{
  "titulo": "Quiz de Evaluación",
  "descripcion": "Verifica tus conocimientos",
  "tipo_contenido": "Quiz",
  "contenido": {
    "preguntas": [
      {
        "pregunta": "¿Cuál es la capital de Francia?",
        "opciones": ["Londres", "París", "Madrid", "Roma"],
        "respuesta_correcta": 1
      },
      {
        "pregunta": "¿Cuánto es 2 + 2?",
        "opciones": ["3", "4", "5", "6"],
        "respuesta_correcta": 1
      }
    ]
  },
  "orden": 3,
  "duracion_estimada_minutos": 5,
  "puntos": 20,
  "publicado": true
}' "Crear lección de quiz")

LECCION_QUIZ_ID=$(echo "$leccion_quiz_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Lección Quiz ID: $LECCION_QUIZ_ID${NC}"
echo ""

echo "=========================================="
echo "STEP 9: Admin - Listar Lecciones del Módulo"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/modulos/$MODULO_ID/lecciones" "$ADMIN_TOKEN" "" "Listar lecciones del módulo"
echo ""

echo "=========================================="
echo "STEP 10: Estudiante - Ver Progreso del Curso"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/productos/$CURSO_ID/progreso" "$ESTUDIANTE_TOKEN" "" "Ver progreso inicial (0%)"
echo ""

echo "=========================================="
echo "STEP 11: Estudiante - Ver Lección de Video"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/lecciones/$LECCION_VIDEO_ID" "$ESTUDIANTE_TOKEN" "" "Ver contenido de lección de video"
echo ""

echo "=========================================="
echo "STEP 12: Estudiante - Completar Lección de Video"
echo "=========================================="
echo ""

completar_response=$(test_endpoint "POST" "/cursos/lecciones/$LECCION_VIDEO_ID/completar" "$ESTUDIANTE_TOKEN" '{
  "progreso_porcentaje": 100,
  "tiempo_invertido_minutos": 10
}' "Completar lección de video")
echo ""

echo "=========================================="
echo "STEP 13: Estudiante - Ver Progreso Actualizado"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/productos/$CURSO_ID/progreso" "$ESTUDIANTE_TOKEN" "" "Ver progreso después de completar lección"
echo ""

echo "=========================================="
echo "STEP 14: Estudiante - Obtener Siguiente Lección"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/productos/$CURSO_ID/siguiente-leccion" "$ESTUDIANTE_TOKEN" "" "Obtener siguiente lección disponible"
echo ""

echo "=========================================="
echo "STEP 15: Estudiante - Completar Lección de Texto"
echo "=========================================="
echo ""

test_endpoint "POST" "/cursos/lecciones/$LECCION_TEXTO_ID/completar" "$ESTUDIANTE_TOKEN" '{
  "progreso_porcentaje": 100,
  "tiempo_invertido_minutos": 15,
  "notas_estudiante": "Muy interesante el tema"
}' "Completar lección de texto"
echo ""

echo "=========================================="
echo "STEP 16: Estudiante - Completar Quiz"
echo "=========================================="
echo ""

test_endpoint "POST" "/cursos/lecciones/$LECCION_QUIZ_ID/completar" "$ESTUDIANTE_TOKEN" '{
  "progreso_porcentaje": 100,
  "tiempo_invertido_minutos": 5,
  "calificacion": 100,
  "ultima_respuesta": {"respuestas": [1, 1]}
}' "Completar lección de quiz con calificación"
echo ""

echo "=========================================="
echo "STEP 17: Estudiante - Ver Progreso Final"
echo "=========================================="
echo ""

test_endpoint "GET" "/cursos/productos/$CURSO_ID/progreso" "$ESTUDIANTE_TOKEN" "" "Ver progreso final (100% en módulo de prueba)"
echo ""

echo "=========================================="
echo "STEP 18: Admin - Actualizar Módulo"
echo "=========================================="
echo ""

test_endpoint "PATCH" "/cursos/modulos/$MODULO_ID" "$ADMIN_TOKEN" '{
  "titulo": "Módulo de Prueba Frontend - Actualizado",
  "publicado": true
}' "Actualizar módulo"
echo ""

echo "=========================================="
echo "STEP 19: Admin - Actualizar Lección"
echo "=========================================="
echo ""

test_endpoint "PATCH" "/cursos/lecciones/$LECCION_VIDEO_ID" "$ADMIN_TOKEN" '{
  "titulo": "Introducción en Video - Actualizada",
  "puntos": 15
}' "Actualizar lección"
echo ""

echo "=========================================="
echo "RESUMEN DE TESTS"
echo "=========================================="
echo ""
echo -e "${GREEN}Tests Passed: $PASSED${NC}"
echo -e "${RED}Tests Failed: $FAILED${NC}"
echo -e "Total Tests: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}=========================================="
  echo "✓ TODOS LOS TESTS PASARON"
  echo "==========================================${NC}"
  echo ""
  echo "Frontend URLs para verificar manualmente:"
  echo "- Admin: $FRONTEND_URL/admin/cursos"
  echo "- Estudiante: $FRONTEND_URL/estudiante/cursos"
  echo "- Curso específico: $FRONTEND_URL/estudiante/cursos/$CURSO_ID"
  echo ""
  exit 0
else
  echo -e "${RED}=========================================="
  echo "✗ ALGUNOS TESTS FALLARON"
  echo "==========================================${NC}"
  exit 1
fi
