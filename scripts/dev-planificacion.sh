#!/bin/bash

# Script para desarrollo enfocado en Planificaciones
# Levanta servidores y abre páginas de planificación en el navegador

echo "🚀 Iniciando entorno de desarrollo - Planificaciones"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si los puertos están ocupados
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Puerto 3000 ocupado, limpiando...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Puerto 3001 ocupado, limpiando...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

echo -e "${BLUE}📦 Levantando servidores...${NC}"
echo ""

# Iniciar servidores en background
npm run dev:all > /tmp/dev-planificacion.log 2>&1 &
DEV_PID=$!

echo -e "${GREEN}✅ Servidores iniciados (PID: $DEV_PID)${NC}"
echo -e "${YELLOW}⏳ Esperando a que los servidores estén listos...${NC}"
echo ""

# Función para verificar si un puerto está escuchando
wait_for_port() {
    local port=$1
    local service=$2
    local max_attempts=60
    local attempt=0

    while ! nc -z localhost $port >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            echo -e "${YELLOW}⚠️  Timeout esperando $service en puerto $port${NC}"
            return 1
        fi
        echo -ne "\r⏳ Esperando $service... ($attempt/$max_attempts)"
        sleep 1
    done
    echo -e "\r${GREEN}✅ $service listo en puerto $port!${NC}                    "
    return 0
}

# Esperar a que ambos servidores estén listos
wait_for_port 3001 "API Backend"
wait_for_port 3000 "Frontend Next.js"

echo ""
echo -e "${GREEN}🎉 Servidores listos!${NC}"
echo ""

# Esperar 2 segundos adicionales para que Next.js compile
echo -e "${BLUE}⏳ Compilando páginas iniciales...${NC}"
sleep 3

echo ""
echo -e "${BLUE}🌐 Abriendo páginas de Planificaciones en el navegador...${NC}"
echo ""

# Detectar el navegador disponible
if command -v xdg-open > /dev/null; then
    BROWSER="xdg-open"
elif command -v gnome-open > /dev/null; then
    BROWSER="gnome-open"
elif command -v firefox > /dev/null; then
    BROWSER="firefox"
elif command -v google-chrome > /dev/null; then
    BROWSER="google-chrome"
else
    echo -e "${YELLOW}⚠️  No se detectó navegador, abre manualmente:${NC}"
    BROWSER=""
fi

# Abrir las 3 pestañas de planificaciones DEMO (sin login)
if [ -n "$BROWSER" ]; then
    echo -e "${GREEN}📖 Abriendo: Portal Admin - Planificaciones DEMO${NC}"
    $BROWSER "http://localhost:3000/admin/planificaciones/demo" > /dev/null 2>&1 &
    sleep 1

    echo -e "${GREEN}📖 Abriendo: Portal Docente - Planificaciones DEMO${NC}"
    $BROWSER "http://localhost:3000/docente/planificaciones/demo" > /dev/null 2>&1 &
    sleep 1

    echo -e "${GREEN}📖 Abriendo: Portal Estudiante - Planificaciones DEMO${NC}"
    $BROWSER "http://localhost:3000/estudiante/planificaciones/demo" > /dev/null 2>&1 &
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Entorno de desarrollo listo!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📍 URLs disponibles:${NC}"
echo ""
echo "  🔧 Admin - Planificaciones DEMO:"
echo "     http://localhost:3000/admin/planificaciones/demo"
echo ""
echo "  👨‍🏫 Docente - Planificaciones DEMO:"
echo "     http://localhost:3000/docente/planificaciones/demo"
echo ""
echo "  🎓 Estudiante - Planificaciones DEMO:"
echo "     http://localhost:3000/estudiante/planificaciones/demo"
echo ""
echo "  🔌 API Backend:"
echo "     http://localhost:3001/api"
echo ""
echo "  📚 API Docs (Swagger):"
echo "     http://localhost:3001/api/docs"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}ℹ️  Los cambios en el código se reflejarán automáticamente${NC}"
echo -e "${YELLOW}ℹ️  Ver logs en: tail -f /tmp/dev-planificacion.log${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🛑 Para detener los servidores: Ctrl+C o ejecuta 'npm run stop:all'${NC}"
echo ""

# Mantener el script corriendo para mostrar logs
echo -e "${BLUE}📝 Logs en tiempo real:${NC}"
echo ""
tail -f /tmp/dev-planificacion.log
