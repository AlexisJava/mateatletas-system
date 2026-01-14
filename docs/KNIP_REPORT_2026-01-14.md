# Knip Report - Mateatletas Ecosystem

**Fecha:** 2026-01-14
**Herramienta:** knip v5.81.0
**Rama:** feature/game-engine

---

## Resumen Ejecutivo

| Categoría                     | Cantidad |
| ----------------------------- | -------- |
| Archivos no utilizados        | 225      |
| Dependencias no utilizadas    | 48       |
| DevDependencias no utilizadas | 13       |
| Dependencias no listadas      | 8        |
| Binarios no listados          | 8        |
| Imports no resueltos          | 1        |
| Exports no utilizados         | 537+     |

---

## 1. Archivos No Utilizados (225)

### 1.1 Scripts de Prisma/Seeds (7 archivos)

```
apps/api/prisma/actualizar-precios.ts
apps/api/prisma/calcular-inscripciones-inteligente.ts
apps/api/prisma/crear-inscripciones-mensuales.ts
apps/api/prisma/import-estudiantes-reales.ts
apps/api/prisma/limpiar-duplicados.ts
apps/api/prisma/seed-add-alexis-admin.ts
apps/api/prisma/seed-add-datos-reales.ts
```

**Acción:** Evaluar si estos scripts son necesarios o moverlos a `/scripts/db/`

### 1.2 Barrel Files (index.ts) vacíos o sin consumidores (40+ archivos)

```
apps/api/src/auth/dto/login-response.dto.ts
apps/api/src/auth/types/index.ts
apps/api/src/auth/use-cases/index.ts
apps/api/src/cache/decorators/index.ts
apps/api/src/cache/index.ts
apps/api/src/cache/interceptors/index.ts
apps/api/src/casas/dto/index.ts
apps/api/src/common/dto/index.ts
apps/api/src/common/guards/index.ts
apps/api/src/common/interfaces/index.ts
apps/api/src/common/validators/index.ts
apps/api/src/feature-flags/index.ts
apps/api/src/health/index.ts
apps/api/src/observability/context/index.ts
apps/api/src/observaciones/dto/index.ts
apps/api/src/security/throttler/index.ts
apps/api/src/suscripciones/domain/constants/index.ts
apps/api/src/suscripciones/services/index.ts
apps/api/src/tiers/index.ts
... y más
```

**Acción:** Eliminar barrel files vacíos o sin consumidores

### 1.3 Componentes Frontend No Utilizados (90+ archivos)

#### Colonia (landing page antigua)

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

#### Quiz/Asincronicos (feature abandonada)

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

#### Resultado (feature abandonada)

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

#### Dashboard/Docente componentes huérfanos

```
apps/web/src/components/dashboard/ActivityCard.tsx
apps/web/src/components/dashboard/EvaluacionCard.tsx
apps/web/src/components/dashboard/MisLogrosCard.tsx
apps/web/src/components/dashboard/ProximaClaseCard.tsx
apps/web/src/components/docente/AlertasDocente.tsx
apps/web/src/components/docente/AttendanceChart.tsx
apps/web/src/components/docente/CourseList.tsx
apps/web/src/components/docente/DarkVeil.tsx
apps/web/src/components/docente/LiveClassHero.tsx
apps/web/src/components/docente/ModalAsignarInsignia.tsx
apps/web/src/components/docente/NotificationCenter.tsx
apps/web/src/components/docente/StatsGrid.tsx
```

**Acción:** Eliminar componentes de features abandonadas

### 1.4 Hooks No Utilizados

```
apps/web/src/hooks/useCasaDistribution.ts
apps/web/src/hooks/useDeviceType.ts
apps/web/src/hooks/useScrollAnimation.ts
apps/web/src/hooks/useWindowSize.ts
apps/web/src/lib/hooks/useCalendario.ts
apps/web/src/lib/hooks/useClases.ts
apps/web/src/lib/hooks/useEstudiantes.ts
apps/web/src/lib/hooks/useNotificaciones.ts
apps/web/src/lib/hooks/usePagos.ts
```

### 1.5 Stores No Utilizados

```
apps/web/src/store/admin.store.ts
apps/web/src/store/calendario.store.ts
apps/web/src/store/casas.store.ts
apps/web/src/store/catalogo.store.ts
apps/web/src/store/clases.store.ts
apps/web/src/store/estudiantes.store.ts
apps/web/src/store/notificaciones.store.ts
apps/web/src/store/pagos.store.ts
```

### 1.6 APIs No Utilizadas

```
apps/web/src/lib/api/calendario.api.ts
apps/web/src/lib/api/casas.api.ts
apps/web/src/lib/api/cursos-tienda.api.ts
apps/web/src/lib/api/inscripciones-2026.ts
apps/web/src/lib/api/notificaciones.api.ts
apps/web/src/lib/api/pagos.api.ts
apps/web/src/lib/api/quizApi.ts
apps/web/src/lib/api/tutor.api.ts
```

### 1.7 Types/Schemas No Utilizados

```
apps/web/src/types/admin-clases.types.ts
apps/web/src/types/calendario.types.ts
apps/web/src/types/casa.types.ts
apps/web/src/types/colonia.ts
apps/web/src/types/courses.ts
apps/web/src/types/inscripciones-2026.ts
apps/web/src/types/pago.types.ts
apps/web/src/types/reportes.types.ts
apps/web/src/types/tutor-dashboard.types.ts
apps/web/src/lib/schemas/casa.schema.ts
apps/web/src/lib/schemas/estudiante.schema.ts
apps/web/src/lib/schemas/notificacion.schema.ts
```

### 1.8 Planificaciones/Features admin (Features por Desarrollar)

```
apps/web/src/features/admin/classes/*
apps/web/src/features/admin/dashboard/*
apps/web/src/features/admin/products/*
apps/web/src/features/admin/stats/*
apps/web/src/features/admin/users/*
apps/web/src/planificaciones/2025-11-*
apps/web/src/planificaciones/shared/*
```

### 1.9 Scripts No Utilizados (17 archivos)

```
scripts/asignar-estudiantes-a-grupos.js
scripts/contar-todos-datos.js
scripts/crear-estudiante-emmita.js
scripts/crear-estudiante-emmita.ts
scripts/crear-usuario-prueba-railway.ts
scripts/export-estudiantes-grupos.js
scripts/export-estudiantes-grupos.ts
scripts/procesar-csv-estudiantes.js
scripts/reset-password.ts
scripts/seeds/crear-estudiante.js
scripts/seeds/create-student.js
scripts/seeds/seed-estudiante.js
scripts/test-pagos-completo.ts
scripts/update-user-password.js
scripts/upload-animations.js
scripts/verificar-datos.js
scripts/verificar-todas-relaciones.js
```

---

## 2. Dependencias No Utilizadas (48)

### 2.1 apps/api (5 dependencias)

| Paquete                     | Línea | Acción                                 |
| --------------------------- | ----- | -------------------------------------- |
| `@mateatletas/contracts`    | 37    | **REVISAR** - Debería estar en uso     |
| `cache-manager-ioredis-yet` | 60    | **ELIMINAR** - Deprecated              |
| `dotenv`                    | 65    | **REVISAR** - Posible uso implícito    |
| `puppeteer`                 | 77    | **EVALUAR** - ¿Se usa para PDFs?       |
| `swagger-ui-express`        | 83    | **REVISAR** - Usado por NestJS Swagger |

### 2.2 apps/web (34 dependencias)

| Paquete                        | Comentario                                     |
| ------------------------------ | ---------------------------------------------- |
| `3dmol`                        | Librería 3D para química - ¿En uso?            |
| `@dnd-kit/core`                | Drag & Drop - Posiblemente para lesson-engine  |
| `@dnd-kit/sortable`            | Drag & Drop - Posiblemente para lesson-engine  |
| `@dnd-kit/utilities`           | Drag & Drop utilities                          |
| `@emotion/react`               | MUI dependency - Evaluar si MUI se usa         |
| `@emotion/styled`              | MUI dependency                                 |
| `@hookform/resolvers`          | Form validation - Revisar uso                  |
| `@lottiefiles/dotlottie-react` | Animaciones - ¿En uso?                         |
| `@mui/icons-material`          | MUI Icons - ¿Reemplazados por Lucide?          |
| `@mui/material`                | MUI Components - ¿Reemplazados?                |
| `@react-three/drei`            | Three.js helpers - ¿En uso?                    |
| `@react-three/fiber`           | React Three.js - ¿En uso?                      |
| `@types/animejs`               | Types para anime.js                            |
| `@use-gesture/react`           | Gestures - ¿En uso?                            |
| `@vercel/blob`                 | Vercel Blob storage - ¿En uso?                 |
| `clsx`                         | Class names utility - **Debería estar en uso** |
| `fengari-web`                  | Lua en browser - Feature específica            |
| `howler`                       | Audio library - ¿Para game-engine?             |
| `isomorphic-dompurify`         | HTML sanitization                              |
| `jspdf`                        | PDF generation - **TIENE CVE**                 |
| `jspdf-autotable`              | PDF tables                                     |
| `katex`                        | Math rendering                                 |
| `leva`                         | Debug controls                                 |
| `marked`                       | Markdown parser                                |
| `mathjs`                       | Math library                                   |
| `matter-js`                    | Physics engine                                 |
| `papaparse`                    | CSV parser                                     |
| `react-confetti-explosion`     | Celebraciones                                  |
| `react-countup`                | Animated numbers                               |
| `react-hook-form`              | Forms - **Debería estar en uso**               |
| `react-katex`                  | React KaTeX wrapper                            |
| `react-rnd`                    | Resizable/Draggable                            |
| `xlsx`                         | Excel - **TIENE CVE**                          |

### 2.3 root package.json (6 dependencias)

| Paquete                      | Acción               |
| ---------------------------- | -------------------- |
| `@nestjs/platform-socket.io` | **MOVER** a apps/api |
| `@nestjs/websockets`         | **MOVER** a apps/api |
| `react-resizable-panels`     | **MOVER** a apps/web |
| `react-use`                  | **MOVER** a apps/web |
| `reflect-metadata`           | **MOVER** a apps/api |
| `socket.io`                  | **MOVER** a apps/api |

### 2.4 packages/\* (3 dependencias)

| Paquete                  | Ubicación     | Acción          |
| ------------------------ | ------------- | --------------- |
| `@mateatletas/ui`        | game-engine   | **REVISAR** uso |
| `@mateatletas/contracts` | lesson-engine | **REVISAR** uso |
| `@dnd-kit/core`          | ui            | **REVISAR** uso |

---

## 3. DevDependencias No Utilizadas (13)

| Paquete                            | Ubicación   | Acción                                              |
| ---------------------------------- | ----------- | --------------------------------------------------- |
| `@eslint/eslintrc`                 | api, web    | ESLint 9 legacy - Evaluar                           |
| `@types/multer`                    | api         | ¿Se usa file upload?                                |
| `madge`                            | api         | Dependency analysis - Útil pero no usado            |
| `@types/matter-js`                 | web         | Types para matter-js                                |
| `axe-core`                         | web         | Accessibility - Redundante con @axe-core/playwright |
| `@types/react`                     | root        | Duplicado                                           |
| `@types/react-dom`                 | root        | Duplicado                                           |
| `@typescript-eslint/eslint-plugin` | root        | Usado por eslint config                             |
| `@typescript-eslint/parser`        | root        | Usado por eslint config                             |
| `eslint-config-prettier`           | root        | Usado por eslint config                             |
| `eslint-plugin-prettier`           | root        | Usado por eslint config                             |
| `@types/react`                     | game-engine | Duplicado                                           |

---

## 4. Dependencias No Listadas (8)

Estas dependencias se usan pero no están en package.json:

| Paquete                | Ubicación              | Acción                         |
| ---------------------- | ---------------------- | ------------------------------ |
| `@paralleldrive/cuid2` | api tests              | **AGREGAR** a devDependencies  |
| `postcss`              | web                    | **AGREGAR** a dependencies     |
| `@vitest/coverage-v8`  | contracts, game-engine | **AGREGAR** a devDependencies  |
| `dotenv`               | scripts                | Usado en upload-animations.mjs |
| `@vercel/blob`         | scripts                | Usado en upload-animations.mjs |

---

## 5. Binarios No Listados (8)

| Binario             | Ubicación    | Comentario                    |
| ------------------- | ------------ | ----------------------------- |
| `admin-estudiantes` | CI           | Workflow específico           |
| `lint-staged`       | husky        | Falta instalación             |
| `sleep`             | package.json | Comando del sistema           |
| `pkill`             | package.json | Comando del sistema           |
| `lsof`              | package.json | Comando del sistema           |
| `test/integration`  | package.json | Ruta de tests                 |
| `artillery`         | package.json | Load testing - No instalado   |
| `railway`           | package.json | CLI de Railway - No instalado |

---

## 6. Imports No Resueltos (1)

```
../../gamificacion/services/logros.service
  → apps/api/src/estudiantes/guards/__tests__/estudiante-ownership.guard.spec.ts:11:31
```

**Acción:** Corregir import path en el test

---

## 7. Exports No Utilizados (537+)

Los exports no utilizados son demasiados para listar individualmente. Las categorías principales son:

### 7.1 API Backend - Funciones de utilidad exportadas pero no usadas

- Funciones de validación en `auth/types/auth-user.type.ts`
- Constantes de caché en `cache/cache.constants.ts`
- Funciones de precio en `pagos/domain/rules/precio.rules.ts`
- Funciones de suscripción en `suscripciones/domain/constants/`

### 7.2 Frontend - Componentes exportados por index pero no importados

- Charts de admin (`AdminAreaChart`, `AdminBarChart`, etc.)
- Componentes de design-system
- Utilidades de tema
- Hooks del design-system

### 7.3 Test Helpers - Funciones de testing no utilizadas

- `assertEstudianteNotExists`
- `assertXPIncreased`
- `assertHasLogro`
- `cleanEstudiantes`
- Muchos más en `apps/api/test/helpers/`

---

## 8. Plan de Acción Recomendado

### 8.1 Prioridad Alta (Seguridad/Limpieza Crítica)

```bash
# 1. Eliminar dependencias con CVEs
yarn workspace web remove xlsx jspdf

# 2. Eliminar dependencias deprecated
yarn workspace api remove cache-manager-ioredis-yet

# 3. Agregar dependencias faltantes
yarn workspace api add -D @paralleldrive/cuid2
yarn workspace web add postcss
yarn workspace @mateatletas/contracts add -D @vitest/coverage-v8
yarn workspace @mateatletas/game-engine add -D @vitest/coverage-v8
```

### 8.2 Prioridad Media (Limpieza de Código)

1. **Eliminar componentes de features abandonadas:**
   - `/components/colonia/` - Landing antigua
   - `/components/asincronicos/` - Feature no implementada
   - `/components/quiz/` - Feature no implementada
   - `/components/resultado/` - Feature no implementada

2. **Eliminar stores no utilizados:**
   - Todo en `apps/web/src/store/` excepto `auth.store.ts`

3. **Eliminar APIs no utilizadas:**
   - `calendario.api.ts`, `casas.api.ts`, `pagos.api.ts`, etc.

### 8.3 Prioridad Baja (Optimización)

1. **Mover dependencias del root a workspaces correctos:**

   ```bash
   # WebSockets → API
   yarn remove @nestjs/platform-socket.io @nestjs/websockets socket.io reflect-metadata
   yarn workspace api add @nestjs/platform-socket.io @nestjs/websockets socket.io reflect-metadata

   # React utilities → Web
   yarn remove react-resizable-panels react-use
   yarn workspace web add react-resizable-panels react-use
   ```

2. **Limpiar barrel files vacíos** (40+ archivos index.ts)

3. **Eliminar scripts obsoletos** en `/scripts/`

---

## 9. Métricas de Impacto

Si se implementan todas las acciones:

| Métrica            | Antes  | Después (Estimado) |
| ------------------ | ------ | ------------------ |
| Archivos totales   | ~1,500 | ~1,275 (-225)      |
| Dependencies (web) | ~80    | ~50 (-30)          |
| Dependencies (api) | ~50    | ~45 (-5)           |
| Bundle size web    | X MB   | -15% (estimado)    |
| `node_modules`     | ~800MB | -10% (estimado)    |

---

## 10. Comando para Re-auditoría

```bash
# Ejecutar knip nuevamente después de las correcciones
npx knip

# Para ver solo issues sin las sugerencias de config
npx knip --no-hints

# Para exportar en JSON
npx knip --reporter json > knip-results.json
```

---

**Generado automáticamente por Claude Code**
**Próxima auditoría recomendada:** Después de implementar acciones de prioridad alta
