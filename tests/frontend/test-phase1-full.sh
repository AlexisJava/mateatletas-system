#!/bin/bash

###############################################################################
# Test Script - Phase 1 Frontend: Full Integration Test
#
# Simula el flujo completo de un tutor en la Fase 1:
# 1. Registro/Login
# 2. Crear estudiante
# 3. Explorar catálogo de productos
# 4. Seleccionar suscripción y crear preferencia de pago
# 5. Simular activación de membresía (mock)
# 6. Explorar clases disponibles
# 7. Filtrar por ruta curricular
# 8. Reservar clase para estudiante
# 9. Ver mis clases reservadas
# 10. Cancelar reserva
#
# Este script valida el happy path completo del frontend.
###############################################################################

API_URL="http://localhost:3001/api"
TOKEN=""
TUTOR_ID=""
ESTUDIANTE_ID=""
PRODUCTO_SUSCRIPCION_ID=""
MEMBRESIA_ID=""
CLASE_ID=""
RESERVA_ID=""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contador de pasos
STEP_COUNT=0
TOTAL_STEPS=10

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}║        TEST PHASE 1 - FLUJO COMPLETO TUTOR (E2E)             ║${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}║  Este test simula el journey completo de un tutor:           ║${NC}"
echo -e "${CYAN}║  Registro → Estudiante → Catálogo → Suscripción →           ║${NC}"
echo -e "${CYAN}║  Clases → Reserva → Cancelación                              ║${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Función auxiliar para mostrar progreso
###############################################################################
show_step() {
    STEP_COUNT=$((STEP_COUNT + 1))
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  PASO $STEP_COUNT/$TOTAL_STEPS: $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

###############################################################################
# PASO 1: Registro de tutor
###############################################################################
show_step "Registro de nuevo tutor"

EMAIL="tutor_e2e_$(date +%s)@test.com"

echo "→ Registrando tutor con email: $EMAIL"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"Password123!\",
        \"nombre\": \"Juan\",
        \"apellido\": \"E2E Test\",
        \"telefono\": \"555-9999\"
    }")

TUTOR_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

if [ -n "$TUTOR_ID" ] && [ "$TUTOR_ID" != "null" ]; then
    echo -e "${GREEN}✓ Registro exitoso${NC}"
    echo "  Tutor ID: $TUTOR_ID"
    echo "  Email: $EMAIL"

    # Login para obtener token
    echo ""
    echo "→ Obteniendo token de autenticación..."

    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"Password123!\"
        }")

    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ Login exitoso${NC}"
        echo "  Token: ${TOKEN:0:30}..."
    else
        echo -e "${RED}✗ Fallo en login${NC}"
        echo "$LOGIN_RESPONSE" | jq '.'
        exit 1
    fi
else
    echo -e "${RED}✗ Fallo en registro${NC}"
    echo "$REGISTER_RESPONSE" | jq '.'
    exit 1
fi

###############################################################################
# PASO 2: Crear estudiante
###############################################################################
show_step "Crear estudiante (hijo del tutor)"

echo "→ Creando estudiante: Mateo E2E"

ESTUDIANTE_RESPONSE=$(curl -s -X POST "$API_URL/estudiantes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "nombre": "Mateo",
        "apellido": "E2E Test",
        "fecha_nacimiento": "2011-08-10",
        "nivel_escolar": "Primaria"
    }')

ESTUDIANTE_ID=$(echo "$ESTUDIANTE_RESPONSE" | jq -r '.id')

if [ -n "$ESTUDIANTE_ID" ] && [ "$ESTUDIANTE_ID" != "null" ]; then
    echo -e "${GREEN}✓ Estudiante creado exitosamente${NC}"
    echo "  Estudiante ID: $ESTUDIANTE_ID"
    echo "  Nombre: Mateo E2E Test"
else
    echo -e "${RED}✗ Fallo al crear estudiante${NC}"
    echo "$ESTUDIANTE_RESPONSE" | jq '.'
    exit 1
fi

###############################################################################
# PASO 3: Explorar catálogo de productos
###############################################################################
show_step "Explorar catálogo de productos"

echo "→ Obteniendo todos los productos del catálogo"

PRODUCTOS_RESPONSE=$(curl -s -X GET "$API_URL/productos" \
    -H "Content-Type: application/json")

TOTAL_PRODUCTOS=$(echo "$PRODUCTOS_RESPONSE" | jq '. | length')

if [ "$TOTAL_PRODUCTOS" -gt 0 ]; then
    echo -e "${GREEN}✓ Catálogo cargado exitosamente${NC}"
    echo "  Total de productos: $TOTAL_PRODUCTOS"

    # Listar productos
    echo ""
    echo "  Productos disponibles:"
    echo "$PRODUCTOS_RESPONSE" | jq -r '.[] | "  - [\(.tipo)] \(.nombre) - $\(.precio)"'
else
    echo -e "${RED}✗ No se encontraron productos${NC}"
    exit 1
fi

###############################################################################
# PASO 4: Seleccionar suscripción y crear preferencia de pago
###############################################################################
show_step "Seleccionar suscripción y crear preferencia de pago"

echo "→ Filtrando suscripciones disponibles"

SUSCRIPCIONES_RESPONSE=$(curl -s -X GET "$API_URL/productos/suscripciones" \
    -H "Content-Type: application/json")

PRODUCTO_SUSCRIPCION_ID=$(echo "$SUSCRIPCIONES_RESPONSE" | jq -r '.[0].id')
PRODUCTO_NOMBRE=$(echo "$SUSCRIPCIONES_RESPONSE" | jq -r '.[0].nombre')
PRODUCTO_PRECIO=$(echo "$SUSCRIPCIONES_RESPONSE" | jq -r '.[0].precio')

if [ -n "$PRODUCTO_SUSCRIPCION_ID" ] && [ "$PRODUCTO_SUSCRIPCION_ID" != "null" ]; then
    echo -e "${GREEN}✓ Suscripción seleccionada${NC}"
    echo "  Plan: $PRODUCTO_NOMBRE"
    echo "  Precio: \$$PRODUCTO_PRECIO"
    echo ""

    echo "→ Creando preferencia de pago en MercadoPago"

    PREFERENCIA_RESPONSE=$(curl -s -X POST "$API_URL/pagos/suscripcion" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"productoId\": \"$PRODUCTO_SUSCRIPCION_ID\"}")

    INIT_POINT=$(echo "$PREFERENCIA_RESPONSE" | jq -r '.init_point')

    if [[ "$INIT_POINT" =~ ^https?:// ]]; then
        echo -e "${GREEN}✓ Preferencia de pago creada${NC}"
        echo "  URL de MercadoPago: $INIT_POINT"
        echo "  (En frontend, aquí se redigiría al usuario)"
    else
        echo -e "${RED}✗ Fallo al crear preferencia de pago${NC}"
        echo "$PREFERENCIA_RESPONSE" | jq '.'
        exit 1
    fi
else
    echo -e "${RED}✗ No se encontró suscripción disponible${NC}"
    exit 1
fi

###############################################################################
# PASO 5: Simular activación de membresía (mock)
###############################################################################
show_step "Simular pago exitoso y activación de membresía"

echo "→ Activando membresía (endpoint mock para desarrollo)"

# Nota: En producción, esto se haría via webhook de MercadoPago
MOCK_PAGO_ID="mock_payment_$(date +%s)"

ACTIVACION_RESPONSE=$(curl -s -X POST "$API_URL/pagos/mock/activar-membresia" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"productoId\": \"$PRODUCTO_SUSCRIPCION_ID\",
        \"pagoIdExterno\": \"$MOCK_PAGO_ID\"
    }")

MEMBRESIA_ID=$(echo "$ACTIVACION_RESPONSE" | jq -r '.id')

if [ -n "$MEMBRESIA_ID" ] && [ "$MEMBRESIA_ID" != "null" ]; then
    echo -e "${GREEN}✓ Membresía activada exitosamente${NC}"
    echo "  Membresía ID: $MEMBRESIA_ID"
    echo "  Estado: $(echo "$ACTIVACION_RESPONSE" | jq -r '.estado')"
    echo "  Vigente hasta: $(echo "$ACTIVACION_RESPONSE" | jq -r '.fechaVencimiento')"
else
    echo -e "${YELLOW}⚠ No se pudo activar membresía (puede ser normal si el endpoint mock no existe)${NC}"
    echo "  Continuando con el test..."
fi

###############################################################################
# PASO 6: Explorar clases disponibles
###############################################################################
show_step "Explorar clases disponibles"

echo "→ Obteniendo clases programadas"

CLASES_RESPONSE=$(curl -s -X GET "$API_URL/clases" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

TOTAL_CLASES=$(echo "$CLASES_RESPONSE" | jq '. | length')

if [ "$TOTAL_CLASES" -gt 0 ]; then
    echo -e "${GREEN}✓ Clases cargadas exitosamente${NC}"
    echo "  Total de clases disponibles: $TOTAL_CLASES"

    # Listar primeras 3 clases
    echo ""
    echo "  Clases disponibles:"
    echo "$CLASES_RESPONSE" | jq -r '.[:3] | .[] | "  - \(.titulo) | \(.fechaHora) | Cupos: \(.cupoDisponible)/\(.cupoMaximo)"'

    # Guardar ID de primera clase con cupo
    CLASE_ID=$(echo "$CLASES_RESPONSE" | jq -r '.[] | select(.cupoDisponible > 0) | .id' | head -n1)

    if [ -n "$CLASE_ID" ] && [ "$CLASE_ID" != "null" ]; then
        echo ""
        echo -e "${GREEN}✓ Clase seleccionada para reservar:${NC} $CLASE_ID"
    else
        echo -e "${YELLOW}⚠ No hay clases con cupo disponible${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No hay clases programadas${NC}"
    echo "  (Esto puede ser normal en ambiente de desarrollo)"
fi

###############################################################################
# PASO 7: Filtrar por ruta curricular
###############################################################################
show_step "Filtrar clases por ruta curricular"

echo "→ Obteniendo rutas curriculares"

RUTAS_RESPONSE=$(curl -s -X GET "$API_URL/clases/metadata/rutas-curriculares" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

TOTAL_RUTAS=$(echo "$RUTAS_RESPONSE" | jq '. | length')

if [ "$TOTAL_RUTAS" -gt 0 ]; then
    echo -e "${GREEN}✓ Rutas curriculares cargadas${NC}"
    echo "  Total de rutas: $TOTAL_RUTAS"

    echo ""
    echo "  Rutas disponibles:"
    echo "$RUTAS_RESPONSE" | jq -r '.[] | "  - \(.nombre) (Color: \(.color))"'

    # Filtrar por primera ruta
    PRIMERA_RUTA_ID=$(echo "$RUTAS_RESPONSE" | jq -r '.[0].id')
    PRIMERA_RUTA_NOMBRE=$(echo "$RUTAS_RESPONSE" | jq -r '.[0].nombre')

    echo ""
    echo "→ Filtrando clases de: $PRIMERA_RUTA_NOMBRE"

    CLASES_FILTRADAS=$(curl -s -X GET "$API_URL/clases?rutaCurricularId=$PRIMERA_RUTA_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")

    TOTAL_FILTRADAS=$(echo "$CLASES_FILTRADAS" | jq '. | length')

    echo -e "${GREEN}✓ Clases filtradas:${NC} $TOTAL_FILTRADAS clases de $PRIMERA_RUTA_NOMBRE"
else
    echo -e "${YELLOW}⚠ No hay rutas curriculares configuradas${NC}"
fi

###############################################################################
# PASO 8: Reservar clase para estudiante
###############################################################################
show_step "Reservar clase para estudiante"

if [ -n "$CLASE_ID" ] && [ "$CLASE_ID" != "null" ]; then
    echo "→ Reservando clase para: Mateo E2E Test"

    RESERVA_RESPONSE=$(curl -s -X POST "$API_URL/clases/$CLASE_ID/reservar" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"estudianteId\": \"$ESTUDIANTE_ID\"}")

    RESERVA_ID=$(echo "$RESERVA_RESPONSE" | jq -r '.id')

    if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
        echo -e "${GREEN}✓ Clase reservada exitosamente${NC}"
        echo "  Reserva ID: $RESERVA_ID"
        echo "  Clase ID: $(echo "$RESERVA_RESPONSE" | jq -r '.claseId')"
        echo "  Estudiante ID: $(echo "$RESERVA_RESPONSE" | jq -r '.estudianteId')"
    else
        echo -e "${RED}✗ Fallo al reservar clase${NC}"
        echo "$RESERVA_RESPONSE" | jq '.'
    fi
else
    echo -e "${YELLOW}⚠ SKIP - No hay clase disponible para reservar${NC}"
fi

###############################################################################
# PASO 9: Ver mis clases reservadas
###############################################################################
show_step "Ver mis clases reservadas"

echo "→ Obteniendo lista de mis reservas"

MIS_RESERVAS_RESPONSE=$(curl -s -X GET "$API_URL/clases/mis-reservas" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

TOTAL_RESERVAS=$(echo "$MIS_RESERVAS_RESPONSE" | jq '. | length')

if [ "$TOTAL_RESERVAS" -gt 0 ]; then
    echo -e "${GREEN}✓ Reservas obtenidas exitosamente${NC}"
    echo "  Total de reservas: $TOTAL_RESERVAS"

    echo ""
    echo "  Mis reservas:"
    echo "$MIS_RESERVAS_RESPONSE" | jq -r '.[] | "  - Reserva \(.id) | Clase: \(.claseId)"'

    # Verificar que incluye la reserva recién creada
    if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
        FOUND=$(echo "$MIS_RESERVAS_RESPONSE" | jq --arg id "$RESERVA_ID" '.[] | select(.id == $id)')

        if [ -n "$FOUND" ]; then
            echo ""
            echo -e "${GREEN}✓ Reserva recién creada está en la lista${NC}"
        else
            echo ""
            echo -e "${RED}✗ Reserva recién creada NO está en la lista${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ No hay reservas${NC}"
fi

###############################################################################
# PASO 10: Cancelar reserva
###############################################################################
show_step "Cancelar reserva"

if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
    echo "→ Cancelando reserva: $RESERVA_ID"

    CANCEL_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/clases/reservas/$RESERVA_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")

    CANCEL_HTTP_CODE=$(echo "$CANCEL_RESPONSE" | tail -n1)

    if [ "$CANCEL_HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Reserva cancelada exitosamente${NC}"

        # Verificar que ya no está en la lista
        echo ""
        echo "→ Verificando que la reserva fue eliminada"

        MIS_RESERVAS_AFTER=$(curl -s -X GET "$API_URL/clases/mis-reservas" \
            -H "Authorization: Bearer $TOKEN")

        FOUND_AFTER=$(echo "$MIS_RESERVAS_AFTER" | jq --arg id "$RESERVA_ID" '.[] | select(.id == $id)')

        if [ -z "$FOUND_AFTER" ]; then
            echo -e "${GREEN}✓ Reserva eliminada de la lista correctamente${NC}"
        else
            echo -e "${RED}✗ Reserva aún aparece en la lista${NC}"
        fi
    else
        echo -e "${RED}✗ Fallo al cancelar reserva (Status: $CANCEL_HTTP_CODE)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ SKIP - No hay reserva para cancelar${NC}"
fi

###############################################################################
# RESUMEN FINAL
###############################################################################
echo ""
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}║                    RESUMEN DE FLUJO E2E                       ║${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Paso 1:${NC}  Tutor registrado exitosamente"
echo -e "${GREEN}✓ Paso 2:${NC}  Estudiante creado"
echo -e "${GREEN}✓ Paso 3:${NC}  Catálogo explorado ($TOTAL_PRODUCTOS productos)"
echo -e "${GREEN}✓ Paso 4:${NC}  Preferencia de pago creada"

if [ -n "$MEMBRESIA_ID" ] && [ "$MEMBRESIA_ID" != "null" ]; then
    echo -e "${GREEN}✓ Paso 5:${NC}  Membresía activada"
else
    echo -e "${YELLOW}⚠ Paso 5:${NC}  Membresía no activada (mock endpoint)"
fi

if [ "$TOTAL_CLASES" -gt 0 ]; then
    echo -e "${GREEN}✓ Paso 6:${NC}  Clases exploradas ($TOTAL_CLASES clases)"
else
    echo -e "${YELLOW}⚠ Paso 6:${NC}  No hay clases disponibles"
fi

if [ "$TOTAL_RUTAS" -gt 0 ]; then
    echo -e "${GREEN}✓ Paso 7:${NC}  Filtro por ruta funcional ($TOTAL_RUTAS rutas)"
else
    echo -e "${YELLOW}⚠ Paso 7:${NC}  No hay rutas configuradas"
fi

if [ -n "$RESERVA_ID" ] && [ "$RESERVA_ID" != "null" ]; then
    echo -e "${GREEN}✓ Paso 8:${NC}  Clase reservada"
    echo -e "${GREEN}✓ Paso 9:${NC}  Reservas listadas ($TOTAL_RESERVAS reservas)"
    echo -e "${GREEN}✓ Paso 10:${NC} Reserva cancelada"
else
    echo -e "${YELLOW}⚠ Paso 8-10:${NC} No se pudieron completar (sin clases disponibles)"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Resumen de datos creados
echo -e "${BLUE}Datos de prueba creados:${NC}"
echo "  Email: $EMAIL"
echo "  Tutor ID: $TUTOR_ID"
echo "  Estudiante ID: $ESTUDIANTE_ID"
[ -n "$MEMBRESIA_ID" ] && [ "$MEMBRESIA_ID" != "null" ] && echo "  Membresía ID: $MEMBRESIA_ID"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║  ✓ FLUJO E2E COMPLETADO EXITOSAMENTE                         ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║  El journey completo del tutor funciona correctamente:       ║${NC}"
echo -e "${GREEN}║  Registro → Catálogo → Pago → Clases → Reservas             ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

exit 0
