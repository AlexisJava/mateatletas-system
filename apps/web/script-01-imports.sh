#!/bin/bash

# Script #1: Limpiar Imports No Usados
# Riesgo: BAJO - Solo elimina imports sin uso
# Errores que arregla: ~25

set -e

echo "🧹 Script #1: Limpiando imports no usados..."
echo ""

cd ~/Documentos/Mateatletas-Ecosystem/apps/web

# Contador de errores antes
echo "📊 Errores ANTES:"
ERROR_ANTES=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
echo "  Total: $ERROR_ANTES errores"
echo ""

# ============================================================
# LIMPIAR IMPORTS NO USADOS (uno por uno, super seguro)
# ============================================================

echo "🔧 Aplicando fixes..."

# 1. admin/planificaciones/page.tsx - Button no usado
echo "  ✓ Eliminando Button de planificaciones/page.tsx"
sed -i '/^import.*{.*Button.*}.*from.*lucide-react/d' \
  src/app/admin/planificaciones/page.tsx

# 2. admin/reportes/page.tsx - useDashboard no usado  
echo "  ✓ Eliminando useDashboard de reportes/page.tsx"
sed -i 's/import { useDashboard, /import { /' \
  src/app/admin/reportes/page.tsx

# 3. admin/usuarios/page.tsx - useUpdateUserRoles no usado
echo "  ✓ Eliminando useUpdateUserRoles de usuarios/page.tsx"
sed -i 's/, useUpdateUserRoles//' \
  src/app/admin/usuarios/page.tsx

# 4. estudiante/planificaciones/page.tsx - CheckCircle no usado
echo "  ✓ Eliminando CheckCircle de estudiante/planificaciones/page.tsx"
sed -i 's/{ CheckCircle, /{ /' \
  src/app/estudiante/planificaciones/page.tsx

# 5. login/page.tsx - logout no usado
echo "  ✓ Eliminando logout de login/page.tsx"
sed -i 's/{ login, logout }/{ login }/' \
  src/app/login/page.tsx

# 6. e2e test - request no usado
echo "  ✓ Eliminando request de e2e test"
sed -i 's/({ page, request })/({ page })/' \
  e2e/planificaciones-flujo-completo.spec.ts

# 7. docente/planificaciones/page.tsx - Users no usado
echo "  ✓ Eliminando Users de docente/planificaciones/page.tsx"
sed -i 's/import { Calendar, Users, /import { Calendar, /' \
  src/app/docente/planificaciones/page.tsx

# 8. docente/planificaciones/page.tsx - selectedAsignacion no usado
echo "  ✓ Eliminando selectedAsignacion"
sed -i 's/const \[selectedAsignacion, setSelectedAsignacion\]/\/\/ const [selectedAsignacion, setSelectedAsignacion]/' \
  src/app/docente/planificaciones/page.tsx

# 9. estudiante/cursos/[cursoId]/page.tsx - Modulo no usado
echo "  ✓ Eliminando Modulo de estudiante/cursos"
sed -i 's/, Modulo//' \
  src/app/estudiante/cursos/[cursoId]/page.tsx

# 10. lib/api/catalogo.api.ts - schemas no usados
echo "  ✓ Eliminando schemas no usados de catalogo.api.ts"
sed -i '/^const createProductoSchema/d' \
  src/lib/api/catalogo.api.ts
sed -i '/^const updateProductoSchema/d' \
  src/lib/api/catalogo.api.ts

echo ""
echo "✅ Imports limpiados"
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
echo ""

if [ "$DIFERENCIA" -gt 0 ]; then
  echo "🎉 ¡Success! Eliminaste $DIFERENCIA errores"
else
  echo "⚠️  No se eliminaron errores. Revisá el output."
fi

echo ""
echo "Próximo paso: Ejecutá 'git diff' para ver los cambios"
echo "Si todo se ve bien: git add . && git commit -m 'fix: eliminar imports no usados'"
