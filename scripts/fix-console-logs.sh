#!/bin/bash

# Script para reemplazar console.log/error/warn por Logger de NestJS
# Uso: ./scripts/fix-console-logs.sh

set -e

echo "🔍 Buscando archivos con console.* en apps/api/src..."

# Archivos a procesar (excluir tests y scripts)
FILES=$(grep -rl "console\." apps/api/src --include="*.ts" | grep -v "test" | grep -v "spec" | grep -v "scripts" | sort -u)

if [ -z "$FILES" ]; then
  echo "✅ No se encontraron console.* en producción"
  exit 0
fi

echo "📝 Archivos encontrados:"
echo "$FILES" | while read file; do
  echo "   - $file"
done

echo ""
echo "🔧 Aplicando fixes..."

# Fix para auth.service.ts (ya tiene Logger importado por Claude)
echo "   ✅ auth.service.ts (ya fixed por Claude)"

# Fix para circuit-breaker.ts
FILE="apps/api/src/common/circuit-breaker/circuit-breaker.ts"
if grep -q "console\." "$FILE" 2>/dev/null; then
  echo "   🔧 Fixing $FILE..."

  # Agregar import Logger si no existe
  if ! grep -q "import { Logger }" "$FILE"; then
    sed -i '1i import { Logger } from '\''@nestjs/common'\'';' "$FILE"
  fi

  # Agregar logger instance si no existe
  if ! grep -q "private readonly logger" "$FILE"; then
    sed -i '/export class CircuitBreaker {/a\  private readonly logger = new Logger('\''CircuitBreaker'\'');' "$FILE"
  fi

  # Reemplazar console.warn por logger.warn
  sed -i 's/console\.warn(/this.logger.warn(/g' "$FILE"

  # Reemplazar console.log por logger.log
  sed -i 's/console\.log(/this.logger.log(/g' "$FILE"

  # Reemplazar console.error por logger.error
  sed -i 's/console\.error(/this.logger.error(/g' "$FILE"

  echo "   ✅ $FILE fixed"
fi

# Fix para role.utils.ts
FILE="apps/api/src/common/utils/role.utils.ts"
if grep -q "console\." "$FILE" 2>/dev/null; then
  echo "   🔧 Fixing $FILE..."

  # Agregar import Logger si no existe
  if ! grep -q "import { Logger }" "$FILE"; then
    sed -i '1i import { Logger } from '\''@nestjs/common'\'';' "$FILE"
  fi

  # Agregar logger instance fuera de la función
  if ! grep -q "const logger" "$FILE"; then
    sed -i '2i const logger = new Logger('\''RoleUtils'\'');' "$FILE"
  fi

  # Reemplazar console.warn por logger.warn
  sed -i 's/console\.warn(/logger.warn(/g' "$FILE"

  # Reemplazar console.error por logger.error
  sed -i 's/console\.error(/logger.error(/g' "$FILE"

  echo "   ✅ $FILE fixed"
fi

# Fix para cache.module.ts
FILE="apps/api/src/common/cache/cache.module.ts"
if grep -q "console\." "$FILE" 2>/dev/null; then
  echo "   🔧 Fixing $FILE..."

  # Agregar import Logger si no existe
  if ! grep -q "import { Logger }" "$FILE"; then
    sed -i "1i import { Logger } from '@nestjs/common';" "$FILE"
  fi

  # Agregar logger instance
  if ! grep -q "const logger" "$FILE"; then
    sed -i "2i const logger = new Logger('CacheModule');" "$FILE"
  fi

  # Reemplazar console.error por logger.error
  sed -i 's/console\.error(/logger.error(/g' "$FILE"

  # Reemplazar console.warn por logger.warn
  sed -i 's/console\.warn(/logger.warn(/g' "$FILE"

  # Reemplazar console.log por logger.log
  sed -i 's/console\.log(/logger.log(/g' "$FILE"

  echo "   ✅ $FILE fixed"
fi

# Fix para prisma.service.ts - MANTENER console.log startup
FILE="apps/api/src/core/database/prisma.service.ts"
if grep -q "console\.log" "$FILE" 2>/dev/null; then
  echo "   ℹ️  $FILE - SKIP (startup log es OK)"
fi

# Fix para main.ts - MANTENER console.log startup
FILE="apps/api/src/main.ts"
if grep -q "console\." "$FILE" 2>/dev/null; then
  echo "   🔧 Fixing $FILE (solo CORS warning)..."

  # Agregar import Logger si no existe
  if ! grep -q "import { Logger }" "$FILE"; then
    sed -i "s/import { NestFactory } from '@nestjs\/core';/import { NestFactory } from '@nestjs\/core';\nimport { Logger } from '@nestjs\/common';/" "$FILE"
  fi

  # Agregar logger instance
  if ! grep -q "const logger" "$FILE"; then
    sed -i "/async function bootstrap/a\  const logger = new Logger('Bootstrap');" "$FILE"
  fi

  # Reemplazar solo console.warn de CORS
  sed -i 's/console\.warn(\`⚠️  CORS blocked/logger.warn(\`⚠️  CORS blocked/g' "$FILE"

  echo "   ✅ $FILE fixed (console.log startup mantenidos)"
fi

# Fix para auto-detect-planificaciones.ts - es un script, SKIP
FILE="apps/api/src/planificaciones-simples/scripts/auto-detect-planificaciones.ts"
if grep -q "console\." "$FILE" 2>/dev/null; then
  echo "   ℹ️  $FILE - SKIP (es un script CLI)"
fi

echo ""
echo "✅ Fix completado!"
echo ""
echo "🔍 Verificando resultados..."
REMAINING=$(grep -r "console\." apps/api/src --include="*.ts" | grep -v "test" | grep -v "spec" | grep -v "scripts" | grep -v "main.ts.*🚀\|📚" | grep -v "prisma.service.ts.*✅" | wc -l)

if [ "$REMAINING" -eq 0 ]; then
  echo "✅ Todos los console.* críticos han sido reemplazados"
else
  echo "⚠️  Quedan $REMAINING console.* (revisar manualmente)"
fi
