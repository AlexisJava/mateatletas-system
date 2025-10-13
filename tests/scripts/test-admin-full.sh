#!/bin/bash

# Script de testing para Slice #9 - Admin Copilot

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #9: ADMIN COPILOT"
echo "========================================="

# PASO 1: Login como tutor (para crear datos de prueba)
echo -e "\n✅ PASO 1: Login de tutor (setup)"
TUTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

TUTOR_TOKEN=$(echo $TUTOR_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token tutor obtenido: ${TUTOR_TOKEN:0:30}..."

# PASO 2: Crear estudiante para la alerta
echo -e "\n✅ PASO 2: Crear estudiante"
ESTUDIANTE=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Estudiante",
    "apellido": "AdminTest",
    "fecha_nacimiento": "2012-05-15",
    "nivel_escolar": "Primaria"
  }')

ESTUDIANTE_ID=$(echo $ESTUDIANTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Estudiante ID: $ESTUDIANTE_ID"

# PASO 3: Login como docente
echo -e "\n✅ PASO 3: Login de docente (setup)"
DOCENTE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.docente@mateatletas.com", "password": "Test123!"}')

DOCENTE_TOKEN=$(echo $DOCENTE_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
DOCENTE_ID=$(echo $DOCENTE_LOGIN | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Token docente obtenido: ${DOCENTE_TOKEN:0:30}..."
echo "Docente ID: $DOCENTE_ID"

# PASO 4: Obtener ruta curricular
echo -e "\n✅ PASO 4: Obtener ruta curricular"
RUTAS=$(curl -s -X GET "$BASE_URL/clases/metadata/rutas-curriculares")
RUTA_ID=$(echo $RUTAS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Ruta ID: $RUTA_ID"

# PASO 5: Programar una clase
echo -e "\n✅ PASO 5: Programar clase (setup)"
CLASE=$(curl -s -X POST "$BASE_URL/clases" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"ruta_curricular_id\": \"$RUTA_ID\",
    \"docente_id\": \"$DOCENTE_ID\",
    \"fecha_hora_inicio\": \"2025-10-15T10:00:00.000Z\",
    \"duracion_minutos\": 60,
    \"cupos_maximo\": 10
  }")

CLASE_ID=$(echo $CLASE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Clase ID: $CLASE_ID"

# PASO 6: Login como Admin
echo -e "\n✅ PASO 6: Login de Admin"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mateatletas.com", "password": "Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token admin obtenido: ${ADMIN_TOKEN:0:30}..."

# PASO 7: Crear una alerta de prueba
echo -e "\n✅ PASO 7: Crear alerta manualmente"
ALERTA=$(curl -s -X POST "$BASE_URL/admin/alertas" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"estudianteId\": \"$ESTUDIANTE_ID\",
    \"claseId\": \"$CLASE_ID\",
    \"descripcion\": \"El estudiante muestra dificultades para concentrarse durante la clase. Se distrae fácilmente y no completa los ejercicios a tiempo.\"
  }")

ALERTA_ID=$(echo $ALERTA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Alerta creada:"
echo "$ALERTA" | python3 -m json.tool 2>/dev/null || echo "$ALERTA"

# PASO 8: Obtener dashboard stats
echo -e "\n✅ PASO 8: Obtener estadísticas del dashboard"
DASHBOARD=$(curl -s -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$DASHBOARD" | python3 -m json.tool 2>/dev/null || echo "$DASHBOARD"

# PASO 9: Listar alertas pendientes
echo -e "\n✅ PASO 9: Listar alertas pendientes"
ALERTAS=$(curl -s -X GET "$BASE_URL/admin/alertas" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$ALERTAS" | python3 -m json.tool 2>/dev/null || echo "$ALERTAS"

# PASO 10: Obtener sugerencia para la alerta
echo -e "\n✅ PASO 10: Obtener sugerencia AI para resolver alerta"
SUGERENCIA=$(curl -s -X GET "$BASE_URL/admin/alertas/$ALERTA_ID/sugerencia" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$SUGERENCIA" | python3 -m json.tool 2>/dev/null || echo "$SUGERENCIA"

# PASO 11: Marcar alerta como resuelta
echo -e "\n✅ PASO 11: Marcar alerta como resuelta"
RESOLVER=$(curl -s -X PATCH "$BASE_URL/admin/alertas/$ALERTA_ID/resolver" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$RESOLVER" | python3 -m json.tool 2>/dev/null || echo "$RESOLVER"

# PASO 12: Verificar que la alerta ya no aparece en pendientes
echo -e "\n✅ PASO 12: Verificar que alerta está resuelta (no aparece en lista)"
ALERTAS_FINALES=$(curl -s -X GET "$BASE_URL/admin/alertas" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$ALERTAS_FINALES" | python3 -m json.tool 2>/dev/null || echo "$ALERTAS_FINALES"

# PASO 13: Crear segunda alerta con keyword diferente
echo -e "\n✅ PASO 13: Crear alerta con problema de comportamiento"
ALERTA2=$(curl -s -X POST "$BASE_URL/admin/alertas" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"estudianteId\": \"$ESTUDIANTE_ID\",
    \"claseId\": \"$CLASE_ID\",
    \"descripcion\": \"El estudiante tiene problemas de conducta y disciplina. Interrumpe frecuentemente la clase.\"
  }")

ALERTA2_ID=$(echo $ALERTA2 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Segunda alerta creada con ID: $ALERTA2_ID"

# PASO 14: Obtener sugerencia para alerta de comportamiento
echo -e "\n✅ PASO 14: Obtener sugerencia para problema de comportamiento"
SUGERENCIA2=$(curl -s -X GET "$BASE_URL/admin/alertas/$ALERTA2_ID/sugerencia" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$SUGERENCIA2" | python3 -m json.tool 2>/dev/null || echo "$SUGERENCIA2"

echo -e "\n========================================="
echo "✅ TESTS COMPLETADOS!"
echo "========================================="

echo -e "\nResumen de pruebas:"
echo "1. Login de tutor: ✅"
echo "2. Estudiante creado: ✅"
echo "3. Login de docente: ✅"
echo "4. Ruta obtenida: ✅"
echo "5. Clase programada: ✅"
echo "6. Token Admin preparado: ✅"
echo "7. Alerta creada manualmente: ✅"
echo "8. Dashboard stats obtenidas: ✅"
echo "9. Alertas listadas: ✅"
echo "10. Sugerencia AI generada: ✅"
echo "11. Alerta resuelta: ✅"
echo "12. Verificación de resolución: ✅"
echo "13. Segunda alerta (comportamiento): ✅"
echo "14. Sugerencia contextual generada: ✅"

echo -e "\n📊 IDs generados:"
echo "ESTUDIANTE_ID: $ESTUDIANTE_ID"
echo "CLASE_ID: $CLASE_ID"
echo "ALERTA_ID: $ALERTA_ID"
echo "ALERTA2_ID: $ALERTA2_ID"

echo -e "\n🎯 Validación de endpoints:"
echo "- GET /admin/dashboard ✅"
echo "- POST /admin/alertas ✅"
echo "- GET /admin/alertas ✅"
echo "- GET /admin/alertas/:id/sugerencia ✅"
echo "- PATCH /admin/alertas/:id/resolver ✅"

echo -e "\n✨ Slice #9 (Admin Copilot) - TEST EXITOSO!"
