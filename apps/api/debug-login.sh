#!/bin/bash

echo "🔍 DEBUG: Problema 401 en /login"
echo "================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar middleware
echo -e "${YELLOW}[1/6] Verificando middleware.ts...${NC}"
if [ -f "apps/web/middleware.ts" ]; then
    echo "✅ Middleware encontrado"
    echo ""
    echo "Rutas públicas configuradas:"
    grep -A 20 "publicRoutes\|PUBLIC_ROUTES" apps/web/middleware.ts | head -25
    echo ""
    echo "¿/login está en rutas públicas?"
    grep -E "'/login'|/login" apps/web/middleware.ts && echo -e "${GREEN}✅ SÍ${NC}" || echo -e "${RED}❌ NO - ESTE ES EL PROBLEMA${NC}"
else
    echo -e "${RED}❌ No se encuentra middleware.ts${NC}"
fi

echo ""
echo "-----------------------------------"
echo ""

# 2. Verificar página de login
echo -e "${YELLOW}[2/6] Verificando página de login...${NC}"
if [ -f "apps/web/app/login/page.tsx" ]; then
    echo "✅ Página de login existe en: app/login/page.tsx"
    echo ""
    echo "Primeras 30 líneas:"
    head -30 apps/web/app/login/page.tsx
elif [ -f "apps/web/app/(auth)/login/page.tsx" ]; then
    echo "✅ Página de login existe en: app/(auth)/login/page.tsx"
    echo ""
    echo "Primeras 30 líneas:"
    head -30 apps/web/app/\(auth\)/login/page.tsx
else
    echo -e "${RED}❌ No se encuentra página de login${NC}"
fi

echo ""
echo "-----------------------------------"
echo ""

# 3. Verificar auth service/endpoint
echo -e "${YELLOW}[3/6] Verificando endpoint de login en backend...${NC}"
if [ -f "apps/api/src/auth/auth.controller.ts" ]; then
    echo "✅ Auth controller encontrado"
    echo ""
    echo "Endpoints de login:"
    grep -B 2 -A 10 "@Post.*login\|@Get.*login" apps/api/src/auth/auth.controller.ts | head -30
else
    echo -e "${RED}❌ No se encuentra auth.controller.ts${NC}"
fi

echo ""
echo "-----------------------------------"
echo ""

# 4. Verificar guards de autenticación
echo -e "${YELLOW}[4/6] Verificando guards en auth.controller...${NC}"
if [ -f "apps/api/src/auth/auth.controller.ts" ]; then
    echo "Guards aplicados:"
    grep -E "@UseGuards|@Public|@SkipAuth" apps/api/src/auth/auth.controller.ts | head -20
    echo ""
    echo "¿Login tiene @Public o @SkipAuth?"
    grep -B 5 "login" apps/api/src/auth/auth.controller.ts | grep -E "@Public|@SkipAuth" && echo -e "${GREEN}✅ SÍ${NC}" || echo -e "${RED}❌ NO - PROBLEMA POTENCIAL${NC}"
fi

echo ""
echo "-----------------------------------"
echo ""

# 5. Verificar variables de entorno
echo -e "${YELLOW}[5/6] Verificando configuración de API...${NC}"
if [ -f "apps/web/.env.local" ]; then
    echo "Variables en .env.local:"
    grep "NEXT_PUBLIC_API_URL\|API_URL" apps/web/.env.local
else
    echo -e "${YELLOW}⚠️  No existe .env.local${NC}"
fi

echo ""

if [ -f ".env" ]; then
    echo "Variables en .env (root):"
    grep "API_URL\|BACKEND_URL\|FRONTEND_URL" .env
fi

echo ""
echo "-----------------------------------"
echo ""

# 6. Test de conectividad
echo -e "${YELLOW}[6/6] Test de conectividad...${NC}"
echo ""
echo "¿Backend está corriendo?"
if command -v curl &> /dev/null; then
    echo "Probando localhost:3001/api/health..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/api/health || echo "❌ Backend no responde"
    echo ""
    echo "Probando localhost:3001/api/auth/login (sin body)..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/api/auth/login || echo "❌ Endpoint no responde"
else
    echo "⚠️  curl no disponible, skip test"
fi

echo ""
echo "================================="
echo -e "${GREEN}🎯 DIAGNÓSTICO COMPLETADO${NC}"
echo "================================="
echo ""
echo "PROBLEMAS COMUNES:"
echo "1. ❌ /login NO está en publicRoutes del middleware"
echo "2. ❌ Endpoint de login NO tiene @Public decorator"
echo "3. ❌ NEXT_PUBLIC_API_URL apunta a localhost en producción"
echo "4. ❌ Backend no está corriendo"
echo ""
echo "PRÓXIMOS PASOS:"
echo "1. Revisar el output arriba"
echo "2. Identificar cuál de los 4 problemas es el tuyo"
echo "3. Aplicar el fix correspondiente"
echo ""
