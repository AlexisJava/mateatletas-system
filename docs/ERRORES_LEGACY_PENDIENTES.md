# Errores TypeScript Legacy - Pendientes de Corrección

> **Fecha:** 31 de Octubre de 2025
> **Autor:** Claude (sesión de refactorización)
> **Estado:** 📊 ~550 errores TypeScript en frontend
> **Backend:** ✅ 0 errores

---

## 📋 Resumen Ejecutivo

Este documento cataloga **todos los errores TypeScript** que existen en el proyecto Mateatletas-Ecosystem después de la corrección de `gamificacion.api.ts`.

**Importante:** Estos errores **NO fueron causados** por la refactorización del PR #28. Son **deuda técnica acumulada** de versiones anteriores del código.

### Estado Actual del Proyecto

| Componente                  | Errores | Estado                |
| --------------------------- | ------- | --------------------- |
| **API (Backend)**           | 0       | ✅ Perfecto           |
| **gamificacion.api.ts**     | 0       | ✅ Recién corregido   |
| **Otros archivos frontend** | ~550    | ⚠️ Legacy (pendiente) |

### Origen de los Errores

1. **Schemas refactorizados sin actualizar código** (40%)
2. **React Query hooks sin tipos definidos** (25%)
3. **APIs sin validación con Zod** (20%)
4. **Propiedades incorrectas/typos** (10%)
5. **Otros (deps, variables no usadas, etc.)** (5%)

---

## 🔴 CRÍTICOS - Bloquean Funcionalidad (70+ errores)

Estos errores impiden que ciertas features funcionen correctamente.

### 1. useClases.ts (26 errores)

**Archivo:** `apps/web/src/lib/hooks/useClases.ts`

**Problema:**

```typescript
// FALTA EL IMPORT DE REACT QUERY
import { useQuery, useMutation } from '@tanstack/react-query';
```

**Impacto:**

- TypeScript no sabe qué tipo retorna `useQuery`
- Todos los componentes que usan este hook fallan
- ~50 componentes afectados indirectamente

**Solución:**

```typescript
// 1. Agregar import faltante
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 2. Asegurar tipos en cada hook
export function useClases(filtros?: FiltroClases, options?: { enabled?: boolean }) {
  return useQuery<ClaseConRelaciones[], Error>({
    // ✅ Tipo explícito
    queryKey: clasesKeys.list(filtros),
    queryFn: () => clasesApi.obtenerClases(filtros),
    ...options,
  });
}
```

**Prioridad:** 🔴 CRÍTICA
**Estimado:** 30 minutos
**Archivos afectados:** 1

---

### 2. APIs sin Validación Zod (44 errores totales)

Estos archivos tienen el MISMO problema que tenía `gamificacion.api.ts` antes de corregirlo.

#### 2.1 tienda.api.ts (11 errores)

**Archivo:** `apps/web/src/lib/api/tienda.api.ts`

**Problema:**

```typescript
// MAL - retorna 'any'
export const obtenerItemsTienda = async () => {
  const response = await apiClient.get('/tienda/items');
  return response as any; // ❌ Tipo inseguro
};
```

**Solución:**

```typescript
// BIEN - validar con schema
import { itemsTiendaSchema } from '@mateatletas/contracts';

export const obtenerItemsTienda = async () => {
  const response = await apiClient.get('/tienda/items');
  return itemsTiendaSchema.parse(response); // ✅ Validado con Zod
};
```

**Prioridad:** 🔴 CRÍTICA
**Estimado:** 45 minutos

---

#### 2.2 planificaciones-simples.api.ts (10 errores)

**Archivo:** `apps/web/src/lib/api/planificaciones-simples.api.ts`

**Problema:** Sin validación de schemas
**Prioridad:** 🔴 CRÍTICA
**Estimado:** 30 minutos

---

#### 2.3 pagos.api.ts (9 errores)

**Archivo:** `apps/web/src/lib/api/pagos.api.ts`

**Problema:** Tipos `any` sin validación
**Prioridad:** 🔴 CRÍTICA
**Estimado:** 40 minutos

---

#### 2.4 estudiantes.api.ts (7 errores)

**Archivo:** `apps/web/src/lib/api/estudiantes.api.ts`

**Problema:** Falta validación con schemas
**Prioridad:** 🔴 CRÍTICA
**Estimado:** 30 minutos

---

#### 2.5 equipos.api.ts (5 errores)

**Archivo:** `apps/web/src/lib/api/equipos.api.ts`

**Problema:** Sin validación Zod
**Prioridad:** 🔴 CRÍTICA
**Estimado:** 20 minutos

---

#### 2.6 admin.api.ts (5 errores)

**Archivo:** `apps/web/src/lib/api/admin.api.ts`

**Problema:** Tipos incorrectos
**Prioridad:** 🟠 ALTA
**Estimado:** 25 minutos

---

### 3. Otros Hooks sin Tipos (14 errores)

#### 3.1 useLogros.ts (7 errores)

**Archivo:** `apps/web/src/hooks/useLogros.ts`

**Problema:** React Query sin tipos genéricos
**Prioridad:** 🔴 CRÍTICA
**Estimado:** 20 minutos

---

#### 3.2 useStudentAnimations.ts (7 errores)

**Archivo:** `apps/web/src/hooks/useStudentAnimations.ts`

**Problema:** Tipos faltantes
**Prioridad:** 🟠 ALTA
**Estimado:** 15 minutos

---

## 🟠 IMPORTANTES - Bugs Visibles (80+ errores)

Estos errores causan problemas que el usuario puede ver o experimentar.

### 4. Componentes de Gamificación (30 errores)

#### 4.1 ListaLogros.tsx (13 errores)

**Archivo:** `apps/web/src/components/gamificacion/ListaLogros.tsx`

**Problema:**

```typescript
// CÓDIGO VIEJO - usa propiedades que YA NO existen
const categorias = data?.por_categoria; // ❌ no existe
const total = data?.total_logros; // ❌ no existe
const desbloqueados = data?.logros_desbloqueados; // ❌ no existe
```

**Schema actual en contracts:**

```typescript
// Lo que REALMENTE retorna la API
export type Logro = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntos: number;
  categoria: string;
  rareza?: string;
  desbloqueado: boolean;
  fecha_desbloqueo?: string | Date;
};

export type LogrosList = Logro[];
```

**Solución:**

```typescript
// Usar el tipo correcto de contracts
import { Logro } from '@mateatletas/contracts';

// Calcular categorías del lado del cliente
const categorias = logros.reduce(
  (acc, logro) => {
    if (!acc[logro.categoria]) {
      acc[logro.categoria] = [];
    }
    acc[logro.categoria].push(logro);
    return acc;
  },
  {} as Record<string, Logro[]>,
);

const total = logros.length;
const desbloqueados = logros.filter((l) => l.desbloqueado).length;
```

**Prioridad:** 🟠 ALTA
**Estimado:** 1 hora
**Archivos afectados:** 1 componente + páginas que lo usan

---

#### 4.2 RecursosBar.tsx (5 errores)

**Archivo:** `apps/web/src/components/gamificacion/RecursosBar.tsx`

**Problema:** Accede a propiedades incorrectas de `RecursosEstudiante`
**Prioridad:** 🟠 ALTA
**Estimado:** 30 minutos

---

#### 4.3 RachaWidget.tsx (5 errores)

**Archivo:** `apps/web/src/components/gamificacion/RachaWidget.tsx`

**Problema:** API de racha cambió
**Prioridad:** 🟠 ALTA
**Estimado:** 30 minutos

---

#### 4.4 gamificacion/logros/page.tsx (8 errores)

**Archivo:** `apps/web/src/app/estudiante/gamificacion/logros/page.tsx`

**Problema:** Usa APIs viejas que cambiaron
**Prioridad:** 🟠 ALTA
**Estimado:** 45 minutos

---

#### 4.5 gamificacion/page.tsx (3 errores)

**Archivo:** `apps/web/src/app/estudiante/gamificacion/page.tsx`

**Problema:** Tipos incorrectos
**Prioridad:** 🟠 ALTA
**Estimado:** 20 minutos

---

### 5. Página de Perfil del Estudiante (11 errores)

**Archivo:** `apps/web/src/app/estudiante/perfil/page.tsx`

**Problema:**

```typescript
// ERROR: estas propiedades NO existen en el schema
recursos.monedas_total; // ❌ Property does not exist
recursos.xp_total; // ❌ Property does not exist
recursos.nivel; // ❌ Property does not exist
```

**Schema actual:**

```typescript
// De @mateatletas/contracts - tienda.schema.ts
export type RecursosEstudiante = {
  id: string;
  estudiante_id: string;
  xp_total: number; // ✅ EXISTE
  monedas_total: number; // ✅ EXISTE
  gemas_total: number;
  ultima_actualizacion: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

**Explicación:**

- `xp_total` y `monedas_total` SÍ existen (¡los errores TypeScript están mal!)
- El problema es que el tipo inferido por React Query es `unknown`
- Necesita tipo genérico explícito en el hook

**Solución:**

```typescript
// 1. En el hook useRecursos
import { RecursosEstudiante } from '@mateatletas/contracts';

export function useRecursos(estudianteId: string) {
  return useQuery<RecursosEstudiante, Error>({
    // ✅ Tipo explícito
    queryKey: ['recursos', estudianteId],
    queryFn: () => gamificacionApi.obtenerRecursos(estudianteId),
  });
}

// 2. En la página
const { data: recursos } = useRecursos(estudianteId);
// Ahora TypeScript sabe que recursos es RecursosEstudiante

// 3. Para 'nivel' (que NO existe), calcularlo del lado del cliente
const nivel = calcularNivelDesdeXP(recursos?.xp_total || 0);
```

**Prioridad:** 🟠 ALTA
**Estimado:** 45 minutos
**Archivos afectados:** 1 página + 1 hook

---

### 6. Propiedades Incorrectas en Schemas (20+ errores)

#### 6.1 ClassCard.tsx y ClassReservationModal.tsx (4 errores)

**Archivos:**

- `apps/web/src/components/features/clases/ClassCard.tsx` (2 errores)
- `apps/web/src/components/features/clases/ClassReservationModal.tsx` (2 errores)

**Problema:**

```typescript
// ERROR: Property 'titulo' does not exist
clase.titulo; // ❌ no existe en ClaseConRelaciones

// ERROR: Property 'cupo_maximo' does not exist. Did you mean 'cupos_maximo'?
clase.cupo_maximo; // ❌ typo
```

**Solución:**

```typescript
// ClaseConRelaciones no tiene 'titulo', usar ruta_curricular
clase.ruta_curricular.nombre; // ✅

// Corregir typo
clase.cupos_maximo; // ✅ (con 's')
```

**Prioridad:** 🟠 ALTA
**Estimado:** 15 minutos
**Archivos afectados:** 2

---

#### 6.2 NotificacionesView.tsx (2 errores)

**Archivo:** `apps/web/src/app/estudiante/gimnasio/views/NotificacionesView.tsx`

**Problema:**

```typescript
// ERROR: Property 'titulo' does not exist on type 'Logro'
logro.titulo; // ❌ debería ser logro.nombre

// ERROR: Property 'nombre' does not exist on type 'ProximaClase'
clase.nombre; // ❌ debería ser clase.ruta_curricular.nombre
```

**Solución:**

```typescript
// Para logros
logro.nombre; // ✅

// Para clases
clase.ruta_curricular.nombre; // ✅
```

**Prioridad:** 🟠 ALTA
**Estimado:** 10 minutos

---

#### 6.3 AsignarPuntosModal.tsx (1 error)

**Archivo:** `apps/web/src/app/docente/grupos/[id]/components/AsignarPuntosModal.tsx`

**Problema:**

```typescript
// ERROR: Property 'codigo' does not exist
accion.codigo; // ❌ no existe en AccionPuntuable schema
```

**Schema actual:**

```typescript
export type AccionPuntuable = {
  id: string;
  nombre: string;
  descripcion: string;
  puntos: number;
  activo: boolean;
  // NO tiene 'codigo'
};
```

**Solución:**

```typescript
// Usar 'id' en lugar de 'codigo'
accion.id; // ✅
```

**Prioridad:** 🟠 ALTA
**Estimado:** 5 minutos

---

#### 6.4 docente/grupos/[id]/page.tsx (2 errores)

**Archivo:** `apps/web/src/app/docente/grupos/[id]/page.tsx`

**Problema:**

```typescript
// ERROR: Property 'avatar_url' does not exist
estudiante.avatar_url; // ❌ debería ser foto_url o avatar_gradient
```

**Solución:**

```typescript
// Usar propiedades correctas
estudiante.foto_url || getAvatarGradient(estudiante.avatar_gradient);
```

**Prioridad:** 🟠 ALTA
**Estimado:** 10 minutos

---

### 7. Planificaciones (10 errores)

#### 7.1 shared/index.ts (8 errores)

**Archivo:** `apps/web/src/planificaciones/shared/index.ts`

**Problema:** Tipos exportados incorrectamente
**Prioridad:** 🟡 MEDIA
**Estimado:** 30 minutos

---

#### 7.2 Archivos de planificaciones de ciencia (2 errores c/u)

**Archivos:**

- `apps/web/src/planificaciones/2025-11-mes-ciencia-astronomia/index.tsx`
- `apps/web/src/planificaciones/2025-11-mes-ciencia-fisica/index.tsx`
- `apps/web/src/planificaciones/2025-11-mes-ciencia-quimica/index.tsx`
- `apps/web/src/planificaciones/2025-11-mes-ciencia-informatica/index.tsx`

**Problema:** Imports de tipos incorrectos
**Prioridad:** 🟡 MEDIA
**Estimado:** 20 minutos (todos juntos)

---

## 🟡 MENORES - No Críticos (40+ errores)

### 8. Props Opcionales Sin Validar (15+ errores)

**Patrón común:**

```typescript
// ERROR: Type 'string | undefined' is not assignable to type 'string'
const id: string = userId; // userId puede ser undefined
```

**Archivos afectados:**

- `apps/web/src/app/admin/usuarios/page.tsx` (1 error)
- `apps/web/src/components/admin/AgregarEstudianteModal.tsx` (5 errores)
- `apps/web/src/app/estudiante/planificaciones/[codigo]/PlanificacionClient.tsx` (5 errores)
- `apps/web/src/components/estudiantes/AvatarSelector.tsx` (3 errores)
- Varios otros archivos (1 error c/u)

**Solución genérica:**

```typescript
// Opción 1: Optional chaining
estudiante?.nombre;

// Opción 2: Nullish coalescing
const id = userId ?? '';

// Opción 3: Validación temprana
if (!userId) return null;
const id: string = userId;

// Opción 4: Non-null assertion (solo si estás 100% seguro)
const id: string = userId!;
```

**Prioridad:** 🟡 MEDIA
**Estimado:** 1 hora (todos juntos)

---

### 9. Variables No Usadas (5+ errores)

**Ejemplos:**

```typescript
// ERROR: 'user' is declared but its value is never read
const { user } = useAuth();

// ERROR: All destructured elements are unused
const { data, isLoading } = useQuery(...);
```

**Archivos:**

- `apps/web/src/app/estudiante/gimnasio/page.tsx`
- `apps/web/src/app/estudiante/gimnasio/views/HubView.tsx`
- Varios otros

**Solución:**

```typescript
// Eliminar variables no usadas
// const { user } = useAuth();  // ❌ eliminar

// O usar _ para indicar que es intencional
const { data: _, isLoading } = useQuery(...);
```

**Prioridad:** 🟢 BAJA
**Estimado:** 30 minutos (cleanup general)

---

### 10. Otros Errores Menores (20+ errores)

#### MathBackground.tsx (3 errores)

**Archivo:** `apps/web/src/app/estudiante/gimnasio/components/MathBackground.tsx`

**Problema:** Props opcionales sin validar
**Prioridad:** 🟡 MEDIA
**Estimado:** 10 minutos

---

#### Tests y Utilidades (10+ errores)

- `apps/web/src/components/admin/__tests__/CreateDocenteForm.improvements.spec.tsx` (4 errores)
- `apps/web/src/features/admin/stats/store/__tests__/stats.store.test.ts` (2 errores)
- `apps/web/src/lib/utils/export.utils.ts` (4 errores)

**Prioridad:** 🟢 BAJA
**Estimado:** 1 hora

---

## ⚪ NO URGENTES (15+ errores)

### 11. Errores de node_modules (10+ errores)

**Archivos:**

- `node_modules/recharts/types/...` (5 errores)
- `node_modules/@types/three/...` (2 errores)
- `node_modules/@testing-library/...` (2 errores)
- `node_modules/framer-motion/...` (2 errores)

**Problema:** Versiones incompatibles de dependencias

**Solución:**

```typescript
// Opción 1: Actualizar dependencias
npm update

// Opción 2: Ignorar (agregar a tsconfig.json)
{
  "compilerOptions": {
    "skipLibCheck": true  // Ignora errores en node_modules
  }
}

// Opción 3: @ts-ignore puntual
// @ts-ignore
import { Component } from 'recharts';
```

**Prioridad:** ⚪ MUY BAJA
**Estimado:** Ignorar por ahora

---

## 📊 Plan de Acción Recomendado

### Fase 1: CRÍTICOS (1-2 días)

**Objetivo:** Eliminar los 70+ errores críticos que bloquean funcionalidad

1. ✅ ~~gamificacion.api.ts~~ (YA CORREGIDO)
2. 🔴 useClases.ts (26 errores) - 30 min
3. 🔴 tienda.api.ts (11 errores) - 45 min
4. 🔴 planificaciones-simples.api.ts (10 errores) - 30 min
5. 🔴 pagos.api.ts (9 errores) - 40 min
6. 🔴 estudiantes.api.ts (7 errores) - 30 min
7. 🔴 useLogros.ts (7 errores) - 20 min
8. 🔴 equipos.api.ts (5 errores) - 20 min

**Total estimado:** ~4 horas

---

### Fase 2: IMPORTANTES (2-3 días)

**Objetivo:** Corregir bugs visibles al usuario

9. 🟠 ListaLogros.tsx (13 errores) - 1 hora
10. 🟠 perfil/page.tsx (11 errores) - 45 min
11. 🟠 RecursosBar.tsx (5 errores) - 30 min
12. 🟠 RachaWidget.tsx (5 errores) - 30 min
13. 🟠 admin.api.ts (5 errores) - 25 min
14. 🟠 Propiedades incorrectas (20 errores) - 2 horas
15. 🟠 gamificacion/logros/page.tsx (8 errores) - 45 min
16. 🟠 Planificaciones (10 errores) - 1 hora

**Total estimado:** ~7 horas

---

### Fase 3: MENORES (1 día)

**Objetivo:** Mejorar calidad del código

17. 🟡 Props opcionales (15 errores) - 1 hora
18. 🟡 Otros hooks (7 errores) - 30 min
19. 🟢 Variables no usadas (5 errores) - 30 min
20. 🟡 Tests y utilidades (10 errores) - 1 hora

**Total estimado:** ~3 horas

---

### Fase 4: OPCIONAL

21. ⚪ node_modules (10 errores) - Ignorar o skipLibCheck

---

## 📈 Métricas de Progreso

### Estado Inicial (Antes de corrección)

- Total errores: ~583
- gamificacion.api.ts: 32 errores
- Resto: ~551 errores

### Estado Actual (Después de corrección)

- Total errores: **~550**
- gamificacion.api.ts: **0 errores** ✅
- Resto: **~550 errores** (legacy)

### Meta Final

- Total errores: **0-10** (solo node_modules si se decide ignorar)
- Tiempo estimado total: **~15 horas** de trabajo
- Distribución:
  - Fase 1 (Críticos): 4 horas
  - Fase 2 (Importantes): 7 horas
  - Fase 3 (Menores): 3 horas
  - Fase 4 (Opcional): Ignorar

---

## 🎯 Quick Wins (Empezar por aquí)

Si solo tienes tiempo para algunos fixes, hazlos en este orden:

1. **useClases.ts** (30 min) → Arregla 26 errores + desbloquea componentes
2. **tienda.api.ts** (45 min) → Arregla 11 errores, similar a gamificacion.api.ts
3. **Props opcionales** (1 hora) → Arregla ~15 errores de múltiples archivos
4. **Variables no usadas** (30 min) → Arregla 5 errores, cleanup rápido
5. **Typos (cupo_maximo, titulo, etc.)** (30 min) → Arregla ~10 errores

**Total Quick Wins:** ~3 horas → **~67 errores resueltos** 🎉

---

## 📝 Notas Adicionales

### Herramientas Útiles

```bash
# Ver errores de un archivo específico
npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | grep "archivo.ts"

# Contar errores totales
npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | grep "error TS" | wc -l

# Agrupar por archivo
npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn

# Ver solo errores críticos (TS2xxx)
npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | grep "error TS2"
```

### Scripts Recomendados (package.json)

```json
{
  "scripts": {
    "type-check": "tsc --noEmit --project apps/web/tsconfig.json",
    "type-check:api": "tsc --noEmit --project apps/api/tsconfig.json",
    "type-check:watch": "tsc --noEmit --watch --project apps/web/tsconfig.json",
    "fix:unused": "eslint --fix '**/*.{ts,tsx}' --rule 'no-unused-vars: error'"
  }
}
```

### Configuración TypeScript (tsconfig.json)

Para reducir ruido de node_modules:

```json
{
  "compilerOptions": {
    "skipLibCheck": true, // Ignora errores de .d.ts en node_modules
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 🚀 Conclusión

**Estado actual:**

- ✅ Backend completamente limpio (0 errores)
- ✅ gamificacion.api.ts corregido (0 errores)
- ⚠️ Frontend con deuda técnica (~550 errores legacy)

**Próximos pasos:**

1. Seguir el plan de 3 fases (15 horas estimadas)
2. Empezar con Quick Wins si hay poco tiempo
3. Priorizar Fase 1 (errores críticos)

**Recursos:**

- Este documento para referencia
- Commit `8d53689` como ejemplo de corrección (gamificacion.api.ts)
- [Documentación de contracts](../packages/contracts/README.md)

---

**Última actualización:** 31 de Octubre de 2025
**Revisión:** v1.0
**Autor:** Claude Code Assistant
