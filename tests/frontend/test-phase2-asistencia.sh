#!/bin/bash

#==============================================================================
# TEST: Phase 2 - Attendance Registration
#==============================================================================
# Tests:
# 1. Get attendance roster for a class
# 2. Mark student as Present
# 3. Mark student as Absent
# 4. Mark student as Justified
# 5. Mark student as Late
# 6. Update attendance with observations and points
# 7. Get class statistics
#==============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)
EMAIL="docente.asistencia.${TIMESTAMP}@mateatletas.com"
PASSWORD="Password123!"

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

#==============================================================================
# Helper Functions
#==============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}TEST $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    echo -e "${RED}  Response: $2${NC}"
    ((TESTS_FAILED++))
}

increment_test() {
    ((TESTS_RUN++))
}

#==============================================================================
# SETUP: Create Docente and Login
#==============================================================================

print_header "SETUP: Create Docente and Login"

echo "Creating docente account..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/docentes/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"nombre\": \"María\",
        \"apellido\": \"Docente\",
        \"especialidad\": \"Geometría\",
        \"biografia\": \"Profesora especializada en geometría\"
    }")

if ! echo "$REGISTER_RESPONSE" | jq -e '.user.id' > /dev/null 2>&1; then
    echo -e "${RED}Failed to create docente${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
    }")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}Failed to login${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Setup complete${NC}\n"

#==============================================================================
# Get a class with students
#==============================================================================

print_header "Finding a class with students"

# Get all classes
CLASES_RESPONSE=$(curl -s -X GET "$API_URL/clases" \
    -H "Authorization: Bearer $TOKEN")

TOTAL_CLASES=$(echo "$CLASES_RESPONSE" | jq '. | length')

if [ "$TOTAL_CLASES" -eq 0 ]; then
    echo -e "${RED}No classes found in the system${NC}"
    echo -e "${YELLOW}Please run backend seeds first: npx prisma db seed${NC}"
    exit 1
fi

# Try to find a class with available spots (meaning it might have students)
CLASE_ID=$(echo "$CLASES_RESPONSE" | jq -r '.[0].id')
CLASE_TITULO=$(echo "$CLASES_RESPONSE" | jq -r '.[0].titulo')

echo -e "${GREEN}✓ Found class: '$CLASE_TITULO' (ID: $CLASE_ID)${NC}\n"

#==============================================================================
# TEST 1: Get Attendance Roster
#==============================================================================

print_header "TEST 1: Get Attendance Roster"
increment_test

print_test "1" "Fetching attendance roster for class: $CLASE_ID"

LISTA_RESPONSE=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TOKEN")

# Check if response has expected structure
if echo "$LISTA_RESPONSE" | jq -e '.claseId' > /dev/null 2>&1; then
    TOTAL_INSCRITOS=$(echo "$LISTA_RESPONSE" | jq '.estadisticas.total')
    TOTAL_PENDIENTES=$(echo "$LISTA_RESPONSE" | jq '.estadisticas.pendientes')
    print_success "Got attendance roster: $TOTAL_INSCRITOS students enrolled, $TOTAL_PENDIENTES pending"

    # Save first student ID if exists
    if [ "$TOTAL_INSCRITOS" -gt 0 ]; then
        ESTUDIANTE_ID=$(echo "$LISTA_RESPONSE" | jq -r '.inscripciones[0].estudiante.id')
        ESTUDIANTE_NOMBRE=$(echo "$LISTA_RESPONSE" | jq -r '.inscripciones[0].estudiante.nombre')
        print_success "First student: $ESTUDIANTE_NOMBRE (ID: $ESTUDIANTE_ID)"
    else
        echo -e "${YELLOW}⚠ Warning: No students enrolled in this class${NC}"
    fi
else
    print_error "Failed to get attendance roster" "$LISTA_RESPONSE"
    exit 1
fi

# Exit if no students
if [ "$TOTAL_INSCRITOS" -eq 0 ]; then
    echo -e "\n${YELLOW}⚠ Cannot continue tests without students enrolled${NC}"
    echo -e "${YELLOW}Please create a tutor and reserve a spot in a class first${NC}\n"
    exit 0
fi

#==============================================================================
# TEST 2: Mark Student as Present
#==============================================================================

print_header "TEST 2: Mark Student as Present"
increment_test

print_test "2" "Marking student as Present (Presente)"

PRESENT_RESPONSE=$(curl -s -X POST "$API_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "estado": "Presente",
        "puntosOtorgados": 10
    }')

# Check if attendance was marked
if echo "$PRESENT_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    ASISTENCIA_ID=$(echo "$PRESENT_RESPONSE" | jq -r '.id')
    ESTADO=$(echo "$PRESENT_RESPONSE" | jq -r '.estado')
    PUNTOS=$(echo "$PRESENT_RESPONSE" | jq -r '.puntosOtorgados')
    print_success "Attendance marked: ID=$ASISTENCIA_ID, Estado=$ESTADO, Puntos=$PUNTOS"
else
    print_error "Failed to mark attendance" "$PRESENT_RESPONSE"
fi

#==============================================================================
# TEST 3: Update to Absent
#==============================================================================

print_header "TEST 3: Update Attendance to Absent"
increment_test

print_test "3" "Updating student attendance to Absent (Ausente)"

ABSENT_RESPONSE=$(curl -s -X POST "$API_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "estado": "Ausente",
        "puntosOtorgados": 0
    }')

# Check if attendance was updated
if echo "$ABSENT_RESPONSE" | jq -e '.estado' > /dev/null 2>&1; then
    ESTADO=$(echo "$ABSENT_RESPONSE" | jq -r '.estado')
    PUNTOS=$(echo "$ABSENT_RESPONSE" | jq -r '.puntosOtorgados')

    if [ "$ESTADO" = "Ausente" ]; then
        print_success "Attendance updated: Estado=$ESTADO, Puntos=$PUNTOS"
    else
        print_error "Estado was not updated correctly (got: $ESTADO)" "$ABSENT_RESPONSE"
    fi
else
    print_error "Failed to update attendance" "$ABSENT_RESPONSE"
fi

#==============================================================================
# TEST 4: Update to Justified
#==============================================================================

print_header "TEST 4: Update Attendance to Justified"
increment_test

print_test "4" "Updating student attendance to Justified (Justificado)"

JUSTIFIED_RESPONSE=$(curl -s -X POST "$API_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "estado": "Justificado",
        "puntosOtorgados": 7,
        "observaciones": "Certificado médico presentado"
    }')

# Check if attendance was updated
if echo "$JUSTIFIED_RESPONSE" | jq -e '.estado' > /dev/null 2>&1; then
    ESTADO=$(echo "$JUSTIFIED_RESPONSE" | jq -r '.estado')
    PUNTOS=$(echo "$JUSTIFIED_RESPONSE" | jq -r '.puntosOtorgados')
    OBSERVACIONES=$(echo "$JUSTIFIED_RESPONSE" | jq -r '.observaciones')

    if [ "$ESTADO" = "Justificado" ]; then
        print_success "Attendance updated: Estado=$ESTADO, Puntos=$PUNTOS"
        print_success "Observations: $OBSERVACIONES"
    else
        print_error "Estado was not updated correctly (got: $ESTADO)" "$JUSTIFIED_RESPONSE"
    fi
else
    print_error "Failed to update attendance" "$JUSTIFIED_RESPONSE"
fi

#==============================================================================
# TEST 5: Update to Late (Tardanza)
#==============================================================================

print_header "TEST 5: Update Attendance to Late"
increment_test

print_test "5" "Updating student attendance to Late (Tardanza)"

LATE_RESPONSE=$(curl -s -X POST "$API_URL/asistencia/clases/$CLASE_ID/estudiantes/$ESTUDIANTE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "estado": "Tardanza",
        "puntosOtorgados": 5,
        "observaciones": "Llegó 10 minutos tarde"
    }')

# Check if attendance was updated
if echo "$LATE_RESPONSE" | jq -e '.estado' > /dev/null 2>&1; then
    ESTADO=$(echo "$LATE_RESPONSE" | jq -r '.estado')
    PUNTOS=$(echo "$LATE_RESPONSE" | jq -r '.puntosOtorgados')

    if [ "$ESTADO" = "Tardanza" ]; then
        print_success "Attendance updated: Estado=$ESTADO, Puntos=$PUNTOS"
    else
        print_error "Estado was not updated correctly (got: $ESTADO)" "$LATE_RESPONSE"
    fi
else
    print_error "Failed to update attendance" "$LATE_RESPONSE"
fi

#==============================================================================
# TEST 6: Get Updated Statistics
#==============================================================================

print_header "TEST 6: Get Updated Class Statistics"
increment_test

print_test "6" "Fetching updated attendance statistics"

STATS_RESPONSE=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID/estadisticas" \
    -H "Authorization: Bearer $TOKEN")

# Check if statistics were returned
if echo "$STATS_RESPONSE" | jq -e '.claseId' > /dev/null 2>&1; then
    TOTAL=$(echo "$STATS_RESPONSE" | jq '.total')
    TARDANZAS=$(echo "$STATS_RESPONSE" | jq '.tardanzas')
    PENDIENTES=$(echo "$STATS_RESPONSE" | jq '.pendientes')
    PORCENTAJE=$(echo "$STATS_RESPONSE" | jq '.porcentajeAsistencia')

    print_success "Statistics: $TOTAL students, $TARDANZAS late, $PENDIENTES pending, ${PORCENTAJE}% attendance"
else
    print_error "Failed to get statistics" "$STATS_RESPONSE"
fi

#==============================================================================
# TEST 7: Verify Roster Updated
#==============================================================================

print_header "TEST 7: Verify Roster Shows Updated Attendance"
increment_test

print_test "7" "Re-fetching roster to verify changes"

UPDATED_LISTA=$(curl -s -X GET "$API_URL/asistencia/clases/$CLASE_ID" \
    -H "Authorization: Bearer $TOKEN")

# Check first student's attendance
FIRST_ESTUDIANTE_ESTADO=$(echo "$UPDATED_LISTA" | jq -r '.inscripciones[0].asistencia.estado')

if [ "$FIRST_ESTUDIANTE_ESTADO" = "Tardanza" ]; then
    print_success "Roster correctly shows student as: $FIRST_ESTUDIANTE_ESTADO"
else
    print_error "Roster shows incorrect status: $FIRST_ESTUDIANTE_ESTADO (expected: Tardanza)" "$UPDATED_LISTA"
fi

#==============================================================================
# SUMMARY
#==============================================================================

print_header "TEST SUMMARY"

echo -e "Total tests run:    ${BLUE}$TESTS_RUN${NC}"
echo -e "Tests passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed:       ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ ALL TESTS PASSED!${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ SOME TESTS FAILED${NC}\n"
    exit 1
fi
