#!/bin/bash

# Quick test for Phase 2
API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)
EMAIL="quick.docente.${TIMESTAMP}@test.com"
PASSWORD="Password123!"

echo "=== PHASE 2 QUICK TEST ==="
echo ""

# 1. Register docente
echo "1. Registering docente..."
REGISTER=$(curl -s -X POST "$API_URL/docentes-public" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"nombre\":\"Test\",\"apellido\":\"Docente\",\"especialidad\":\"Math\",\"biografia\":\"Test\"}")

if echo "$REGISTER" | jq -e '.user.id' > /dev/null 2>&1; then
    echo "   ✓ Docente registered"
else
    echo "   ✗ Failed to register"
    echo "$REGISTER"
    exit 1
fi

# 2. Login
echo "2. Logging in..."
LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN" | jq -r '.access_token')
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "   ✓ Login successful"
else
    echo "   ✗ Failed to login"
    echo "$LOGIN"
    exit 1
fi

# 3. Get my classes
echo "3. Getting my classes..."
CLASES=$(curl -s -X GET "$API_URL/clases/docente/mis-clases" \
    -H "Authorization: Bearer $TOKEN")

if echo "$CLASES" | jq -e '. | type == "array"' > /dev/null 2>&1; then
    COUNT=$(echo "$CLASES" | jq '. | length')
    echo "   ✓ Got $COUNT classes"
else
    echo "   ✗ Failed to get classes"
    echo "$CLASES"
    exit 1
fi

# 4. Get attendance summary
echo "4. Getting attendance summary..."
RESUMEN=$(curl -s -X GET "$API_URL/asistencia/docente/resumen" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESUMEN" | jq -e '.docenteId' > /dev/null 2>&1; then
    echo "   ✓ Got attendance summary"
else
    echo "   ✗ Failed to get summary"
    echo "$RESUMEN"
    exit 1
fi

# 5. Get a class and try attendance roster
echo "5. Testing attendance roster..."
TODAS_CLASES=$(curl -s -X GET "$API_URL/clases" -H "Authorization: Bearer $TOKEN")
CLASE_ID=$(echo "$TODAS_CLASES" | jq -r '.[0].id' 2>/dev/null)

if [ -n "$CLASE_ID" ] && [ "$CLASE_ID" != "null" ]; then
    ROSTER=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$ROSTER" | jq -e '.claseId' > /dev/null 2>&1; then
        echo "   ✓ Got attendance roster for class $CLASE_ID"
        TOTAL=$(echo "$ROSTER" | jq -r '.estadisticas.total')
        echo "   ℹ Total students: $TOTAL"
    else
        echo "   ✗ Failed to get roster"
        echo "$ROSTER"
        exit 1
    fi
else
    echo "   ⚠ No classes available to test roster"
fi

echo ""
echo "=== ALL TESTS PASSED ✓ ==="
echo ""
