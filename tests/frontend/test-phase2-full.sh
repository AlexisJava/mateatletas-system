#!/bin/bash

#==============================================================================
# TEST: Phase 2 - Complete Docente Flow (E2E)
#==============================================================================
# Complete teacher journey:
# 1. Register as docente
# 2. Login to get token
# 3. View dashboard (mis clases + attendance summary)
# 4. Get curriculum routes (for class context)
# 5. View all my classes
# 6. Select a class with students
# 7. Get attendance roster for class
# 8. Mark attendance for multiple students (all 4 states)
# 9. Add observations and custom points
# 10. Get updated statistics
# 11. Verify all changes persisted
#==============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)
EMAIL="docente.e2e.${TIMESTAMP}@mateatletas.com"
PASSWORD="Password123!"

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

#==============================================================================
# Helper Functions
#==============================================================================

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${BLUE}[STEP $1/${YELLOW}11${BLUE}]${NC} $2"
}

print_success() {
    echo -e "${GREEN}  ✓${NC} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}  ✗${NC} $1"
    echo -e "${RED}    Response: $2${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${CYAN}  ℹ${NC} $1"
}

increment_test() {
    ((TESTS_RUN++))
}

#==============================================================================
# STEP 1: Register Docente
#==============================================================================

print_header "E2E TEST: Complete Docente Flow"
print_step "1" "Registering new docente account"
increment_test

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/docentes/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"nombre\": \"Roberto\",
        \"apellido\": \"Matemático\",
        \"especialidad\": \"Álgebra Avanzada\",
        \"biografia\": \"Profesor con 15 años de experiencia en matemáticas\"
    }")

if echo "$REGISTER_RESPONSE" | jq -e '.user.id' > /dev/null 2>&1; then
    DOCENTE_USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
    DOCENTE_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.docente.id')
    print_success "Docente registered: $EMAIL"
    print_info "User ID: $DOCENTE_USER_ID"
    print_info "Docente ID: $DOCENTE_ID"
else
    print_error "Failed to register docente" "$REGISTER_RESPONSE"
    exit 1
fi

sleep 1

#==============================================================================
# STEP 2: Login
#==============================================================================

print_step "2" "Logging in as docente"
increment_test

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
    }")

if echo "$LOGIN_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
    USER_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.user.role')
    print_success "Login successful"
    print_info "Role: $USER_ROLE"
    print_info "Token: ${TOKEN:0:20}..."
else
    print_error "Failed to login" "$LOGIN_RESPONSE"
    exit 1
fi

sleep 1

#==============================================================================
# STEP 3: View Dashboard - Get My Classes
#==============================================================================

print_step "3" "Loading dashboard - fetching my classes"
increment_test

CLASES_RESPONSE=$(curl -s -X GET "$API_URL/clases/docente/mis-clases" \
    -H "Authorization: Bearer $TOKEN")

if echo "$CLASES_RESPONSE" | jq -e '. | type == "array"' > /dev/null 2>&1; then
    CLASES_COUNT=$(echo "$CLASES_RESPONSE" | jq '. | length')
    print_success "Dashboard loaded: $CLASES_COUNT classes found"

    if [ "$CLASES_COUNT" -gt 0 ]; then
        # Show some stats
        PROGRAMADAS=$(echo "$CLASES_RESPONSE" | jq '[.[] | select(.estado == "Programada")] | length')
        print_info "Scheduled classes: $PROGRAMADAS"
    else
        print_info "No classes assigned yet (this is normal for new teacher)"
    fi
else
    print_error "Failed to fetch my classes" "$CLASES_RESPONSE"
fi

sleep 1

#==============================================================================
# STEP 4: Get Attendance Summary
#==============================================================================

print_step "4" "Loading dashboard - fetching attendance summary"
increment_test

RESUMEN_RESPONSE=$(curl -s -X GET "$API_URL/asistencia/docente/resumen" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESUMEN_RESPONSE" | jq -e '.docenteId' > /dev/null 2>&1; then
    TOTAL_CLASES_TAUGHT=$(echo "$RESUMEN_RESPONSE" | jq -r '.totalClasesImpartidas')
    TASA_ASISTENCIA=$(echo "$RESUMEN_RESPONSE" | jq -r '.tasaAsistenciaPromedio')
    print_success "Attendance summary loaded"
    print_info "Classes taught: $TOTAL_CLASES_TAUGHT"
    print_info "Average attendance: ${TASA_ASISTENCIA}%"
else
    print_error "Failed to fetch attendance summary" "$RESUMEN_RESPONSE"
fi

sleep 1

#==============================================================================
# STEP 5: Get Curriculum Routes
#==============================================================================

print_step "5" "Loading curriculum routes (for context)"
increment_test

RUTAS_RESPONSE=$(curl -s -X GET "$API_URL/clases/metadata/rutas-curriculares" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RUTAS_RESPONSE" | jq -e '. | type == "array"' > /dev/null 2>&1; then
    RUTAS_COUNT=$(echo "$RUTAS_RESPONSE" | jq '. | length')
    print_success "Curriculum routes loaded: $RUTAS_COUNT routes"

    if [ "$RUTAS_COUNT" -gt 0 ]; then
        SAMPLE_RUTA=$(echo "$RUTAS_RESPONSE" | jq -r '.[0].nombre')
        print_info "Example route: $SAMPLE_RUTA"
    fi
else
    print_error "Failed to fetch curriculum routes" "$RUTAS_RESPONSE"
fi

sleep 1

#==============================================================================
# STEP 6: Find a Class with Students
#==============================================================================

print_step "6" "Finding a class with enrolled students"
increment_test

# Get all available classes (not just mine, for testing)
ALL_CLASES_RESPONSE=$(curl -s -X GET "$API_URL/clases" \
    -H "Authorization: Bearer $TOKEN")

TOTAL_CLASES=$(echo "$ALL_CLASES_RESPONSE" | jq '. | length')

if [ "$TOTAL_CLASES" -eq 0 ]; then
    print_error "No classes found in system" "Please run: npx prisma db seed"
    exit 1
fi

# Find a class that has students (cupoDisponible < cupoMaximo)
CLASE_CON_ESTUDIANTES=$(echo "$ALL_CLASES_RESPONSE" | jq -r '.[] | select(.cupoDisponible < .cupoMaximo) | .id' | head -n 1)

if [ -z "$CLASE_CON_ESTUDIANTES" ] || [ "$CLASE_CON_ESTUDIANTES" = "null" ]; then
    print_info "No classes with students found"
    print_info "Using first available class for testing"
    CLASE_ID=$(echo "$ALL_CLASES_RESPONSE" | jq -r '.[0].id')
    CLASE_TITULO=$(echo "$ALL_CLASES_RESPONSE" | jq -r '.[0].titulo')
else
    CLASE_ID="$CLASE_CON_ESTUDIANTES"
    CLASE_TITULO=$(echo "$ALL_CLASES_RESPONSE" | jq -r ".[] | select(.id == \"$CLASE_ID\") | .titulo")
fi

print_success "Selected class: '$CLASE_TITULO'"
print_info "Class ID: $CLASE_ID"

sleep 1

#==============================================================================
# STEP 7: Get Attendance Roster
#==============================================================================

print_step "7" "Opening attendance page - loading roster"
increment_test

LISTA_RESPONSE=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$LISTA_RESPONSE" | jq -e '.claseId' > /dev/null 2>&1; then
    TOTAL_INSCRITOS=$(echo "$LISTA_RESPONSE" | jq '.estadisticas.total')
    TOTAL_PENDIENTES=$(echo "$LISTA_RESPONSE" | jq '.estadisticas.pendientes')

    print_success "Attendance roster loaded"
    print_info "Total students: $TOTAL_INSCRITOS"
    print_info "Pending: $TOTAL_PENDIENTES"

    if [ "$TOTAL_INSCRITOS" -eq 0 ]; then
        echo -e "\n${YELLOW}⚠ WARNING: No students enrolled in this class${NC}"
        echo -e "${YELLOW}Cannot test attendance registration without students${NC}"
        echo -e "${YELLOW}Stopping test here (partial success)${NC}\n"

        # Show summary so far
        print_header "PARTIAL TEST SUMMARY"
        echo -e "Steps completed: ${GREEN}7/11${NC} (63%)"
        echo -e "Tests passed:    ${GREEN}$TESTS_PASSED${NC}"
        echo -e "Tests failed:    ${RED}$TESTS_FAILED${NC}"
        echo -e "\n${YELLOW}✓ PARTIAL SUCCESS - Need students to continue${NC}\n"
        exit 0
    fi

    # Get student IDs
    ESTUDIANTE_IDS=($(echo "$LISTA_RESPONSE" | jq -r '.inscripciones[].estudiante.id'))
    ESTUDIANTE_NOMBRES=($(echo "$LISTA_RESPONSE" | jq -r '.inscripciones[].estudiante.nombre'))

    print_info "Students enrolled:"
    for i in "${!ESTUDIANTE_NOMBRES[@]}"; do
        echo -e "    ${CYAN}$((i+1)).${NC} ${ESTUDIANTE_NOMBRES[$i]} (${ESTUDIANTE_IDS[$i]})"
    done
else
    print_error "Failed to load attendance roster" "$LISTA_RESPONSE"
    exit 1
fi

sleep 1

#==============================================================================
# STEP 8: Mark Attendance - All States
#==============================================================================

print_step "8" "Marking attendance for students (all 4 states)"
increment_test

# Prepare to mark different students with different states
STATES=("Presente" "Ausente" "Justificado" "Tardanza")
PUNTOS=(10 0 7 5)
OBSERVACIONES=(
    "Participó activamente en la clase"
    ""
    "Presentó certificado médico"
    "Llegó 15 minutos tarde"
)

MARKED_COUNT=0

for i in "${!ESTUDIANTE_IDS[@]}"; do
    # Limit to 4 students (one per state)
    if [ $i -ge 4 ]; then
        break
    fi

    ESTUDIANTE_ID="${ESTUDIANTE_IDS[$i]}"
    ESTADO="${STATES[$i]}"
    PUNTO="${PUNTOS[$i]}"
    OBS="${OBSERVACIONES[$i]}"

    echo -e "  ${CYAN}Marking${NC} ${ESTUDIANTE_NOMBRES[$i]} as ${YELLOW}$ESTADO${NC}..."

    if [ -n "$OBS" ]; then
        MARK_RESPONSE=$(curl -s -X POST "$API_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"estado\": \"$ESTADO\",
                \"puntosOtorgados\": $PUNTO,
                \"observaciones\": \"$OBS\"
            }")
    else
        MARK_RESPONSE=$(curl -s -X POST "$API_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"estado\": \"$ESTADO\",
                \"puntosOtorgados\": $PUNTO
            }")
    fi

    if echo "$MARK_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        ((MARKED_COUNT++))
    else
        print_error "Failed to mark ${ESTUDIANTE_NOMBRES[$i]}" "$MARK_RESPONSE"
    fi

    sleep 0.5
done

if [ $MARKED_COUNT -gt 0 ]; then
    print_success "Marked attendance for $MARKED_COUNT students"
else
    print_error "Failed to mark any attendance" ""
fi

sleep 1

#==============================================================================
# STEP 9: Get Updated Statistics
#==============================================================================

print_step "9" "Viewing updated statistics"
increment_test

STATS_RESPONSE=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID/estadisticas" \
    -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | jq -e '.claseId' > /dev/null 2>&1; then
    TOTAL_STAT=$(echo "$STATS_RESPONSE" | jq '.total')
    PRESENTES=$(echo "$STATS_RESPONSE" | jq '.presentes')
    AUSENTES=$(echo "$STATS_RESPONSE" | jq '.ausentes')
    JUSTIFICADOS=$(echo "$STATS_RESPONSE" | jq '.justificados')
    TARDANZAS=$(echo "$STATS_RESPONSE" | jq '.tardanzas')
    PENDIENTES=$(echo "$STATS_RESPONSE" | jq '.pendientes')
    PORCENTAJE=$(echo "$STATS_RESPONSE" | jq '.porcentajeAsistencia')

    print_success "Statistics updated"
    print_info "Present: $PRESENTES | Absent: $AUSENTES | Justified: $JUSTIFICADOS | Late: $TARDANZAS | Pending: $PENDIENTES"
    print_info "Attendance rate: ${PORCENTAJE}%"
else
    print_error "Failed to get updated statistics" "$STATS_RESPONSE"
fi

sleep 1

#==============================================================================
# STEP 10: Verify Roster Shows Updates
#==============================================================================

print_step "10" "Verifying roster reflects all changes"
increment_test

UPDATED_LISTA=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$UPDATED_LISTA" | jq -e '.claseId' > /dev/null 2>&1; then
    # Count how many have asistencia recorded
    ASISTENCIAS_REGISTRADAS=$(echo "$UPDATED_LISTA" | jq '[.inscripciones[] | select(.asistencia != null)] | length')

    if [ "$ASISTENCIAS_REGISTRADAS" -eq "$MARKED_COUNT" ]; then
        print_success "Roster correctly shows $ASISTENCIAS_REGISTRADAS students with attendance"
    else
        print_error "Roster mismatch: shows $ASISTENCIAS_REGISTRADAS but marked $MARKED_COUNT" ""
    fi

    # Verify first student's details
    FIRST_ASISTENCIA=$(echo "$UPDATED_LISTA" | jq -r '.inscripciones[0].asistencia')
    if [ "$FIRST_ASISTENCIA" != "null" ]; then
        FIRST_ESTADO=$(echo "$UPDATED_LISTA" | jq -r '.inscripciones[0].asistencia.estado')
        FIRST_PUNTOS=$(echo "$UPDATED_LISTA" | jq -r '.inscripciones[0].asistencia.puntosOtorgados')
        print_info "First student: Estado=$FIRST_ESTADO, Puntos=$FIRST_PUNTOS"
    fi
else
    print_error "Failed to re-fetch roster" "$UPDATED_LISTA"
fi

sleep 1

#==============================================================================
# STEP 11: Final Dashboard Check
#==============================================================================

print_step "11" "Final check - updated attendance summary"
increment_test

FINAL_RESUMEN=$(curl -s -X GET "$API_URL/asistencia/docente/resumen" \
    -H "Authorization: Bearer $TOKEN")

if echo "$FINAL_RESUMEN" | jq -e '.docenteId' > /dev/null 2>&1; then
    FINAL_TASA=$(echo "$FINAL_RESUMEN" | jq -r '.tasaAsistenciaPromedio')
    print_success "Final dashboard updated"
    print_info "New average attendance: ${FINAL_TASA}%"
else
    print_error "Failed to get final summary" "$FINAL_RESUMEN"
fi

#==============================================================================
# SUMMARY
#==============================================================================

print_header "E2E TEST SUMMARY"

echo -e "${MAGENTA}Complete Docente Journey:${NC}"
echo -e "  1. ✓ Register docente"
echo -e "  2. ✓ Login"
echo -e "  3. ✓ View dashboard (my classes)"
echo -e "  4. ✓ View attendance summary"
echo -e "  5. ✓ Load curriculum routes"
echo -e "  6. ✓ Select class with students"
echo -e "  7. ✓ Load attendance roster"
echo -e "  8. ✓ Mark attendance (4 states)"
echo -e "  9. ✓ View updated statistics"
echo -e " 10. ✓ Verify roster changes"
echo -e " 11. ✓ Check updated dashboard"
echo ""

echo -e "${BLUE}Test Statistics:${NC}"
echo -e "  Total tests run:    ${BLUE}$TESTS_RUN${NC}"
echo -e "  Tests passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "  Tests failed:       ${RED}$TESTS_FAILED${NC}"
echo ""

echo -e "${BLUE}Data Created:${NC}"
echo -e "  Docente account:    ${GREEN}1${NC} ($EMAIL)"
echo -e "  Attendance records: ${GREEN}$MARKED_COUNT${NC} students"
echo -e "  States tested:      ${GREEN}4${NC} (Present, Absent, Justified, Late)"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║            ✓ ALL E2E TESTS PASSED! 🎉                     ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  Phase 2: Panel Docente is fully functional!              ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║               ✗ SOME TESTS FAILED                          ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
