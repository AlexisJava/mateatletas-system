#!/bin/bash

# ============================================
# SCRIPT DE VERIFICACIÓN PRE-DEPLOY
# ============================================
# Ejecuta todas las validaciones necesarias antes de un deploy a Railway
# para prevenir que el sistema se rompa por configuraciones incorrectas.
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🔒 ============================================"
echo "   VERIFICACIÓN PRE-DEPLOY - RAILWAY"
echo "============================================"
echo ""

errors=0
warnings=0

# ============================================
# 1. VERIFICAR QUE MAIN.JS EXISTA
# ============================================
echo "📦 [1/7] Verificando build de la API..."

if [ ! -f "apps/api/dist/src/main.js" ]; then
  echo -e "${RED}❌ ERROR: No se encontró apps/api/dist/src/main.js${NC}"
  echo ""
  echo "   El archivo main.js debe estar en apps/api/dist/src/main.js"
  echo "   El Dockerfile espera encontrarlo en esa ubicación."
  echo ""
  echo "💡 Solución:"
  echo "   npm run build --workspace=apps/api"
  echo ""
  errors=$((errors + 1))
else
  echo -e "${GREEN}✅ main.js encontrado en la ubicación correcta${NC}"

  # Verificar que el archivo no esté vacío
  file_size=$(stat -c%s "apps/api/dist/src/main.js" 2>/dev/null || stat -f%z "apps/api/dist/src/main.js" 2>/dev/null)
  if [ "$file_size" -lt 100 ]; then
    echo -e "${YELLOW}⚠️  main.js parece estar vacío o corrupto (${file_size} bytes)${NC}"
    warnings=$((warnings + 1))
  fi
fi

echo ""

# ============================================
# 2. VERIFICAR DOCKERFILE CMD
# ============================================
echo "🐳 [2/7] Verificando configuración del Dockerfile..."

if [ ! -f "Dockerfile" ]; then
  echo -e "${RED}❌ ERROR: No se encontró el Dockerfile${NC}"
  errors=$((errors + 1))
else
  # Extraer el CMD del Dockerfile
  cmd_line=$(grep -E "^CMD" Dockerfile | tail -1)

  if echo "$cmd_line" | grep -q "node dist/src/main.js"; then
    echo -e "${GREEN}✅ CMD del Dockerfile correcto: node dist/src/main.js${NC}"
  else
    echo -e "${RED}❌ ERROR: CMD del Dockerfile NO coincide con la ubicación de main.js${NC}"
    echo ""
    echo "   CMD actual: $cmd_line"
    echo "   CMD esperado: node dist/src/main.js"
    echo ""
    echo "💡 Solución:"
    echo "   Editar Dockerfile y cambiar el CMD a:"
    echo '   CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]'
    echo ""
    errors=$((errors + 1))
  fi
fi

echo ""

# ============================================
# 3. VERIFICAR SCRIPTS DE PACKAGE.JSON
# ============================================
echo "📝 [3/7] Verificando scripts de package.json..."

api_start=$(grep -A 1 '"start":' apps/api/package.json | grep "node dist/src/main.js" || true)

if [ -n "$api_start" ]; then
  echo -e "${GREEN}✅ Script 'start' en apps/api/package.json correcto${NC}"
else
  echo -e "${RED}❌ ERROR: Script 'start' en apps/api/package.json NO apunta a dist/src/main.js${NC}"
  echo ""
  echo "💡 Solución:"
  echo "   Editar apps/api/package.json y establecer:"
  echo '   "start": "node dist/src/main.js"'
  echo ""
  errors=$((errors + 1))
fi

echo ""

# ============================================
# 4. VERIFICAR ORDEN DE MIGRACIONES
# ============================================
echo "🗄️  [4/7] Verificando migraciones de Prisma..."

if [ -f "scripts/verify-migrations.sh" ]; then
  # Ejecutar verificación de migraciones
  if bash scripts/verify-migrations.sh > /tmp/migration-check.log 2>&1; then
    echo -e "${GREEN}✅ Migraciones verificadas correctamente${NC}"
  else
    echo -e "${RED}❌ ERROR: Problemas detectados en las migraciones${NC}"
    echo ""
    cat /tmp/migration-check.log
    echo ""
    errors=$((errors + 1))
  fi
else
  echo -e "${YELLOW}⚠️  Script verify-migrations.sh no encontrado, saltando verificación${NC}"
  warnings=$((warnings + 1))
fi

echo ""

# ============================================
# 5. VERIFICAR ARCHIVOS TEMPORALES
# ============================================
echo "🧹 [5/7] Verificando archivos temporales..."

temp_files=$(find apps/api/prisma/migrations -type d -name "*temp*" -o -name "*debug*" -o -name "*backup*" -o -name "*old*" 2>/dev/null || true)

if [ -n "$temp_files" ]; then
  echo -e "${YELLOW}⚠️  Archivos/carpetas temporales encontrados:${NC}"
  echo "$temp_files"
  echo ""
  echo "💡 Considera eliminarlos antes del deploy"
  warnings=$((warnings + 1))
else
  echo -e "${GREEN}✅ No se encontraron archivos temporales${NC}"
fi

echo ""

# ============================================
# 6. VERIFICAR NEST-CLI.JSON
# ============================================
echo "⚙️  [6/7] Verificando configuración de NestJS..."

if [ ! -f "apps/api/nest-cli.json" ]; then
  echo -e "${RED}❌ ERROR: No se encontró apps/api/nest-cli.json${NC}"
  errors=$((errors + 1))
else
  # Verificar que sourceRoot sea "src"
  source_root=$(grep '"sourceRoot"' apps/api/nest-cli.json | grep '"src"' || true)

  if [ -n "$source_root" ]; then
    echo -e "${GREEN}✅ nest-cli.json configurado correctamente${NC}"
  else
    echo -e "${RED}❌ ERROR: nest-cli.json no tiene sourceRoot: 'src'${NC}"
    echo ""
    echo "💡 Solución:"
    echo "   Editar apps/api/nest-cli.json y establecer:"
    echo '   "sourceRoot": "src"'
    echo ""
    errors=$((errors + 1))
  fi
fi

echo ""

# ============================================
# 7. VERIFICAR TSCONFIG
# ============================================
echo "📘 [7/7] Verificando configuración de TypeScript..."

if [ ! -f "apps/api/tsconfig.json" ]; then
  echo -e "${RED}❌ ERROR: No se encontró apps/api/tsconfig.json${NC}"
  errors=$((errors + 1))
else
  echo -e "${GREEN}✅ tsconfig.json encontrado${NC}"

  # Verificar que outDir esté configurado correctamente
  out_dir=$(grep '"outDir"' apps/api/tsconfig.json | grep -o '"[^"]*"' | tail -1 | tr -d '"' || true)

  if [ -n "$out_dir" ]; then
    echo "   outDir configurado como: $out_dir"
  fi
fi

echo ""
echo "============================================"
echo ""

# ============================================
# RESUMEN FINAL
# ============================================
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ TODAS LAS VERIFICACIONES PASARON${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "🚀 Es seguro hacer deploy a Railway"
  echo ""
  exit 0
elif [ $errors -eq 0 ] && [ $warnings -gt 0 ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}⚠️  VERIFICACIÓN PASÓ CON ${warnings} ADVERTENCIA(S)${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Se puede hacer deploy, pero revisa las advertencias."
  echo ""
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ VERIFICACIÓN FALLÓ - ${errors} ERROR(ES)${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "⛔ NO hacer deploy hasta corregir los errores."
  echo ""
  echo "📚 Para más información, consulta: DEPLOYMENT.md"
  echo ""
  exit 1
fi
