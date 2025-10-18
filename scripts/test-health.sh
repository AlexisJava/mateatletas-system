#!/bin/bash
# =============================================================================
# Health Check Test Script for Mateatletas Ecosystem
# =============================================================================
# Verifica que los health endpoints del backend estén respondiendo correctamente
# Uso: ./scripts/test-health.sh
# =============================================================================

set -e

LOGFILE="infra_repair_2025-10-18.log"

echo "=================================================="
echo "🏥 HEALTH CHECK TEST - Mateatletas Ecosystem"
echo "=================================================="
echo ""

ERRORS=0

# =============================================================================
# 1. Verificar que el backend esté escuchando en 3001
# =============================================================================
echo "1️⃣  Verificando que NestJS esté en puerto 3001..."

if lsof -i :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PROCESS=$(lsof -i :3001 -sTCP:LISTEN | tail -n 1 | awk '{print $1}')
    echo "   ✅ Proceso escuchando en 3001: $PROCESS"
else
    echo "   ❌ ERROR: No hay proceso escuchando en puerto 3001"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# =============================================================================
# 2. Test /api/health (Health Check Completo)
# =============================================================================
echo "2️⃣  Testing /api/health (health check completo)..."

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ GET /api/health → 200 OK"
    echo "$BODY" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'      Status: {d.get(\"status\", \"N/A\")}'); print(f'      Database: {d.get(\"details\", {}).get(\"database\", {}).get(\"status\", \"N/A\")}')" 2>/dev/null || echo "      Response: $BODY"
else
    echo "   ❌ GET /api/health → HTTP $HTTP_CODE"
    echo "      Response: $BODY"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# =============================================================================
# 3. Test /api/health/ready (Readiness Probe)
# =============================================================================
echo "3️⃣  Testing /api/health/ready (readiness probe)..."

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/health/ready 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ GET /api/health/ready → 200 OK"
    echo "$BODY" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'      Status: {d.get(\"status\", \"N/A\")}')" 2>/dev/null || echo "      Response: $BODY"
else
    echo "   ❌ GET /api/health/ready → HTTP $HTTP_CODE"
    echo "      Response: $BODY"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# =============================================================================
# 4. Test /api/health/live (Liveness Probe)
# =============================================================================
echo "4️⃣  Testing /api/health/live (liveness probe)..."

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/health/live 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ GET /api/health/live → 200 OK"
    echo "$BODY" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'      Status: {d.get(\"status\", \"N/A\")}'); print(f'      Uptime: {d.get(\"uptime\", \"N/A\")}s')" 2>/dev/null || echo "      Response: $BODY"
else
    echo "   ❌ GET /api/health/live → HTTP $HTTP_CODE"
    echo "      Response: $BODY"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# =============================================================================
# 5. Verificar Frontend en puerto 3000
# =============================================================================
echo "5️⃣  Verificando que Next.js esté en puerto 3000..."

if lsof -i :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PROCESS=$(lsof -i :3000 -sTCP:LISTEN | tail -n 1 | awk '{print $1}')
    echo "   ✅ Proceso escuchando en 3000: $PROCESS"
else
    echo "   ⚠️  WARNING: No hay proceso escuchando en puerto 3000"
fi

echo ""

# =============================================================================
# RESULTADO FINAL
# =============================================================================
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ HEALTH CHECKS PASSED - Sistema funcionando correctamente"
    echo "=================================================="
    echo ""
    echo "📊 Resumen:"
    echo "   • Backend (NestJS): http://localhost:3001/api"
    echo "   • Frontend (Next.js): http://localhost:3000"
    echo "   • Health endpoint: http://localhost:3001/api/health"
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Health checks PASSED" >> "$LOGFILE"
    exit 0
else
    echo "❌ HEALTH CHECKS FAILED - $ERRORS errores detectados"
    echo "=================================================="
    echo ""
    echo "💡 Verificar que los servidores estén corriendo:"
    echo "   ps aux | grep -E 'node|nest|next' | grep -v grep"
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Health checks FAILED ($ERRORS errors)" >> "$LOGFILE"
    exit 1
fi
