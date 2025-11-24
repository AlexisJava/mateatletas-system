#!/bin/bash

# =============================================================================
# DIAGNÓSTICO RAILWAY + PRISMA + NESTJS MONOREPO
# Ejecutar desde la raíz del monorepo
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

echo "=============================================="
echo "  DIAGNÓSTICO RAILWAY + PRISMA + NESTJS"
echo "  $(date)"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# 1. ESTRUCTURA DEL PROYECTO
# -----------------------------------------------------------------------------
echo "📁 [1/10] ESTRUCTURA DEL PROYECTO"
echo "-----------------------------------"

# 1.1 Verificar que estamos en un monorepo
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json existe en raíz"
    ((PASS++))
else
    echo -e "${RED}✗${NC} package.json NO existe en raíz"
    ((FAIL++))
fi

# 1.2 Verificar carpeta apps/api
if [ -d "apps/api" ]; then
    echo -e "${GREEN}✓${NC} apps/api/ existe"
    ((PASS++))
else
    echo -e "${RED}✗${NC} apps/api/ NO existe"
    ((FAIL++))
fi

# 1.3 Verificar package.json de api
if [ -f "apps/api/package.json" ]; then
    echo -e "${GREEN}✓${NC} apps/api/package.json existe"
    ((PASS++))
else
    echo -e "${RED}✗${NC} apps/api/package.json NO existe"
    ((FAIL++))
fi

# 1.4 Verificar Dockerfile
if [ -f "Dockerfile" ] || [ -f "apps/api/Dockerfile" ]; then
    DOCKERFILE_PATH=$([ -f "Dockerfile" ] && echo "Dockerfile" || echo "apps/api/Dockerfile")
    echo -e "${GREEN}✓${NC} Dockerfile existe en: $DOCKERFILE_PATH"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Dockerfile NO existe"
    ((FAIL++))
fi

echo ""

# -----------------------------------------------------------------------------
# 2. PRISMA - CONFIGURACIÓN
# -----------------------------------------------------------------------------
echo "🔷 [2/10] PRISMA - CONFIGURACIÓN"
echo "-----------------------------------"

# 2.1 Verificar schema.prisma
PRISMA_SCHEMA=""
if [ -f "apps/api/prisma/schema.prisma" ]; then
    PRISMA_SCHEMA="apps/api/prisma/schema.prisma"
elif [ -f "prisma/schema.prisma" ]; then
    PRISMA_SCHEMA="prisma/schema.prisma"
fi

if [ -n "$PRISMA_SCHEMA" ]; then
    echo -e "${GREEN}✓${NC} schema.prisma existe en: $PRISMA_SCHEMA"
    ((PASS++))
else
    echo -e "${RED}✗${NC} schema.prisma NO encontrado"
    ((FAIL++))
fi

# 2.2 Verificar que prisma está en dependencies (NO devDependencies)
if [ -f "apps/api/package.json" ]; then
    PRISMA_IN_DEPS=$(grep -A 100 '"dependencies"' apps/api/package.json | grep -B 100 '}' | head -100 | grep '"prisma"' || true)
    PRISMA_IN_DEV=$(grep -A 100 '"devDependencies"' apps/api/package.json | grep -B 100 '}' | head -100 | grep '"prisma"' || true)
    
    if [ -n "$PRISMA_IN_DEPS" ]; then
        echo -e "${GREEN}✓${NC} 'prisma' está en dependencies"
        ((PASS++))
    elif [ -n "$PRISMA_IN_DEV" ]; then
        echo -e "${RED}✗${NC} 'prisma' está en devDependencies - DEBE estar en dependencies para producción"
        ((FAIL++))
    else
        echo -e "${RED}✗${NC} 'prisma' NO está en package.json"
        ((FAIL++))
    fi
    
    # 2.3 Verificar @prisma/client
    PRISMA_CLIENT=$(grep '"@prisma/client"' apps/api/package.json || true)
    if [ -n "$PRISMA_CLIENT" ]; then
        echo -e "${GREEN}✓${NC} '@prisma/client' está en package.json"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} '@prisma/client' NO está en package.json"
        ((FAIL++))
    fi
fi

# 2.4 Verificar binaryTargets en schema.prisma
if [ -n "$PRISMA_SCHEMA" ]; then
    BINARY_TARGETS=$(grep "binaryTargets" "$PRISMA_SCHEMA" || true)
    if [ -n "$BINARY_TARGETS" ]; then
        echo -e "${GREEN}✓${NC} binaryTargets configurado en schema.prisma"
        echo "    $BINARY_TARGETS"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} binaryTargets NO configurado - puede fallar en Linux/Docker"
        echo "    Agregar: binaryTargets = [\"native\", \"linux-musl-openssl-3.0.x\"]"
        ((WARN++))
    fi
fi

echo ""

# -----------------------------------------------------------------------------
# 3. PRISMA - MÓDULOS INSTALADOS (LOCAL)
# -----------------------------------------------------------------------------
echo "📦 [3/10] PRISMA - MÓDULOS INSTALADOS"
echo "-----------------------------------"

# 3.1 Verificar node_modules existe
if [ -d "apps/api/node_modules" ]; then
    echo -e "${GREEN}✓${NC} apps/api/node_modules existe"
    ((PASS++))
    
    # 3.2 Verificar @prisma/client
    if [ -d "apps/api/node_modules/@prisma/client" ]; then
        echo -e "${GREEN}✓${NC} @prisma/client instalado"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} @prisma/client NO instalado"
        ((FAIL++))
    fi
    
    # 3.3 Verificar @prisma/engines (EL PROBLEMA)
    if [ -d "apps/api/node_modules/@prisma/engines" ]; then
        echo -e "${GREEN}✓${NC} @prisma/engines instalado"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} @prisma/engines NO instalado - ESTE ES EL PROBLEMA"
        ((FAIL++))
    fi
    
    # 3.4 Verificar prisma CLI
    if [ -f "apps/api/node_modules/.bin/prisma" ]; then
        echo -e "${GREEN}✓${NC} prisma CLI instalado"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} prisma CLI NO instalado"
        ((FAIL++))
    fi
else
    echo -e "${YELLOW}⚠${NC} apps/api/node_modules NO existe - ejecutar npm/yarn install"
    ((WARN++))
fi

# 3.5 Verificar en raíz también (monorepo hoisting)
if [ -d "node_modules/@prisma/engines" ]; then
    echo -e "${GREEN}✓${NC} @prisma/engines también en raíz (hoisting)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} @prisma/engines NO está en raíz - puede causar problemas con workspaces"
    ((WARN++))
fi

echo ""

# -----------------------------------------------------------------------------
# 4. DOCKERFILE - ANÁLISIS
# -----------------------------------------------------------------------------
echo "🐳 [4/10] DOCKERFILE - ANÁLISIS"
echo "-----------------------------------"

if [ -n "$DOCKERFILE_PATH" ] && [ -f "$DOCKERFILE_PATH" ]; then
    # 4.1 Verificar imagen base
    BASE_IMAGE=$(grep "^FROM" "$DOCKERFILE_PATH" | head -1)
    echo "    Base image: $BASE_IMAGE"
    
    # 4.2 Verificar que corre prisma generate
    PRISMA_GENERATE=$(grep "prisma generate" "$DOCKERFILE_PATH" || true)
    if [ -n "$PRISMA_GENERATE" ]; then
        echo -e "${GREEN}✓${NC} 'prisma generate' está en Dockerfile"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} 'prisma generate' NO está en Dockerfile - CRÍTICO"
        ((FAIL++))
    fi
    
    # 4.3 Verificar multi-stage build
    STAGE_COUNT=$(grep -c "^FROM" "$DOCKERFILE_PATH" || echo "1")
    echo "    Stages en Dockerfile: $STAGE_COUNT"
    
    if [ "$STAGE_COUNT" -gt 1 ]; then
        echo -e "${YELLOW}⚠${NC} Multi-stage build detectado - verificar que @prisma/engines se copia entre stages"
        ((WARN++))
        
        # 4.4 Verificar COPY de prisma entre stages
        COPY_PRISMA=$(grep "COPY.*prisma" "$DOCKERFILE_PATH" || true)
        if [ -n "$COPY_PRISMA" ]; then
            echo -e "${GREEN}✓${NC} Se copia carpeta prisma entre stages"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} NO se copia carpeta prisma entre stages"
            ((FAIL++))
        fi
        
        # 4.5 Verificar COPY de node_modules/@prisma
        COPY_PRISMA_MODULES=$(grep "COPY.*@prisma" "$DOCKERFILE_PATH" || true)
        if [ -n "$COPY_PRISMA_MODULES" ]; then
            echo -e "${GREEN}✓${NC} Se copia @prisma modules entre stages"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠${NC} NO se copia explícitamente @prisma entre stages - puede fallar"
            ((WARN++))
        fi
    fi
    
    # 4.6 Verificar openssl (requerido por Prisma)
    OPENSSL=$(grep "openssl" "$DOCKERFILE_PATH" || true)
    if [ -n "$OPENSSL" ]; then
        echo -e "${GREEN}✓${NC} openssl mencionado en Dockerfile"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} openssl NO instalado explícitamente - puede ser necesario"
        ((WARN++))
    fi
else
    echo -e "${YELLOW}⚠${NC} No se puede analizar Dockerfile"
    ((WARN++))
fi

echo ""

# -----------------------------------------------------------------------------
# 5. YARN/NPM - CONFIGURACIÓN WORKSPACES
# -----------------------------------------------------------------------------
echo "📦 [5/10] PACKAGE MANAGER - WORKSPACES"
echo "-----------------------------------"

# 5.1 Detectar package manager
if [ -f "yarn.lock" ]; then
    echo -e "${GREEN}✓${NC} Usando Yarn (yarn.lock existe)"
    PKG_MANAGER="yarn"
    ((PASS++))
elif [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✓${NC} Usando NPM (package-lock.json existe)"
    PKG_MANAGER="npm"
    ((PASS++))
elif [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✓${NC} Usando PNPM (pnpm-lock.yaml existe)"
    PKG_MANAGER="pnpm"
    ((PASS++))
else
    echo -e "${RED}✗${NC} No se detecta lockfile - puede causar inconsistencias"
    ((FAIL++))
fi

# 5.2 Verificar workspaces en package.json raíz
WORKSPACES=$(grep -A 5 '"workspaces"' package.json 2>/dev/null || true)
if [ -n "$WORKSPACES" ]; then
    echo -e "${GREEN}✓${NC} Workspaces configurados en package.json raíz"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Workspaces NO configurados - puede afectar hoisting de deps"
    ((WARN++))
fi

# 5.3 Verificar .npmrc o .yarnrc
if [ -f ".npmrc" ]; then
    echo "    .npmrc existe:"
    cat .npmrc | sed 's/^/    /'
fi
if [ -f ".yarnrc" ] || [ -f ".yarnrc.yml" ]; then
    echo "    .yarnrc existe"
fi

echo ""

# -----------------------------------------------------------------------------
# 6. SCRIPTS DE BUILD
# -----------------------------------------------------------------------------
echo "🔨 [6/10] SCRIPTS DE BUILD"
echo "-----------------------------------"

if [ -f "apps/api/package.json" ]; then
    # 6.1 Verificar script build
    BUILD_SCRIPT=$(grep '"build"' apps/api/package.json || true)
    if [ -n "$BUILD_SCRIPT" ]; then
        echo -e "${GREEN}✓${NC} Script 'build' existe"
        echo "    $BUILD_SCRIPT"
        ((PASS++))
        
        # Verificar que incluye prisma generate
        if echo "$BUILD_SCRIPT" | grep -q "prisma generate"; then
            echo -e "${GREEN}✓${NC} Build script incluye 'prisma generate'"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠${NC} Build script NO incluye 'prisma generate' - debería agregarse"
            ((WARN++))
        fi
    else
        echo -e "${RED}✗${NC} Script 'build' NO existe"
        ((FAIL++))
    fi
    
    # 6.2 Verificar script start
    START_SCRIPT=$(grep '"start"' apps/api/package.json | head -1 || true)
    if [ -n "$START_SCRIPT" ]; then
        echo -e "${GREEN}✓${NC} Script 'start' existe"
        echo "    $START_SCRIPT"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Script 'start' NO existe"
        ((FAIL++))
    fi
fi

echo ""

# -----------------------------------------------------------------------------
# 7. VARIABLES DE ENTORNO
# -----------------------------------------------------------------------------
echo "🔐 [7/10] VARIABLES DE ENTORNO"
echo "-----------------------------------"

# 7.1 Verificar .env existe (local)
if [ -f "apps/api/.env" ]; then
    echo -e "${GREEN}✓${NC} apps/api/.env existe"
    ((PASS++))
    
    # Verificar DATABASE_URL
    if grep -q "DATABASE_URL" apps/api/.env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configurado en .env"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} DATABASE_URL NO configurado en .env"
        ((FAIL++))
    fi
else
    echo -e "${YELLOW}⚠${NC} apps/api/.env NO existe (ok si usas Railway env vars)"
    ((WARN++))
fi

# 7.2 Verificar .env.example
if [ -f "apps/api/.env.example" ]; then
    echo -e "${GREEN}✓${NC} apps/api/.env.example existe (buena práctica)"
    ((PASS++))
fi

echo ""

# -----------------------------------------------------------------------------
# 8. RAILWAY - CONFIGURACIÓN ESPECÍFICA
# -----------------------------------------------------------------------------
echo "🚂 [8/10] RAILWAY - CONFIGURACIÓN"
echo "-----------------------------------"

# 8.1 Verificar railway.json o railway.toml
if [ -f "railway.json" ] || [ -f "railway.toml" ]; then
    echo -e "${GREEN}✓${NC} Configuración Railway existe"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} No hay railway.json/toml - Railway usará defaults"
    ((WARN++))
fi

# 8.2 Verificar nixpacks.toml (si no usa Dockerfile)
if [ -f "nixpacks.toml" ]; then
    echo -e "${GREEN}✓${NC} nixpacks.toml existe"
    cat nixpacks.toml | sed 's/^/    /'
    ((PASS++))
fi

# 8.3 Verificar Procfile
if [ -f "Procfile" ]; then
    echo -e "${GREEN}✓${NC} Procfile existe"
    cat Procfile | sed 's/^/    /'
    ((PASS++))
fi

echo ""

# -----------------------------------------------------------------------------
# 9. VERSIONES
# -----------------------------------------------------------------------------
echo "📋 [9/10] VERSIONES"
echo "-----------------------------------"

# 9.1 Node version
if [ -f ".nvmrc" ]; then
    echo "    .nvmrc: $(cat .nvmrc)"
fi
if [ -f ".node-version" ]; then
    echo "    .node-version: $(cat .node-version)"
fi

NODE_VERSION=$(node --version 2>/dev/null || echo "No instalado")
echo "    Node local: $NODE_VERSION"

# 9.2 Prisma version
if [ -f "apps/api/package.json" ]; then
    PRISMA_VERSION=$(grep '"prisma"' apps/api/package.json | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "No encontrado")
    PRISMA_CLIENT_VERSION=$(grep '"@prisma/client"' apps/api/package.json | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "No encontrado")
    echo "    Prisma CLI: $PRISMA_VERSION"
    echo "    @prisma/client: $PRISMA_CLIENT_VERSION"
    
    if [ "$PRISMA_VERSION" != "$PRISMA_CLIENT_VERSION" ] && [ "$PRISMA_VERSION" != "No encontrado" ]; then
        echo -e "${RED}✗${NC} VERSIONES DE PRISMA NO COINCIDEN - puede causar problemas"
        ((FAIL++))
    fi
fi

echo ""

# -----------------------------------------------------------------------------
# 10. TEST DE PRISMA GENERATE
# -----------------------------------------------------------------------------
echo "🧪 [10/10] TEST PRISMA GENERATE"
echo "-----------------------------------"

if [ -n "$PRISMA_SCHEMA" ]; then
    echo "    Ejecutando: npx prisma generate --schema=$PRISMA_SCHEMA"
    
    cd apps/api 2>/dev/null || cd .
    
    if npx prisma generate --schema=prisma/schema.prisma 2>&1; then
        echo -e "${GREEN}✓${NC} prisma generate ejecutó correctamente"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} prisma generate FALLÓ"
        ((FAIL++))
    fi
    
    cd - > /dev/null 2>&1 || true
fi

echo ""

# -----------------------------------------------------------------------------
# RESUMEN
# -----------------------------------------------------------------------------
echo "=============================================="
echo "  RESUMEN"
echo "=============================================="
echo -e "  ${GREEN}PASS:${NC} $PASS"
echo -e "  ${YELLOW}WARN:${NC} $WARN"
echo -e "  ${RED}FAIL:${NC} $FAIL"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ HAY PROBLEMAS CRÍTICOS QUE RESOLVER${NC}"
    echo ""
    echo "ACCIONES RECOMENDADAS:"
    echo "1. Si 'prisma' está en devDependencies, moverlo a dependencies"
    echo "2. Asegurar que Dockerfile ejecuta 'npx prisma generate'"
    echo "3. En multi-stage builds, copiar node_modules/@prisma/ completo"
    echo "4. Agregar binaryTargets en schema.prisma para Linux"
    echo "5. Limpiar cache: rm -rf node_modules && npm install"
else
    echo -e "${GREEN}✅ TODO PARECE CORRECTO${NC}"
fi

echo ""
echo "=============================================="
