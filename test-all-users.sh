#!/bin/bash

# Script de prueba exhaustiva de todos los usuarios y flujos
# Detecta discrepancias y problemas en el portal tutor

API="http://localhost:3001/api"
DISCREPANCIAS=()

echo "🧪 PRUEBAS EXHAUSTIVAS DE USUARIOS - PORTAL TUTOR"
echo "=================================================="
echo ""

# Función para agregar discrepancia
add_discrepancia() {
    DISCREPANCIAS+=("❌ $1")
}

# Función para mensaje de éxito
success() {
    echo "✅ $1"
}

# Función para hacer request y mostrar resultado
test_endpoint() {
    local METHOD=$1
    local ENDPOINT=$2
    local TOKEN=$3
    local DATA=$4
    local DESCRIPTION=$5

    echo "📡 Testing: $DESCRIPTION"

    if [ "$METHOD" == "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API$ENDPOINT")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$DATA" "$API$ENDPOINT")
    fi

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
        success "$DESCRIPTION (HTTP $HTTP_CODE)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        add_discrepancia "$DESCRIPTION - HTTP $HTTP_CODE - $BODY"
        echo "❌ Error: HTTP $HTTP_CODE"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  PRUEBAS DE ADMIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login Admin
ADMIN_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mateatletas.com","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.access_token')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    success "Admin login exitoso"

    # Probar endpoints de admin
    test_endpoint "GET" "/admin/dashboard" "$ADMIN_TOKEN" "" "Dashboard Admin"
    test_endpoint "GET" "/admin/estadisticas" "$ADMIN_TOKEN" "" "Estadísticas Admin"
    test_endpoint "GET" "/admin/usuarios" "$ADMIN_TOKEN" "" "Listar usuarios"
    test_endpoint "GET" "/estudiantes/admin/all" "$ADMIN_TOKEN" "" "Listar TODOS los estudiantes"
    test_endpoint "GET" "/pagos/admin/all" "$ADMIN_TOKEN" "" "Listar TODOS los pagos"
    test_endpoint "GET" "/admin/alertas" "$ADMIN_TOKEN" "" "Listar alertas"
else
    add_discrepancia "Admin login falló - Token: $ADMIN_TOKEN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  PRUEBAS DE TUTOR 1 - MARÍA GONZÁLEZ (Completo)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login María
MARIA_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.gonzalez@test.com","password":"Test123!"}')

MARIA_TOKEN=$(echo $MARIA_LOGIN | jq -r '.access_token')
MARIA_USER=$(echo $MARIA_LOGIN | jq -r '.user')

if [ "$MARIA_TOKEN" != "null" ] && [ -n "$MARIA_TOKEN" ]; then
    success "María login exitoso"
    echo "Usuario: $MARIA_USER" | jq '.'

    # Verificar onboarding
    ONBOARDING=$(echo $MARIA_USER | jq -r '.ha_completado_onboarding')
    if [ "$ONBOARDING" == "true" ]; then
        success "Onboarding completado correctamente"
    else
        add_discrepancia "María debería tener onboarding completado pero es: $ONBOARDING"
    fi

    # Probar endpoints de tutor
    test_endpoint "GET" "/auth/profile" "$MARIA_TOKEN" "" "Perfil de María"
    test_endpoint "GET" "/estudiantes" "$MARIA_TOKEN" "" "Listar estudiantes de María"
    test_endpoint "GET" "/estudiantes/count" "$MARIA_TOKEN" "" "Contar estudiantes de María"
    test_endpoint "GET" "/pagos/membresia" "$MARIA_TOKEN" "" "Membresía de María"
    test_endpoint "GET" "/clases" "$MARIA_TOKEN" "" "Clases disponibles para María"
    test_endpoint "GET" "/equipos" "$MARIA_TOKEN" "" "Listar equipos"
    test_endpoint "GET" "/productos" "$MARIA_TOKEN" "" "Catálogo de productos"

else
    add_discrepancia "María login falló - Token: $MARIA_TOKEN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  PRUEBAS DE TUTOR 2 - CARLOS RODRÍGUEZ (Onboarding)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login Carlos
CARLOS_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.rodriguez@test.com","password":"Test123!"}')

CARLOS_TOKEN=$(echo $CARLOS_LOGIN | jq -r '.access_token')
CARLOS_USER=$(echo $CARLOS_LOGIN | jq -r '.user')

if [ "$CARLOS_TOKEN" != "null" ] && [ -n "$CARLOS_TOKEN" ]; then
    success "Carlos login exitoso"
    echo "Usuario: $CARLOS_USER" | jq '.'

    # Verificar onboarding
    ONBOARDING=$(echo $CARLOS_USER | jq -r '.ha_completado_onboarding')
    if [ "$ONBOARDING" == "false" ]; then
        success "Onboarding pendiente correctamente"
    else
        add_discrepancia "Carlos debería tener onboarding pendiente pero es: $ONBOARDING"
    fi

    # Probar endpoints básicos
    test_endpoint "GET" "/estudiantes" "$CARLOS_TOKEN" "" "Listar estudiantes de Carlos (debería estar vacío)"
    test_endpoint "GET" "/pagos/membresia" "$CARLOS_TOKEN" "" "Membresía de Carlos (no debería tener)"

else
    add_discrepancia "Carlos login falló - Token: $CARLOS_TOKEN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  PRUEBAS DE TUTOR 3 - ANA MARTÍNEZ (Membresía vencida)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login Ana
ANA_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.martinez@test.com","password":"Test123!"}')

ANA_TOKEN=$(echo $ANA_LOGIN | jq -r '.access_token')
ANA_USER=$(echo $ANA_LOGIN | jq -r '.user')

if [ "$ANA_TOKEN" != "null" ] && [ -n "$ANA_TOKEN" ]; then
    success "Ana login exitoso"

    # Probar membresía
    test_endpoint "GET" "/pagos/membresia" "$ANA_TOKEN" "" "Membresía de Ana (debería estar Atrasada)"
    test_endpoint "GET" "/estudiantes" "$ANA_TOKEN" "" "Estudiantes de Ana"
    test_endpoint "GET" "/clases" "$ANA_TOKEN" "" "Clases para Ana"

else
    add_discrepancia "Ana login falló - Token: $ANA_TOKEN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  PRUEBAS DE DOCENTE 1 - JUAN PÉREZ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login Juan
JUAN_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@docente.com","password":"Test123!"}')

JUAN_TOKEN=$(echo $JUAN_LOGIN | jq -r '.access_token')

if [ "$JUAN_TOKEN" != "null" ] && [ -n "$JUAN_TOKEN" ]; then
    success "Juan (docente) login exitoso"

    test_endpoint "GET" "/docentes/me" "$JUAN_TOKEN" "" "Perfil de Juan"
    test_endpoint "GET" "/clases/docente/mis-clases" "$JUAN_TOKEN" "" "Clases de Juan"

else
    add_discrepancia "Juan (docente) login falló"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  PRUEBAS DE DOCENTE 2 - LAURA SÁNCHEZ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login Laura
LAURA_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"laura.sanchez@docente.com","password":"Test123!"}')

LAURA_TOKEN=$(echo $LAURA_LOGIN | jq -r '.access_token')

if [ "$LAURA_TOKEN" != "null" ] && [ -n "$LAURA_TOKEN" ]; then
    success "Laura (docente) login exitoso"

    test_endpoint "GET" "/docentes/me" "$LAURA_TOKEN" "" "Perfil de Laura"
    test_endpoint "GET" "/clases/docente/mis-clases" "$LAURA_TOKEN" "" "Clases de Laura"

else
    add_discrepancia "Laura (docente) login falló"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  PRUEBAS DE ESTUDIANTE - SOFÍA GONZÁLEZ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login Sofía
SOFIA_LOGIN=$(curl -s -X POST "$API/auth/estudiante/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"sofia.gonzalez@estudiante.com","password":"Test123!"}')

SOFIA_TOKEN=$(echo $SOFIA_LOGIN | jq -r '.access_token')

if [ "$SOFIA_TOKEN" != "null" ] && [ -n "$SOFIA_TOKEN" ]; then
    success "Sofía (estudiante) login exitoso"

    test_endpoint "GET" "/auth/profile" "$SOFIA_TOKEN" "" "Perfil de Sofía"

else
    add_discrepancia "Sofía (estudiante) login falló"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE DISCREPANCIAS ENCONTRADAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#DISCREPANCIAS[@]} -eq 0 ]; then
    echo "✅ ¡NO SE ENCONTRARON DISCREPANCIAS!"
    echo "✨ Todos los flujos funcionan correctamente"
else
    echo "Se encontraron ${#DISCREPANCIAS[@]} discrepancias:"
    echo ""
    for discrepancia in "${DISCREPANCIAS[@]}"; do
        echo "$discrepancia"
    done
fi

echo ""
echo "🏁 Pruebas completadas"
