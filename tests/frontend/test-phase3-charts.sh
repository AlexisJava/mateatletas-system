#!/bin/bash

# Phase 3 Charts - Visual Testing Checklist
# Tests the advanced Recharts implementation

set -e

echo "=========================================="
echo "Phase 3 - Advanced Charts Testing"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
API_URL="http://localhost:3001"

echo -e "${BLUE}Pre-requisites:${NC}"
echo "1. Backend running on port 3001"
echo "2. Frontend running on port 3000"
echo "3. Admin user exists (admin@mateatletas.com)"
echo ""

# Login as admin
echo -e "\n${YELLOW}1️⃣ Logging in as Admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mateatletas.com",
    "password": "Admin123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"

# Fetch users
echo -e "\n${YELLOW}2️⃣ Fetching users data...${NC}"
USERS_RESPONSE=$(curl -s -X GET "$API_URL/admin/usuarios" \
  -H "Authorization: Bearer $TOKEN")

USER_COUNT=$(echo $USERS_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${GREEN}✅ Found $USER_COUNT users${NC}"

# Fetch classes
echo -e "\n${YELLOW}3️⃣ Fetching classes data...${NC}"
CLASSES_RESPONSE=$(curl -s -X GET "$API_URL/clases" \
  -H "Authorization: Bearer $TOKEN")

CLASS_COUNT=$(echo $CLASSES_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${GREEN}✅ Found $CLASS_COUNT classes${NC}"

# Fetch dashboard stats
echo -e "\n${YELLOW}4️⃣ Fetching dashboard stats...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ Dashboard stats fetched${NC}"

echo ""
echo "=========================================="
echo "Data Ready for Charts:"
echo "=========================================="
echo "Users: $USER_COUNT"
echo "Classes: $CLASS_COUNT"
echo ""

echo -e "${BLUE}=========================================="
echo "Manual Visual Testing Checklist"
echo "==========================================${NC}"
echo ""
echo "Navigate to: ${YELLOW}http://localhost:3000/admin/reportes${NC}"
echo ""

echo "📊 CHART 1: User Distribution Pie Chart"
echo "  [ ] Pie chart visible with 3 segments"
echo "  [ ] Blue segment = Tutores"
echo "  [ ] Purple segment = Docentes"
echo "  [ ] Red segment = Admins"
echo "  [ ] Percentages shown on each segment"
echo "  [ ] Legend below shows exact counts"
echo "  [ ] Hover shows tooltip with details"
echo "  [ ] Smooth animation on load (800ms)"
echo ""

echo "📊 CHART 2: Class Status Pie Chart"
echo "  [ ] Pie chart visible with 2 segments"
echo "  [ ] Green segment = Programadas"
echo "  [ ] Red segment = Canceladas"
echo "  [ ] Percentages shown on segments"
echo "  [ ] Legend shows exact counts"
echo "  [ ] Tooltip works on hover"
echo "  [ ] Animated entrance"
echo ""

echo "📈 CHART 3: User Growth Line Chart"
echo "  [ ] Line chart visible with 6 months"
echo "  [ ] X-axis shows months (Ene-Jun)"
echo "  [ ] Y-axis shows user counts"
echo "  [ ] Orange line (#ff6b35)"
echo "  [ ] Grid lines visible (dashed)"
echo "  [ ] Dots on each data point"
echo "  [ ] Hover shows tooltip"
echo "  [ ] Smooth curve (monotone)"
echo "  [ ] Animated line drawing (1000ms)"
echo ""

echo "📊 CHART 4: Classes by Route Bar Chart"
echo "  [ ] Bar chart visible (if routes exist)"
echo "  [ ] Purple bars (#8b5cf6)"
echo "  [ ] Rounded top corners"
echo "  [ ] X-axis labels angled (-45°)"
echo "  [ ] Y-axis shows class counts"
echo "  [ ] Hover shows tooltip"
echo "  [ ] Grid lines visible"
echo "  [ ] Animated bars (800ms)"
echo ""

echo "🔽 DATE RANGE FILTERS"
echo "  [ ] 'Filtros de Fecha' button visible"
echo "  [ ] Click button shows/hides filter panel"
echo "  [ ] Icon changes (🔽/🔼)"
echo "  [ ] Start date picker works"
echo "  [ ] End date picker works"
echo "  [ ] 'Último Mes' button works"
echo "  [ ] 'Últimos 6 Meses' button works"
echo "  [ ] Blue info box shows filtered counts"
echo "  [ ] Charts update when dates change"
echo "  [ ] Stats cards update when dates change"
echo ""

echo "📱 RESPONSIVE DESIGN"
echo "  [ ] Charts readable on mobile (< 768px)"
echo "  [ ] Charts readable on tablet (768-1024px)"
echo "  [ ] Charts readable on desktop (> 1024px)"
echo "  [ ] Filters stack properly on mobile"
echo "  [ ] No horizontal scrolling"
echo ""

echo "⚡ PERFORMANCE"
echo "  [ ] Charts load within 2 seconds"
echo "  [ ] No flickering or jank"
echo "  [ ] Smooth animations"
echo "  [ ] Tooltips appear instantly"
echo "  [ ] Filter changes are instant"
echo ""

echo "🎨 STYLING"
echo "  [ ] Charts match brand colors"
echo "  [ ] Consistent spacing and padding"
echo "  [ ] Professional appearance"
echo "  [ ] Text is readable"
echo "  [ ] No overlapping elements"
echo ""

echo -e "${GREEN}=========================================="
echo "Testing Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Note:${NC} This script validates data availability."
echo "Please perform manual visual checks using the checklist above."
echo ""
echo -e "${BLUE}Frontend URL:${NC} http://localhost:3000/admin/reportes"
echo ""
