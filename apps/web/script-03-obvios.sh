#!/bin/bash

# Script #3: Fixes Manuales Obvios
# Riesgo: BAJO - Fixes quirúrgicos de errores específicos
# Errores que arregla: ~4

set -e

echo "🔧 Script #3: Fixes manuales obvios..."
echo ""

cd ~/Documentos/Mateatletas-Ecosystem/apps/web

# Contador de errores antes
echo "📊 Errores ANTES:"
ERROR_ANTES=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
echo "  Total: $ERROR_ANTES errores"
echo ""

echo "🔨 Aplicando fixes..."

# 1. TYPO EN REPORTES - línea 123: clases → classes
echo "  ✓ Fix #1: clases → classes (reportes/page.tsx línea 123)"
sed -i '123s/clases,/classes,/' src/app/admin/reportes/page.tsx

# 2. IMPORTS NO USADOS - e2e test
echo "  ✓ Fix #2: Eliminar 'request' no usado (e2e test)"
sed -i 's/({ page, request })/({ page })/' e2e/planificaciones-flujo-completo.spec.ts

# 3. IMPORTS NO USADOS - admin/planificaciones-simples
echo "  ✓ Fix #3: Eliminar 'Users' no usado (planificaciones-simples)"
sed -i 's/import { Calendar, Users, /import { Calendar, /' \
  src/app/admin/planificaciones-simples/page.tsx

# 4. IMPORTS NO USADOS - admin/planificaciones
echo "  ✓ Fix #4: Eliminar 'Button' no usado (planificaciones)"
sed -i '/^import.*Button.*lucide-react/d' \
  src/app/admin/planificaciones/page.tsx

echo ""
echo "✅ Fixes aplicados"
echo ""

# Contador de errores después
echo "📊 Errores DESPUÉS:"
ERROR_DESPUES=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
echo "  Total: $ERROR_DESPUES errores"
echo ""

# Calcular diferencia
DIFERENCIA=$((ERROR_ANTES - ERROR_DESPUES))
echo "📈 Resultado:"
echo "  Errores eliminados: $DIFERENCIA"
echo "  Errores restantes: $ERROR_DESPUES"
