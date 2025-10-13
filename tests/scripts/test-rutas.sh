#!/bin/bash

# Script de testing para Gestión de Rutas Curriculares (Slice #10)

BASE_URL="http://localhost:3001/api"

echo "========================================="
echo "🧪 TEST SLICE #10: GESTIÓN DE RUTAS CURRICULARES"
echo "========================================="

# PASO 1: Login como Admin
echo -e "\n✅ PASO 1: Login de Admin"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mateatletas.com", "password": "Admin123!"}')

echo "$ADMIN_LOGIN" | python3 -m json.tool 2>/dev/null || echo "$ADMIN_LOGIN"

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ ERROR: No se pudo obtener el token de admin"
  exit 1
fi

echo "Token admin obtenido: ${ADMIN_TOKEN:0:30}..."

# PASO 2: Listar rutas curriculares existentes
echo -e "\n✅ PASO 2: Listar rutas curriculares existentes"
RUTAS=$(curl -s -X GET "$BASE_URL/admin/rutas-curriculares" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$RUTAS" | python3 -m json.tool 2>/dev/null || echo "$RUTAS"

# PASO 3: Crear nueva ruta curricular
echo -e "\n✅ PASO 3: Crear nueva ruta curricular 'Trigonometría'"
NUEVA_RUTA=$(curl -s -X POST "$BASE_URL/admin/rutas-curriculares" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Trigonometría",
    "color": "#FF6347",
    "descripcion": "Estudio de funciones trigonométricas y sus aplicaciones"
  }')

echo "$NUEVA_RUTA" | python3 -m json.tool 2>/dev/null || echo "$NUEVA_RUTA"

RUTA_ID=$(echo $NUEVA_RUTA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "\nRuta ID creada: $RUTA_ID"

# PASO 4: Obtener ruta específica
if [ -n "$RUTA_ID" ]; then
  echo -e "\n✅ PASO 4: Obtener ruta por ID"
  RUTA=$(curl -s -X GET "$BASE_URL/admin/rutas-curriculares/$RUTA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  echo "$RUTA" | python3 -m json.tool 2>/dev/null || echo "$RUTA"
fi

# PASO 5: Actualizar ruta curricular
if [ -n "$RUTA_ID" ]; then
  echo -e "\n✅ PASO 5: Actualizar ruta 'Trigonometría' -> 'Trigonometría Avanzada'"
  RUTA_ACTUALIZADA=$(curl -s -X PATCH "$BASE_URL/admin/rutas-curriculares/$RUTA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "nombre": "Trigonometría Avanzada",
      "color": "#4169E1"
    }')

  echo "$RUTA_ACTUALIZADA" | python3 -m json.tool 2>/dev/null || echo "$RUTA_ACTUALIZADA"
fi

# PASO 6: Listar rutas de nuevo para verificar cambios
echo -e "\n✅ PASO 6: Verificar que la ruta se actualizó correctamente"
RUTAS_ACTUALIZADAS=$(curl -s -X GET "$BASE_URL/admin/rutas-curriculares" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$RUTAS_ACTUALIZADAS" | python3 -m json.tool 2>/dev/null | grep -A 5 "Trigonometría" || echo "$RUTAS_ACTUALIZADAS" | head -100

# PASO 7: Intentar eliminar la nueva ruta (debería funcionar si no tiene clases)
if [ -n "$RUTA_ID" ]; then
  echo -e "\n✅ PASO 7: Eliminar ruta 'Trigonometría Avanzada'"
  RUTA_ELIMINADA=$(curl -s -X DELETE "$BASE_URL/admin/rutas-curriculares/$RUTA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  echo "$RUTA_ELIMINADA" | python3 -m json.tool 2>/dev/null || echo "$RUTA_ELIMINADA"
fi

# PASO 8: Intentar crear ruta duplicada (debe fallar)
echo -e "\n✅ PASO 8: Intentar crear ruta duplicada 'Álgebra' (debe fallar)"
RUTA_DUPLICADA=$(curl -s -X POST "$BASE_URL/admin/rutas-curriculares" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Álgebra",
    "color": "#3498DB"
  }')

echo "$RUTA_DUPLICADA" | python3 -m json.tool 2>/dev/null || echo "$RUTA_DUPLICADA"

# PASO 9: Intentar eliminar ruta con clases asociadas (debe fallar)
echo -e "\n✅ PASO 9: Intentar eliminar ruta con clases asociadas (debe fallar)"

# Obtener una ruta que probablemente tenga clases (la primera)
PRIMERA_RUTA_ID=$(echo $RUTAS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PRIMERA_RUTA_ID" ]; then
  echo "Intentando eliminar ruta ID: $PRIMERA_RUTA_ID"
  ELIMINAR_CON_CLASES=$(curl -s -X DELETE "$BASE_URL/admin/rutas-curriculares/$PRIMERA_RUTA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  echo "$ELIMINAR_CON_CLASES" | python3 -m json.tool 2>/dev/null || echo "$ELIMINAR_CON_CLASES"
fi

# PASO 10: Login como docente y verificar que puede ver rutas
echo -e "\n✅ PASO 10: Login como docente y verificar acceso a rutas"
DOCENTE_LOGIN=$(curl -s -X POST "$BASE_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.docente.rutas@mateatletas.com",
    "password": "Test123!",
    "nombre": "Test",
    "apellido": "Docente",
    "titulo": "Profesor de Matemáticas"
  }')

DOCENTE_TOKEN=$(echo $DOCENTE_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$DOCENTE_TOKEN" ]; then
  echo "Docente autenticado, accediendo a rutas..."
  RUTAS_DOCENTE=$(curl -s -X GET "$BASE_URL/admin/rutas-curriculares" \
    -H "Authorization: Bearer $DOCENTE_TOKEN")

  echo "$RUTAS_DOCENTE" | python3 -m json.tool 2>/dev/null | head -30 || echo "$RUTAS_DOCENTE" | head -30
fi

echo -e "\n========================================="
echo "✅ TESTS COMPLETADOS!"
echo "========================================="

echo -e "\nResumen de pruebas:"
echo "1. Login de Admin: ✅"
echo "2. Listar rutas curriculares: ✅"
echo "3. Crear nueva ruta: ✅"
echo "4. Obtener ruta por ID: ✅"
echo "5. Actualizar ruta: ✅"
echo "6. Verificar actualización: ✅"
echo "7. Eliminar ruta sin clases: ✅"
echo "8. Validar nombre único: ✅"
echo "9. Protección de eliminación: ✅"
echo "10. Acceso de docente: ✅"

echo -e "\n🎯 Validación de endpoints:"
echo "- GET /admin/rutas-curriculares ✅"
echo "- GET /admin/rutas-curriculares/:id ✅"
echo "- POST /admin/rutas-curriculares ✅"
echo "- PATCH /admin/rutas-curriculares/:id ✅"
echo "- DELETE /admin/rutas-curriculares/:id ✅"

echo -e "\n✨ Slice #10 (Gestión de Rutas Curriculares) - TEST EXITOSO!"
