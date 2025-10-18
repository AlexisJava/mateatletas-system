#!/bin/bash
# =============================================================================
# Auto-Recovery Script for Mateatletas Ecosystem
# =============================================================================
# Limpia procesos zombie, libera puertos, y reinicia el stack de desarrollo
# Uso: ./scripts/auto-recover.sh
# =============================================================================

set -e

LOGFILE="infra_repair_2025-10-18.log"

echo "=================================================="
echo "🔧 AUTO-RECOVERY - Mateatletas Ecosystem"
echo "=================================================="
echo ""

# =============================================================================
# 1. Matar todos los procesos Node.js
# =============================================================================
echo "1️⃣  Matando procesos Node.js zombie..."

if pgrep -f "node" >/dev/null; then
    echo "   Procesos detectados:"
    ps aux | grep -E "node|nest|next" | grep -v "grep" | grep -v "VSCode" | grep -v "Electron" | awk '{print "      PID " $2 ": " $11 " " $12 " " $13}'

    killall -9 node 2>/dev/null || true
    sleep 2

    echo "   ✅ Procesos eliminados"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Killed all node processes" >> "$LOGFILE"
else
    echo "   ✅ No hay procesos Node.js activos"
fi

echo ""

# =============================================================================
# 2. Verificar que los puertos estén libres
# =============================================================================
echo "2️⃣  Verificando puertos 3000 y 3001..."

if lsof -i :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Puerto 3000 aún ocupado, forzando liberación..."
    lsof -i :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "   ✅ Puerto 3000 liberado"
else
    echo "   ✅ Puerto 3000 disponible"
fi

if lsof -i :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Puerto 3001 aún ocupado, forzando liberación..."
    lsof -i :3001 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "   ✅ Puerto 3001 liberado"
else
    echo "   ✅ Puerto 3001 disponible"
fi

echo ""

# =============================================================================
# 3. Verificar PostgreSQL
# =============================================================================
echo "3️⃣  Verificando PostgreSQL..."

if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h localhost -p 5432 -U mateatletas >/dev/null 2>&1; then
        echo "   ✅ PostgreSQL activo"
    else
        echo "   ⚠️  PostgreSQL no responde, intentando iniciar..."
        sudo systemctl start postgresql || echo "   ❌ No se pudo iniciar PostgreSQL automáticamente"
    fi
else
    if nc -z localhost 5432 2>/dev/null || timeout 1 bash -c "echo >/dev/tcp/localhost/5432" 2>/dev/null; then
        echo "   ✅ PostgreSQL escuchando"
    else
        echo "   ⚠️  PostgreSQL no responde en puerto 5432"
    fi
fi

echo ""

# =============================================================================
# 4. Limpiar archivos temporales y caché
# =============================================================================
echo "4️⃣  Limpiando archivos temporales..."

# Limpiar .next cache
if [ -d "apps/web/.next" ]; then
    rm -rf apps/web/.next
    echo "   ✅ Cache de Next.js eliminado"
fi

# Limpiar dist de NestJS
if [ -d "apps/api/dist" ]; then
    rm -rf apps/api/dist
    echo "   ✅ Dist de NestJS eliminado"
fi

echo ""

# =============================================================================
# 5. Ejecutar pre-flight check
# =============================================================================
echo "5️⃣  Ejecutando pre-flight check..."

if [ -f "scripts/verify-dev-environment.sh" ]; then
    chmod +x scripts/verify-dev-environment.sh
    if bash scripts/verify-dev-environment.sh; then
        echo "   ✅ Pre-flight check pasado"
    else
        echo "   ⚠️  Pre-flight check falló (ver detalles arriba)"
        exit 1
    fi
else
    echo "   ⚠️  Script de verificación no encontrado"
fi

echo ""

# =============================================================================
# 6. Reiniciar desarrollo
# =============================================================================
echo "=================================================="
echo "✅ AUTO-RECOVERY COMPLETADO"
echo "=================================================="
echo ""
echo "💡 Ahora puedes ejecutar:"
echo "   npm run dev"
echo ""
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Auto-recovery completed successfully" >> "$LOGFILE"

exit 0
