#!/bin/bash

# TEST EXHAUSTIVO DE npm run dev
# Este script encuentra el hijo de puta que causa el problema de puertos

set -e

LOG_FILE="/tmp/test-dev-exhaustivo-$(date +%Y%m%d-%H%M%S).log"

log() {
  echo "[$(date +%H:%M:%S)] $1" | tee -a "$LOG_FILE"
}

error() {
  echo "[$(date +%H:%M:%S)] ❌ ERROR: $1" | tee -a "$LOG_FILE"
  exit 1
}

success() {
  echo "[$(date +%H:%M:%S)] ✅ $1" | tee -a "$LOG_FILE"
}

log "==============================================="
log "TEST EXHAUSTIVO - npm run dev"
log "==============================================="
log "Log completo: $LOG_FILE"
log ""

# ============================================
# TEST 1: Limpiar TODO
# ============================================
log "TEST 1: Limpiando TODOS los procesos node/nest/next..."
killall -9 node 2>/dev/null || true
killall -9 nest 2>/dev/null || true
killall -9 next 2>/dev/null || true
sleep 3

# Verificar que no haya procesos
PROCS=$(ps aux | grep -E "(node|nest|next)" | grep -v grep | grep -v "test-dev" || true)
if [ -n "$PROCS" ]; then
  log "⚠️  WARNING: Procesos que siguen vivos:"
  echo "$PROCS" | tee -a "$LOG_FILE"
else
  success "No hay procesos node/nest/next corriendo"
fi

# ============================================
# TEST 2: Verificar puertos libres
# ============================================
log ""
log "TEST 2: Verificando que puertos 3000 y 3001 estén libres..."

PORT_3000=$(lsof -i :3000 2>/dev/null || true)
PORT_3001=$(lsof -i :3001 2>/dev/null || true)

if [ -n "$PORT_3000" ]; then
  error "Puerto 3000 ocupado:\n$PORT_3000"
fi

if [ -n "$PORT_3001" ]; then
  error "Puerto 3001 ocupado:\n$PORT_3001"
fi

success "Puertos 3000 y 3001 libres"

# ============================================
# TEST 3: Verificar configuración de puertos
# ============================================
log ""
log "TEST 3: Verificando configuración de puertos en archivos..."

log "Backend .env:"
grep "PORT" apps/api/.env | tee -a "$LOG_FILE"

log "Frontend .env.local:"
grep "NEXT_PUBLIC_API_URL" apps/web/.env.local 2>/dev/null || log "No existe .env.local"

log "Backend main.ts (último listen):"
tail -5 apps/api/src/main.ts | grep -E "PORT|listen" | tee -a "$LOG_FILE"

success "Configuración de puertos verificada"

# ============================================
# TEST 4: BACKEND SOLO
# ============================================
log ""
log "TEST 4: Iniciando SOLO el backend..."
log "Comando: cd apps/api && npm run dev"

cd apps/api
npm run dev > /tmp/backend-test.log 2>&1 &
BACKEND_PID=$!
cd ../..

log "Backend PID: $BACKEND_PID"
log "Esperando 15 segundos para que compile..."
sleep 15

# Verificar que el proceso siga vivo
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  error "Backend murió durante el arranque. Ver /tmp/backend-test.log"
fi

log "Verificando puerto 3001..."
PORT_CHECK=$(lsof -i :3001 2>/dev/null || true)

if [ -z "$PORT_CHECK" ]; then
  log "❌ Puerto 3001 NO está escuchando"
  log "Últimas 50 líneas del log del backend:"
  tail -50 /tmp/backend-test.log | tee -a "$LOG_FILE"
  kill $BACKEND_PID 2>/dev/null || true
  error "Backend no abrió el puerto 3001"
else
  success "Puerto 3001 ESCUCHANDO"
  log "Proceso escuchando:"
  echo "$PORT_CHECK" | tee -a "$LOG_FILE"
fi

log "Testeando endpoint /api/health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health 2>&1 || echo "FALLÓ")

if [[ "$HEALTH_RESPONSE" == *"FALLÓ"* ]] || [[ "$HEALTH_RESPONSE" == *"Connection refused"* ]]; then
  log "❌ Endpoint /api/health NO responde"
  log "Response: $HEALTH_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  error "Backend no responde a requests HTTP"
else
  success "Backend responde correctamente"
  log "Response: $HEALTH_RESPONSE"
fi

log "Matando backend..."
kill $BACKEND_PID 2>/dev/null || true
sleep 3

# ============================================
# TEST 5: FRONTEND SOLO
# ============================================
log ""
log "TEST 5: Iniciando SOLO el frontend..."
log "Comando: cd apps/web && npm run dev"

cd apps/web
timeout 30 npm run dev > /tmp/frontend-test.log 2>&1 &
FRONTEND_PID=$!
cd ../..

log "Frontend PID: $FRONTEND_PID"
log "Esperando 15 segundos para que compile..."
sleep 15

# Verificar que el proceso siga vivo
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
  log "⚠️  Frontend completó (puede ser normal con timeout)"
fi

log "Verificando puerto 3000..."
PORT_CHECK=$(lsof -i :3000 2>/dev/null || true)

if [ -z "$PORT_CHECK" ]; then
  log "❌ Puerto 3000 NO está escuchando"
  log "Últimas 30 líneas del log del frontend:"
  tail -30 /tmp/frontend-test.log | tee -a "$LOG_FILE"

  # Verificar si se fue a otro puerto
  log "Buscando si Next.js eligió otro puerto..."
  grep -E "Local.*http://localhost:[0-9]+" /tmp/frontend-test.log | tail -1 | tee -a "$LOG_FILE"

  kill $FRONTEND_PID 2>/dev/null || true
  error "Frontend no abrió el puerto 3000"
else
  success "Puerto 3000 ESCUCHANDO"
  log "Proceso escuchando:"
  echo "$PORT_CHECK" | tee -a "$LOG_FILE"
fi

kill $FRONTEND_PID 2>/dev/null || true
sleep 3

# ============================================
# TEST 6: npm run dev (TURBO)
# ============================================
log ""
log "TEST 6: Iniciando con npm run dev (turbo)..."
log "Este es el comando que DEBE funcionar"

timeout 40 npm run dev > /tmp/turbo-test.log 2>&1 &
TURBO_PID=$!

log "Turbo PID: $TURBO_PID"
log "Esperando 30 segundos para que arranque todo..."
sleep 30

log "Verificando puertos..."
PORT_3000=$(lsof -i :3000 2>/dev/null || true)
PORT_3001=$(lsof -i :3001 2>/dev/null || true)

log ""
log "=== RESULTADO PUERTO 3000 (Frontend) ==="
if [ -z "$PORT_3000" ]; then
  log "❌ Puerto 3000 NO está escuchando"
else
  success "Puerto 3000 ESCUCHANDO"
  echo "$PORT_3000" | tee -a "$LOG_FILE"
fi

log ""
log "=== RESULTADO PUERTO 3001 (Backend) ==="
if [ -z "$PORT_3001" ]; then
  log "❌ Puerto 3001 NO está escuchando"
else
  success "Puerto 3001 ESCUCHANDO"
  echo "$PORT_3001" | tee -a "$LOG_FILE"
fi

log ""
log "=== LOG COMPLETO DE TURBO (últimas 100 líneas) ==="
tail -100 /tmp/turbo-test.log | tee -a "$LOG_FILE"

kill $TURBO_PID 2>/dev/null || true
killall -9 node 2>/dev/null || true

log ""
log "==============================================="
log "TEST COMPLETADO"
log "==============================================="
log "Log completo guardado en: $LOG_FILE"
log ""

if [ -n "$PORT_3000" ] && [ -n "$PORT_3001" ]; then
  success "TODO FUNCIONÓ CORRECTAMENTE"
  exit 0
else
  error "HAY PROBLEMAS - revisar log completo"
fi
