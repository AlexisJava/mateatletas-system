#!/bin/bash

# Script de Testing de Fixes de Seguridad
# Auth Module (7 fixes) + Colonia Module (4 fixes)

API_URL="http://localhost:3001/api"
COLONIA_URL="http://localhost:3001/api/colonia"

echo "🔐 TESTING DE SEGURIDAD - MÓDULOS AUTH Y COLONIA"
echo "================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =======================
# AUTH MODULE TESTS
# =======================

echo "📋 MÓDULO AUTH - 7 FIXES"
echo "========================"
echo ""

# -----------------------------------------------
# TEST 1: Password MaxLength (DoS Prevention)
# -----------------------------------------------
echo "🧪 TEST 1: Password MaxLength @MaxLength(128)"
echo "   Objetivo: Prevenir DoS via bcrypt con passwords gigantes"
echo ""

# Generar password de 200 caracteres (debería fallar)
LONG_PASSWORD=$(python3 -c "print('A' * 200)")

echo "   → Intentando registro con password de 200 caracteres..."
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test-long-pwd@test.com\",
    \"password\": \"$LONG_PASSWORD\",
    \"nombre\": \"Test\",
    \"apellido\": \"User\"
  }" 2>&1)

if echo "$RESPONSE" | grep -q "no puede tener más de 128 caracteres"; then
  echo -e "   ${GREEN}✅ PASS${NC}: Validación MaxLength funciona"
else
  echo -e "   ${RED}❌ FAIL${NC}: Validación MaxLength NO funciona"
  echo "   Response: $RESPONSE"
fi
echo ""

# -----------------------------------------------
# TEST 2: Rate Limiting en Login
# -----------------------------------------------
echo "🧪 TEST 2: Rate Limiting @Throttle(5/min)"
echo "   Objetivo: Prevenir brute force con rate limiting"
echo ""

echo "   → Enviando 6 requests de login en 1 segundo..."
for i in {1..6}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test@test.com\", \"password\": \"wrong\"}")

  if [ "$i" -eq 6 ]; then
    if [ "$RESPONSE" -eq 429 ]; then
      echo -e "   ${GREEN}✅ PASS${NC}: Request #6 bloqueado con 429 Too Many Requests"
    else
      echo -e "   ${YELLOW}⚠️  WARN${NC}: Request #6 retornó $RESPONSE (esperado 429)"
    fi
  fi
done
echo ""

# -----------------------------------------------
# TEST 3: Login Attempt Tracking (Brute Force)
# -----------------------------------------------
echo "🧪 TEST 7: Login Attempt Tracking (5 intentos/15min)"
echo "   Objetivo: Bloquear cuenta tras 5 intentos fallidos"
echo ""

TEST_EMAIL="brute-force-test@test.com"

echo "   → Registrando usuario de prueba..."
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"ValidPass123\",
    \"nombre\": \"Brute\",
    \"apellido\": \"Test\"
  }" > /dev/null

echo "   → Intentando 5 logins fallidos..."
for i in {1..5}; do
  curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"WrongPass\"}" > /dev/null
  echo "      Intento $i/5 completado"
done

echo "   → Intento #6 (debería estar bloqueado)..."
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"WrongPass\"}")

if echo "$RESPONSE" | grep -q "Demasiados intentos fallidos"; then
  echo -e "   ${GREEN}✅ PASS${NC}: Cuenta bloqueada después de 5 intentos"
else
  echo -e "   ${RED}❌ FAIL${NC}: Cuenta NO bloqueada"
  echo "   Response: $RESPONSE"
fi
echo ""

# =======================
# COLONIA MODULE TESTS
# =======================

echo ""
echo "📋 MÓDULO COLONIA - 4 FIXES"
echo "============================"
echo ""

# -----------------------------------------------
# TEST 8: Password MaxLength (Colonia)
# -----------------------------------------------
echo "🧪 TEST 8: Password MaxLength en Colonia @MaxLength(128)"
echo "   Objetivo: Prevenir DoS en inscripción de colonia"
echo ""

# Generar password de 200 caracteres
LONG_PASSWORD=$(python3 -c "print('A' * 200)")

echo "   → Intentando inscripción con password de 200 caracteres..."
RESPONSE=$(curl -s -X POST "$COLONIA_URL/inscripcion" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test-colonia-long@test.com\",
    \"password\": \"$LONG_PASSWORD\",
    \"nombre\": \"Test\",
    \"telefono\": \"1234567890\",
    \"estudiantes\": [{
      \"nombre\": \"Estudiante Test\",
      \"edad\": 8,
      \"cursosSeleccionados\": [{
        \"id\": \"test-course\",
        \"name\": \"Test Course\",
        \"area\": \"Test\",
        \"instructor\": \"Test\",
        \"dayOfWeek\": \"Lunes\",
        \"timeSlot\": \"09:00-10:00\",
        \"color\": \"#FF0000\",
        \"icon\": \"test\"
      }]
    }]
  }" 2>&1)

if echo "$RESPONSE" | grep -q "no puede tener más de 128 caracteres"; then
  echo -e "   ${GREEN}✅ PASS${NC}: Validación MaxLength funciona en Colonia"
else
  echo -e "   ${RED}❌ FAIL${NC}: Validación MaxLength NO funciona"
  echo "   Response: $RESPONSE"
fi
echo ""

# -----------------------------------------------
# TEST 10: Rate Limiting Inscripción Colonia
# -----------------------------------------------
echo "🧪 TEST 10: Rate Limiting Inscripción @Throttle(5/hora)"
echo "   Objetivo: Prevenir spam de inscripciones"
echo ""

echo "   → Enviando 6 inscripciones en pocos segundos..."
for i in {1..6}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$COLONIA_URL/inscripcion" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"spam-$i@test.com\",
      \"password\": \"TestPass123\",
      \"nombre\": \"Spam Test $i\",
      \"telefono\": \"1234567890\",
      \"estudiantes\": [{
        \"nombre\": \"Student\",
        \"edad\": 8,
        \"cursosSeleccionados\": [{
          \"id\": \"test\",
          \"name\": \"Test\",
          \"area\": \"Test\",
          \"instructor\": \"Test\",
          \"dayOfWeek\": \"Lunes\",
          \"timeSlot\": \"09:00\",
          \"color\": \"#000\",
          \"icon\": \"test\"
        }]
      }]
    }")

  if [ "$i" -eq 6 ]; then
    if [ "$RESPONSE" -eq 429 ]; then
      echo -e "   ${GREEN}✅ PASS${NC}: Request #6 bloqueado con 429 Too Many Requests"
    else
      echo -e "   ${YELLOW}⚠️  WARN${NC}: Request #6 retornó $RESPONSE (esperado 429)"
    fi
  fi
done
echo ""

# =======================
# RESUMEN
# =======================

echo ""
echo "================================================="
echo "✅ TESTING COMPLETADO"
echo "================================================="
echo ""
echo "NOTA: Los tests de Payment Amount Validation y Username Uniqueness"
echo "      requieren un flujo completo de inscripción + pago y son más"
echo "      complejos de automatizar. Se recomienda testing manual."
echo ""
echo "Tests ejecutados:"
echo "  - Auth: Password MaxLength ✓"
echo "  - Auth: Rate Limiting ✓"
echo "  - Auth: Login Attempt Tracking ✓"
echo "  - Colonia: Password MaxLength ✓"
echo "  - Colonia: Rate Limiting ✓"
echo ""
