#!/bin/bash

# Script de reinicio limpio para desarrollo Mateatletas Ecosystem
# Limpia procesos zombies y reinicia backend + frontend con health checks

# Función para esperar a que un puerto esté disponible
wait_for_port() {
  local port=$1
  local timeout=$2
  local elapsed=0

  while [ $elapsed -lt $timeout ]; do
    if lsof -ti:$port > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  return 1
}

# Función para verificar health del backend
wait_for_backend_health() {
  local timeout=$1
  local elapsed=0

  while [ $elapsed -lt $timeout ]; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  return 1
}

echo "🧹 Limpiando procesos zombies..."

# 1. Matar procesos en puertos específicos
lsof -ti:3000,3001,3002,5555 2>/dev/null | xargs -r kill -9 2>/dev/null

# 2. Matar procesos Node relacionados con el proyecto
pkill -f "nest start" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "turbo run dev" 2>/dev/null
pkill -f "prisma studio" 2>/dev/null

# 3. Esperar a que se liberen los puertos (con timeout)
echo "⏳ Esperando liberación de puertos..."
for i in {1..10}; do
  PUERTO_3001=$(lsof -ti:3001 2>/dev/null)
  PUERTO_3000=$(lsof -ti:3000 2>/dev/null)

  if [ -z "$PUERTO_3001" ] && [ -z "$PUERTO_3000" ]; then
    break
  fi

  if [ $i -eq 10 ]; then
    echo "❌ ERROR: Los puertos no se liberaron después de 10 segundos"
    [ -n "$PUERTO_3001" ] && echo "   Puerto 3001 en uso: PID $PUERTO_3001"
    [ -n "$PUERTO_3000" ] && echo "   Puerto 3000 en uso: PID $PUERTO_3000"
    exit 1
  fi

  sleep 1
done

echo "✅ Puertos liberados"
echo ""
echo "🚀 Iniciando servidores..."
echo ""

# 4. Crear directorio para logs con timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_DIR="/tmp/mateatletas-logs"
mkdir -p $LOG_DIR

BACKEND_LOG="$LOG_DIR/backend-$TIMESTAMP.log"
FRONTEND_LOG="$LOG_DIR/frontend-$TIMESTAMP.log"

# 5. Iniciar backend en puerto 3001
cd /home/alexis/Documentos/Mateatletas-Ecosystem/apps/api
echo "📦 Iniciando Backend API (puerto 3001)..."
npm run start:dev > $BACKEND_LOG 2>&1 &
BACKEND_PID=$!

# 6. Esperar a que el puerto 3001 esté activo
echo "⏳ Esperando puerto 3001..."
if ! wait_for_port 3001 30; then
  echo "❌ ERROR: Backend no abrió el puerto 3001 en 30 segundos"
  echo "📄 Últimas líneas del log:"
  tail -20 $BACKEND_LOG
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

echo "✅ Puerto 3001 activo"

# 7. Verificar que el backend responda correctamente
echo "⏳ Verificando salud del backend..."
if ! wait_for_backend_health 20; then
  echo "❌ ERROR: Backend no responde al health check en 20 segundos"
  echo "📄 Últimas líneas del log:"
  tail -20 $BACKEND_LOG
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

echo "✅ Backend funcionando correctamente"

# 8. Iniciar frontend en puerto 3000
cd /home/alexis/Documentos/Mateatletas-Ecosystem/apps/web
echo "🌐 Iniciando Frontend Next.js (puerto 3000)..."
npm run dev > $FRONTEND_LOG 2>&1 &
FRONTEND_PID=$!

# 9. Esperar a que el puerto 3000 esté activo
echo "⏳ Esperando puerto 3000..."
if ! wait_for_port 3000 30; then
  echo "❌ ERROR: Frontend no abrió el puerto 3000 en 30 segundos"
  echo "📄 Últimas líneas del log:"
  tail -20 $FRONTEND_LOG
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 1
fi

echo "✅ Puerto 3000 activo"

echo ""
echo "✅ ¡Servidores iniciados exitosamente!"
echo ""
echo "📋 Información:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 URLs:"
echo "   Backend API:  http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo "   Swagger Docs: http://localhost:3001/api/docs"
echo "   Frontend:     http://localhost:3000"
echo ""
echo "📄 Logs:"
echo "   Backend:  tail -f $BACKEND_LOG"
echo "   Frontend: tail -f $FRONTEND_LOG"
echo ""
echo "🛑 Para detener los servidores:"
echo "   ./dev-stop.sh"
echo "   O manualmente: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Guardar PIDs en archivo para que dev-stop.sh pueda usarlos
echo "$BACKEND_PID" > /tmp/mateatletas-backend.pid
echo "$FRONTEND_PID" > /tmp/mateatletas-frontend.pid
