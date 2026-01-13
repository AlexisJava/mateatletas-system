# Auditoría - Estado Actual del Proyecto

**Fecha:** 2026-01-13
**Auditor:** Claude Code
**Versión:** 1.0

---

## Resumen Ejecutivo

El proyecto Mateatletas tiene una **arquitectura bien definida** pero con implementación **parcial** en varios sistemas críticos. El **backend está maduro** (35+ módulos NestJS, 69 modelos Prisma, 92 tests de integración pasando). El **Sandbox del Admin** está funcional y conectado. Sin embargo, los packages compartidos (`lesson-engine`, `game-engine`, `ui`) tienen **estructura pero sin implementación real** - están marcados como "FASE 2/3/4" pendientes.

**Estado general:** ~60% completo en estructura, ~40% en implementación real.

---

## 1. Sandbox

**Estado:** ✅ **Completo y Funcional**

### Ubicación

`apps/web/src/components/admin/views/sandbox/`

### Componentes implementados

| Archivo             | Líneas | Estado               |
| ------------------- | ------ | -------------------- |
| `SandboxView.tsx`   | 541    | ⚠️ Excede 300 líneas |
| `StartModal.tsx`    | 170    | ✅ OK                |
| `TreePanel.tsx`     | 282    | ✅ OK                |
| `EditorPanel.tsx`   | ~200   | ✅ OK                |
| `PreviewPanel.tsx`  | ~150   | ✅ OK                |
| `SaveIndicator.tsx` | ~30    | ✅ OK                |

### Funcionalidades

- ✅ Creación de Microlecciones y Planificaciones
- ✅ Árbol de nodos recursivo con CRUD
- ✅ Editor Monaco para JSON
- ✅ Preview con LessonRenderer
- ✅ Auto-guardado (300ms debounce)
- ✅ Context API para estado global
- ✅ Tests E2E actualizados

### Issues detectados

1. **SandboxView.tsx tiene 541 líneas** - viola la regla de máximo 300 líneas
2. **Colores hardcodeados** en `StartModal.tsx`:
   ```tsx
   { value: 'QUANTUM', label: 'Quantum', color: '#F472B6' }
   ```
   Deberían usar tokens de `@mateatletas/ui`

### Conectividad Backend

- ✅ API endpoints funcionando (`/api/admin/contenidos/*`)
- ✅ 92 tests de integración pasando

---

## 2. Design System

**Estado:** ⚠️ **Parcial - Estructura sin componentes**

### packages/ui (Source of Truth)

| Carpeta         | Estado          | Contenido                                      |
| --------------- | --------------- | ---------------------------------------------- |
| `tokens/`       | ✅ Implementado | `colors.ts`, `typography.ts`, `motion.ts`      |
| `hooks/`        | ✅ Implementado | 7 hooks (useTheme, useQuiz, useDragDrop, etc.) |
| `primitives/`   | ❌ Placeholder  | `export {}` - "FASE 2"                         |
| `compositions/` | ❌ Placeholder  | `export {}` - "FASE 2"                         |

### apps/web/src/components/ui

Existe una carpeta **separada** con componentes locales:

- `AnimatedCounter.tsx`
- `Breadcrumbs.tsx`
- `FloatingCard.tsx`
- `FloatingLines.tsx`
- `LoadingSpinner.tsx`
- `MagneticButton.tsx`
- `StudentAvatar.tsx`
- `ThemeToggle.tsx`
- `Toast.tsx`
- `TypingCode.tsx`

**Problema:** Estos componentes **NO están en `@mateatletas/ui`** y **NO se importan desde el package compartido**.

### Colores hardcodeados

Se encontraron ~20+ instancias de colores hex hardcodeados en:

- `CasaDistributionChart.tsx`
- `StartModal.tsx`
- `SandboxView.tsx`
- `AnalyticsView.tsx`
- Varios archivos CSS modules

### Tokens disponibles (colors.ts)

```typescript
houseTokens.quantum.colors.primary; // #F472B6
houseTokens.vertex.colors.primary; // #60A5FA
houseTokens.pulsar.colors.primary; // #34D399
```

Estos tokens **existen** pero **no se usan** en apps/web.

---

## 3. Lesson Engine

**Estado:** ⚠️ **Parcial - Estructura sin intents**

### Ubicación

`packages/lesson-engine/`

### Componentes implementados

| Archivo              | Estado       |
| -------------------- | ------------ |
| `LessonRenderer.tsx` | ✅ Funcional |
| `IntentRegistry.ts`  | ✅ Funcional |
| `SlideContainer.tsx` | ✅ Funcional |
| `LessonContext.tsx`  | ✅ Funcional |

### Intents (0/45 implementados)

Todas las carpetas de intents son **placeholders vacíos**:

```typescript
// presentation/index.ts
export {}; // "Implemented in FASE 3"

// interaction/index.ts
export {}; // "Implemented in FASE 3"

// gamification/index.ts
export {}; // "Implemented in FASE 3"

// narrative/index.ts
export {}; // "Implemented in FASE 3"

// layout/index.ts
export {}; // "Implemented in FASE 3"

// closure/index.ts
export {}; // "Implemented in FASE 3"
```

### Schemas Zod (contracts)

Los **schemas existen** en `packages/contracts/src/schemas/content/intents/`:

| Categoría    | Intents definidos en schema               |
| ------------ | ----------------------------------------- |
| Presentation | hero, define, explain, showcase           |
| Interaction  | quiz, match, sort                         |
| Gamification | challenge, achievement (parcial)          |
| Narrative    | mascot, conversation (parcial)            |
| Layout       | split, bento, tabs (parcial)              |
| Closure      | summary, nextSteps, certificate (parcial) |

**Total schemas:** ~15 intents definidos
**Total componentes:** 0 implementados

---

## 4. Game Engine

**Estado:** ❌ **Estructura sin implementación**

### Ubicación

`packages/game-engine/`

### Dependencias

```json
{
  "phaser": "^3.80.0" // ✅ Instalado
}
```

### Estado de implementación

| Carpeta               | Estado                                  |
| --------------------- | --------------------------------------- |
| `core/`               | ❌ Placeholder - `export {}` ("FASE 4") |
| `systems/`            | ❌ Placeholder - `export {}` ("FASE 4") |
| `templates/arcade/`   | ❌ Placeholder                          |
| `templates/puzzle/`   | ❌ Placeholder                          |
| `templates/memory/`   | ❌ Placeholder                          |
| `templates/strategy/` | ❌ Placeholder                          |

### Conclusión

Phaser.js está instalado pero **no hay ningún juego implementado**. Solo existe la estructura de carpetas.

---

## 5. Contracts/Schemas

**Estado:** ✅ **Completo y Funcional**

### Ubicación

`packages/contracts/src/schemas/`

### Schemas implementados (12 archivos, ~1585 líneas)

| Schema                         | Contenido                |
| ------------------------------ | ------------------------ |
| `auth.schema.ts`               | Login, registro, tokens  |
| `estudiante.schema.ts`         | Perfil estudiante        |
| `equipo.schema.ts`             | Equipos pedagógicos      |
| `notificacion.schema.ts`       | Sistema notificaciones   |
| `producto.schema.ts`           | Catálogo productos       |
| `clase.schema.ts`              | Clases/sesiones          |
| `gamificacion.schema.ts`       | XP, logros, rachas       |
| `admin.schema.ts`              | DTOs admin panel         |
| `planificacion.schema.ts`      | Planificaciones docentes |
| `pago.schema.ts`               | Sistema pagos            |
| `progreso-actividad.schema.ts` | Tracking progreso        |
| `enums.schema.ts`              | Enums compartidos        |

### Content Schemas (intents)

| Archivo                  | Líneas | Intents                         |
| ------------------------ | ------ | ------------------------------- |
| `presentation.schema.ts` | 69     | hero, define, explain, showcase |
| `interaction.schema.ts`  | 63     | quiz, match, sort               |
| `gamification.schema.ts` | 39     | challenge, achievement          |
| `narrative.schema.ts`    | 51     | mascot, conversation            |
| `layout.schema.ts`       | 47     | split, bento, tabs              |
| `closure.schema.ts`      | 34     | summary, nextSteps              |

---

## Matriz de Estado

| Componente        | Estructura | Implementación | Integración |
| ----------------- | ---------- | -------------- | ----------- |
| **Backend API**   | ✅         | ✅             | ✅          |
| **Sandbox**       | ✅         | ✅             | ✅          |
| **Contracts**     | ✅         | ✅             | ✅          |
| **Lesson Engine** | ✅         | ❌             | ⚠️          |
| **Design System** | ⚠️         | ❌             | ❌          |
| **Game Engine**   | ✅         | ❌             | ❌          |

---

## Próximos Pasos Recomendados

### 1. URGENTE: Refactorizar SandboxView.tsx

- Actualmente tiene **541 líneas** (viola regla de max 300)
- Extraer estilos inline a CSS module
- Extraer lógica a hooks custom
- Dividir en sub-componentes

### 2. ALTA: Centralizar Design System

- Mover componentes de `apps/web/src/components/ui/` a `packages/ui/src/primitives/`
- Reemplazar colores hardcodeados por tokens de `@mateatletas/ui`
- Crear barrel exports funcionales en primitives/compositions

### 3. ALTA: Implementar Intents básicos del Lesson Engine

Los schemas ya existen. Implementar al menos estos 5 intents core:

- `hero` - Para títulos de lección
- `explain` - Para contenido explicativo
- `quiz` - Para preguntas múltiple opción
- `define` - Para definiciones
- `summary` - Para cierres

### 4. MEDIA: Game Engine

- Implementar al menos 1 template funcional (sugerido: memory game)
- Crear integración React-Phaser via EventBus

### 5. BAJA: Tests unitarios para packages

- `packages/ui` - 0 tests
- `packages/lesson-engine` - 0 tests
- `packages/game-engine` - 0 tests

---

## Archivos que requieren atención inmediata

```
⚠️ apps/web/src/components/admin/views/sandbox/SandboxView.tsx (541 líneas)
⚠️ Colores hardcodeados en ~20 archivos
❌ packages/lesson-engine/src/intents/*/index.ts (todos vacíos)
❌ packages/game-engine/src/core/index.ts (vacío)
❌ packages/ui/src/primitives/index.ts (vacío)
❌ packages/ui/src/compositions/index.ts (vacío)
```

---

## Conclusión

El proyecto tiene una **base sólida** con backend funcional y arquitectura bien diseñada. El trabajo pendiente está claramente marcado como "FASE 2/3/4" en el código. La prioridad debería ser:

1. Estabilizar lo existente (refactor SandboxView)
2. Centralizar Design System
3. Implementar intents del Lesson Engine
4. Game Engine puede esperar

**Estimación de trabajo restante:**

- Design System: ~2-3 días
- Lesson Engine (5 intents core): ~3-4 días
- Game Engine (1 template): ~2-3 días
