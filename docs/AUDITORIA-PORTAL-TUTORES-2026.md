# 🔍 Auditoría Exhaustiva del Portal de Tutores - Mateatletas 2026

> **Fecha:** 18 de Enero de 2026
> **Versión:** 1.0
> **Branch:** `refactor/productos-suscripciones-2026`
> **Autor:** Claude Code (Auditoría automatizada)

---

## 📋 Resumen Ejecutivo

El portal de tutores de Mateatletas es una aplicación robusta que implementa el **MODELO 2026** de suscripciones familiares con tier por inscripción. La auditoría identificó **8 issues críticos**, **12 issues moderados**, y **15 oportunidades de mejora** que deben abordarse antes del lanzamiento a producción.

### Calificación General

| Categoría        | Puntuación | Estado               |
| ---------------- | ---------- | -------------------- |
| Seguridad        | 7.5/10     | ⚠️ Requiere atención |
| Arquitectura     | 8.5/10     | ✅ Buena             |
| Performance      | 7/10       | ⚠️ Requiere atención |
| Type Safety      | 6.5/10     | 🔴 Requiere mejoras  |
| UX/Accesibilidad | 6/10       | 🔴 Requiere mejoras  |
| Mantenibilidad   | 8/10       | ✅ Buena             |
| Testing          | 5/10       | 🔴 Crítico           |

---

## 🏗️ Alcance de la Auditoría

### Archivos Analizados

**Frontend (Next.js 15 + React 19):**

- 8 páginas en `apps/web/src/app/tutor/`
- 12 componentes en `apps/web/src/components/tutor/`
- 2 API clients en `apps/web/src/lib/api/`
- 1 hook personalizado en `apps/web/src/hooks/`
- 1 store de Zustand en `apps/web/src/store/`

**Backend (NestJS 11):**

- Módulo `tutor/` completo (controller, services, DTOs)
- Módulo `suscripciones/` (command/query services)
- Módulo `auth/` (tutor-auth.service)
- Schema Prisma (modelos relacionados)

**Total:** ~12,000 líneas de código analizadas

---

## 🔴 Issues Críticos (Bloquean Producción)

### CRIT-01: Archivos God Component exceden 300 líneas

**Ubicación:**

- `apps/web/src/components/tutor/suscripcion/NuevaSuscripcionWizard.tsx` (1505 líneas)
- `apps/web/src/app/tutor/suscripcion/agregar/page.tsx` (729 líneas)
- `apps/api/src/tutor/services/tutor-stats.service.ts` (657 líneas)
- `apps/web/src/components/tutor/suscripcion/SuscripcionDashboard.tsx` (556 líneas)

**Problema:** Viola la regla del CLAUDE.md de máximo 300 líneas por archivo. Aumenta complejidad cognitiva y dificulta testing/mantenimiento.

**Impacto:** Alto - Dificulta debugging y refactoring

**Recomendación:**

```
NuevaSuscripcionWizard.tsx debe dividirse en:
├── wizard/WizardContainer.tsx (orquestador, ~100 líneas)
├── wizard/steps/HijoStep.tsx (~180 líneas)
├── wizard/steps/ProductoStep.tsx (~150 líneas)
├── wizard/steps/TierStep.tsx (~100 líneas)
├── wizard/steps/HorarioStep.tsx (~80 líneas)
├── wizard/steps/ConfirmarStep.tsx (~200 líneas)
├── wizard/components/FechaNacimientoInput.tsx (~80 líneas)
└── wizard/hooks/useWizardState.ts (lógica de estado)
```

---

### CRIT-02: Console.log en código de producción

**Ubicación:** `apps/web/src/components/tutor/suscripcion/NuevaSuscripcionWizard.tsx`

**Líneas afectadas:** 444, 461, 465, 467, 469, 500-509

```typescript
// Líneas 500-509 - DEBUG LOGS EN PRODUCCIÓN
console.log('═══════════════════════════════════════════════════════');
console.log('[WIZARD] Creando suscripción con payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('[WIZARD] Detalles de selección:');
// ... más logs
```

**Problema:** Los `console.log` exponen información sensible en producción y violan las reglas del CLAUDE.md.

**Impacto:** Alto - Fuga de información + degradación de performance

**Recomendación:** Eliminar todos los console.log o usar un logger condicional:

```typescript
const isDev = process.env.NODE_ENV === 'development';
if (isDev) logger.debug('[WIZARD] payload:', payload);
```

---

### CRIT-03: Falta de tests unitarios en módulo tutor

**Ubicación:** `apps/api/src/tutor/`

**Problema:** El módulo tutor no tiene archivo de tests dedicado (`__tests__/`). Los servicios `TutorQueryService`, `TutorStatsService`, y `TutorBusinessValidator` carecen de cobertura.

**Impacto:** Crítico - Regresiones no detectadas

**Archivos que necesitan tests:**

- `tutor-query.service.spec.ts` - getProximasClases, getDashboardResumen
- `tutor-stats.service.spec.ts` - calcularMetricasDashboard, construirAlertas
- `tutor.controller.spec.ts` - endpoints con guards

---

### CRIT-04: Hardcoded URL de producción

**Ubicación:** `apps/api/src/suscripciones/services/suscripcion-familiar-command.service.ts:74-75`

```typescript
this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
```

**Problema:** Si `FRONTEND_URL` no está configurado en producción, los callbacks de MercadoPago apuntarán a localhost.

**Impacto:** Crítico - Suscripciones rotas en producción

**Recomendación:**

```typescript
this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
// Falla fast en startup si no está configurado
```

---

### CRIT-05: useAuthStore() sin uso del valor retornado

**Ubicación:** `apps/web/src/components/tutor/suscripcion/NuevaSuscripcionWizard.tsx:251`

```typescript
export function NuevaSuscripcionWizard(): React.ReactElement {
  const router = useRouter();
  useAuthStore(); // ← Llamado sin asignar a variable
  const { crearSuscripcion, isCreating } = useSuscripcionFamiliar();
```

**Problema:** Hook llamado sin usar el valor. Posible código muerto o falta verificación de autenticación.

**Impacto:** Moderado - Comportamiento inesperado

**Recomendación:** Si no se necesita, eliminar. Si se necesita verificar auth:

```typescript
const { user, isAuthenticated } = useAuthStore();
if (!isAuthenticated) return <RedirectToLogin />;
```

---

### CRIT-06: Vulnerabilidad CVE-2025-29927 (Next.js Middleware Bypass)

**Contexto:** Según las búsquedas de best practices 2026, Next.js tenía una vulnerabilidad crítica en middleware de autenticación.

**Verificación requerida:**

1. Confirmar versión de Next.js es ≥15.2.3
2. Verificar que la autenticación no dependa SOLO del middleware

**Ubicación a verificar:** `apps/web/package.json` y `apps/web/src/middleware.ts`

**Recomendación:** Implementar defense-in-depth verificando auth en cada Server Component/Action.

---

### CRIT-07: Tipo `any` implícito en catch blocks

**Ubicación múltiple:**

```typescript
// TutorDashboard.tsx:66
} catch (err) {
  console.error('Error cargando dashboard tutor:', err); // err es any

// NuevaSuscripcionWizard.tsx:468
} catch (hijoErr) { // hijoErr es any
  console.error('[WIZARD] Error creando hijo:', hijoErr);
```

**Problema:** TypeScript strict mode requiere `unknown` en catch. Viola reglas del CLAUDE.md sobre tipos explícitos.

**Recomendación:**

```typescript
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Error desconocido';
  setError(message);
}
```

---

### CRIT-08: Falta validación de edad fuera de rango

**Ubicación:** `NuevaSuscripcionWizard.tsx:214-228`

```typescript
function calcularCasa(fechaNacimiento: string | Date | null): CasaTipo | null {
  // ...
  if (edad >= 6 && edad <= 9) return 'QUANTUM';
  if (edad >= 10 && edad <= 12) return 'VERTEX';
  if (edad >= 13 && edad <= 17) return 'PULSAR';
  return null; // ← Silenciosamente retorna null para edades inválidas
}
```

**Problema:** Niños <6 o >17 años pueden avanzar en el wizard y fallar silenciosamente.

**Impacto:** Crítico - UX confusa y posibles errores en producción

**Recomendación:** Mostrar mensaje de error específico:

```typescript
if (edad < 6) return { error: 'El estudiante debe tener al menos 6 años' };
if (edad > 17) return { error: 'Mateatletas es para estudiantes hasta 17 años' };
```

---

## ⚠️ Issues Moderados

### MOD-01: Duplicación de constantes TIERS

**Ubicaciones:**

- `NuevaSuscripcionWizard.tsx:97-154` - TIERS constante
- `agregar/page.tsx` - Similar constante
- `suscripcion-familiar.constants.ts` (backend)

**Problema:** Precios y nombres de tiers duplicados en 3+ lugares. Desincronización probable.

**Recomendación:** Usar `@mateatletas/contracts` para compartir constantes:

```typescript
// packages/contracts/src/tiers.ts
export const TIERS_CONFIG = { ... } as const;
```

---

### MOD-02: Falta de optimistic updates en mutations

**Ubicación:** `useSuscripcionFamiliar.ts`

**Problema:** Las mutations de React Query invalidan el cache pero no hacen optimistic updates. El usuario ve delay hasta que se recarga.

**Recomendación por best practices 2026:**

```typescript
const agregarMutation = useMutation({
  mutationFn: suscripcionFamiliarApi.agregarInscripciones,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: SUSCRIPCION_FAMILIAR_KEY });
    const previous = queryClient.getQueryData(SUSCRIPCION_FAMILIAR_KEY);
    // Optimistic update
    queryClient.setQueryData(SUSCRIPCION_FAMILIAR_KEY, (old) => ({
      ...old,
      inscripciones: [...old.inscripciones, ...newData.inscripciones],
    }));
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(SUSCRIPCION_FAMILIAR_KEY, context.previous);
  },
});
```

---

### MOD-03: Falta de error boundaries en componentes críticos

**Ubicación:** Todo el portal de tutores

**Problema:** Un error en cualquier componente crashea toda la aplicación. No hay fallback UI.

**Recomendación:**

```typescript
// components/tutor/TutorErrorBoundary.tsx
export function TutorErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<TutorErrorFallback />}
      onError={(error) => logToSentry(error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

### MOD-04: Falta de loading skeletons

**Ubicación:** `TutorDashboard.tsx`, `SuscripcionDashboard.tsx`

**Problema:** Durante la carga se muestra un spinner genérico. Causa layout shift cuando cargan los datos.

**Recomendación:** Usar skeletons que coincidan con el layout final:

```typescript
if (isLoading) return <DashboardSkeleton />;
```

---

### MOD-05: Queries paralelas en getDashboardResumen sin limit

**Ubicación:** `tutor-query.service.ts:92-97`

```typescript
const [metricas, hijos, pagosPendientes, clasesHoy] = await Promise.all([
  this.statsService.calcularMetricasDashboard(tutorId),
  this.statsService.obtenerHijos(tutorId),
  this.statsService.obtenerPagosPendientes(tutorId),
  this.statsService.obtenerClasesHoy(tutorId),
]);
```

**Problema:** Si un tutor tiene muchos hijos/pagos, las queries pueden ser pesadas. No hay paginación.

**Recomendación:** Agregar limits por defecto:

```typescript
this.statsService.obtenerHijos(tutorId, { limit: 10 });
```

---

### MOD-06: Falta validación de CUIL/DNI en tutor

**Ubicación:** Schema Prisma - modelo Tutor

```prisma
model Tutor {
  dni String?
  cuil String?  // ← REQUERIDO para inscripciones 2026 según comentario
```

**Problema:** El comentario dice "REQUERIDO para inscripciones 2026" pero el campo es opcional.

**Recomendación:** Hacer obligatorio o agregar validación en el wizard antes de crear inscripciones.

---

### MOD-07: Manejo inconsistente de estados de suscripción

**Ubicación:** `suscripcion-familiar.api.ts:28-34` vs Prisma Schema

```typescript
// Frontend
export type EstadoSuscripcionFamiliar =
  | 'PENDIENTE_PAGO'
  | 'ACTIVA'
  | 'EN_GRACIA'
  | 'SUSPENDIDA'
  | 'CANCELADA';

// Backend (Prisma enum)
enum EstadoSuscripcionFamiliar {
  PENDING       // ← Diferente nombre!
  AUTHORIZED    // ← Diferente nombre!
  PAUSED
  CANCELLED
}
```

**Problema:** Los estados del frontend no coinciden con los del backend.

**Impacto:** Bugs en mapeo de estados

**Recomendación:** Unificar usando contracts compartidos.

---

### MOD-08: Falta de rate limiting en frontend

**Ubicación:** Mutations en `useSuscripcionFamiliar.ts`

**Problema:** Un usuario puede hacer click múltiples veces en "Crear Suscripción" antes de que se deshabilite el botón.

**Recomendación:** Agregar debounce o verificar isPending antes de permitir nueva mutation.

---

### MOD-09: Accesibilidad - Falta de roles ARIA

**Ubicación:** Modales en `components/tutor/modals/`

**Problema:** Los modales no tienen `role="dialog"`, `aria-modal="true"`, ni manejo de focus trap.

**Recomendación:**

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
```

---

### MOD-10: Fechas hardcodeadas

**Ubicación:** `TutorDashboard.tsx:196`

```typescript
<span className="text-sm text-slate-400">Pagado 2026</span>
```

**Problema:** El año está hardcodeado.

**Recomendación:**

```typescript
<span>Pagado {new Date().getFullYear()}</span>
```

---

### MOD-11: Falta de memoización en componentes pesados

**Ubicación:** `NuevaSuscripcionWizard.tsx` - subcomponentes

**Problema:** Los componentes HijoStep, ProductoStep, etc. se re-renderizan innecesariamente.

**Recomendación:**

```typescript
const MemoizedHijoStep = React.memo(HijoStep);
```

---

### MOD-12: Selector de fecha no accesible por teclado

**Ubicación:** `FechaNacimientoInput` en `NuevaSuscripcionWizard.tsx:721-826`

**Problema:** Usa 3 selects separados sin navegación de teclado coordinada.

**Recomendación:** Considerar usar un date picker accesible o agregar aria-labels descriptivos.

---

## 💡 Oportunidades de Mejora

### OPT-01: Migrar a Server Components donde sea posible

**Contexto:** Según best practices Next.js 15 2026, los Server Components mejoran performance y SEO.

**Candidatos:**

- `TutorDashboard.tsx` - La parte de fetch inicial puede ser Server Component
- `SuscripcionDashboard.tsx` - El fetch de datos puede ser Server Component

---

### OPT-02: Implementar React.cache() para auth

**Contexto:** Best practices 2026 recomiendan memoizar verificaciones de auth por request.

```typescript
const getAuth = cache(async () => {
  const session = await validateSession();
  return session;
});
```

---

### OPT-03: Usar Suspense boundaries

**Ubicación:** Páginas del portal tutor

**Beneficio:** Streaming de contenido y mejor perceived performance.

```typescript
<Suspense fallback={<DashboardSkeleton />}>
  <TutorDashboard />
</Suspense>
```

---

### OPT-04: Extraer lógica de cálculo de casa a utility

**Ubicación:** `calcularCasa()` y `calcularEdad()` en NuevaSuscripcionWizard

**Beneficio:** Reutilizable y testeable independientemente.

---

### OPT-05: Implementar stale-while-revalidate pattern

**Ubicación:** `useSuscripcionFamiliar.ts`

**Actual:**

```typescript
staleTime: 5 * 60 * 1000, // 5 minutos
```

**Mejora:** Ya implementado correctamente. Considerar reducir a 1-2 minutos para datos críticos como pagos.

---

### OPT-06: Agregar prefetch en navegación

**Ubicación:** Links en `TutorDashboard.tsx`

```typescript
// Actual
<button onClick={() => router.push('/tutor/suscripcion')}>

// Mejor
<Link href="/tutor/suscripcion" prefetch={true}>
```

---

### OPT-07: Implementar circuit breaker en frontend

**Contexto:** El backend tiene circuit breaker para MercadoPago, pero el frontend no maneja servicios degradados.

**Recomendación:** Mostrar UI de servicio no disponible cuando el backend retorna errores 5xx repetidos.

---

### OPT-08: Agregar feature flags

**Beneficio:** Poder activar/desactivar funcionalidades sin redeploy.

```typescript
const { isEnabled } = useFeatureFlag('suscripcion-v2');
if (isEnabled) return <NuevaSuscripcionWizard />;
return <SuscripcionWizardLegacy />;
```

---

### OPT-09: Implementar PWA capabilities

**Beneficio:** Mejor experiencia en mobile, notificaciones push para alertas de clases.

---

### OPT-10: Agregar telemetría de errores

**Beneficio:** Detectar problemas en producción antes que los usuarios reporten.

```typescript
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(error, { tags: { module: 'tutor-portal' } });
```

---

### OPT-11: Internacionalización preparada

**Contexto:** Aunque la app es para Argentina, preparar i18n facilita expansión futura.

---

### OPT-12: Documentar API con OpenAPI/Swagger

**Estado actual:** Swagger disponible en `/api/docs`

**Mejora:** Asegurar que todos los endpoints del tutor tengan decoradores `@ApiOperation`, `@ApiResponse`.

---

### OPT-13: Implementar health checks específicos

**Beneficio:** Monitoreo granular de dependencias (DB, MercadoPago, etc.)

---

### OPT-14: Agregar métricas de business

**Beneficio:** Dashboard de analytics para el equipo de negocio.

```typescript
trackEvent('tutor:suscripcion:creada', { tier, monto });
```

---

### OPT-15: Code splitting más granular

**Ubicación:** `NuevaSuscripcionWizard.tsx`

**Beneficio:** Cargar steps del wizard on-demand:

```typescript
const TierStep = dynamic(() => import('./steps/TierStep'), { loading: () => <StepSkeleton /> });
```

---

## 📊 Comparativa con Best Practices 2026

### Next.js 15 App Router

| Práctica          | Estado             | Notas                     |
| ----------------- | ------------------ | ------------------------- |
| Server Components | ⚠️ Parcial         | Todo es Client Component  |
| Middleware auth   | ✅ Implementado    | Verificar versión por CVE |
| Route handlers    | ✅ No aplica       | Usa API externa           |
| Streaming         | ❌ No implementado | Oportunidad de mejora     |
| Error boundaries  | ❌ No implementado | Crítico                   |

### React 19

| Práctica           | Estado      | Notas                              |
| ------------------ | ----------- | ---------------------------------- |
| Automatic batching | ✅ Heredado | React 19 lo hace por defecto       |
| Transitions        | ❌ No usado | useTransition para navigation      |
| Actions            | ⚠️ Parcial  | Mutations de RQ, no Server Actions |

### React Query (TanStack Query)

| Práctica               | Estado             | Notas                    |
| ---------------------- | ------------------ | ------------------------ |
| Query keys tipados     | ✅ Implementado    | Usar `as const`          |
| Stale time configurado | ✅ 5 minutos       | Apropiado                |
| Optimistic updates     | ❌ No implementado | Mejoraría UX             |
| Error handling         | ⚠️ Parcial         | Solo toast, sin retry UI |

### Zustand

| Práctica               | Estado           | Notas                         |
| ---------------------- | ---------------- | ----------------------------- |
| Separación de concerns | ✅ Bien          | Auth separado de server state |
| Persist middleware     | ✅ Implementado  | localStorage                  |
| Devtools               | ❓ No verificado | Verificar en development      |

### NestJS 11

| Práctica           | Estado           | Notas                   |
| ------------------ | ---------------- | ----------------------- |
| CQRS pattern       | ✅ Implementado  | Query/Command services  |
| Guards composition | ✅ Implementado  | JwtAuth + Roles         |
| Circuit breaker    | ✅ Implementado  | MercadoPago             |
| Validation pipes   | ✅ Implementado  | class-validator         |
| Exception filters  | ❓ No verificado | Verificar global filter |

### TypeScript Strict Mode

| Flag             | Esperado | Verificar               |
| ---------------- | -------- | ----------------------- |
| strict           | true     | tsconfig.json           |
| noImplicitAny    | true     | Violaciones encontradas |
| strictNullChecks | true     | Parcialmente cumplido   |

---

## 🎯 Plan de Acción Recomendado

### Sprint 1: Críticos (Pre-launch blockers)

| ID      | Tarea                               | Esfuerzo | Prioridad |
| ------- | ----------------------------------- | -------- | --------- |
| CRIT-02 | Eliminar console.logs de producción | 2h       | P0        |
| CRIT-04 | Validar FRONTEND_URL obligatorio    | 30min    | P0        |
| CRIT-06 | Verificar versión Next.js y CVE     | 1h       | P0        |
| CRIT-07 | Tipar catch blocks como unknown     | 2h       | P0        |
| CRIT-08 | Validar rango de edad en wizard     | 2h       | P0        |

### Sprint 2: Refactoring (Post-launch priority)

| ID      | Tarea                                | Esfuerzo | Prioridad |
| ------- | ------------------------------------ | -------- | --------- |
| CRIT-01 | Dividir NuevaSuscripcionWizard       | 8h       | P1        |
| CRIT-03 | Escribir tests para módulo tutor     | 16h      | P1        |
| MOD-01  | Unificar constantes TIERS            | 4h       | P1        |
| MOD-07  | Sincronizar estados frontend/backend | 4h       | P1        |

### Sprint 3: Mejoras UX

| ID     | Tarea                          | Esfuerzo | Prioridad |
| ------ | ------------------------------ | -------- | --------- |
| MOD-02 | Implementar optimistic updates | 8h       | P2        |
| MOD-03 | Agregar error boundaries       | 4h       | P2        |
| MOD-04 | Crear loading skeletons        | 6h       | P2        |
| MOD-09 | Mejorar accesibilidad modales  | 4h       | P2        |

### Backlog: Optimizaciones

| ID     | Tarea                      | Esfuerzo | Prioridad |
| ------ | -------------------------- | -------- | --------- |
| OPT-01 | Migrar a Server Components | 16h      | P3        |
| OPT-03 | Implementar Suspense       | 8h       | P3        |
| OPT-10 | Integrar Sentry            | 4h       | P3        |

---

## 📚 Referencias

### Best Practices Consultadas

1. [Next.js 15 App Router Authentication Guide](https://nextjs.org/learn/dashboard-app/adding-authentication) - Clerk
2. [React State Management 2025/2026](https://www.developerway.com/posts/react-state-management-2025) - developerway
3. [NestJS Authorization Documentation](https://docs.nestjs.com/security/authorization) - NestJS Official
4. [TypeScript Strict Mode Best Practices](https://www.typescriptlang.org/tsconfig/strict.html) - TypeScript Official
5. [Zustand + React Query Integration Patterns](https://tkdodo.eu/blog/zustand-and-react-context) - TkDodo's Blog
6. [React 2026 Stack Patterns](https://www.patterns.dev/react/react-2026/) - Patterns.dev

### CVE Relevantes

- **CVE-2025-29927**: Next.js Middleware Authentication Bypass - Requiere versión ≥15.2.3

---

## ✅ Checklist de Producción

- [x] Eliminar todos los console.log ✅ Corregido
- [x] Verificar FRONTEND_URL en Railway ✅ Ahora usa getOrThrow()
- [x] Confirmar versión Next.js ≥15.2.3 ✅ Versión 15.5.9 (sin middleware)
- [x] Tipar todos los catch blocks ✅ Corregido
- [x] Validar rango de edades en wizard ✅ CRIT-08 implementado
- [x] Sincronizar estados frontend/backend ✅ MOD-07 implementado
- [ ] Tests de integración corriendo
- [ ] Error boundaries implementados
- [ ] Sentry configurado
- [ ] Feature flags activos
- [ ] Documentación API actualizada

---

## 🔄 Seguimiento

Este documento debe actualizarse después de cada sprint de correcciones. Usar la siguiente convención:

- ✅ Corregido en PR #XXX
- 🔄 En progreso
- ❌ Pendiente
- 🚫 No se hará (con justificación)

---

_Generado automáticamente por Claude Code - Auditoría v1.0_
