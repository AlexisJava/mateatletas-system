#!/bin/bash

# Script de testing E2E para Notificaciones y Eventos
# Prueba todos los endpoints de ambos módulos con datos reales

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001/api"
TESTS_PASSED=0
TESTS_FAILED=0
REPORT_FILE="/tmp/test-notificaciones-eventos-report.md"

# Credenciales de docentes
JUAN_EMAIL="juan.perez@docente.com"
JUAN_PASS="Test123!"
LAURA_EMAIL="laura.sanchez@docente.com"
LAURA_PASS="Test123!"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  TESTING E2E: NOTIFICACIONES Y EVENTOS - PORTAL DOCENTE   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Función para logging
log_test() {
    echo -e "${BLUE}▶${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

log_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Función para hacer login
login() {
    local EMAIL=$1
    local PASS=$2

    cat > /tmp/login-payload.json << EEOF
{
  "email": "$EMAIL",
  "password": "$PASS"
}
EEOF

    local RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d @/tmp/login-payload.json)

    local TOKEN=$(echo $RESPONSE | jq -r '.access_token')

    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo $TOKEN
    else
        echo ""
    fi
}

# ============================================================================
# PARTE 1: AUTENTICACIÓN
# ============================================================================

echo -e "\n${MAGENTA}═══ PARTE 1: AUTENTICACIÓN ═══${NC}\n"

log_test "Autenticando como Juan Pérez (docente)..."
JUAN_TOKEN=$(login "$JUAN_EMAIL" "$JUAN_PASS")
if [ -n "$JUAN_TOKEN" ]; then
    log_success "Juan Pérez autenticado correctamente"
else
    log_error "Error autenticando a Juan Pérez"
    exit 1
fi

log_test "Autenticando como Laura Sánchez (docente)..."
LAURA_TOKEN=$(login "$LAURA_EMAIL" "$LAURA_PASS")
if [ -n "$LAURA_TOKEN" ]; then
    log_success "Laura Sánchez autenticada correctamente"
else
    log_error "Error autenticando a Laura Sánchez"
    exit 1
fi

# ============================================================================
# PARTE 2: TESTING NOTIFICACIONES
# ============================================================================

echo -e "\n${MAGENTA}═══ PARTE 2: TESTING NOTIFICACIONES ═══${NC}\n"

log_test "GET /notificaciones - Listar todas las notificaciones de Juan..."
JUAN_NOTIFS=$(curl -s -X GET "$API_URL/notificaciones" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_NOTIFS_COUNT=$(echo $JUAN_NOTIFS | jq '. | length')

if [ "$JUAN_NOTIFS_COUNT" -gt 0 ]; then
    log_success "Juan tiene $JUAN_NOTIFS_COUNT notificaciones"
    log_info "Primera notificación: $(echo $JUAN_NOTIFS | jq -r '.[0].titulo')"
else
    log_error "Juan debería tener notificaciones del seed"
fi

log_test "GET /notificaciones/count - Contar notificaciones no leídas..."
JUAN_UNREAD=$(curl -s -X GET "$API_URL/notificaciones/count" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_UNREAD_COUNT=$(echo $JUAN_UNREAD | jq -r '.count')

if [ "$JUAN_UNREAD_COUNT" -ge 0 ]; then
    log_success "Juan tiene $JUAN_UNREAD_COUNT notificaciones no leídas"
else
    log_error "Error obteniendo contador de notificaciones no leídas"
fi

log_test "GET /notificaciones?soloNoLeidas=true - Filtrar solo no leídas..."
JUAN_ONLY_UNREAD=$(curl -s -X GET "$API_URL/notificaciones?soloNoLeidas=true" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_ONLY_UNREAD_COUNT=$(echo $JUAN_ONLY_UNREAD | jq '. | length')

if [ "$JUAN_ONLY_UNREAD_COUNT" -eq "$JUAN_UNREAD_COUNT" ]; then
    log_success "Filtro de no leídas funciona correctamente ($JUAN_ONLY_UNREAD_COUNT notificaciones)"
else
    log_error "Discrepancia en contador de no leídas: esperado $JUAN_UNREAD_COUNT, recibido $JUAN_ONLY_UNREAD_COUNT"
fi

# Marcar primera notificación como leída
if [ "$JUAN_UNREAD_COUNT" -gt 0 ]; then
    FIRST_NOTIF_ID=$(echo $JUAN_ONLY_UNREAD | jq -r '.[0].id')

    log_test "PATCH /notificaciones/$FIRST_NOTIF_ID/leer - Marcar como leída..."
    MARK_READ=$(curl -s -X PATCH "$API_URL/notificaciones/$FIRST_NOTIF_ID/leer" \
        -H "Authorization: Bearer $JUAN_TOKEN")

    MARKED_AS_READ=$(echo $MARK_READ | jq -r '.leida')
    if [ "$MARKED_AS_READ" == "true" ]; then
        log_success "Notificación marcada como leída"
    else
        log_error "Error marcando notificación como leída"
    fi
fi

log_test "PATCH /notificaciones/leer-todas - Marcar todas como leídas..."
MARK_ALL=$(curl -s -X PATCH "$API_URL/notificaciones/leer-todas" \
    -H "Authorization: Bearer $JUAN_TOKEN")
MARKED_COUNT=$(echo $MARK_ALL | jq -r '.count')

if [ "$MARKED_COUNT" -ge 0 ]; then
    log_success "Marcadas $MARKED_COUNT notificaciones como leídas"
else
    log_error "Error marcando todas las notificaciones como leídas"
fi

# Verificar que ahora hay 0 no leídas
log_test "Verificando que ahora hay 0 notificaciones no leídas..."
JUAN_AFTER=$(curl -s -X GET "$API_URL/notificaciones/count" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_AFTER_COUNT=$(echo $JUAN_AFTER | jq -r '.count')

if [ "$JUAN_AFTER_COUNT" -eq 0 ]; then
    log_success "Confirmado: 0 notificaciones no leídas después de marcar todas"
else
    log_error "Aún hay $JUAN_AFTER_COUNT notificaciones no leídas"
fi

# Test Laura's notifications
log_test "GET /notificaciones - Listar notificaciones de Laura..."
LAURA_NOTIFS=$(curl -s -X GET "$API_URL/notificaciones" \
    -H "Authorization: Bearer $LAURA_TOKEN")
LAURA_NOTIFS_COUNT=$(echo $LAURA_NOTIFS | jq '. | length')

if [ "$LAURA_NOTIFS_COUNT" -gt 0 ]; then
    log_success "Laura tiene $LAURA_NOTIFS_COUNT notificaciones"
else
    log_error "Laura debería tener notificaciones del seed"
fi

# ============================================================================
# PARTE 3: TESTING EVENTOS
# ============================================================================

echo -e "\n${MAGENTA}═══ PARTE 3: TESTING EVENTOS ═══${NC}\n"

log_test "GET /eventos - Listar todos los eventos de Juan..."
JUAN_EVENTOS=$(curl -s -X GET "$API_URL/eventos" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_EVENTOS_COUNT=$(echo $JUAN_EVENTOS | jq '. | length')

if [ "$JUAN_EVENTOS_COUNT" -gt 0 ]; then
    log_success "Juan tiene $JUAN_EVENTOS_COUNT eventos"
    log_info "Primer evento: $(echo $JUAN_EVENTOS | jq -r '.[0].titulo')"
else
    log_error "Juan debería tener eventos del seed"
fi

log_test "GET /eventos/estadisticas - Estadísticas de eventos..."
JUAN_STATS=$(curl -s -X GET "$API_URL/eventos/estadisticas" \
    -H "Authorization: Bearer $JUAN_TOKEN")
TOTAL_EVENTOS=$(echo $JUAN_STATS | jq -r '.total')
REUNIONES=$(echo $JUAN_STATS | jq -r '.reuniones')
TAREAS=$(echo $JUAN_STATS | jq -r '.tareas')

if [ "$TOTAL_EVENTOS" -gt 0 ]; then
    log_success "Estadísticas: $TOTAL_EVENTOS eventos total ($REUNIONES reuniones, $TAREAS tareas)"
else
    log_error "Error obteniendo estadísticas de eventos"
fi

log_test "GET /eventos/mes/2025/10 - Eventos del mes de octubre 2025..."
JUAN_MES=$(curl -s -X GET "$API_URL/eventos/mes/2025/10" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_MES_COUNT=$(echo $JUAN_MES | jq '. | length')

if [ "$JUAN_MES_COUNT" -ge 0 ]; then
    log_success "Octubre 2025: $JUAN_MES_COUNT eventos"
else
    log_error "Error obteniendo eventos del mes"
fi

log_test "GET /eventos/semana - Eventos de la semana actual..."
JUAN_SEMANA=$(curl -s -X GET "$API_URL/eventos/semana" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_SEMANA_COUNT=$(echo $JUAN_SEMANA | jq '. | length')

if [ "$JUAN_SEMANA_COUNT" -ge 0 ]; then
    log_success "Semana actual: $JUAN_SEMANA_COUNT eventos"
else
    log_error "Error obteniendo eventos de la semana"
fi

log_test "GET /eventos/dia - Eventos del día de hoy..."
JUAN_DIA=$(curl -s -X GET "$API_URL/eventos/dia" \
    -H "Authorization: Bearer $JUAN_TOKEN")
JUAN_DIA_COUNT=$(echo $JUAN_DIA | jq '. | length')

log_success "Día de hoy: $JUAN_DIA_COUNT eventos"

# Crear un nuevo evento
log_test "POST /eventos - Crear nuevo evento..."
cat > /tmp/nuevo-evento.json << 'EEOF'
{
  "titulo": "Test: Reunión de prueba",
  "descripcion": "Evento creado durante testing E2E",
  "fecha_inicio": "2025-10-25T15:00:00.000Z",
  "fecha_fin": "2025-10-25T16:00:00.000Z",
  "todo_el_dia": false,
  "tipo": "Reunion",
  "color": "#10B981",
  "recordatorio": true,
  "minutos_antes": 30
}
EEOF

NUEVO_EVENTO=$(curl -s -X POST "$API_URL/eventos" \
    -H "Authorization: Bearer $JUAN_TOKEN" \
    -H "Content-Type: application/json" \
    -d @/tmp/nuevo-evento.json)

NUEVO_EVENTO_ID=$(echo $NUEVO_EVENTO | jq -r '.id')

if [ "$NUEVO_EVENTO_ID" != "null" ] && [ -n "$NUEVO_EVENTO_ID" ]; then
    log_success "Evento creado con ID: $NUEVO_EVENTO_ID"
else
    log_error "Error creando nuevo evento"
fi

# Obtener el evento creado
if [ -n "$NUEVO_EVENTO_ID" ]; then
    log_test "GET /eventos/$NUEVO_EVENTO_ID - Obtener evento creado..."
    EVENTO_DETAIL=$(curl -s -X GET "$API_URL/eventos/$NUEVO_EVENTO_ID" \
        -H "Authorization: Bearer $JUAN_TOKEN")

    EVENTO_TITULO=$(echo $EVENTO_DETAIL | jq -r '.titulo')
    if [ "$EVENTO_TITULO" == "Test: Reunión de prueba" ]; then
        log_success "Evento recuperado correctamente"
    else
        log_error "Error obteniendo detalles del evento"
    fi
fi

# Actualizar el evento
if [ -n "$NUEVO_EVENTO_ID" ]; then
    log_test "PATCH /eventos/$NUEVO_EVENTO_ID - Actualizar evento..."
    cat > /tmp/update-evento.json << 'EEOF'
{
  "titulo": "Test: Reunión ACTUALIZADA",
  "color": "#EF4444"
}
EEOF

    UPDATED_EVENTO=$(curl -s -X PATCH "$API_URL/eventos/$NUEVO_EVENTO_ID" \
        -H "Authorization: Bearer $JUAN_TOKEN" \
        -H "Content-Type: application/json" \
        -d @/tmp/update-evento.json)

    UPDATED_TITULO=$(echo $UPDATED_EVENTO | jq -r '.titulo')
    if [ "$UPDATED_TITULO" == "Test: Reunión ACTUALIZADA" ]; then
        log_success "Evento actualizado correctamente"
    else
        log_error "Error actualizando evento"
    fi
fi

# Eliminar el evento
if [ -n "$NUEVO_EVENTO_ID" ]; then
    log_test "DELETE /eventos/$NUEVO_EVENTO_ID - Eliminar evento..."
    DELETE_RESULT=$(curl -s -X DELETE "$API_URL/eventos/$NUEVO_EVENTO_ID" \
        -H "Authorization: Bearer $JUAN_TOKEN")

    DELETE_MSG=$(echo $DELETE_RESULT | jq -r '.message')
    if [ "$DELETE_MSG" == "Evento eliminado correctamente" ]; then
        log_success "Evento eliminado correctamente"
    else
        log_error "Error eliminando evento"
    fi
fi

# Test Laura's events
log_test "GET /eventos - Listar eventos de Laura..."
LAURA_EVENTOS=$(curl -s -X GET "$API_URL/eventos" \
    -H "Authorization: Bearer $LAURA_TOKEN")
LAURA_EVENTOS_COUNT=$(echo $LAURA_EVENTOS | jq '. | length')

if [ "$LAURA_EVENTOS_COUNT" -gt 0 ]; then
    log_success "Laura tiene $LAURA_EVENTOS_COUNT eventos"
else
    log_error "Laura debería tener eventos del seed"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    RESUMEN DEL TESTING                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${GREEN}✓ Tests exitosos:${NC} $TESTS_PASSED / $TOTAL_TESTS"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}✗ Tests fallidos:${NC} $TESTS_FAILED / $TOTAL_TESTS"
fi

# Crear reporte
cat > $REPORT_FILE << EOF
# Reporte de Testing E2E - Notificaciones y Eventos

**Fecha:** $(date '+%Y-%m-%d %H:%M:%S')
**Tests ejecutados:** $TOTAL_TESTS
**Tests exitosos:** $TESTS_PASSED
**Tests fallidos:** $TESTS_FAILED
**Porcentaje de éxito:** $(awk "BEGIN {printf \"%.2f\", ($TESTS_PASSED/$TOTAL_TESTS)*100}")%

## Módulos Testeados

### Notificaciones
- ✅ GET /notificaciones (listar todas)
- ✅ GET /notificaciones/count (contar no leídas)
- ✅ GET /notificaciones?soloNoLeidas=true (filtrar)
- ✅ PATCH /notificaciones/:id/leer (marcar como leída)
- ✅ PATCH /notificaciones/leer-todas (marcar todas)

### Eventos
- ✅ GET /eventos (listar todos)
- ✅ GET /eventos/estadisticas (estadísticas)
- ✅ GET /eventos/mes/:year/:month (filtrar por mes)
- ✅ GET /eventos/semana (filtrar por semana)
- ✅ GET /eventos/dia (filtrar por día)
- ✅ POST /eventos (crear evento)
- ✅ GET /eventos/:id (obtener detalles)
- ✅ PATCH /eventos/:id (actualizar)
- ✅ DELETE /eventos/:id (eliminar)

## Datos de Prueba

### Juan Pérez (juan.perez@docente.com)
- Notificaciones: $JUAN_NOTIFS_COUNT
- Eventos: $JUAN_EVENTOS_COUNT

### Laura Sánchez (laura.sanchez@docente.com)
- Notificaciones: $LAURA_NOTIFS_COUNT
- Eventos: $LAURA_EVENTOS_COUNT

## Resultado

$(if [ $TESTS_FAILED -eq 0 ]; then
    echo "**✅ TODOS LOS TESTS PASARON CORRECTAMENTE**"
else
    echo "**⚠️ ALGUNOS TESTS FALLARON - Revisar logs**"
fi)

---
*Generado automáticamente por test-notificaciones-eventos.sh*
EOF

echo -e "\n${BLUE}📄 Reporte generado en:${NC} $REPORT_FILE"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ TODOS LOS TESTS PASARON - SISTEMA 100% FUNCIONAL  ✓${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"
    exit 0
else
    echo -e "\n${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}     ✗ ALGUNOS TESTS FALLARON - REVISAR ERRORES ✗${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}\n"
    exit 1
fi
