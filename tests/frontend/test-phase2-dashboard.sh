#!/bin/bash

#==============================================================================
# TEST: Phase 2 - Docente Dashboard
#==============================================================================
# Tests:
# 1. Docente registration
# 2. Docente login
# 3. Get teacher's classes
# 4. Get attendance summary
# 5. Get class details
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
EMAIL="docente.test.${TIMESTAMP}@mateatletas.com"
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
# TEST 1: Register Docente
#==============================================================================

print_header "TEST 1: Register Docente"
increment_test

print_test "1" "Registering new docente"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/docentes/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"nombre\": \"Carlos\",
        \"apellido\": \"Profesor\",
        \"especialidad\": \"Álgebra\",
        \"biografia\": \"Profesor con 10 años de experiencia\"
    }")

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | jq -e '.user.id' > /dev/null 2>&1; then
    DOCENTE_USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
    print_success "Docente registered with ID: $DOCENTE_USER_ID"
else
    print_error "Failed to register docente" "$REGISTER_RESPONSE"
    exit 1
fi

#==============================================================================
# TEST 2: Login Docente
#==============================================================================

print_header "TEST 2: Login Docente"
increment_test

print_test "2" "Logging in as docente"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
    }")

# Check if login was successful and token was returned
if echo "$LOGIN_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
    USER_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.user.role')
    print_success "Login successful, token obtained, role: $USER_ROLE"

    # Verify role is docente
    if [ "$USER_ROLE" = "docente" ]; then
        print_success "User role is docente (correct)"
    else
        print_error "User role is NOT docente (got: $USER_ROLE)" "$LOGIN_RESPONSE"
    fi
else
    print_error "Failed to login" "$LOGIN_RESPONSE"
    exit 1
fi

#==============================================================================
# TEST 3: Get Teacher's Classes
#==============================================================================

print_header "TEST 3: Get Teacher's Classes"
increment_test

print_test "3" "Fetching teacher's classes (mis-clases)"

CLASES_RESPONSE=$(curl -s -X GET "$API_URL/clases/docente/mis-clases" \
    -H "Authorization: Bearer $TOKEN")

# Check if response is an array
if echo "$CLASES_RESPONSE" | jq -e '. | type == "array"' > /dev/null 2>&1; then
    CLASES_COUNT=$(echo "$CLASES_RESPONSE" | jq '. | length')
    print_success "Got teacher's classes: $CLASES_COUNT classes"

    # Save first class ID if exists
    if [ "$CLASES_COUNT" -gt 0 ]; then
        FIRST_CLASE_ID=$(echo "$CLASES_RESPONSE" | jq -r '.[0].id')
        FIRST_CLASE_TITULO=$(echo "$CLASES_RESPONSE" | jq -r '.[0].titulo')
        print_success "First class: '$FIRST_CLASE_TITULO' (ID: $FIRST_CLASE_ID)"
    else
        echo -e "${YELLOW}⚠ Warning: No classes found for this teacher${NC}"
    fi
else
    print_error "Failed to get teacher's classes" "$CLASES_RESPONSE"
fi

#==============================================================================
# TEST 4: Get Attendance Summary
#==============================================================================

print_header "TEST 4: Get Attendance Summary"
increment_test

print_test "4" "Fetching teacher's attendance summary"

RESUMEN_RESPONSE=$(curl -s -X GET "$API_URL/asistencia/docente/resumen" \
    -H "Authorization: Bearer $TOKEN")

# Check if response has expected fields
if echo "$RESUMEN_RESPONSE" | jq -e '.docenteId' > /dev/null 2>&1; then
    TOTAL_CLASES=$(echo "$RESUMEN_RESPONSE" | jq -r '.totalClasesImpartidas')
    TASA_ASISTENCIA=$(echo "$RESUMEN_RESPONSE" | jq -r '.tasaAsistenciaPromedio')
    print_success "Got attendance summary: $TOTAL_CLASES classes taught, ${TASA_ASISTENCIA}% average attendance"
else
    print_error "Failed to get attendance summary" "$RESUMEN_RESPONSE"
fi

#==============================================================================
# TEST 5: Get Class Details (if exists)
#==============================================================================

print_header "TEST 5: Get Class Details"
increment_test

if [ -n "$FIRST_CLASE_ID" ]; then
    print_test "5" "Fetching details of class: $FIRST_CLASE_ID"

    CLASE_DETAIL_RESPONSE=$(curl -s -X GET "$API_URL/clases/$FIRST_CLASE_ID" \
        -H "Authorization: Bearer $TOKEN")

    # Check if response has expected fields
    if echo "$CLASE_DETAIL_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        CLASE_TITULO=$(echo "$CLASE_DETAIL_RESPONSE" | jq -r '.titulo')
        CLASE_ESTADO=$(echo "$CLASE_DETAIL_RESPONSE" | jq -r '.estado')
        CLASE_CUPO=$(echo "$CLASE_DETAIL_RESPONSE" | jq -r '.cupoMaximo')
        print_success "Class details: '$CLASE_TITULO', status: $CLASE_ESTADO, capacity: $CLASE_CUPO"
    else
        print_error "Failed to get class details" "$CLASE_DETAIL_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠ Skipping: No classes available to test${NC}"
    print_success "Test skipped (no classes available)"
fi

#==============================================================================
# TEST 6: Get Curriculum Routes
#==============================================================================

print_header "TEST 6: Get Curriculum Routes"
increment_test

print_test "6" "Fetching curriculum routes (for class creation)"

RUTAS_RESPONSE=$(curl -s -X GET "$API_URL/clases/metadata/rutas-curriculares" \
    -H "Authorization: Bearer $TOKEN")

# Check if response is an array
if echo "$RUTAS_RESPONSE" | jq -e '. | type == "array"' > /dev/null 2>&1; then
    RUTAS_COUNT=$(echo "$RUTAS_RESPONSE" | jq '. | length')
    print_success "Got curriculum routes: $RUTAS_COUNT routes"

    # Show first route
    if [ "$RUTAS_COUNT" -gt 0 ]; then
        FIRST_RUTA=$(echo "$RUTAS_RESPONSE" | jq -r '.[0].nombre')
        FIRST_RUTA_COLOR=$(echo "$RUTAS_RESPONSE" | jq -r '.[0].color')
        print_success "First route: '$FIRST_RUTA' (color: $FIRST_RUTA_COLOR)"
    fi
else
    print_error "Failed to get curriculum routes" "$RUTAS_RESPONSE"
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
