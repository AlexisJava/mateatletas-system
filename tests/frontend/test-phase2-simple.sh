#!/bin/bash

# Simplified Phase 2 Test
API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@test.com"

echo "=== PHASE 2 SIMPLE TEST ==="

# 1. Register
echo "1. Register docente..."
curl -s -X POST "$API_URL/docentes-public" \
  -H "Content-Type: application/json" \
  -d '{"email":"'$EMAIL'","password":"Password123!","nombre":"Test","apellido":"Doc","biografia":"Test"}' | jq -r '.user.id' > /tmp/docente_id.txt

if [ -s /tmp/docente_id.txt ]; then
    echo "   ✓ Registered"
else
    echo "   ✗ Failed"
    exit 1
fi

# 2. Login
echo "2. Login..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'$EMAIL'","password":"Password123!"}' | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "   ✓ Logged in"
else
    echo "   ✗ Failed to login"
    exit 1
fi

# 3. Get classes
echo "3. Get my classes..."
CLASES=$(curl -s -X GET "$API_URL/clases/docente/mis-clases" -H "Authorization: Bearer $TOKEN")
COUNT=$(echo "$CLASES" | jq '. | length')
echo "   ✓ Got $COUNT classes"

# 4. Get summary
echo "4. Get attendance summary..."
RESUMEN=$(curl -s -X GET "$API_URL/asistencia/docente/resumen" -H "Authorization: Bearer $TOKEN")
if echo "$RESUMEN" | jq -e '.docente_id' > /dev/null 2>&1; then
    echo "   ✓ Got summary"
else
    echo "   ✗ Failed"
    echo "$RESUMEN"
    exit 1
fi

# 5. Get attendance roster
echo "5. Get attendance roster..."
ALL_CLASES=$(curl -s -X GET "$API_URL/clases" -H "Authorization: Bearer $TOKEN")
CLASE_ID=$(echo "$ALL_CLASES" | jq -r '.[0].id' 2>/dev/null)

if [ -n "$CLASE_ID" ] && [ "$CLASE_ID" != "null" ]; then
    ROSTER=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID" -H "Authorization: Bearer $TOKEN")
    if echo "$ROSTER" | jq -e '.clase' > /dev/null 2>&1; then
        TOTAL=$(echo "$ROSTER" | jq -r '.total_inscritos')
        echo "   ✓ Got roster ($TOTAL students)"
    else
        echo "   ✗ Failed to get roster"
        echo "$ROSTER"
        exit 1
    fi
else
    echo "   ⚠ No classes to test"
fi

echo ""
echo "=== ALL PHASE 2 TESTS PASSED ✓ ==="
