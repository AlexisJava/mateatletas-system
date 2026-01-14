#!/bin/bash
set -e

echo "🔥 LIMPIEZA ULTRA BRUTAL - Mateatletas Ecosystem"
echo "================================================"

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar desde la raíz del proyecto"
    exit 1
fi

# ============================================
# FASE 1: SEGURIDAD CRÍTICA
# ============================================
echo ""
echo "🔴 FASE 1: Actualizaciones de Seguridad..."

# CVE-2025-68428 - jspdf
yarn workspace web add jspdf@^4.0.0

# CVE-2023-30533 - xlsx (migrar a CDN oficial)
yarn workspace web remove xlsx || true
yarn workspace web add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

# Deprecated
yarn workspace api remove cache-manager-ioredis-yet || true

echo "✅ Fase 1 completada"

# ============================================
# FASE 2: FEATURES ABANDONADAS
# ============================================
echo ""
echo "🟠 FASE 2: Eliminando features abandonadas..."

# Colonia (landing antigua)
rm -rf apps/web/src/components/colonia/

# Quiz/Asincronicos
rm -rf apps/web/src/components/asincronicos/
rm -rf apps/web/src/components/quiz/

# Resultado
rm -rf apps/web/src/components/resultado/

# Planificaciones y features admin
rm -rf apps/web/src/planificaciones/
rm -rf apps/web/src/features/admin/classes/
rm -rf apps/web/src/features/admin/dashboard/
rm -rf apps/web/src/features/admin/products/
rm -rf apps/web/src/features/admin/stats/
rm -rf apps/web/src/features/admin/users/

echo "✅ Fase 2 completada"

# ============================================
# FASE 3: CÓDIGO MUERTO BACKEND
# ============================================
echo ""
echo "🟡 FASE 3: Eliminando código muerto backend..."

# Scripts Prisma obsoletos
rm -f apps/api/prisma/actualizar-precios.ts
rm -f apps/api/prisma/calcular-inscripciones-inteligente.ts
rm -f apps/api/prisma/crear-inscripciones-mensuales.ts
rm -f apps/api/prisma/import-estudiantes-reales.ts
rm -f apps/api/prisma/limpiar-duplicados.ts
rm -f apps/api/prisma/seed-add-alexis-admin.ts
rm -f apps/api/prisma/seed-add-datos-reales.ts

# Barrel files vacíos (los más seguros de eliminar)
rm -f apps/api/src/auth/dto/login-response.dto.ts
rm -f apps/api/src/auth/types/index.ts
rm -f apps/api/src/auth/use-cases/index.ts
rm -f apps/api/src/cache/decorators/index.ts
rm -f apps/api/src/cache/index.ts
rm -f apps/api/src/cache/interceptors/index.ts
rm -f apps/api/src/casas/dto/index.ts
rm -f apps/api/src/common/dto/index.ts
rm -f apps/api/src/common/guards/index.ts
rm -f apps/api/src/common/interfaces/index.ts
rm -f apps/api/src/common/validators/index.ts
rm -f apps/api/src/feature-flags/index.ts
rm -f apps/api/src/health/index.ts
rm -f apps/api/src/observability/context/index.ts
rm -f apps/api/src/observaciones/dto/index.ts
rm -f apps/api/src/security/throttler/index.ts
rm -f apps/api/src/suscripciones/domain/constants/index.ts
rm -f apps/api/src/suscripciones/services/index.ts
rm -f apps/api/src/tiers/index.ts

echo "✅ Fase 3 completada"

# ============================================
# FASE 4: CÓDIGO MUERTO FRONTEND
# ============================================
echo ""
echo "🟡 FASE 4: Eliminando código muerto frontend..."

# Componentes huérfanos dashboard/docente
rm -f apps/web/src/components/dashboard/ActivityCard.tsx
rm -f apps/web/src/components/dashboard/EvaluacionCard.tsx
rm -f apps/web/src/components/dashboard/MisLogrosCard.tsx
rm -f apps/web/src/components/dashboard/ProximaClaseCard.tsx
rm -f apps/web/src/components/docente/AlertasDocente.tsx
rm -f apps/web/src/components/docente/AttendanceChart.tsx
rm -f apps/web/src/components/docente/CourseList.tsx
rm -f apps/web/src/components/docente/DarkVeil.tsx
rm -f apps/web/src/components/docente/LiveClassHero.tsx
rm -f apps/web/src/components/docente/ModalAsignarInsignia.tsx
rm -f apps/web/src/components/docente/NotificationCenter.tsx
rm -f apps/web/src/components/docente/StatsGrid.tsx

# Hooks no utilizados
rm -f apps/web/src/hooks/useCasaDistribution.ts
rm -f apps/web/src/hooks/useDeviceType.ts
rm -f apps/web/src/hooks/useScrollAnimation.ts
rm -f apps/web/src/hooks/useWindowSize.ts
rm -f apps/web/src/lib/hooks/useCalendario.ts
rm -f apps/web/src/lib/hooks/useClases.ts
rm -f apps/web/src/lib/hooks/useEstudiantes.ts
rm -f apps/web/src/lib/hooks/useNotificaciones.ts
rm -f apps/web/src/lib/hooks/usePagos.ts

# Stores no utilizados
rm -f apps/web/src/store/admin.store.ts
rm -f apps/web/src/store/calendario.store.ts
rm -f apps/web/src/store/casas.store.ts
rm -f apps/web/src/store/catalogo.store.ts
rm -f apps/web/src/store/clases.store.ts
rm -f apps/web/src/store/estudiantes.store.ts
rm -f apps/web/src/store/notificaciones.store.ts
rm -f apps/web/src/store/pagos.store.ts

# APIs no utilizadas
rm -f apps/web/src/lib/api/calendario.api.ts
rm -f apps/web/src/lib/api/casas.api.ts
rm -f apps/web/src/lib/api/cursos-tienda.api.ts
rm -f apps/web/src/lib/api/inscripciones-2026.ts
rm -f apps/web/src/lib/api/notificaciones.api.ts
rm -f apps/web/src/lib/api/pagos.api.ts
rm -f apps/web/src/lib/api/quizApi.ts
rm -f apps/web/src/lib/api/tutor.api.ts

# Types/Schemas no utilizados
rm -f apps/web/src/types/admin-clases.types.ts
rm -f apps/web/src/types/calendario.types.ts
rm -f apps/web/src/types/casa.types.ts
rm -f apps/web/src/types/colonia.ts
rm -f apps/web/src/types/courses.ts
rm -f apps/web/src/types/inscripciones-2026.ts
rm -f apps/web/src/types/pago.types.ts
rm -f apps/web/src/types/reportes.types.ts
rm -f apps/web/src/types/tutor-dashboard.types.ts
rm -f apps/web/src/lib/schemas/casa.schema.ts
rm -f apps/web/src/lib/schemas/estudiante.schema.ts
rm -f apps/web/src/lib/schemas/notificacion.schema.ts

# Dependencias frontend obsoletas
echo "Eliminando dependencias no utilizadas..."
yarn workspace web remove 3dmol || true
yarn workspace web remove @react-three/drei @react-three/fiber || true
yarn workspace web remove @mui/material @mui/icons-material || true
yarn workspace web remove @emotion/react @emotion/styled || true
yarn workspace web remove @lottiefiles/dotlottie-react || true
yarn workspace web remove @use-gesture/react || true
yarn workspace web remove leva || true
yarn workspace web remove matter-js @types/matter-js || true

echo "✅ Fase 4 completada"

# ============================================
# FASE 5: CONSOLIDACIÓN DE DEPENDENCIAS
# ============================================
echo ""
echo "🟢 FASE 5: Consolidando dependencias..."

# Mover deps del root a workspaces correctos
yarn remove @nestjs/platform-socket.io @nestjs/websockets socket.io || true
yarn workspace api add @nestjs/platform-socket.io @nestjs/websockets socket.io || true

yarn remove react-resizable-panels react-use || true
yarn workspace web add react-resizable-panels react-use || true

# Agregar dependencias faltantes
yarn workspace api add -D @paralleldrive/cuid2 || true
yarn workspace web add postcss || true

echo "✅ Fase 5 completada"

# ============================================
# FASE 6: SCRIPTS OBSOLETOS
# ============================================
echo ""
echo "🟢 FASE 6: Eliminando scripts obsoletos..."

rm -f scripts/asignar-estudiantes-a-grupos.js
rm -f scripts/contar-todos-datos.js
rm -f scripts/crear-estudiante-emmita.js
rm -f scripts/crear-estudiante-emmita.ts
rm -f scripts/crear-usuario-prueba-railway.ts
rm -f scripts/export-estudiantes-grupos.js
rm -f scripts/export-estudiantes-grupos.ts
rm -f scripts/procesar-csv-estudiantes.js
rm -f scripts/reset-password.ts
rm -f scripts/test-pagos-completo.ts
rm -f scripts/update-user-password.js
rm -f scripts/upload-animations.js
rm -f scripts/verificar-datos.js
rm -f scripts/verificar-todas-relaciones.js
rm -rf scripts/seeds/

echo "✅ Fase 6 completada"

# ============================================
# VERIFICACIÓN FINAL
# ============================================
echo ""
echo "🔍 Verificando instalación..."
yarn install

echo ""
echo "============================================"
echo "🎉 LIMPIEZA COMPLETADA"
echo "============================================"
echo ""
echo "Próximos pasos:"
echo "1. yarn build"
echo "2. yarn lint"
echo "3. yarn test"
echo "4. yarn knip (para verificar)"
echo ""
