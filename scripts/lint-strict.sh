#!/bin/bash
# Script para lint estricto en archivos staged
# Bloquea commit si hay warnings de 'any', unused vars, etc.

set -e

FILES="$@"

if [ -z "$FILES" ]; then
  echo "No files to lint"
  exit 0
fi

echo "🔍 Running strict TypeScript checks on staged files..."

for file in $FILES; do
  # Solo verificar archivos .ts y .tsx
  if [[ $file == *.ts ]] || [[ $file == *.tsx ]]; then
    echo "  Checking: $file"

    # Cambiar a directorio correcto (api o web)
    if [[ $file == apps/api/* ]]; then
      cd apps/api
      RELATIVE_FILE="${file#apps/api/}"
    elif [[ $file == apps/web/* ]]; then
      cd apps/web
      RELATIVE_FILE="${file#apps/web/}"
    else
      continue
    fi

    # Ejecutar ESLint con --max-warnings=0
    npx eslint --fix --max-warnings=0 "$RELATIVE_FILE" || {
      echo ""
      echo "❌ COMMIT BLOCKED"
      echo "   File: $file"
      echo "   Reason: Contains ESLint warnings (any, unused vars, etc.)"
      echo ""
      echo "Fix the warnings and try again."
      echo "Or skip with: git commit --no-verify"
      exit 1
    }

    # Volver a raíz
    cd ../..
  fi
done

echo "✅ All checks passed!"
