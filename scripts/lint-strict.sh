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

# Separar archivos por app
API_FILES=""
WEB_FILES=""

for file in $FILES; do
  if [[ $file == *.ts ]] || [[ $file == *.tsx ]]; then
    if [[ $file == apps/api/* ]]; then
      RELATIVE_FILE="${file#apps/api/}"
      API_FILES="$API_FILES $RELATIVE_FILE"
    elif [[ $file == apps/web/* ]]; then
      RELATIVE_FILE="${file#apps/web/}"
      WEB_FILES="$WEB_FILES $RELATIVE_FILE"
    fi
  fi
done

# Lint archivos de API
if [ -n "$API_FILES" ]; then
  echo ""
  echo "📦 Checking API files..."
  cd apps/api

  # Usar npm run lint que funciona correctamente con ESLint 9
  # El flag -- permite pasar argumentos adicionales
  if ! npm run lint -- --max-warnings=0 $API_FILES; then
    echo ""
    echo "❌ COMMIT BLOCKED"
    echo "   App: apps/api"
    echo "   Reason: Contains ESLint warnings (any, unused vars, etc.)"
    echo ""
    echo "Fix the warnings and try again."
    echo "Or skip with: git commit --no-verify"
    exit 1
  fi

  cd ../..
fi

# Lint archivos de Web
if [ -n "$WEB_FILES" ]; then
  echo ""
  echo "🌐 Checking Web files..."
  cd apps/web

  # Usar npm run lint que funciona correctamente con ESLint 9
  if ! npm run lint -- --max-warnings=0 $WEB_FILES; then
    echo ""
    echo "❌ COMMIT BLOCKED"
    echo "   App: apps/web"
    echo "   Reason: Contains ESLint warnings (any, unused vars, etc.)"
    echo ""
    echo "Fix the warnings and try again."
    echo "Or skip with: git commit --no-verify"
    exit 1
  fi

  cd ../..
fi

echo ""
echo "✅ All checks passed!"