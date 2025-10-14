#!/bin/bash

# ============================================================
# 🧪 Test SLICE #14: Portal Docente Completo
# ============================================================
# Este script prueba todas las funcionalidades del portal docente:
# - Perfil del docente
# - Calendario mensual de clases
# - Gestión de observaciones
# - Reportes con gráficos
# - Mejoras en lista de asistencia
# ============================================================

BASE_URL="http://localhost:3001/api"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Función para imprimir títulos
print_title() {
  echo ""
  echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${MAGENTA}║ $1${NC}"
  echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
}

# Función para imprimir subtítulos
print_subtitle() {
  echo ""
  echo -e "${CYAN}▶ $1${NC}"
}

# Función para verificar respuesta exitosa
check_success() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((FAILED++))
  fi
}

# Función para extraer valor JSON
extract_json_value() {
  echo "$1" | grep -o "\"$2\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*:"\(.*\)".*/\1/'
}

# Variables globales
ADMIN_TOKEN=""
DOCENTE_TOKEN=""
DOCENTE_ID=""
ESTUDIANTE_ID=""
CLASE_ID=""
INSCRIPCION_ID=""

# ============================================================
# 1️⃣ AUTENTICACIÓN Y SETUP
# ============================================================

print_title "1️⃣  AUTENTICACIÓN Y SETUP"

print_subtitle "Login como Admin"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mateatletas.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(extract_json_value "$RESPONSE" "access_token")

if [ -n "$ADMIN_TOKEN" ]; then
  check_success 0 "Admin login exitoso"
else
  check_success 1 "Admin login falló"
  echo "$RESPONSE"
  exit 1
fi

print_subtitle "Crear Docente de prueba"
DOCENTE_RESPONSE=$(curl -s -X POST "$BASE_URL/docentes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "docente.prueba@test.com",
    "password": "docente123",
    "nombre": "María",
    "apellido": "González",
    "telefono": "+52 123 456 7890",
    "titulo_profesional": "Lic. en Matemáticas",
    "biografia": "Docente con 10 años de experiencia en educación matemática",
    "especialidades": ["Álgebra", "Geometría", "Cálculo"]
  }')

DOCENTE_ID=$(extract_json_value "$DOCENTE_RESPONSE" "id")

if [ -n "$DOCENTE_ID" ]; then
  check_success 0 "Docente creado: $DOCENTE_ID"
else
  # Puede que ya exista, intentar login
  echo -e "${YELLOW}⚠️  Docente puede ya existir, intentando login...${NC}"
fi

print_subtitle "Login como Docente"
DOCENTE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente.prueba@test.com",
    "password": "docente123"
  }')

DOCENTE_TOKEN=$(extract_json_value "$DOCENTE_LOGIN" "access_token")

if [ -n "$DOCENTE_TOKEN" ]; then
  check_success 0 "Docente login exitoso"
else
  check_success 1 "Docente login falló"
  echo "$DOCENTE_LOGIN"
  exit 1
fi

# Obtener ID del docente del token
DOCENTE_PROFILE=$(curl -s -X GET "$BASE_URL/docentes/me" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")
DOCENTE_ID=$(extract_json_value "$DOCENTE_PROFILE" "id")

# ============================================================
# 2️⃣ PERFIL DEL DOCENTE (GET /docentes/me)
# ============================================================

print_title "2️⃣  PERFIL DEL DOCENTE"

print_subtitle "GET /docentes/me - Obtener perfil"
PERFIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/docentes/me" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$PERFIL_RESPONSE" | tail -n1)
PERFIL_BODY=$(echo "$PERFIL_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Obtener perfil docente"
  echo "$PERFIL_BODY" | grep -q '"nombre"' && echo -e "   ${GREEN}✓${NC} Contiene nombre"
  echo "$PERFIL_BODY" | grep -q '"email"' && echo -e "   ${GREEN}✓${NC} Contiene email"
  echo "$PERFIL_BODY" | grep -q '"titulo_profesional"' && echo -e "   ${GREEN}✓${NC} Contiene título profesional"
  echo "$PERFIL_BODY" | grep -q '"especialidades"' && echo -e "   ${GREEN}✓${NC} Contiene especialidades"
else
  check_success 1 "Obtener perfil docente (HTTP $HTTP_CODE)"
fi

print_subtitle "PATCH /docentes/me - Actualizar perfil"
UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/docentes/me" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+52 999 888 7777",
    "biografia": "Docente apasionada por las matemáticas y la educación innovadora. 10 años de experiencia.",
    "especialidades": ["Álgebra Lineal", "Geometría Analítica", "Cálculo Diferencial"]
  }')

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Actualizar perfil docente"
  echo "$UPDATE_BODY" | grep -q '999 888 7777' && echo -e "   ${GREEN}✓${NC} Teléfono actualizado"
  echo "$UPDATE_BODY" | grep -q 'educación innovadora' && echo -e "   ${GREEN}✓${NC} Biografía actualizada"
else
  check_success 1 "Actualizar perfil docente (HTTP $HTTP_CODE)"
fi

# ============================================================
# 3️⃣ CALENDARIO DE CLASES (GET /clases/docente/mis-clases)
# ============================================================

print_title "3️⃣  CALENDARIO DE CLASES"

# Primero crear una ruta curricular y una clase
print_subtitle "Setup: Crear ruta curricular y clase"

RUTAS_RESPONSE=$(curl -s -X GET "$BASE_URL/clases/metadata/rutas-curriculares")
RUTA_ID=$(echo "$RUTAS_RESPONSE" | grep -o '"id":"[^"]*"' | head -n1 | sed 's/"id":"\(.*\)"/\1/')

if [ -z "$RUTA_ID" ]; then
  echo -e "${YELLOW}⚠️  No hay rutas curriculares, creando una...${NC}"
  RUTA_CREATE=$(curl -s -X POST "$BASE_URL/admin/rutas-curriculares" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "nombre": "Álgebra Fundamental",
      "descripcion": "Ruta para fundamentos de álgebra",
      "nivel": "Intermedio",
      "color": "#FF6B35"
    }')
  RUTA_ID=$(extract_json_value "$RUTA_CREATE" "id")
fi

echo -e "   ${GREEN}✓${NC} Ruta curricular: $RUTA_ID"

# Crear clase
CLASE_CREATE=$(curl -s -X POST "$BASE_URL/clases" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"titulo\": \"Clase de Álgebra Básica\",
    \"descripcion\": \"Introducción al álgebra\",
    \"fecha_hora_inicio\": \"$(date -u -d '+2 days' +'%Y-%m-%dT10:00:00.000Z')\",
    \"duracion_minutos\": 60,
    \"cupo_maximo\": 10,
    \"ruta_curricular_id\": \"$RUTA_ID\"
  }")

CLASE_ID=$(extract_json_value "$CLASE_CREATE" "id")

if [ -n "$CLASE_ID" ]; then
  echo -e "   ${GREEN}✓${NC} Clase creada: $CLASE_ID"
else
  echo -e "   ${RED}✗${NC} Error creando clase"
fi

print_subtitle "GET /clases/docente/mis-clases - Obtener todas las clases"
MIS_CLASES_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/clases/docente/mis-clases" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$MIS_CLASES_RESPONSE" | tail -n1)
MIS_CLASES_BODY=$(echo "$MIS_CLASES_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Obtener mis clases como docente"
  echo "$MIS_CLASES_BODY" | grep -q '"titulo"' && echo -e "   ${GREEN}✓${NC} Contiene clases"
  echo "$MIS_CLASES_BODY" | grep -q '"fecha_hora_inicio"' && echo -e "   ${GREEN}✓${NC} Con fechas"
  echo "$MIS_CLASES_BODY" | grep -q '"rutaCurricular"' && echo -e "   ${GREEN}✓${NC} Con ruta curricular"
else
  check_success 1 "Obtener mis clases (HTTP $HTTP_CODE)"
fi

print_subtitle "GET /clases/docente/mis-clases?incluirPasadas=true - Con pasadas"
MIS_CLASES_FULL=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/clases/docente/mis-clases?incluirPasadas=true" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$MIS_CLASES_FULL" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Obtener todas mis clases (incluyendo pasadas)"
else
  check_success 1 "Obtener todas mis clases (HTTP $HTTP_CODE)"
fi

# ============================================================
# 4️⃣ OBSERVACIONES (GET /asistencia/docente/observaciones)
# ============================================================

print_title "4️⃣  OBSERVACIONES"

# Setup: Crear estudiante e inscripción
print_subtitle "Setup: Crear estudiante y registrar asistencia con observación"

ESTUDIANTE_CREATE=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "Pérez",
    "fecha_nacimiento": "2010-05-15",
    "nivel_escolar": "Secundaria",
    "tutor_nombre": "Roberto Pérez",
    "tutor_email": "roberto@test.com",
    "tutor_telefono": "+52 111 222 3333"
  }')

ESTUDIANTE_ID=$(extract_json_value "$ESTUDIANTE_CREATE" "id")

if [ -n "$ESTUDIANTE_ID" ]; then
  echo -e "   ${GREEN}✓${NC} Estudiante creado: $ESTUDIANTE_ID"
fi

# Inscribir estudiante en la clase (como Admin o crear endpoint público)
# Para este test, asumimos que el estudiante puede inscribirse

# Registrar asistencia con observación
ASISTENCIA_CREATE=$(curl -s -X POST "$BASE_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Presente",
    "puntosOtorgados": 10,
    "observaciones": "Excelente participación en clase. Resolvió todos los ejercicios correctamente."
  }')

if echo "$ASISTENCIA_CREATE" | grep -q '"observaciones"'; then
  echo -e "   ${GREEN}✓${NC} Asistencia con observación registrada"
fi

print_subtitle "GET /asistencia/docente/observaciones - Todas las observaciones"
OBS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/asistencia/docente/observaciones" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$OBS_RESPONSE" | tail -n1)
OBS_BODY=$(echo "$OBS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Obtener observaciones del docente"
  echo "$OBS_BODY" | grep -q '"observaciones"' && echo -e "   ${GREEN}✓${NC} Contiene observaciones"
  echo "$OBS_BODY" | grep -q '"estudiante"' && echo -e "   ${GREEN}✓${NC} Con datos del estudiante"
  echo "$OBS_BODY" | grep -q '"clase"' && echo -e "   ${GREEN}✓${NC} Con datos de la clase"
else
  check_success 1 "Obtener observaciones (HTTP $HTTP_CODE)"
fi

print_subtitle "GET /asistencia/docente/observaciones?limit=5 - Con límite"
OBS_LIMIT=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/asistencia/docente/observaciones?limit=5" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$OBS_LIMIT" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Obtener observaciones con límite"
else
  check_success 1 "Obtener observaciones con límite (HTTP $HTTP_CODE)"
fi

print_subtitle "GET /asistencia/docente/observaciones?estudianteId=XXX - Filtro por estudiante"
OBS_ESTUDIANTE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/asistencia/docente/observaciones?estudianteId=$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$OBS_ESTUDIANTE" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Filtrar observaciones por estudiante"
else
  check_success 1 "Filtrar observaciones por estudiante (HTTP $HTTP_CODE)"
fi

# ============================================================
# 5️⃣ REPORTES (GET /asistencia/docente/reportes)
# ============================================================

print_title "5️⃣  REPORTES CON ESTADÍSTICAS"

print_subtitle "GET /asistencia/docente/reportes - Obtener reportes completos"
REPORTES_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/asistencia/docente/reportes" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

HTTP_CODE=$(echo "$REPORTES_RESPONSE" | tail -n1)
REPORTES_BODY=$(echo "$REPORTES_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
  check_success 0 "Obtener reportes del docente"

  # Verificar estructura del reporte
  echo "$REPORTES_BODY" | grep -q '"estadisticas_globales"' && echo -e "   ${GREEN}✓${NC} Estadísticas globales"
  echo "$REPORTES_BODY" | grep -q '"asistencia_semanal"' && echo -e "   ${GREEN}✓${NC} Asistencia semanal (últimas 8 semanas)"
  echo "$REPORTES_BODY" | grep -q '"top_estudiantes"' && echo -e "   ${GREEN}✓${NC} Top 10 estudiantes"
  echo "$REPORTES_BODY" | grep -q '"por_ruta_curricular"' && echo -e "   ${GREEN}✓${NC} Estadísticas por ruta curricular"

  # Verificar campos específicos
  echo "$REPORTES_BODY" | grep -q '"total_registros"' && echo -e "   ${GREEN}✓${NC} Total de registros"
  echo "$REPORTES_BODY" | grep -q '"porcentaje_asistencia"' && echo -e "   ${GREEN}✓${NC} Porcentaje de asistencia"
  echo "$REPORTES_BODY" | grep -q '"presentes"' && echo -e "   ${GREEN}✓${NC} Conteo de presentes"
  echo "$REPORTES_BODY" | grep -q '"ausentes"' && echo -e "   ${GREEN}✓${NC} Conteo de ausentes"
else
  check_success 1 "Obtener reportes (HTTP $HTTP_CODE)"
  echo "$REPORTES_BODY"
fi

# ============================================================
# 6️⃣ RESUMEN FINAL
# ============================================================

print_title "📊 RESUMEN FINAL"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "${CYAN}Total de pruebas:${NC} $TOTAL"
echo -e "${GREEN}Pasadas:${NC} $PASSED"
echo -e "${RED}Fallidas:${NC} $FAILED"
echo -e "${BLUE}Porcentaje de éxito:${NC} $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!          ║${NC}"
  echo -e "${GREEN}║  SLICE #14: Portal Docente Completo está listo 🚀     ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ❌ ALGUNAS PRUEBAS FALLARON                           ║${NC}"
  echo -e "${RED}║  Revisa los errores arriba                             ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
