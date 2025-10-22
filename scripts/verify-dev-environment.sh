#!/bin/bash
# =============================================================================
# Pre-flight Verification Script for Mateatletas Ecosystem
# =============================================================================
# Verifica que el entorno esté listo antes de iniciar los servidores de desarrollo
# Previene conflictos de puerto, errores de conexión a DB, y configuraciones incorrectas
# =============================================================================

set -e  # Exit on error

LOGFILE="infra_repair_2025-10-18.log"

echo "=================================================="
echo "🔍 PRE-FLIGHT VERIFICATION - Mateatletas Ecosystem"
echo "=================================================="
echo ""

ERRORS=0

# =============================================================================
# 1. Verificar que los puertos 3000 y 3001 estén libres
# =============================================================================
echo "1️⃣  Verificando puertos 3000 y 3001..."

if lsof -i :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ❌ ERROR: Puerto 3000 ya está en uso"
    lsof -i :3000 -sTCP:LISTEN
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ Puerto 3000 disponible"
fi

if lsof -i :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ❌ ERROR: Puerto 3001 ya está en uso"
    lsof -i :3001 -sTCP:LISTEN
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ Puerto 3001 disponible"
fi

echo ""

# =============================================================================
# 2. Verificar PostgreSQL en puerto 5432
# =============================================================================
echo "2️⃣  Verificando PostgreSQL en puerto 5432..."

if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h localhost -p 5432 -U mateatletas >/dev/null 2>&1; then
        echo "   ✅ PostgreSQL activo en puerto 5432"
    else
        echo "   ❌ ERROR: PostgreSQL no responde en puerto 5432"
        echo "   💡 Iniciar con: sudo systemctl start postgresql"
        ERRORS=$((ERRORS + 1))
    fi
else
    # Fallback si pg_isready no está instalado
    if nc -z localhost 5432 2>/dev/null || timeout 1 bash -c "echo >/dev/tcp/localhost/5432" 2>/dev/null; then
        echo "   ✅ PostgreSQL escuchando en puerto 5432"
    else
        echo "   ❌ ERROR: PostgreSQL no responde en puerto 5432"
        echo "   💡 Iniciar con: sudo systemctl start postgresql"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""

# =============================================================================
# 3. Verificar que DATABASE_URL apunte a :5432 (no :5433)
# =============================================================================
echo "3️⃣  Verificando DATABASE_URL en archivos .env..."

if [ -f .env ]; then
    if grep -q "localhost:5433" .env; then
        echo "   ❌ ERROR: .env apunta a :5433 (debe ser :5432)"
        grep DATABASE_URL .env
        ERRORS=$((ERRORS + 1))
    elif grep -q "localhost:5432" .env; then
        echo "   ✅ .env apunta correctamente a :5432"
    else
        echo "   ⚠️  WARNING: DATABASE_URL no encontrado en .env"
    fi
else
    echo "   ❌ ERROR: Archivo .env no existe"
    ERRORS=$((ERRORS + 1))
fi

if [ -f apps/api/.env ]; then
    if grep -q "localhost:5433" apps/api/.env; then
        echo "   ❌ ERROR: apps/api/.env apunta a :5433 (debe ser :5432)"
        grep DATABASE_URL apps/api/.env
        ERRORS=$((ERRORS + 1))
    elif grep -q "localhost:5432" apps/api/.env; then
        echo "   ✅ apps/api/.env apunta correctamente a :5432"
    else
        echo "   ⚠️  WARNING: DATABASE_URL no encontrado en apps/api/.env"
    fi
else
    echo "   ❌ ERROR: Archivo apps/api/.env no existe"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# =============================================================================
# 4. Verificar configuración de PORT en .env.local
# =============================================================================
echo "4️⃣  Verificando PORT en apps/web/.env.local..."

if [ -f apps/web/.env.local ]; then
    if grep -q "PORT=3000" apps/web/.env.local; then
        echo "   ✅ apps/web/.env.local configura PORT=3000"
    else
        echo "   ⚠️  WARNING: PORT no está configurado como 3000 en apps/web/.env.local"
    fi
else
    echo "   ⚠️  WARNING: apps/web/.env.local no existe (Next.js usará PORT del root .env)"
fi

echo ""

# =============================================================================
# 5. Verificar que no haya procesos zombie de intentos anteriores
# =============================================================================
echo "5️⃣  Verificando procesos Node.js activos..."

# Filtrar mejor: excluir electron, code, typescript, esbuild, etc.
NODE_COUNT=$(ps aux | grep -E "node|nest|next" | grep -v "grep" | grep -v "electron" | grep -v "/usr/lib/code" | grep -v "typescript" | grep -v "esbuild" | grep -v "fusermount" | wc -l)

if [ "$NODE_COUNT" -gt 10 ]; then
    echo "   ⚠️  WARNING: Detectados $NODE_COUNT procesos Node/Nest/Next"
    echo "   💡 Considerar ejecutar: killall -9 node (si hay errores de puerto)"
    echo "   💡 O ejecutar: lsof -ti:3000,3001 | xargs kill -9"
else
    echo "   ✅ Procesos Node.js bajo control ($NODE_COUNT procesos)"
fi

echo ""

# =============================================================================
# RESULTADO FINAL
# =============================================================================
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ PRE-FLIGHT CHECK PASSED - Listo para npm run dev"
    echo "=================================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Pre-flight check PASSED" >> "$LOGFILE"
    exit 0
else
    echo "❌ PRE-FLIGHT CHECK FAILED - $ERRORS errores detectados"
    echo "=================================================="
    echo "💡 Resolver los errores antes de ejecutar npm run dev"
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Pre-flight check FAILED ($ERRORS errors)" >> "$LOGFILE"
    exit 1
fi
