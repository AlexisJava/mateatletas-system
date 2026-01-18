# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **IMPORTANTE:** Leé este archivo COMPLETO antes de empezar cualquier tarea.

---

## REGLAS INQUEBRANTABLES

### Responsabilidad

- PROHIBIDO: Decir "este error no tiene que ver con mis cambios"
- PROHIBIDO: Evadir responsabilidad por errores que aparecen después de tus cambios
- OBLIGATORIO: Si hay error después de tus cambios, ASUMÍ que lo causaste
- OBLIGATORIO: Correr `git diff HEAD~1` para verificar qué cambiaste

### Código

- PROHIBIDO: `any`, `unknown`, `@ts-ignore`, `as`, `!`, `?.` sin justificación documentada
- PROHIBIDO: Archivos de más de 300 líneas (God Components/Services)
- PROHIBIDO: Código duplicado - extraer a función/componente compartido
- OBLIGATORIO: Tipos explícitos en parámetros y retornos
- OBLIGATORIO: Clean Architecture - separar responsabilidades

### Testing

- PROHIBIDO: Mocks de base de datos en tests de integración (usar DB real con docker-compose.test.yml)
- PROHIBIDO: Modificar test para que pase (modificar el CÓDIGO, no el test)
- PROHIBIDO: Ejecutar tests - EL USUARIO LOS EJECUTA (Claude tarda demasiado)
- PROHIBIDO: Corregir tests reactivamente cuando fallan (ver ciclo abajo)
- OBLIGATORIO: TDD - test primero, código después
- OBLIGATORIO: Verificar funcionamiento real en browser/Postman
- OBLIGATORIO: Black Box Testing - testear REQUISITOS, no implementación
- OBLIGATORIO: Leer `apps/api/test/TESTING.md` antes de escribir tests

### Ciclo de Construcción de Tests (OBLIGATORIO)

Cuando se escriben tests nuevos, seguir este ciclo **sin excepciones**:

```
1. ESCRIBIR    → Crear el archivo de test completo
2. EJECUTAR   → Correr los tests (usuario o Claude según contexto)
3. REPORTAR   → Si fallan, listar CUÁLES fallan y FRENAR
4. INVESTIGAR → Averiguar POR QUÉ fallan SIN implementar nada
5. PLANIFICAR → Explicar el fix propuesto al usuario
6. IMPLEMENTAR → Solo después de entender la causa raíz
7. REPETIR    → Volver al paso 2
```

**CRÍTICO:** Si un test falla, NUNCA corregir reactivamente. Siempre:

1. Frenar
2. Reportar qué tests fallan
3. Investigar la causa raíz (leer código, verificar estructura de response, etc.)
4. Explicar el diagnóstico al usuario
5. Solo implementar después de entender el problema

Este ciclo se repite cuantas veces sea necesario hasta que todos los tests pasen.

### Instrucciones del Usuario

- PROHIBIDO: Tomar atajos que contradigan instrucciones explícitas
- PROHIBIDO: Restaurar código viejo con `git checkout` sin permiso
- PROHIBIDO: Simplificar tareas sin preguntar primero
- OBLIGATORIO: Seguir instrucciones AL PIE DE LA LETRA
- OBLIGATORIO: Si hay ambigüedad, PREGUNTAR antes de asumir

### Cambios en Lógica de Negocio

- PROHIBIDO: Modificar lógica de negocio sin autorización explícita del usuario
- OBLIGATORIO: Antes de tocar código que afecta comportamiento del sistema:
  1. Explicar en español criollo qué se quiere hacer y por qué
  2. Esperar el OK del usuario antes de hacer cualquier cambio
- Esto aplica a: validaciones, permisos, flujos de autenticación, reglas de negocio, etc.

### Prisma / Base de Datos

- PROHIBIDO: `prisma db push` (causa drift y desincronización)
- PROHIBIDO: `prisma migrate dev` sin backup previo (puede resetear la DB)
- OBLIGATORIO: Backup ANTES de cualquier migración

---

## METODOLOGÍA DE TRABAJO

### Flujo obligatorio (sin excepciones)

```
1. AUDITAR     → Leer código existente, entender contexto completo
2. DIAGNOSTICAR → Identificar CAUSA RAÍZ, no síntomas
3. PLANIFICAR  → Explicar solución ANTES de implementar
4. IMPLEMENTAR → Código limpio, tipos explícitos, vertical slices
5. VERIFICAR   → Tests pasan Y funciona en browser (NO solo build)
```

### Definición de TERMINADO

Una tarea **NO** está terminada hasta que:

- [ ] Compila sin errores TypeScript (`yarn build`)
- [ ] Linter pasa sin warnings (`yarn lint`)
- [ ] Tests relacionados pasan (`yarn test`)
- [ ] **FUNCIONA en browser** (verificar manualmente)
- [ ] No hay errores en consola del browser

PROHIBIDO: Hacer build/commit con errores pendientes
PROHIBIDO: Decir "listo" sin verificar funcionamiento real

---

## STACK TECNOLÓGICO

### Requisitos del Entorno

- **Node.js**: 22.x (obligatorio)
- **Package Manager**: Yarn 4.10+ (usa Corepack)
- **Docker**: Para tests de integración

### Stack Principal

- **Backend**: NestJS 11 + Prisma 6.18 + PostgreSQL 15
- **Frontend**: Next.js 15.5 + React 19.1 + Tailwind 4
- **Testing Backend**: Jest 30 con DB real (docker-compose.test.yml)
- **Testing Frontend**: Vitest 4 + Playwright 1.56 (E2E)
- **State Management**: Zustand 5 + React Query 5
- **Forms**: React Hook Form 7 + Zod 3
- **Animations**: Framer Motion 12
- **Cache**: Redis (Keyv) + In-Memory fallback
- **Queues**: BullMQ
- **Deploy**: Railway (API) + Vercel (Web)

### Pre-commit Hooks (Husky + lint-staged)

Los commits fallan automáticamente si:

- ESLint encuentra **cualquier warning** en `apps/api/src/` (`--max-warnings=0`)
- Prettier encuentra archivos mal formateados

Para saltear en emergencias (NO recomendado): `git commit --no-verify`

---

## ESTRUCTURA DEL PROYECTO

```
mateatletas-ecosystem/
├── apps/
│   ├── api/              # Backend NestJS (port 3001)
│   │   ├── src/
│   │   │   ├── admin/    # Panel administrativo
│   │   │   ├── auth/     # JWT con refresh tokens, guards por rol
│   │   │   ├── estudiantes/
│   │   │   ├── docentes/
│   │   │   ├── gamificacion/
│   │   │   └── ...       # 35+ módulos más
│   │   ├── prisma/       # Schema (69 modelos) y migraciones
│   │   └── test/         # Tests de integración
│   └── web/              # Frontend Next.js (port 3000)
│       └── src/
│           ├── app/      # App Router pages
│           ├── components/
│           ├── hooks/
│           ├── store/    # Zustand stores
│           └── lib/      # Utilidades
├── packages/
│   ├── contracts/        # @mateatletas/contracts - DTOs + Zod schemas compartidos
│   ├── ui/               # @mateatletas/ui - Design System (tokens, hooks)
│   ├── game-engine/      # @mateatletas/game-engine - Phaser minigames
│   └── lesson-engine/    # @mateatletas/lesson-engine - Motor de microlecciones
├── docs/                 # Documentación técnica
└── scripts/              # Utilidades
```

### Portales de la aplicación

| Portal      | Ruta                  | Descripción                    |
| ----------- | --------------------- | ------------------------------ |
| Admin       | `/admin/*`            | Gestión completa de plataforma |
| Docentes    | `/docente/*`          | Portal para profesores         |
| Estudiantes | `/estudiante-login/*` | Portal gamificado para alumnos |
| Tutores     | `/tutor/*`            | Portal para padres/tutores     |

---

## DISEÑO VISUAL - ESTILO MATEATLETAS

### Norte Visual: "Dark Glassmorphism Gaming Premium"

Inspiración: PS5 UI, Apple Liquid Glass, Microsoft Fluent Design

### Características del estilo

1. **Dark Mode por defecto**
   - Fondo principal: `#0a0a0f` o gradientes oscuros con colores vibrantes
   - Nunca negro puro (`#000`) - usar grises muy oscuros con tinte de color

2. **Glassmorphism en componentes**

   ```tsx
   className="
     bg-white/[0.05]
     backdrop-blur-xl
     border border-white/[0.1]
     shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
     rounded-2xl
   "
   ```

3. **Gradientes de fondo ambient**
   - Orbes de color vibrante (púrpuras, azules neón, magentas)
   - Blur difuso que da vida al glass
   - Nunca fondos sólidos planos

4. **Colores por Casa**

   | Casa           | Color Principal   | Gradiente        |
   | -------------- | ----------------- | ---------------- |
   | QUANTUM (6-9)  | Cyan `#00d4ff`    | cyan → blue      |
   | VERTEX (10-12) | Magenta `#ff00ff` | magenta → purple |
   | PULSAR (13-17) | Amber `#ffaa00`   | amber → orange   |

5. **Efectos y animaciones**
   - Transiciones suaves (300ms ease-out)
   - Hover con glow sutil
   - Elementos que "flotan" con sombras difusas

### NO HACER en diseño

- Fondos blancos o grises claros
- Bordes duros sin blur
- Sombras duras/box-shadow básicas
- Colores planos sin profundidad

### SÍ HACER en diseño

- Todo componente sobre fondo con gradiente/blur
- Cards con efecto glass y bordes sutiles luminosos
- Jerarquía visual con capas de translucidez
- Glow en elementos interactivos

---

## LESSON ENGINE (Sistema de Contenido)

El package `@mateatletas/lesson-engine` es el motor de microlecciones educativas.

### Arquitectura Intent-Based

Las lecciones se componen de **slides**, y cada slide tiene un **intent** que define su propósito:

```
packages/lesson-engine/src/
├── intents/
│   ├── presentation/   # hero, define, explain, showcase
│   ├── interaction/    # quiz, match, sort
│   ├── gamification/   # achievement, progress, levelUp
│   ├── narrative/      # mascot, conversation
│   ├── layout/         # split, bento
│   └── closure/        # summary, nextSteps
├── renderer/
│   ├── LessonRenderer.tsx    # Renderiza lección completa
│   ├── SlideContainer.tsx    # Container 100vh sin scroll
│   └── IntentRegistry.ts     # Registro de componentes
└── context/
    └── LessonContext.tsx     # Estado, XP, navegación
```

### Reglas del Sistema de Contenido

- **NO SCROLL**: Cada slide ocupa 100vh exacto
- **Responsive**: Funciona en mobile, tablet y desktop
- **Intent-based**: El sistema infiere el layout según el intent

### Documentación Completa

Ver `docs/ARQUITECTURA_SISTEMA_CONTENIDO_MATEATLETAS.md` para:

- Catálogo completo de 45 intents
- Schemas Zod de cada intent
- Sistema de juegos (game-engine)
- Design tokens por Casa (Quantum, Vertex, Pulsar)

---

## GAME ENGINE (Sistema de Juegos)

El package `@mateatletas/game-engine` es el motor de minijuegos basado en Phaser.js.

### Arquitectura

```
packages/game-engine/src/
├── core/
│   ├── BaseScene.ts      # Clase base para todas las escenas
│   ├── EventBus.ts       # Comunicación React ↔ Phaser
│   ├── GameRegistry.ts   # Registro de templates disponibles
│   └── types.ts          # GameResult, GameConfig, callbacks
├── systems/
│   ├── InputSystem.ts    # Manejo de input (touch/keyboard)
│   ├── AudioSystem.ts    # Sonidos y música
│   └── ParticleSystem.ts # Efectos visuales
└── templates/
    ├── arcade/           # CatcherScene, ShooterScene, RunnerScene, etc.
    ├── puzzle/           # Rompecabezas, matching
    ├── memory/           # Juegos de memoria
    └── strategy/         # Juegos de estrategia
```

### Crear un Nuevo Template

Todos los templates extienden `BaseScene`:

```typescript
class MiJuego extends BaseScene<MiConfig> {
  create() {
    super.create(); // OBLIGATORIO - setup de timers y eventos
    // Setup específico del juego...
  }

  update(time: number, delta: number) {
    super.update(time, delta); // OBLIGATORIO - maneja pausa y tiempo límite
    // Lógica del juego...
  }

  // Usar métodos heredados:
  // this.onCorrectAnswer(points) - incrementa score y combo
  // this.onWrongAnswer(penalty)  - resetea combo
  // this.loseLife()              - resta vida, retorna true si game over
  // this.endGame(success)        - termina y llama callback
}
```

### Comunicación React ↔ Phaser

El `EventBus` permite comunicación bidireccional:

```typescript
// Desde React: pausar juego
EventBus.emitGamePause();

// Desde Phaser: notificar resultado
EventBus.emitGameComplete(result);

// React escucha:
EventBus.onGameComplete((result) => guardarXP(result.xp));
```

### Templates Disponibles (Arcade)

| Template          | Descripción               | Mecánica                      |
| ----------------- | ------------------------- | ----------------------------- |
| `CatcherScene`    | Atrapar objetos que caen  | Mover canasta horizontalmente |
| `ShooterScene`    | Disparar a objetivos      | Apuntar y disparar            |
| `RunnerScene`     | Correr y esquivar         | Saltar obstáculos             |
| `DodgerScene`     | Esquivar proyectiles      | Movimiento en 4 direcciones   |
| `WhackAMoleScene` | Golpear topos             | Tap en objetivos emergentes   |
| `BreakoutScene`   | Romper bloques con pelota | Paddle y rebote               |

---

## ARQUITECTURA BACKEND (NestJS)

### Patrón de Módulos

Cada feature module sigue Clean Architecture:

```
domain/
├── {domain}.controller.ts      # HTTP endpoints
├── {domain}.service.ts         # Lógica de negocio
├── {domain}-query.service.ts   # Solo lecturas (CQRS)
├── {domain}-command.service.ts # Solo escrituras (CQRS)
├── dto/                        # Request/Response DTOs
├── guards/                     # Route guards específicos
└── {domain}.module.ts          # Module definition
```

### Autenticación

- JWT + HttpOnly cookies
- 4 roles: Admin, Docente, Tutor, Estudiante
- Guards: `JwtAuthGuard` (global), `RolesGuard` (role-based)
- Decorators: `@GetUser()`, `@Roles()`, `@Public()`

### Patrones de Query

```typescript
// N+1 prevention - usar include
const estudiante = await this.prisma.estudiante.findUnique({
  where: { id },
  include: { tutor: true, recursos: true }
});

// Batch operations - usar transacciones
await this.prisma.$transaction([
  this.prisma.progreso.updateMany(...),
  this.prisma.recursos.update(...)
]);
```

---

## ARQUITECTURA FRONTEND (Next.js)

### State Management

- **Zustand**: Client-side UI state, persisted to localStorage
- **React Query**: Server state, API data caching

```typescript
// Store pattern (src/store/auth.store.ts)
export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({ ... }), { name: 'auth-storage' })
);

// Query pattern (src/hooks/usePersonas.ts)
export function usePersonas() {
  return useQuery({ queryKey: ['personas'], queryFn: personasApi.getAll });
}
```

### API Calls

- Axios instance en `src/lib/axios-instance.ts`
- withCredentials: true (HttpOnly cookies)
- Interceptors para 401 handling

---

## COMANDOS FRECUENTES

### Desarrollo

```bash
yarn dev                  # Backend + Frontend en paralelo
yarn dev:api              # Solo backend (port 3001)
yarn dev:web              # Solo frontend (port 3000)
yarn dev:stop             # Detener servidores y liberar puertos
```

### Build y Verificación

```bash
yarn build                # Compilar todo
yarn build:contracts      # Solo compilar contracts (necesario antes de build)
yarn lint                 # ESLint todos los packages
yarn lint:strict          # ESLint sin warnings
yarn typecheck            # TypeScript check
yarn quality              # typecheck + lint:strict
yarn quality:full         # quality + test:api
yarn validate             # Script de validación completa
```

### Testing

```bash
# Unit tests
yarn test                 # Todos los unit tests
yarn test:api             # Solo backend
yarn test:web             # Solo frontend

# Test específico (backend)
cd apps/api && npm test -- --testPathPattern="nombre-archivo"

# Integration tests (requiere docker-compose.test.yml)
docker-compose -f apps/api/docker-compose.test.yml up -d
cd apps/api && npx prisma migrate deploy  # Usa DATABASE_URL del .env de test
yarn test:integration                      # DATABASE_URL se configura automáticamente

# E2E tests (Playwright)
yarn test:e2e             # Playwright completo
yarn test:e2e:ui          # Con UI interactivo
yarn test:e2e:headed      # Con browser visible
```

### Factories para Tests

Al escribir tests de integración, usar factories de `apps/api/test/fixtures/factories`:

```typescript
// Escenarios completos (recomendado)
import { createFullAulaSetup, createEstudianteConComision } from '../../fixtures/factories';

// Setup completo de aula virtual con planificación
const setup = await createFullAulaSetup(prisma);
// → { admin, docente, estudiante, planificacion, asignacion, passwords... }

// Presets de estudiante (variantes comunes)
import { ESTUDIANTE_PRESETS } from '../../fixtures/presets';
const { estudiante, password } = await ESTUDIANTE_PRESETS.planSincronico(prisma);
```

### Comandos de Workspace

```bash
# Ejecutar comando en un package específico
yarn workspace api test              # Tests del API
yarn workspace web dev               # Dev server del frontend
yarn workspace @mateatletas/ui build # Build del UI package

# Ejecutar en todos los workspaces
yarn workspaces foreach run build    # Build en todos
```

### Database

```bash
cd apps/api
npx prisma migrate deploy     # Aplicar migraciones (SEGURO)
npx prisma migrate status     # Ver estado
npx prisma studio             # UI para explorar datos (localhost:5555)
npx prisma generate           # Regenerar cliente después de cambios en schema
```

### Atajos Útiles

```bash
yarn dev:stop             # Mata procesos en puertos 3000/3001
yarn stop                 # Alias más corto
yarn build:contracts      # Rebuild contracts (necesario si cambian DTOs)
```

---

## MIGRACIONES DE BASE DE DATOS

**NUNCA** usar `prisma migrate dev` directamente. Puede resetear la DB.

```bash
# 1. SIEMPRE hacer backup primero
mkdir -p backups
pg_dump -U postgres mateatletas_dev > backups/pre_migrate_$(date +%Y%m%d_%H%M%S).sql

# 2. Aplicar migraciones pendientes (SEGURO)
npx prisma migrate deploy

# 3. O crear nueva migración (CUIDADO)
npx prisma migrate dev --name nombre_migracion

# 4. Si falla, restaurar
psql -U postgres mateatletas_dev < backups/pre_migrate_XXXXX.sql
```

---

## CONVENCIONES

### Nombres de archivos

- Componentes: `PascalCase.tsx`
- Hooks: `useNombre.ts`
- Utils: `kebab-case.ts`
- Stores: `nombre.store.ts`
- Types: `nombre.types.ts`

### Nombres de tests

```typescript
// Patrón: should_[acción]_when_[condición]
it('should_return_401_when_token_expired', async () => { ... })
it('should_create_student_when_valid_data', async () => { ... })
```

### Commits

```
tipo(scope): descripción corta

tipos: feat, fix, refactor, test, docs, chore
scope: api, web, ui, auth, pagos, etc.

Ejemplos:
feat(api): add planificacion CRUD endpoints
fix(web): resolve hydration error in StudentDashboard
test(api): add integration tests for pagos module
```

---

## INSCRIPCIONES A CLASEGROUPOS (Vista Unificada)

### Contexto

Existen **dos fuentes de inscripción** a ClaseGrupos que se unifican via una vista PostgreSQL:

| Tabla                       | Fuente                                   | Uso                                    |
| --------------------------- | ---------------------------------------- | -------------------------------------- |
| `inscripciones_clase_grupo` | Admin crea manualmente (becas, especial) | ESCRITURA de inscripciones manuales    |
| `inscripciones_actividad`   | Tutor crea via suscripción familiar 2026 | ESCRITURA de inscripciones suscripción |
| `inscripciones_unificadas`  | **VISTA** que combina ambas fuentes      | **LECTURA** - Single Source of Truth   |

### Reglas Obligatorias

- **LECTURA**: Siempre usar `prisma.inscripcionUnificada` (la vista)
- **ESCRITURA MANUAL** (admin/becas): Usar `prisma.inscripcionClaseGrupo`
- **ESCRITURA SUSCRIPCIÓN** (tutor): Usar `prisma.inscripcionActividad`
- PROHIBIDO: Leer de `inscripcionClaseGrupo` directamente en módulos de docentes/estudiantes

### Campos Importantes de la Vista

```typescript
// La vista tiene campos adicionales que indican la fuente
{
  fuente: 'MANUAL' | 'SUSCRIPCION_2026';
  estado: 'ACTIVA' | 'CANCELADA' | 'PAUSADA';
  tipo_acceso: 'SINCRONICO' | 'ASINCRONICO';
  tier: 'STEAM_LIBROS' | 'STEAM_ASINCRONICO' | 'STEAM_SINCRONICO' | null;
  suscripcion_familiar_id: string | null; // Solo para SUSCRIPCION_2026
}
```

### Migraciones Afectadas

Ver `apps/api/prisma/migrations/20260118100000_create_inscripciones_unificadas_view/`

---

## ANTI-PATRONES A EVITAR

- God Services/Components (>300 líneas)
- N+1 queries (usar include, groupBy, o batch)
- Promise.all con loops de queries individuales
- console.log en producción (usar Logger de NestJS)
- Parches sin entender causa raíz
- Modificar tests para que pasen

---

## REFERENCIAS

Para tareas específicas, leer:

- **Testing**: `apps/api/test/TESTING.md`
- **Arquitectura contenido**: `docs/ARQUITECTURA_SISTEMA_CONTENIDO_MATEATLETAS.md`
- **Design System tokens**: `packages/ui/src/tokens/`
- **Intents implementados**: `packages/lesson-engine/src/intents/`
- **Schemas Zod**: `packages/contracts/src/schemas/`

---

## URLs DE DESARROLLO

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Prisma Studio: http://localhost:5555

---

## TROUBLESHOOTING COMÚN

### "Port already in use"

```bash
yarn dev:stop                          # Mata procesos en 3000/3001
```

### "Prisma Client out of sync"

```bash
cd apps/api && npx prisma generate     # Regenerar cliente
```

### Tests de integración fallan

```bash
# Verificar que docker-compose.test.yml está corriendo
docker ps | grep postgres-test
# Si no está, levantarlo:
docker-compose -f apps/api/docker-compose.test.yml up -d
```

### Errores de tipos después de cambios en contracts

```bash
yarn build:contracts                   # Rebuild contracts primero
```

---

## SCRIPTS DE CALIDAD

Antes de hacer commit o PR, verificar:

```bash
yarn quality              # typecheck + lint:strict (rápido)
yarn quality:full         # quality + test:api (completo)
yarn validate             # Script de validación completa
```

---

## NOTAS FINALES

1. **Siempre verificar funcionamiento real** - No confiar solo en que compila
2. **Commits atómicos** - Un commit por cambio lógico
3. **Preguntar ante duda** - Mejor preguntar que asumir mal
4. **Calidad clase mundial** - No hay mediocridad, cada línea cuenta
