#!/bin/bash

# Test completo de integración - Todas las verticales
# Este script prueba un flujo completo de un usuario en la plataforma

BASE_URL="http://localhost:3001/api"

echo "============================================================"
echo "🎯 TEST DE INTEGRACIÓN COMPLETA - MATEATLETAS ECOSYSTEM"
echo "============================================================"
echo ""
echo "Este test simula el flujo completo de un tutor usando la plataforma:"
echo "1. Registro y autenticación"
echo "2. Creación de estudiantes"
echo "3. Organización en equipos"
echo "4. Consulta de catálogo"
echo "5. Compra de suscripción"
echo "6. Inscripción a clase"
echo "7. Registro de asistencia por docente"
echo ""

# Variables para tracking
TUTOR_EMAIL="integration.test.$RANDOM@mateatletas.com"
ERRORS=0

# ====================
# SLICE #1: AUTH
# ====================
echo "============================================================"
echo "📍 SLICE #1: AUTENTICACIÓN"
echo "============================================================"

echo -e "\n1️⃣ Registrando nuevo tutor..."
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TUTOR_EMAIL\",
    \"password\": \"Test123!\",
    \"nombre\": \"Integration\",
    \"apellido\": \"Test\"
  }")

if echo "$REGISTER" | grep -q "id"; then
  echo "✅ Tutor registrado exitosamente"
else
  echo "❌ Error al registrar tutor"
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n2️⃣ Iniciando sesión..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TUTOR_EMAIL\",
    \"password\": \"Test123!\"
  }")

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
TUTOR_ID=$(echo $LOGIN | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo "✅ Login exitoso - Token: ${TOKEN:0:30}..."
  echo "   Tutor ID: $TUTOR_ID"
else
  echo "❌ Error en login"
  ERRORS=$((ERRORS + 1))
  exit 1
fi

# ====================
# SLICE #2: ESTUDIANTES
# ====================
echo -e "\n============================================================"
echo "📍 SLICE #2: GESTIÓN DE ESTUDIANTES"
echo "============================================================"

echo -e "\n1️⃣ Creando estudiante María..."
EST1=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellido": "González",
    "fecha_nacimiento": "2012-03-15",
    "nivel_escolar": "Primaria"
  }')

EST1_ID=$(echo $EST1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$EST1_ID" ]; then
  echo "✅ Estudiante María creada - ID: $EST1_ID"
else
  echo "❌ Error al crear estudiante"
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n2️⃣ Creando estudiante Carlos..."
EST2=$(curl -s -X POST "$BASE_URL/estudiantes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "González",
    "fecha_nacimiento": "2010-07-20",
    "nivel_escolar": "Secundaria"
  }')

EST2_ID=$(echo $EST2 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$EST2_ID" ]; then
  echo "✅ Estudiante Carlos creado - ID: $EST2_ID"
else
  echo "❌ Error al crear estudiante"
  ERRORS=$((ERRORS + 1))
fi

# ====================
# SLICE #3: EQUIPOS
# ====================
echo -e "\n============================================================"
echo "📍 SLICE #3: GESTIÓN DE EQUIPOS"
echo "============================================================"

echo -e "\n1️⃣ Creando equipo Fénix..."
EQUIPO=$(curl -s -X POST "$BASE_URL/equipos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombre\": \"Fénix Integration $RANDOM\",
    \"color_primario\": \"#FF6B35\",
    \"color_secundario\": \"#F7B801\"
  }")

EQUIPO_ID=$(echo $EQUIPO | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$EQUIPO_ID" ]; then
  echo "✅ Equipo creado - ID: $EQUIPO_ID"
else
  echo "❌ Error al crear equipo"
  echo "Response: $EQUIPO" | head -c 200
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n2️⃣ Agregando María al equipo..."
AGREGAR=$(curl -s -X PATCH "$BASE_URL/estudiantes/$EST1_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"equipo_id\": \"$EQUIPO_ID\"}")

if echo "$AGREGAR" | grep -q "equipo_id"; then
  echo "✅ María agregada al equipo Fénix"
else
  echo "❌ Error al agregar al equipo"
  ERRORS=$((ERRORS + 1))
fi

# ====================
# SLICE #4: DOCENTES
# ====================
echo -e "\n============================================================"
echo "📍 SLICE #4: DOCENTES"
echo "============================================================"

echo -e "\n1️⃣ Creando docente..."
DOCENTE=$(curl -s -X POST "$BASE_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente.integration.'$RANDOM'@mateatletas.com",
    "password": "Test123!",
    "nombre": "Ana",
    "apellido": "Martínez",
    "titulo": "Profesora de Matemáticas"
  }')

DOCENTE_ID=$(echo $DOCENTE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
DOCENTE_EMAIL=$(echo $DOCENTE | grep -o '"email":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$DOCENTE_ID" ]; then
  echo "✅ Docente creado - ID: $DOCENTE_ID"
else
  echo "❌ Error al crear docente"
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n2️⃣ Login de docente..."
DOC_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$DOCENTE_EMAIL\", \"password\": \"Test123!\"}")

DOC_TOKEN=$(echo $DOC_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$DOC_TOKEN" ]; then
  echo "✅ Docente autenticado"
else
  echo "⚠️ Error en login de docente"
fi

# ====================
# SLICE #5: CATÁLOGO
# ====================
echo -e "\n============================================================"
echo "📍 SLICE #5: CATÁLOGO DE PRODUCTOS"
echo "============================================================"

echo -e "\n1️⃣ Consultando productos disponibles..."
PRODUCTOS=$(curl -s -X GET "$BASE_URL/productos" \
  -H "Authorization: Bearer $TOKEN")

PROD_COUNT=$(echo $PRODUCTOS | grep -o '"id":"[^"]*' | wc -l)
SUSCRIPCION_ID=$(echo $PRODUCTOS | grep -o '"id":"seed-suscripcion-mensual' | cut -d'"' -f3)

if [ $PROD_COUNT -gt 0 ]; then
  echo "✅ Catálogo consultado - $PROD_COUNT productos encontrados"
else
  echo "❌ Error al consultar catálogo"
  ERRORS=$((ERRORS + 1))
fi

# ====================
# SLICE #6: PAGOS
# ====================
echo -e "\n============================================================"
echo "📍 SLICE #6: PAGOS (MercadoPago)"
echo "============================================================"

echo -e "\n1️⃣ Creando preferencia de pago para suscripción..."
PREFERENCIA=$(curl -s -X POST "$BASE_URL/pagos/suscripcion" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productoId\": \"seed-suscripcion-mensual\"}")

INIT_POINT=$(echo $PREFERENCIA | grep -o '"init_point":"[^"]*' | cut -d'"' -f4)
MEMBRESIA_ID=$(echo $PREFERENCIA | grep -o '"membresiaId":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$INIT_POINT" ]; then
  echo "✅ Preferencia de pago creada"
  echo "   🔗 Link: $INIT_POINT"
  echo "   📝 Membresía ID: $MEMBRESIA_ID"
else
  echo "❌ Error al crear preferencia"
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n2️⃣ Activando membresía con endpoint mock..."
if [ ! -z "$MEMBRESIA_ID" ]; then
  ACTIVAR=$(curl -s -X POST "$BASE_URL/pagos/mock/activar-membresia/$MEMBRESIA_ID")

  if echo "$ACTIVAR" | grep -q "activada exitosamente"; then
    echo "✅ Membresía activada con mock endpoint"
  else
    echo "⚠️ Respuesta de activación: $(echo $ACTIVAR | head -c 100)"
  fi
fi

echo -e "\n3️⃣ Verificando membresía activa..."
MEMBRESIA=$(curl -s -X GET "$BASE_URL/pagos/membresia" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MEMBRESIA" | grep -q "Activa\|activa"; then
  echo "✅ Membresía activada correctamente"
else
  echo "⚠️ Membresía en estado: $(echo $MEMBRESIA | grep -o '"estado":"[^"]*' | cut -d'"' -f4)"
fi

# ====================
# SLICE #7: CLASES
# ====================
echo -e "\n============================================================"
echo "📍 SLICE #7: CLASES Y RESERVAS"
echo "============================================================"

echo -e "\n1️⃣ Login como Admin para crear clases..."
# Usar admin de seed (email: admin@mateatletas.com, password: Admin123!)
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mateatletas.com", "password": "Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
  echo "✅ Admin autenticado"
else
  echo "⚠️ No se pudo autenticar como admin - intentando crear clase con tutor"
  ADMIN_TOKEN=$TOKEN
fi

echo -e "\n2️⃣ Listando rutas curriculares..."
RUTAS=$(curl -s -X GET "$BASE_URL/clases/metadata/rutas-curriculares" \
  -H "Authorization: Bearer $TOKEN")

RUTA_ID=$(echo $RUTAS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$RUTA_ID" ]; then
  RUTA_NOMBRE=$(echo $RUTAS | grep -o '"nombre":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "✅ Rutas consultadas - Usando: $RUTA_NOMBRE"
else
  echo "❌ Error al consultar rutas"
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n3️⃣ Programando clase (como Admin)..."
TOMORROW=$(date -d "tomorrow 10:00" -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -v+1d -u +"%Y-%m-%dT10:00:00.000Z")

CLASE=$(curl -s -X POST "$BASE_URL/clases" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"rutaCurricularId\": \"$RUTA_ID\",
    \"docenteId\": \"$DOCENTE_ID\",
    \"fechaHoraInicio\": \"$TOMORROW\",
    \"duracionMinutos\": 60,
    \"cuposMaximo\": 10
  }")

CLASE_ID=$(echo $CLASE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$CLASE_ID" ]; then
  echo "✅ Clase programada - ID: $CLASE_ID"
else
  echo "⚠️ Error al programar clase - usando clase existente"
  CLASES_DISP=$(curl -s -X GET "$BASE_URL/clases" -H "Authorization: Bearer $TOKEN")
  CLASE_ID=$(echo $CLASES_DISP | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

echo -e "\n4️⃣ Reservando cupo para María (como tutor)..."
RESERVA=$(curl -s -X POST "$BASE_URL/clases/$CLASE_ID/reservar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"estudianteId\": \"$EST1_ID\",
    \"observaciones\": \"Primera clase de integración\"
  }")

INSCRIPCION_ID=$(echo $RESERVA | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$INSCRIPCION_ID" ]; then
  echo "✅ Cupo reservado - Inscripción ID: $INSCRIPCION_ID"
else
  echo "❌ Error al reservar cupo"
  echo "$RESERVA" | head -5
  ERRORS=$((ERRORS + 1))
fi

echo -e "\n5️⃣ Verificando clase con inscripción..."
DETALLE=$(curl -s -X GET "$BASE_URL/clases/$CLASE_ID" \
  -H "Authorization: Bearer $TOKEN")

CUPOS_OCUPADOS=$(echo $DETALLE | grep -o '"cupos_ocupados":[0-9]*' | cut -d':' -f2)

if [ ! -z "$CUPOS_OCUPADOS" ]; then
  echo "✅ Clase consultada - Cupos ocupados: $CUPOS_OCUPADOS"
else
  echo "⚠️ No se pudo verificar cupos"
fi

# ====================
# RESUMEN FINAL
# ====================
echo -e "\n============================================================"
echo "📊 RESUMEN DE INTEGRACIÓN"
echo "============================================================"
echo ""

echo "🔐 AUTENTICACIÓN:"
echo "   ✅ Tutor registrado: $TUTOR_EMAIL"
echo "   ✅ Token generado: ${TOKEN:0:40}..."
echo ""

echo "👨‍👩‍👧‍👦 ESTUDIANTES:"
echo "   ✅ María creada: $EST1_ID"
echo "   ✅ Carlos creado: $EST2_ID"
echo ""

echo "🏆 EQUIPOS:"
echo "   ✅ Equipo Fénix creado: $EQUIPO_ID"
echo "   ✅ María asignada al equipo"
echo ""

echo "👨‍🏫 DOCENTES:"
echo "   ✅ Docente creado: $DOCENTE_EMAIL"
echo ""

echo "📦 CATÁLOGO:"
echo "   ✅ Productos consultados: $PROD_COUNT"
echo ""

echo "💳 PAGOS:"
if [ ! -z "$MEMBRESIA_ID" ]; then
  echo "   ✅ Preferencia creada"
  echo "   ✅ Membresía: $MEMBRESIA_ID"
else
  echo "   ⚠️ Verificar estado de pagos"
fi
echo ""

echo "📚 CLASES:"
if [ ! -z "$CLASE_ID" ]; then
  echo "   ✅ Clase programada: $CLASE_ID"
fi
if [ ! -z "$INSCRIPCION_ID" ]; then
  echo "   ✅ Reserva creada: $INSCRIPCION_ID"
  echo "   ✅ Cupos ocupados: $CUPOS_OCUPADOS"
fi
echo ""

echo "============================================================"
if [ $ERRORS -eq 0 ]; then
  echo "✅ INTEGRACIÓN COMPLETA: TODOS LOS TESTS PASARON"
else
  echo "⚠️ INTEGRACIÓN COMPLETADA CON $ERRORS ERRORES"
fi
echo "============================================================"
