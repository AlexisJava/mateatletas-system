# Plan de Limpieza Ultra Brutal - Mateatletas Ecosystem

**Fecha:** 2026-01-14
**Objetivo:** Eliminar todo el código muerto, vulnerabilidades y dependencias obsoletas
**Impacto estimado:** -225 archivos, -48 dependencias, ~15% menos bundle size

---

## Resumen Ejecutivo

| Fase | Descripción            | Archivos | Dependencias | Prioridad  |
| ---- | ---------------------- | -------- | ------------ | ---------- |
| 1    | Seguridad Crítica      | 0        | 4            | 🔴 URGENTE |
| 2    | Features Abandonadas   | 89       | 0            | 🟠 ALTA    |
| 3    | Código Muerto Backend  | 47       | 5            | 🟡 MEDIA   |
| 4    | Código Muerto Frontend | 72       | 34           | 🟡 MEDIA   |
| 5    | Consolidación Deps     | 0        | 6            | 🟢 BAJA    |
| 6    | Scripts Obsoletos      | 17       | 0            | 🟢 BAJA    |

**Total:** 225 archivos + 49 dependencias a eliminar

---

## FASE 1: Seguridad Crítica 🔴

### 1.1 CVE-2025-68428 - jspdf (CRÍTICO)

```bash
# Actualizar a versión segura
yarn workspace web add jspdf@^4.0.0
```

**Breaking changes a verificar:**

- API de `loadFile()` cambió
- Verificar uso en generación de PDFs

### 1.2 CVE-2023-30533 - xlsx (ALTO)

```bash
# Opción A: Migrar a CDN oficial
yarn workspace web remove xlsx
yarn workspace web add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

# Opción B: Reemplazar por exceljs (recomendado)
yarn workspace web remove xlsx
yarn workspace web add exceljs
```

### 1.3 cache-manager-ioredis-yet (DEPRECATED)

```bash
yarn workspace api remove cache-manager-ioredis-yet
```

**Nota:** Ya usamos Keyv con @keyv/redis. Verificar que no haya imports residuales.

### 1.4 ESLint 8.x → 9.x (web)

```bash
yarn workspace web add -D eslint@^9.39.0 eslint-config-next@latest
```

**Acción manual:** Migrar `eslint.config.mjs` a flat config.

---

## FASE 2: Features Abandonadas 🟠

### 2.1 Colonia Landing (14 archivos)

Feature de landing page antigua para cursos de verano.

```bash
rm -rf apps/web/src/components/colonia/
```

**Archivos a eliminar:**

```
apps/web/src/components/colonia/BenefitsSection.tsx
apps/web/src/components/colonia/CourseCard.tsx
apps/web/src/components/colonia/CourseCatalog.tsx
apps/web/src/components/colonia/CourseDetailModal.tsx
apps/web/src/components/colonia/CTASection.tsx
apps/web/src/components/colonia/FAQSection.tsx
apps/web/src/components/colonia/Footer.tsx
apps/web/src/components/colonia/HeroSection.tsx
apps/web/src/components/colonia/HowToEnrollSection.tsx
apps/web/src/components/colonia/InfoSection.tsx
apps/web/src/components/colonia/InscriptionForm.tsx
apps/web/src/components/colonia/PricingSection.tsx
apps/web/src/components/colonia/ScheduleGrid.tsx
apps/web/src/components/colonia/ScrollToTop.tsx
```

### 2.2 Quiz/Asincronicos (17 archivos)

Feature de quizzes nunca implementada completamente.

```bash
rm -rf apps/web/src/components/asincronicos/
rm -rf apps/web/src/components/quiz/
```

**Archivos a eliminar:**

```
apps/web/src/components/asincronicos/BeneficiosSection.tsx
apps/web/src/components/asincronicos/CursosGrid.tsx
apps/web/src/components/asincronicos/FAQAsincronicos.tsx
apps/web/src/components/asincronicos/HeroAsincronicos.tsx
apps/web/src/components/asincronicos/QuizCard.tsx
apps/web/src/components/quiz/Pregunta1.tsx
apps/web/src/components/quiz/Pregunta2.tsx
apps/web/src/components/quiz/Pregunta3.tsx
apps/web/src/components/quiz/Pregunta4.tsx
apps/web/src/components/quiz/Pregunta5.tsx
apps/web/src/components/quiz/QuizAsincronico.tsx
apps/web/src/components/quiz/QuizModal.tsx
```

### 2.3 Resultado (9 archivos)

Feature de resultados de quiz abandonada.

```bash
rm -rf apps/web/src/components/resultado/
```

**Archivos a eliminar:**

```
apps/web/src/components/resultado/CaminoAprendizaje.tsx
apps/web/src/components/resultado/DescuentoMultipleHijo.tsx
apps/web/src/components/resultado/FAQSection.tsx
apps/web/src/components/resultado/GarantiaSection.tsx
apps/web/src/components/resultado/HeaderResultado.tsx
apps/web/src/components/resultado/LoadingAnalysis.tsx
apps/web/src/components/resultado/OpcionesPago.tsx
apps/web/src/components/resultado/RutasAlternativas.tsx
apps/web/src/components/resultado/StickyCTAMobile.tsx
```

### 2.4 Dashboard/Docente Huérfanos (13 archivos)

Componentes de dashboard nunca integrados.

```bash
# Dashboard
rm apps/web/src/components/dashboard/ActivityCard.tsx
rm apps/web/src/components/dashboard/EvaluacionCard.tsx
rm apps/web/src/components/dashboard/MisLogrosCard.tsx
rm apps/web/src/components/dashboard/ProximaClaseCard.tsx

# Docente
rm apps/web/src/components/docente/AlertasDocente.tsx
rm apps/web/src/components/docente/AttendanceChart.tsx
rm apps/web/src/components/docente/CourseList.tsx
rm apps/web/src/components/docente/DarkVeil.tsx
rm apps/web/src/components/docente/LiveClassHero.tsx
rm apps/web/src/components/docente/ModalAsignarInsignia.tsx
rm apps/web/src/components/docente/NotificationCenter.tsx
rm apps/web/src/components/docente/StatsGrid.tsx
```

### 2.5 Planificaciones Obsoletas (36+ archivos)

```bash
rm -rf apps/web/src/planificaciones/
rm -rf apps/web/src/features/admin/classes/
rm -rf apps/web/src/features/admin/dashboard/
rm -rf apps/web/src/features/admin/products/
rm -rf apps/web/src/features/admin/stats/
rm -rf apps/web/src/features/admin/users/
```

---

## FASE 3: Código Muerto Backend 🟡

### 3.1 Scripts Prisma Obsoletos (7 archivos)

```bash
rm apps/api/prisma/actualizar-precios.ts
rm apps/api/prisma/calcular-inscripciones-inteligente.ts
rm apps/api/prisma/crear-inscripciones-mensuales.ts
rm apps/api/prisma/import-estudiantes-reales.ts
rm apps/api/prisma/limpiar-duplicados.ts
rm apps/api/prisma/seed-add-alexis-admin.ts
rm apps/api/prisma/seed-add-datos-reales.ts
```

### 3.2 Barrel Files Vacíos (40+ archivos)

```bash
# Eliminar todos los index.ts vacíos o sin consumidores
rm apps/api/src/auth/dto/login-response.dto.ts
rm apps/api/src/auth/types/index.ts
rm apps/api/src/auth/use-cases/index.ts
rm apps/api/src/cache/decorators/index.ts
rm apps/api/src/cache/index.ts
rm apps/api/src/cache/interceptors/index.ts
rm apps/api/src/casas/dto/index.ts
rm apps/api/src/common/dto/index.ts
rm apps/api/src/common/guards/index.ts
rm apps/api/src/common/interfaces/index.ts
rm apps/api/src/common/validators/index.ts
rm apps/api/src/feature-flags/index.ts
rm apps/api/src/health/index.ts
rm apps/api/src/observability/context/index.ts
rm apps/api/src/observaciones/dto/index.ts
rm apps/api/src/security/throttler/index.ts
rm apps/api/src/suscripciones/domain/constants/index.ts
rm apps/api/src/suscripciones/services/index.ts
rm apps/api/src/tiers/index.ts
```

### 3.3 Dependencias Backend (5)

```bash
yarn workspace api remove cache-manager-ioredis-yet
yarn workspace api remove puppeteer  # Si no se usa para PDFs
```

**Verificar antes de eliminar:**

- `@mateatletas/contracts` - Debería usarse
- `dotenv` - Posible uso implícito
- `swagger-ui-express` - Usado por NestJS Swagger

### 3.4 Fix Import Roto

```bash
# Corregir import en test
# apps/api/src/estudiantes/guards/__tests__/estudiante-ownership.guard.spec.ts:11
# Cambiar: ../../gamificacion/services/logros.service
# A: ../../../gamificacion/services/logros.service
```

---

## FASE 4: Código Muerto Frontend 🟡

### 4.1 Hooks No Utilizados (9 archivos)

```bash
rm apps/web/src/hooks/useCasaDistribution.ts
rm apps/web/src/hooks/useDeviceType.ts
rm apps/web/src/hooks/useScrollAnimation.ts
rm apps/web/src/hooks/useWindowSize.ts
rm apps/web/src/lib/hooks/useCalendario.ts
rm apps/web/src/lib/hooks/useClases.ts
rm apps/web/src/lib/hooks/useEstudiantes.ts
rm apps/web/src/lib/hooks/useNotificaciones.ts
rm apps/web/src/lib/hooks/usePagos.ts
```

### 4.2 Stores No Utilizados (8 archivos)

```bash
rm apps/web/src/store/admin.store.ts
rm apps/web/src/store/calendario.store.ts
rm apps/web/src/store/casas.store.ts
rm apps/web/src/store/catalogo.store.ts
rm apps/web/src/store/clases.store.ts
rm apps/web/src/store/estudiantes.store.ts
rm apps/web/src/store/notificaciones.store.ts
rm apps/web/src/store/pagos.store.ts
```

### 4.3 APIs No Utilizadas (8 archivos)

```bash
rm apps/web/src/lib/api/calendario.api.ts
rm apps/web/src/lib/api/casas.api.ts
rm apps/web/src/lib/api/cursos-tienda.api.ts
rm apps/web/src/lib/api/inscripciones-2026.ts
rm apps/web/src/lib/api/notificaciones.api.ts
rm apps/web/src/lib/api/pagos.api.ts
rm apps/web/src/lib/api/quizApi.ts
rm apps/web/src/lib/api/tutor.api.ts
```

### 4.4 Types/Schemas No Utilizados (12 archivos)

```bash
rm apps/web/src/types/admin-clases.types.ts
rm apps/web/src/types/calendario.types.ts
rm apps/web/src/types/casa.types.ts
rm apps/web/src/types/colonia.ts
rm apps/web/src/types/courses.ts
rm apps/web/src/types/inscripciones-2026.ts
rm apps/web/src/types/pago.types.ts
rm apps/web/src/types/reportes.types.ts
rm apps/web/src/types/tutor-dashboard.types.ts
rm apps/web/src/lib/schemas/casa.schema.ts
rm apps/web/src/lib/schemas/estudiante.schema.ts
rm apps/web/src/lib/schemas/notificacion.schema.ts
```

### 4.5 Dependencias Frontend Obsoletas (34)

**Eliminar completamente:**

```bash
# Librería 3D no utilizada
yarn workspace web remove 3dmol @react-three/drei @react-three/fiber

# MUI reemplazado por design system propio
yarn workspace web remove @mui/material @mui/icons-material @emotion/react @emotion/styled

# Animaciones no utilizadas
yarn workspace web remove @lottiefiles/dotlottie-react @types/animejs leva

# Gestures no utilizados
yarn workspace web remove @use-gesture/react

# Física no utilizada (a menos que game-engine la use)
yarn workspace web remove matter-js @types/matter-js

# Verificar si se usan antes de eliminar:
yarn workspace web remove fengari-web  # Lua en browser
yarn workspace web remove howler       # Audio
yarn workspace web remove papaparse    # CSV
yarn workspace web remove react-rnd    # Drag resize
```

**Mover a packages correspondientes:**

```bash
# Si se usan en lesson-engine
yarn workspace web remove @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
yarn workspace @mateatletas/lesson-engine add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Audio para game-engine
yarn workspace web remove howler
yarn workspace @mateatletas/game-engine add howler
```

---

## FASE 5: Consolidación de Dependencias 🟢

### 5.1 Mover del Root a Workspaces Correctos

```bash
# WebSockets → API
yarn remove @nestjs/platform-socket.io @nestjs/websockets socket.io reflect-metadata
yarn workspace api add @nestjs/platform-socket.io @nestjs/websockets socket.io reflect-metadata

# React utilities → Web
yarn remove react-resizable-panels react-use
yarn workspace web add react-resizable-panels react-use
```

### 5.2 Agregar Dependencias Faltantes

```bash
# Dependencias usadas pero no listadas
yarn workspace api add -D @paralleldrive/cuid2
yarn workspace web add postcss
yarn workspace @mateatletas/contracts add -D @vitest/coverage-v8
yarn workspace @mateatletas/game-engine add -D @vitest/coverage-v8
```

### 5.3 Unificar Versiones Inconsistentes

**TypeScript → 5.9.x:**

```bash
yarn add -D typescript@^5.9.0
yarn workspace api add -D typescript@^5.9.0
yarn workspace @mateatletas/contracts add -D typescript@^5.9.0
yarn workspace @mateatletas/ui add -D typescript@^5.9.0
yarn workspace @mateatletas/game-engine add -D typescript@^5.9.0
yarn workspace @mateatletas/lesson-engine add -D typescript@^5.9.0
```

**Vitest → 4.x:**

```bash
yarn workspace @mateatletas/contracts add -D vitest@^4.0.16
yarn workspace @mateatletas/ui add -D vitest@^4.0.16
yarn workspace @mateatletas/game-engine add -D vitest@^4.0.16
```

**framer-motion → 12.x:**

```bash
yarn workspace @mateatletas/ui add framer-motion@^12.26.0
yarn workspace @mateatletas/lesson-engine add framer-motion@^12.26.0
```

**lucide-react → unificado:**

```bash
yarn workspace web add lucide-react@^0.562.0
yarn workspace @mateatletas/ui add lucide-react@^0.562.0
yarn workspace @mateatletas/lesson-engine add lucide-react@^0.562.0
```

---

## FASE 6: Scripts Obsoletos 🟢

```bash
rm scripts/asignar-estudiantes-a-grupos.js
rm scripts/contar-todos-datos.js
rm scripts/crear-estudiante-emmita.js
rm scripts/crear-estudiante-emmita.ts
rm scripts/crear-usuario-prueba-railway.ts
rm scripts/export-estudiantes-grupos.js
rm scripts/export-estudiantes-grupos.ts
rm scripts/procesar-csv-estudiantes.js
rm scripts/reset-password.ts
rm scripts/test-pagos-completo.ts
rm scripts/update-user-password.js
rm scripts/upload-animations.js
rm scripts/verificar-datos.js
rm scripts/verificar-todas-relaciones.js
rm -rf scripts/seeds/
```

---

## Script de Limpieza Automatizado

Crear `scripts/cleanup-brutal.sh`:

```bash
#!/bin/bash
set -e

echo "🔥 LIMPIEZA ULTRA BRUTAL - Mateatletas Ecosystem"
echo "================================================"

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar desde la raíz del proyecto"
    exit 1
fi

# Fase 1: Seguridad
echo ""
echo "📦 FASE 1: Actualizaciones de Seguridad..."
yarn workspace web add jspdf@^4.0.0
yarn workspace web remove xlsx
yarn workspace web add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
yarn workspace api remove cache-manager-ioredis-yet

# Fase 2: Features abandonadas
echo ""
echo "🗑️  FASE 2: Eliminando features abandonadas..."
rm -rf apps/web/src/components/colonia/
rm -rf apps/web/src/components/asincronicos/
rm -rf apps/web/src/components/quiz/
rm -rf apps/web/src/components/resultado/
rm -rf apps/web/src/planificaciones/
rm -rf apps/web/src/features/admin/classes/
rm -rf apps/web/src/features/admin/dashboard/
rm -rf apps/web/src/features/admin/products/
rm -rf apps/web/src/features/admin/stats/
rm -rf apps/web/src/features/admin/users/

# Fase 3: Componentes huérfanos
echo ""
echo "🧹 FASE 3: Eliminando componentes huérfanos..."
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

# Fase 4: Hooks, stores, APIs muertos
echo ""
echo "💀 FASE 4: Eliminando código muerto..."
rm -f apps/web/src/hooks/useCasaDistribution.ts
rm -f apps/web/src/hooks/useDeviceType.ts
rm -f apps/web/src/hooks/useScrollAnimation.ts
rm -f apps/web/src/hooks/useWindowSize.ts
rm -f apps/web/src/lib/hooks/useCalendario.ts
rm -f apps/web/src/lib/hooks/useClases.ts
rm -f apps/web/src/lib/hooks/useEstudiantes.ts
rm -f apps/web/src/lib/hooks/useNotificaciones.ts
rm -f apps/web/src/lib/hooks/usePagos.ts

rm -f apps/web/src/store/admin.store.ts
rm -f apps/web/src/store/calendario.store.ts
rm -f apps/web/src/store/casas.store.ts
rm -f apps/web/src/store/catalogo.store.ts
rm -f apps/web/src/store/clases.store.ts
rm -f apps/web/src/store/estudiantes.store.ts
rm -f apps/web/src/store/notificaciones.store.ts
rm -f apps/web/src/store/pagos.store.ts

rm -f apps/web/src/lib/api/calendario.api.ts
rm -f apps/web/src/lib/api/casas.api.ts
rm -f apps/web/src/lib/api/cursos-tienda.api.ts
rm -f apps/web/src/lib/api/inscripciones-2026.ts
rm -f apps/web/src/lib/api/notificaciones.api.ts
rm -f apps/web/src/lib/api/pagos.api.ts
rm -f apps/web/src/lib/api/quizApi.ts
rm -f apps/web/src/lib/api/tutor.api.ts

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

# Fase 5: Scripts Prisma obsoletos
echo ""
echo "🗃️  FASE 5: Eliminando scripts Prisma obsoletos..."
rm -f apps/api/prisma/actualizar-precios.ts
rm -f apps/api/prisma/calcular-inscripciones-inteligente.ts
rm -f apps/api/prisma/crear-inscripciones-mensuales.ts
rm -f apps/api/prisma/import-estudiantes-reales.ts
rm -f apps/api/prisma/limpiar-duplicados.ts
rm -f apps/api/prisma/seed-add-alexis-admin.ts
rm -f apps/api/prisma/seed-add-datos-reales.ts

# Fase 6: Scripts root obsoletos
echo ""
echo "📜 FASE 6: Eliminando scripts obsoletos..."
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

# Fase 7: Dependencias
echo ""
echo "📦 FASE 7: Limpiando dependencias..."
# Eliminar libs no utilizadas
yarn workspace web remove 3dmol @react-three/drei @react-three/fiber || true
yarn workspace web remove @mui/material @mui/icons-material @emotion/react @emotion/styled || true
yarn workspace web remove @lottiefiles/dotlottie-react leva || true
yarn workspace web remove @use-gesture/react || true

# Mover deps del root
yarn remove @nestjs/platform-socket.io @nestjs/websockets socket.io || true
yarn workspace api add @nestjs/platform-socket.io @nestjs/websockets socket.io || true

yarn remove react-resizable-panels react-use || true
yarn workspace web add react-resizable-panels react-use || true

echo ""
echo "✅ LIMPIEZA COMPLETADA"
echo ""
echo "Próximos pasos manuales:"
echo "1. yarn install"
echo "2. yarn build"
echo "3. yarn lint"
echo "4. yarn test"
echo "5. Verificar funcionamiento en browser"
echo "6. Ejecutar 'yarn knip' para verificar limpieza"
```

---

## Verificación Post-Limpieza

```bash
# 1. Reinstalar dependencias
yarn install

# 2. Verificar build
yarn build

# 3. Verificar linting
yarn lint

# 4. Ejecutar tests
yarn test

# 5. Re-ejecutar knip
yarn knip

# 6. Verificar tamaño de node_modules
du -sh node_modules/
```

---

## Métricas Esperadas Post-Limpieza

| Métrica            | Antes  | Después | Reducción     |
| ------------------ | ------ | ------- | ------------- |
| Archivos totales   | ~1,500 | ~1,275  | -225 (-15%)   |
| Dependencies (web) | ~80    | ~50     | -30 (-37%)    |
| Dependencies (api) | ~50    | ~45     | -5 (-10%)     |
| node_modules       | ~800MB | ~680MB  | ~120MB (-15%) |
| Bundle size web    | X MB   | -15%    | Estimado      |
| Warnings knip      | 537+   | <50     | -90%          |

---

## Notas Importantes

1. **SIEMPRE hacer backup antes de ejecutar el script**

   ```bash
   git stash
   git checkout -b backup/pre-cleanup-$(date +%Y%m%d)
   ```

2. **Ejecutar en orden** - Las fases están ordenadas por prioridad e impacto

3. **Verificar imports** - Después de eliminar archivos, algunos imports pueden fallar

4. **Tests primero** - Asegurar que todos los tests pasen ANTES de la limpieza

5. **Commit por fase** - Hacer commits separados por cada fase para facilitar rollback

---

## Comando Rápido para Empezar

```bash
# Crear rama de limpieza
git checkout -b cleanup/brutal-$(date +%Y%m%d)

# Ejecutar script
chmod +x scripts/cleanup-brutal.sh
./scripts/cleanup-brutal.sh

# Verificar
yarn build && yarn lint && yarn test
```

---

**Generado automáticamente por Claude Code**
**Ejecutar con precaución - siempre hacer backup primero**
