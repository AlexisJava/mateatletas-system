# AUDITORÍA DE ERRORES TYPESCRIPT - MATEATLETAS FRONTEND

> **Fecha:** 2025-11-29
> **Total errores:** 60
> **Contexto:** Preparación para Fase 1 (Studio + refactors)

---

## ERRORES QUE BLOQUEAN FASE 1

| Archivo   | Línea | Error | Impacto | Esfuerzo |
| --------- | ----- | ----- | ------- | -------- |
| _Ninguno_ | -     | -     | -       | -        |

**Conclusión:** Ninguno de los 60 errores bloquea el trabajo de Fase 1 (AppShell, Studio). Todos están en módulos independientes.

---

## ERRORES CRÍTICOS (🔴 Pueden romper en runtime)

| Archivo                            | Línea      | Error         | Descripción                                                                              | Esfuerzo                                         |
| ---------------------------------- | ---------- | ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ |
| `lib/api/quizApi.ts`               | 47-49      | TS2339        | Properties `interes_principal`, `nivel_actual`, `objetivo` no existen en `QuizResponses` | 5 min                                            |
| `lib/algorithms/recomendarRuta.ts` | 38, 41     | TS2322/TS2345 | `Ruta                                                                                    | undefined`asignado a`Ruta` - puede ser undefined | 10 min |
| `lib/algorithms/recomendarRuta.ts` | 74, 77, 78 | TS18048       | `principal` posiblemente undefined después de `rutasConScore[0]`                         | 5 min                                            |

### Análisis:

**`quizApi.ts`** - El tipo `QuizResponses` en `types/courses.ts` NO tiene las propiedades `interes_principal`, `nivel_actual`, `objetivo`. El quiz usa campos diferentes:

- `interes_principal` → debería ser `objetivo_principal` o similar
- `nivel_actual` → debería ser `nivel_programacion` o `nivel_mate_escuela`
- `objetivo` → debería ser `objetivo_principal`

**Solución:** Actualizar el mapping en `quizApi.ts` para usar los campos correctos del tipo.

**`recomendarRuta.ts`** - El algoritmo no maneja el caso donde `rutasConScore[0]` sea undefined (array vacío). También el fallback puede ser undefined si `todasLasRutas` está vacío.

**Solución:** Agregar checks de undefined antes de acceder.

---

## ERRORES ALTOS (🟠 Molestarán en refactors)

| Archivo                                                    | Líneas          | Error                 | Descripción                                               | Esfuerzo |
| ---------------------------------------------------------- | --------------- | --------------------- | --------------------------------------------------------- | -------- |
| `components/colonia/CourseCard.tsx`                        | 75, 83, 97, 102 | TS2532                | `course.schedules[0]` posiblemente undefined              | 5 min    |
| `components/colonia/CourseCatalog.tsx`                     | 28              | TS18048               | Variables de filtro posiblemente undefined                | 3 min    |
| `components/colonia/CourseDetailModal.tsx`                 | 145, 149, 158   | TS2532                | Accesos a arrays sin verificar                            | 5 min    |
| `components/colonia/InscriptionForm.tsx`                   | 215             | TS18048               | `min`, `max` posiblemente undefined                       | 2 min    |
| `components/colonia/ScheduleGrid.tsx`                      | 16-37, 104      | TS18048/TS2345/TS2769 | Múltiples accesos a arrays/strings sin verificar          | 10 min   |
| `components/inscripciones-2026/GlobalInscriptionModal.tsx` | 676-923         | TS2532/TS18048        | 18 errores de acceso a propiedades posiblemente undefined | 20 min   |

### Análisis:

Todos estos errores son del patrón `array[0].property` sin verificar que `array[0]` exista. Son errores comunes cuando se asume que un array siempre tiene elementos.

**Impacto:** Si se pasa un array vacío, la app crashea en runtime con `Cannot read property 'X' of undefined`.

**Patrón de fix:**

```typescript
// Antes (error)
course.schedules[0].dayOfWeek;

// Después (correcto)
course.schedules[0]?.dayOfWeek ?? 'No disponible';
// o
course.schedules.length > 0 ? course.schedules[0].dayOfWeek : 'No disponible';
```

---

## ERRORES MEDIOS (🟡 Deuda técnica)

| Archivo                                                  | Línea         | Error         | Descripción                                   | Esfuerzo |
| -------------------------------------------------------- | ------------- | ------------- | --------------------------------------------- | -------- |
| `app/admin/reportes/page.tsx`                            | 63            | TS7030        | useEffect no retorna en todos los paths       | 2 min    |
| `app/estudiante/crear-avatar/page.tsx`                   | 40            | TS7030        | useEffect no retorna en todos los paths       | 2 min    |
| `components/effects/AchievementToast.tsx`                | 25            | TS7030        | useEffect no retorna en todos los paths       | 2 min    |
| `components/resultado/LoadingAnalysis.tsx`               | 147, 150, 152 | TS7030/TS2532 | useEffect + accesos undefined                 | 5 min    |
| `components/ui/AnimatedCounter.tsx`                      | 17            | TS7030        | useEffect no retorna en todos los paths       | 2 min    |
| `planificaciones/shared/components/AchievementPopup.tsx` | 11            | TS7030        | useEffect no retorna en todos los paths       | 2 min    |
| `hooks/useScrollAnimation.ts`                            | 12            | TS18048       | `entry` posiblemente undefined                | 2 min    |
| `components/quiz/QuizAsincronico.tsx`                    | 210           | TS2322        | Tipo de transición framer-motion incompatible | 5 min    |

### Análisis:

**TS7030 (useEffect):** TypeScript detecta que algunos callbacks de useEffect no retornan cleanup en todos los paths. Generalmente no es un bug real, pero es mejor ser explícito.

**Patrón de fix:**

```typescript
// Antes
useEffect(() => {
  if (condition) {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }
  // No return aquí - TS7030
}, []);

// Después
useEffect(() => {
  if (condition) {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }
  return undefined; // Explícito
}, []);
```

---

## ERRORES BAJOS (⚪ Código legacy/tests)

| Archivo                     | Línea  | Error         | Descripción                                          | Esfuerzo |
| --------------------------- | ------ | ------------- | ---------------------------------------------------- | -------- |
| `playwright.config.ts`      | 83     | TS2769        | Overload de config no matchea                        | 5 min    |
| `tests/e2e/global-setup.ts` | 16     | TS2532        | `process.env.X` posiblemente undefined               | 2 min    |
| `tests/e2e/global-setup.ts` | 59, 64 | TS7034/TS7005 | Array `requiredEnvVars` tiene tipo implícito `any[]` | 2 min    |

### Análisis:

Errores en archivos de configuración de tests. El array vacío `requiredEnvVars = []` se infiere como `any[]` porque no tiene elementos para inferir el tipo.

**Fix simple:**

```typescript
const requiredEnvVars: string[] = [];
```

---

## RESUMEN EJECUTIVO

| Severidad      | Cantidad | Minutos Est. | Módulos Afectados             |
| -------------- | -------- | ------------ | ----------------------------- |
| 🔴 **CRÍTICO** | 6        | 20 min       | quizApi, recomendarRuta       |
| 🟠 **ALTO**    | 31       | 45 min       | colonia/, inscripciones-2026/ |
| 🟡 **MEDIO**   | 14       | 22 min       | varios UI components          |
| ⚪ **BAJO**    | 9        | 9 min        | tests/, config                |
| **TOTAL**      | **60**   | **~96 min**  |                               |

---

## ANÁLISIS POR MÓDULO

| Módulo                  | Errores | ¿Fase 1?   | Acción                  |
| ----------------------- | ------- | ---------- | ----------------------- |
| `colonia/`              | 19      | ❌ No      | Puede esperar           |
| `inscripciones-2026/`   | 18      | ❌ No      | Puede esperar           |
| `lib/algorithms/`       | 5       | ❌ No      | Arreglar si se usa quiz |
| `lib/api/quizApi.ts`    | 3       | ❌ No      | Arreglar si se usa quiz |
| `components/ui/`        | 1       | ⚠️ Posible | Arreglar pronto         |
| `components/quiz/`      | 1       | ❌ No      | Puede esperar           |
| `components/resultado/` | 3       | ❌ No      | Puede esperar           |
| `components/effects/`   | 1       | ❌ No      | Puede esperar           |
| `hooks/`                | 1       | ⚠️ Posible | Arreglar pronto         |
| `app/admin/`            | 1       | ⚠️ Posible | Arreglar pronto         |
| `app/estudiante/`       | 1       | ❌ No      | Puede esperar           |
| `planificaciones/`      | 1       | ❌ No      | Puede esperar           |
| `tests/`                | 3       | ❌ No      | Puede esperar           |
| `playwright.config`     | 1       | ❌ No      | Puede esperar           |

---

## RECOMENDACIÓN

### Opción A: Arreglar solo lo crítico ahora (20 min)

```
✅ lib/api/quizApi.ts (5 min)
✅ lib/algorithms/recomendarRuta.ts (15 min)
```

**Pros:** Rápido, elimina riesgo de crash en runtime
**Contras:** Deuda técnica permanece

### Opción B: Arreglar crítico + alto en módulos que usamos (45 min)

```
✅ lib/api/quizApi.ts (5 min)
✅ lib/algorithms/recomendarRuta.ts (15 min)
✅ components/ui/AnimatedCounter.tsx (2 min)
✅ hooks/useScrollAnimation.ts (2 min)
✅ app/admin/reportes/page.tsx (2 min)
```

**Pros:** Limpia los módulos que podríamos tocar
**Contras:** colonia/inscripciones siguen con errores

### Opción C: Limpiar todo (96 min = ~1.5h)

**Pros:** Codebase limpio, CI verde
**Contras:** Toma tiempo de desarrollo

---

## MI RECOMENDACIÓN

**Ir con Opción A ahora + Opción C en un sprint de "housekeeping"**

Razones:

1. Los errores críticos pueden causar crashes en producción
2. Los errores de `colonia/` e `inscripciones-2026/` están en código que NO tocamos en Fase 1
3. Los módulos con errores parecen ser features secundarias (quiz, colonia de verano, inscripciones 2026)
4. El AppShell y Studio no dependen de ninguno de estos módulos

**Acción inmediata:** Arreglar los 6 errores críticos (20 min)
**Siguiente sprint:** Ticket de housekeeping para los 54 restantes

---

_Generado automáticamente - Mateatletas TypeScript Audit v1.0_
