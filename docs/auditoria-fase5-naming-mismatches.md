# AUDITORÍA FASE 5: CONSISTENCIA DE NAMING ENTRE BACKEND Y FRONTEND

**Fecha:** 2026-01-27
**Auditor:** Claude Code
**Scope:** Todos los módulos del ecosistema Mateatletas

---

## RESUMEN EJECUTIVO

Se identificaron **3 mismatches críticos**, **5 mismatches medios** y **4 inconsistencias menores** entre las definiciones de tipos del backend y frontend.

| Severidad  | Cantidad | Impacto                          |
| ---------- | -------- | -------------------------------- |
| 🔴 CRÍTICO | 3        | Runtime errors, undefined values |
| 🟠 ALTO    | 5        | Bugs visuales, datos incorrectos |
| 🟡 MEDIO   | 4        | Inconsistencias, código frágil   |

---

## 🔴 MISMATCHES CRÍTICOS (RUNTIME ERRORS)

### 1. HijoInfo: `puntosTotales` vs `xpTotal`

**Causa raíz:** El backend envía `puntosTotales`, el frontend espera `xpTotal`.

| Ubicación                                                                                       | Campo           | Tipo                |
| ----------------------------------------------------------------------------------------------- | --------------- | ------------------- |
| Backend: [tutor-dashboard.types.ts:109](apps/api/src/tutor/types/tutor-dashboard.types.ts#L109) | `puntosTotales` | `number`            |
| Frontend: [tutores.api.ts:45](apps/web/src/lib/api/tutores.api.ts#L45)                          | `xpTotal`       | `number`            |
| Uso: [TutorDashboard.tsx:290](apps/web/src/components/tutor/TutorDashboard.tsx#L290)            | `hijo.xpTotal`  | Siempre `undefined` |

**Impacto:** El dashboard del tutor muestra `undefined` o `NaN` en lugar de los puntos del hijo.

**Solución recomendada:** Corregir el FRONTEND para usar `puntosTotales` (el backend es la fuente de verdad).

```typescript
// tutores.api.ts - CAMBIAR
export interface HijoInfo {
  // ...
  puntosTotales: number; // ✅ Antes era xpTotal
  // ...
}
```

---

### 2. HijoInfo: Falta campo `comisiones`

**Causa raíz:** El backend incluye `comisiones: ComisionInfo[]` pero el frontend no lo define.

| Ubicación                                                                                       | Campo                        |
| ----------------------------------------------------------------------------------------------- | ---------------------------- |
| Backend: [tutor-dashboard.types.ts:112](apps/api/src/tutor/types/tutor-dashboard.types.ts#L112) | `comisiones: ComisionInfo[]` |
| Frontend: [tutores.api.ts:38-48](apps/web/src/lib/api/tutores.api.ts#L38-L48)                   | **NO EXISTE**                |

**Impacto:** El componente `TutorDashboard` no puede mostrar las comisiones del hijo.

**Solución recomendada:** Agregar la interfaz `ComisionInfo` y el campo al frontend.

```typescript
// tutores.api.ts - AGREGAR
export interface ComisionInfo {
  id: string;
  nombre: string;
  horario: string;
  docente: { nombre: string; apellido: string };
  producto?: { nombre: string };
}

export interface HijoInfo {
  // ... campos existentes
  comisiones: ComisionInfo[]; // ✅ AGREGAR
}
```

---

### 3. EstadoSuscripcionFamiliar: Faltan estados del backend

**Causa raíz:** El frontend no maneja 2 nuevos estados del backend (Verano 2026).

| Componente       | Estados                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| Backend (Prisma) | `PENDING, AUTHORIZED, PAUSED, PENDIENTE_CANCELACION, CANCELLED, CONTINUIDAD` |
| Frontend Colors  | `ACTIVA, PENDIENTE, PAUSADA, CANCELADA, VENCIDA`                             |

**Impacto:** Si un usuario tiene estado `PENDIENTE_CANCELACION` o `CONTINUIDAD`, el frontend crashea o muestra UI incorrecta.

**Ubicación:** [colors.constants.ts:110-120](apps/web/src/components/admin/constants/colors.constants.ts#L110-L120)

**Solución recomendada:**

1. Usar los nombres EXACTOS del backend (`PENDING`, no `PENDIENTE`)
2. Agregar los estados faltantes

```typescript
// colors.constants.ts - CAMBIAR
export const SUSCRIPCION_ESTADO_COLORS: Record<string, EstadoColorConfig> = {
  PENDING: { ... },               // ✅ Era PENDIENTE
  AUTHORIZED: { ... },            // ✅ Era ACTIVA
  PAUSED: { ... },                // ✅ Era PAUSADA
  CANCELLED: { ... },             // ✅ Era CANCELADA
  PENDIENTE_CANCELACION: { ... }, // ✅ AGREGAR
  CONTINUIDAD: { ... },           // ✅ AGREGAR
};
```

---

## 🟠 MISMATCHES ALTOS (BUGS VISUALES)

### 4. MundoTipo: `MATEMATICA` vs `MATEMATICAS`

| Componente       | Valor                   |
| ---------------- | ----------------------- |
| Backend (Prisma) | `MATEMATICA` (singular) |
| Frontend Colors  | `MATEMATICAS` (plural)  |

**Ubicación:** [colors.constants.ts:232](apps/web/src/components/admin/constants/colors.constants.ts#L232)

**Impacto:** Workaround con normalización. Código frágil que puede romperse.

**Solución:** Cambiar `MUNDO_COLORS` para usar `MATEMATICA` (singular).

---

### 5. EstadoPago: PascalCase vs UPPERCASE

| Componente       | Valores                                        |
| ---------------- | ---------------------------------------------- |
| Backend (Prisma) | `Pendiente, Pagado, Vencido, Parcial, Anulado` |
| Frontend Colors  | `PAGADO, PENDIENTE, VENCIDO, CANCELADO`        |

**Problemas:**

- Capitalización diferente (`Pagado` vs `PAGADO`)
- Frontend tiene `CANCELADO` que no existe en backend
- Backend tiene `Anulado` y `Parcial` que no están en frontend

**Ubicación:** [colors.constants.ts:82](apps/web/src/components/admin/constants/colors.constants.ts#L82)

---

### 6. TipoNotificacion: Solo implementado para Docentes

**Backend tiene 64 tipos distribuidos:**

- TUTOR\_\* (22 tipos)
- ESTUDIANTE\_\* (16 tipos)
- DOCENTE\_\* (15 tipos)
- ADMIN\_\* (11 tipos)

**Frontend solo tiene:**

- `TipoNotificacionDocente` (15 valores)

**Impacto:** Los portales de Tutor, Estudiante y Admin no pueden renderizar notificaciones tipadas.

**Ubicación:** [docentes.api.ts:~40](apps/web/src/lib/api/docentes.api.ts#L40)

---

### 7. Docente: Campo duplicado `titulo` vs `tituloProfesional`

| Campo                        | Ubicación                                                      |
| ---------------------------- | -------------------------------------------------------------- |
| `titulo?: string`            | [docentes.api.ts:9](apps/web/src/lib/api/docentes.api.ts#L9)   |
| `tituloProfesional?: string` | [docentes.api.ts:10](apps/web/src/lib/api/docentes.api.ts#L10) |

**Impacto:** El frontend no sabe cuál campo usar. Ambos son opcionales.

**Solución:** Documentar en el backend cuál es el campo canónico y eliminar el otro.

---

### 8. Avatar: `fotoUrl` vs `avatarUrl`

Se usan ambos nombres indistintamente:

| Campo       | Ubicación                                                                     |
| ----------- | ----------------------------------------------------------------------------- |
| `fotoUrl`   | [docentes.api.ts (EstudianteTopPuntos)](apps/web/src/lib/api/docentes.api.ts) |
| `avatarUrl` | [tutores.api.ts (HijoInfo)](apps/web/src/lib/api/tutores.api.ts)              |
| `avatar`    | [docente.types.ts](apps/web/src/types/docente.types.ts)                       |

**Solución:** Estandarizar a `avatarUrl` en todo el codebase.

---

## 🟡 MISMATCHES MENORES (INCONSISTENCIAS)

### 9. Campos Decimal serializados como string

Los campos monetarios vienen como `string` (no `number`) porque PostgreSQL Decimal se serializa así:

| Campo               | Tipo en Frontend | Tipo Real        |
| ------------------- | ---------------- | ---------------- |
| `precioBase`        | `string`         | Decimal → string |
| `precioFinal`       | `string`         | Decimal → string |
| `descuentoAplicado` | `string`         | Decimal → string |

**Estado:** ✅ Documentado correctamente en comentarios.

---

### 10. Fallbacks frágiles en API calls

```typescript
// clase-grupos.api.ts:82 - Código defensivo excesivo
const rawData = Array.isArray(response) ? response : response?.data || [];
```

**Problema:** Asume que el backend puede devolver array O wrapper `{ data }`. No documentado.

---

### 11. Validación Zod inconsistente

| Portal      | Tiene Zod Schemas      |
| ----------- | ---------------------- |
| Estudiantes | ✅ 15+ schemas         |
| Docentes    | ❌ Solo types manuales |
| Tutores     | ❌ Solo types manuales |

**Impacto:** Si el backend cambia, Docentes y Tutores pueden tener bugs silenciosos.

---

### 12. Audit logs usan snake_case (intencional)

Los componentes de audit logs usan claves como `user_management`, `data_modification`.

**Estado:** ✅ Es intencional para mapeo de UI, no son propiedades de datos.

---

## TABLA COMPLETA DE COMPARACIÓN

### Módulo: TUTOR

| Endpoint             | Campo Backend                | Campo Frontend                        | Match |
| -------------------- | ---------------------------- | ------------------------------------- | ----- |
| `/dashboard-resumen` | `hijos[].puntosTotales`      | `hijos[].xpTotal`                     | ❌    |
| `/dashboard-resumen` | `hijos[].comisiones`         | -                                     | ❌    |
| `/dashboard-resumen` | `metricas.totalHijos`        | `metricas.totalHijos`                 | ✅    |
| `/dashboard-resumen` | `metricas.clasesDelMes`      | `metricas.clasesDelMes`               | ✅    |
| `/dashboard-resumen` | `alertas[].tipo`             | `alertas[].tipo`                      | ✅    |
| `/proximas-clases`   | `clases[].labelFecha`        | `clases[].labelFecha`                 | ✅    |
| `/mis-inscripciones` | `inscripciones[].precioBase` | `inscripciones[].precioBase` (string) | ✅    |

### Módulo: DOCENTES

| Endpoint        | Campo Backend               | Campo Frontend                          | Match |
| --------------- | --------------------------- | --------------------------------------- | ----- |
| `/me/dashboard` | `claseInminente.cupoMaximo` | `claseInminente.cupoMaximo`             | ✅    |
| `/me/dashboard` | `stats.puntosOtorgados`     | `stats.puntosOtorgados`                 | ✅    |
| `/me/dashboard` | `docente.titulo`            | `docente.titulo` OR `tituloProfesional` | ⚠️    |
| `/estudiantes`  | `estudiante.fotoUrl`        | `estudiante.avatarUrl`                  | ⚠️    |

### Módulo: ESTUDIANTES

| Endpoint            | Campo Backend          | Campo Frontend         | Match |
| ------------------- | ---------------------- | ---------------------- | ----- |
| `/mi-progreso`      | `gamificacion.xpTotal` | `gamificacion.xpTotal` | ✅    |
| `/mi-progreso`      | `racha.rachaActual`    | `racha.rachaActual`    | ✅    |
| `/mis-clases`       | `clase.diaSemana`      | `clase.diaSemana`      | ✅    |
| `/verificar-acceso` | `motivo`               | `motivo`               | ✅    |

### Módulo: ADMIN

| Endpoint     | Campo Backend       | Campo Frontend      | Match |
| ------------ | ------------------- | ------------------- | ----- |
| `/dashboard` | No tipado explícito | No tipado explícito | ⚠️    |

### Enums Globales

| Enum                        | Backend                | Frontend                  | Match |
| --------------------------- | ---------------------- | ------------------------- | ----- |
| `DiaSemana`                 | 7 valores              | 7 valores                 | ✅    |
| `CasaTipo`                  | 3 valores              | 3 valores                 | ✅    |
| `TierNombre`                | 3 valores              | 3 valores                 | ✅    |
| `TipoClaseGrupo`            | 2 valores              | 2 valores                 | ✅    |
| `MundoTipo`                 | 3 valores (singular)   | 3 valores (plural)        | ⚠️    |
| `EstadoPago`                | 5 valores (PascalCase) | 4 valores (UPPERCASE)     | ❌    |
| `EstadoSuscripcionFamiliar` | 6 valores              | 4 valores                 | ❌    |
| `TipoNotificacion`          | 64 valores             | 15 valores (solo Docente) | ❌    |

---

## RECOMENDACIONES

### Prioridad CRÍTICA (hacer ahora)

1. **[tutores.api.ts]** Cambiar `xpTotal` → `puntosTotales` en `HijoInfo`
2. **[tutores.api.ts]** Agregar `comisiones: ComisionInfo[]` a `HijoInfo`
3. **[colors.constants.ts]** Actualizar `SUSCRIPCION_ESTADO_COLORS` con nombres del backend

### Prioridad ALTA (esta semana)

4. **[colors.constants.ts]** Cambiar `MATEMATICAS` → `MATEMATICA`
5. **[colors.constants.ts]** Alinear `PAGO_ESTADO_COLORS` con `EstadoPago` del backend
6. **[docentes.api.ts]** Agregar tipos de notificación para Tutor, Estudiante, Admin

### Prioridad MEDIA (próximo sprint)

7. **[docentes.api.ts]** Resolver duplicidad `titulo` vs `tituloProfesional`
8. **[global]** Estandarizar `avatarUrl` vs `fotoUrl`
9. **[docentes.api.ts, tutores.api.ts]** Agregar validación Zod como en estudiantes.api.ts

---

## ARCHIVOS AFECTADOS

| Archivo                                                       | Cambios Requeridos                              |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `apps/web/src/lib/api/tutores.api.ts`                         | `xpTotal`→`puntosTotales`, agregar `comisiones` |
| `apps/web/src/components/tutor/TutorDashboard.tsx`            | Actualizar uso de `hijo.xpTotal`                |
| `apps/web/src/components/admin/constants/colors.constants.ts` | Múltiples correcciones de enums                 |
| `apps/web/src/lib/api/docentes.api.ts`                        | Resolver `titulo`, agregar tipos notificación   |

---

## CONCLUSIÓN

El codebase tiene **buena consistencia general** (85%+ camelCase). Los problemas principales son:

1. **Campo semántico diferente** (`puntosTotales` vs `xpTotal`) - requiere decisión de producto
2. **Enums desactualizados** en el frontend después de cambios de Verano 2026
3. **Tipos de notificación incompletos** para 3 de 4 portales

Se recomienda crear un **paquete contracts** con las definiciones canónicas de todos los tipos y que tanto backend como frontend importen desde ahí (ya existe parcialmente en `@mateatletas/contracts`).
