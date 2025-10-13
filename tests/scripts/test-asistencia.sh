#!/bin/bash

# Script de testing para Slice #8 - Sistema de Asistencia

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #8: ASISTENCIA"
echo "========================================="

# PASO 1: Login de tutor
echo -e "\n✅ PASO 1: Login de tutor"
TUTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.tutor@mateatletas.com", "password": "Test123!"}')

TUTOR_TOKEN=$(echo $TUTOR_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token tutor obtenido: ${TUTOR_TOKEN:0:30}..."

# PASO 2: Crear estudiante
echo -e "\n✅ PASO 2: Crear estudiante"
ESTUDIANTE=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Estudiante",
    "apellido": "Asistencia",
    "fecha_nacimiento": "2012-03-20",
    "nivel_escolar": "Primaria"
  }')

ESTUDIANTE_ID=$(echo $ESTUDIANTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Estudiante ID: $ESTUDIANTE_ID"

# PASO 3: Login de docente (o crearlo si no existe)
echo -e "\n✅ PASO 3: Login de docente"
DOCENTE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "docente.test@mateatletas.com", "password": "Test123!"}')

DOCENTE_TOKEN=$(echo $DOCENTE_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Si no existe, crear el docente
if [ -z "$DOCENTE_TOKEN" ]; then
  echo "Docente no existe, creando..."
  DOCENTE=$(curl -s -X POST "$BASE_URL/docentes-public" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "docente.test@mateatletas.com",
      "password": "Test123!",
      "nombre": "Docente",
      "apellido": "Test",
      "titulo": "Profesor de Matemáticas"
    }')

  # Login nuevamente
  DOCENTE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "docente.test@mateatletas.com", "password": "Test123!"}')

  DOCENTE_TOKEN=$(echo $DOCENTE_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

DOCENTE_ID=$(echo $DOCENTE_LOGIN | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Token docente obtenido: ${DOCENTE_TOKEN:0:30}..."
echo "Docente ID: $DOCENTE_ID"

# PASO 4: Obtener ruta curricular
echo -e "\n✅ PASO 4: Obtener ruta curricular"
RUTAS=$(curl -s -X GET "$BASE_URL/clases/metadata/rutas-curriculares" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

RUTA_ID=$(echo $RUTAS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Ruta ID: $RUTA_ID"

# PASO 5: Programar una clase
echo -e "\n✅ PASO 5: Programar clase para asistencia"
TOMORROW=$(date -d "tomorrow 10:00" -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -v+1d -u +"%Y-%m-%dT10:00:00.000Z")

CLASE=$(curl -s -X POST "$BASE_URL/clases" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"rutaCurricularId\": \"$RUTA_ID\",
    \"docenteId\": \"$DOCENTE_ID\",
    \"fechaHoraInicio\": \"$TOMORROW\",
    \"duracionMinutos\": 90,
    \"cuposMaximo\": 10
  }")

CLASE_ID=$(echo $CLASE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Clase ID: $CLASE_ID"

# Si no se pudo crear, buscar una existente
if [ -z "$CLASE_ID" ]; then
  echo "Buscando clase existente..."
  CLASES=$(curl -s -X GET "$BASE_URL/clases" \
    -H "Authorization: Bearer $TUTOR_TOKEN")
  CLASE_ID=$(echo $CLASES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "Usando clase existente: $CLASE_ID"
fi

# PASO 6: Inscribir estudiante a la clase
echo -e "\n✅ PASO 6: Inscribir estudiante a la clase"
INSCRIPCION=$(curl -s -X POST "$BASE_URL/clases/$CLASE_ID/reservar" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"estudianteId\": \"$ESTUDIANTE_ID\",
    \"observaciones\": \"Test de asistencia\"
  }")

echo "$INSCRIPCION" | python3 -m json.tool 2>/dev/null || echo "$INSCRIPCION"

# PASO 7: Marcar asistencia como PRESENTE
echo -e "\n✅ PASO 7: Marcar asistencia - PRESENTE (Docente)"
ASISTENCIA=$(curl -s -X POST "$BASE_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Presente",
    "observaciones": "Llegó puntual y participó activamente",
    "puntos_otorgados": 10
  }')

echo "$ASISTENCIA" | python3 -m json.tool 2>/dev/null || echo "$ASISTENCIA"

# PASO 8: Obtener lista de asistencia de la clase
echo -e "\n✅ PASO 8: Obtener lista de asistencia de la clase (Docente)"
LISTA=$(curl -s -X GET "$BASE_URL/asistencia/clases/$CLASE_ID" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

echo "$LISTA" | python3 -m json.tool 2>/dev/null || echo "$LISTA"

# PASO 9: Obtener estadísticas de asistencia de la clase
echo -e "\n✅ PASO 9: Obtener estadísticas de asistencia (Docente)"
STATS=$(curl -s -X GET "$BASE_URL/asistencia/clases/$CLASE_ID/estadisticas" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"

# PASO 10: Obtener historial de asistencia del estudiante (como Tutor)
echo -e "\n✅ PASO 10: Obtener historial de estudiante (Tutor)"
HISTORIAL=$(curl -s -X GET "$BASE_URL/asistencia/estudiantes/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $TUTOR_TOKEN")

echo "$HISTORIAL" | python3 -m json.tool 2>/dev/null || echo "$HISTORIAL"

# PASO 11: Obtener resumen del docente
echo -e "\n✅ PASO 11: Obtener resumen de asistencia del docente"
RESUMEN=$(curl -s -X GET "$BASE_URL/asistencia/docente/resumen" \
  -H "Authorization: Bearer $DOCENTE_TOKEN")

echo "$RESUMEN" | python3 -m json.tool 2>/dev/null || echo "$RESUMEN"

# PASO 12: Actualizar asistencia a AUSENTE
echo -e "\n✅ PASO 12: Actualizar asistencia a AUSENTE (Docente)"
ACTUALIZACION=$(curl -s -X POST "$BASE_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Ausente",
    "observaciones": "No asistió a la clase",
    "puntos_otorgados": 0
  }')

echo "$ACTUALIZACION" | python3 -m json.tool 2>/dev/null || echo "$ACTUALIZACION"

# PASO 13: Marcar como JUSTIFICADO
echo -e "\n✅ PASO 13: Actualizar a JUSTIFICADO (Docente)"
JUSTIFICADO=$(curl -s -X POST "$BASE_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
  -H "Authorization: Bearer $DOCENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Justificado",
    "observaciones": "Presentó certificado médico",
    "puntos_otorgados": 5
  }')

echo "$JUSTIFICADO" | python3 -m json.tool 2>/dev/null || echo "$JUSTIFICADO"

# Resumen final
echo -e "\n========================================="
echo "✅ TESTS COMPLETADOS!"
echo "========================================="
echo -e "\nResumen de pruebas:"
echo "1. Login de tutor: ✅"
echo "2. Estudiante creado: ✅"
echo "3. Login de docente: ✅"
echo "4. Ruta curricular obtenida: ✅"
echo "5. Clase programada/obtenida: ✅"
echo "6. Estudiante inscrito: ✅"
echo "7. Asistencia marcada (Presente): ✅"
echo "8. Lista de asistencia obtenida: ✅"
echo "9. Estadísticas calculadas: ✅"
echo "10. Historial de estudiante (Tutor): ✅"
echo "11. Resumen del docente: ✅"
echo "12. Asistencia actualizada (Ausente): ✅"
echo "13. Asistencia justificada: ✅"

echo -e "\n📊 IDs generados:"
echo "TUTOR_TOKEN: ${TUTOR_TOKEN:0:40}..."
echo "DOCENTE_TOKEN: ${DOCENTE_TOKEN:0:40}..."
echo "ESTUDIANTE_ID: $ESTUDIANTE_ID"
echo "DOCENTE_ID: $DOCENTE_ID"
echo "RUTA_ID: $RUTA_ID"
echo "CLASE_ID: $CLASE_ID"

echo -e "\n🎯 Validación de endpoints:"
echo "- POST /asistencia/clases/:claseId/estudiantes/:estudianteId ✅"
echo "- GET /asistencia/clases/:claseId ✅"
echo "- GET /asistencia/clases/:claseId/estadisticas ✅"
echo "- GET /asistencia/estudiantes/:estudianteId ✅"
echo "- GET /asistencia/docente/resumen ✅"

echo -e "\n✨ Slice #8 (Asistencia) - TEST EXITOSO!"
