#!/bin/bash

# Script para detener todos los servidores de desarrollo

echo "🛑 Deteniendo servidores Mateatletas..."

# Intentar detener usando los PIDs guardados primero (más limpio)
if [ -f /tmp/mateatletas-backend.pid ]; then
  BACKEND_PID=$(cat /tmp/mateatletas-backend.pid)
  if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "   Deteniendo backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
  fi
  rm /tmp/mateatletas-backend.pid
fi

if [ -f /tmp/mateatletas-frontend.pid ]; then
  FRONTEND_PID=$(cat /tmp/mateatletas-frontend.pid)
  if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "   Deteniendo frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
  fi
  rm /tmp/mateatletas-frontend.pid
fi

# Esperar un poco para que terminen gracefully
sleep 2

# Matar procesos en puertos específicos (fallback agresivo)
echo "   Limpiando procesos en puertos..."
lsof -ti:3000,3001,3002,5555 2>/dev/null | xargs -r kill -9 2>/dev/null

# Matar procesos Node relacionados (fallback)
pkill -f "nest start" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "turbo run dev" 2>/dev/null
pkill -f "prisma studio" 2>/dev/null

# Esperar un poco más
sleep 1

echo ""
echo "✅ Servidores detenidos"

# Verificar que los puertos estén libres
PUERTO_3000=$(lsof -ti:3000 2>/dev/null)
PUERTO_3001=$(lsof -ti:3001 2>/dev/null)
PUERTO_3002=$(lsof -ti:3002 2>/dev/null)

if [ -z "$PUERTO_3000" ] && [ -z "$PUERTO_3001" ] && [ -z "$PUERTO_3002" ]; then
  echo "✅ Todos los puertos liberados (3000, 3001, 3002)"
else
  echo ""
  echo "⚠️  Advertencia: Algunos puertos todavía en uso:"
  [ -n "$PUERTO_3000" ] && echo "   Puerto 3000: PID $PUERTO_3000"
  [ -n "$PUERTO_3001" ] && echo "   Puerto 3001: PID $PUERTO_3001"
  [ -n "$PUERTO_3002" ] && echo "   Puerto 3002: PID $PUERTO_3002"
  echo ""
  echo "   Ejecuta: lsof -ti:3000,3001,3002 | xargs kill -9"
fi

echo ""
