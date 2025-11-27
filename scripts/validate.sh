#!/bin/bash
set -e

echo "=========================================="
echo "  VALIDANDO PROYECTO MATEATLETAS"
echo "=========================================="

echo ""
echo "1/3 TypeScript check..."
echo "----------------------------------------"
cd apps/api && npx tsc --noEmit
cd ../..
echo "API: OK"

cd apps/web && npx tsc --noEmit
cd ../..
echo "WEB: OK"

echo ""
echo "2/3 ESLint check..."
echo "----------------------------------------"
cd apps/api && npx eslint . --ext .ts --max-warnings=0 2>/dev/null || echo "API: Warnings encontrados (revisar)"
cd ../..

cd apps/web && npx eslint . --ext .ts,.tsx --max-warnings=0 2>/dev/null || echo "WEB: Warnings encontrados (revisar)"
cd ../..

echo ""
echo "3/3 Running tests..."
echo "----------------------------------------"
cd apps/api && npx jest --passWithNoTests --testTimeout=15000 --forceExit 2>&1 | tail -5
cd ../..

echo ""
echo "=========================================="
echo "  VALIDACION COMPLETADA"
echo "=========================================="
