# 🔧 TypeScript Errors - Plan de Corrección Completo

## 📊 Estado Actual
- **Errores iniciales:** 235
- **Errores después de fix stores:** 220
- **Errores restantes:** 220

## 🎯 Estrategia de Corrección

### ✅ COMPLETADO

#### 1. Stores - Error Handling (Reducidos 15 errores)
- ✅ Reemplazados todos los `((error as unknown).response)?.data?.message` 
- ✅ Implementado `getErrorMessage()` helper
- ✅ Agregados tipos `CrearClaseDto` y `CrearProductoDto` en admin.store
- ✅ Agregados casts `as Clase[]` y `as Producto[]`

### 🔧 PENDIENTE - Por Categoría

#### 2. TS6133 - Unused Variables (41 errores) - PRIORIDAD ALTA
**Acción:** Eliminar o prefixar con `_`

**Archivos afectados:**
```typescript
// src/app/docente/calendario/page.tsx
- getColorPorTipo (línea 10)
- cargarVistaSemana (línea 41)
- onEventoClickAccent (línea 317)
- onClickAccent (línea 348)

// src/app/docente/mis-clases/page.tsx
- claseId (línea 147)
- onEnviarRecordatorio (líneas 579, 716)
- formatFecha (líneas 584, 721)
- onCancelar (línea 717)
- puedeCancelar (línea 718)

// src/app/estudiante/cursos/algebra-challenge/page.tsx
- Zap (línea 13)

// src/app/estudiante/cursos/calculo-mental/page.tsx
- Sparkles (línea 17)

// src/app/estudiante/evaluacion/page.tsx
- Trophy (línea 12)

// src/app/estudiante/layout.tsx
- User, Sun, Moon, Menu (líneas 12-17)
- NotificationButton (línea 270)

// src/app/(protected)/layout.tsx
- user, logout (línea 28)
```

**Fix automático:**
```bash
# Eliminar imports no usados
sed -i '/^import.*Trophy.*$/d' src/app/estudiante/evaluacion/page.tsx
sed -i '/^import.*Zap.*$/d' src/app/estudiante/cursos/algebra-challenge/page.tsx
```

#### 3. TS2304 - Cannot Find Name (12 errores) - PRIORIDAD ALTA
**Acción:** Agregar imports faltantes

**Archivos:**
```typescript
// src/app/estudiante/ranking/page.tsx:117
import { Trophy } from 'lucide-react';

// src/app/docente/calendario/page.tsx:220
// Definir variable 'color' o eliminar referencia

// src/app/docente/planificador/page.tsx:62
import { BookOpen } from 'lucide-react';

// src/app/docente/planificador/page.tsx:132, 671
// Definir variable 'template' o corregir lógica

// src/app/docente/planificador/page.tsx:567, 868
import { Download } from 'lucide-react';

// src/app/estudiante/dashboard/page.tsx:55
import type { Clase } from '@/types/clases.types';

// src/app/estudiante/dashboard/page.tsx:299, 303
import { User, Clock } from 'lucide-react';

// src/app/estudiante/dashboard/page.tsx:358
import { TrendingUp } from 'lucide-react';

// src/app/estudiante/dashboard/page.tsx:393
import { BookOpen } from 'lucide-react';

// src/app/estudiante/logros/page.tsx:143
import { Trophy } from 'lucide-react';
```

#### 4. TS2322 - Type Mismatches (28 errores) - PRIORIDAD MEDIA

**4.1 Framer Motion Errors (6 errores)**
```typescript
// Problema: transition prop con string 'ease'
// Fix: Usar arrays de easing predefinidos

// ANTES:
<motion.div
  transition={{ duration: 0.3, ease: "easeInOut" }}
>

// DESPUÉS:
<motion.div
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>

// O usar tipo correcto:
import { Easing } from 'framer-motion';
const easing: Easing = [0.4, 0, 0.2, 1];
```

**Archivos afectados:**
- src/app/docente/calendario/page.tsx:65
- src/app/docente/observaciones/page.tsx:85
- src/app/docente/perfil/page.tsx:103
- src/app/docente/planificador/page.tsx:354
- src/app/docente/reportes/page.tsx:205

**4.2 Unknown to ReactNode (10+ errores)**
```typescript
// Problema: Valores 'unknown' asignados a ReactNode
// Fix: Cast explícito

// ANTES:
<span>{data.equipoActual.nombre}</span>

// DESPUÉS:
<span>{data.equipoActual?.nombre as React.ReactNode}</span>

// O mejor:
<span>{String(data.equipoActual?.nombre ?? '')}</span>
```

**4.3 Other Type Mismatches**
```typescript
// src/app/estudiante/cursos/[cursoId]/lecciones/[leccionId]/page.tsx
// Líneas 282, 286, 289, 297, 298, 301
// Fix: Definir tipos correctos para contenido de lecciones

// src/app/docente/perfil/page.tsx:271
// Fix: LoadingSpinner no acepta prop 'color'
<LoadingSpinner size="sm" /> // Eliminar color prop
```

#### 5. TS18046/TS18047 - Possibly Undefined/Null (21 errores) - PRIORIDAD MEDIA

**Acción:** Agregar optional chaining y nullish coalescing

```typescript
// ANTES:
estudiante.nombre

// DESPUÉS:
estudiante?.nombre ?? 'Sin nombre'

// ANTES:
data.equipoActual.color

// DESPUÉS:
data.equipoActual?.color ?? '#gray'
```

**Archivos principales:**
- src/app/estudiante/ranking/page.tsx (10 errores)
- src/app/estudiante/dashboard/page.tsx (5 errores)
- src/app/admin/reportes/page.tsx (2 errores)

#### 6. TS2339 - Property Does Not Exist (17 errores) - PRIORIDAD MEDIA

**6.1 Calendario Page**
```typescript
// src/app/docente/calendario/page.tsx
// Problemas:
// - onEventoClickAccent no existe en GrupoEventosProps
// - onClickAccent no existe en EventoCardProps  
// - colorAccent no existe
// - onClick no existe

// Fix: Revisar interfaces y props
interface GrupoEventosProps {
  // ... existing props
  onEventoClick: (evento: Evento) => void; // Ya existe
}

interface EventoCardProps {
  // ... existing props
  onClick: () => void; // Agregar
}
```

**6.2 Logros Page**
```typescript
// src/app/estudiante/logros/page.tsx
// Problema: Property 'rareza' does not exist on type 'Logro'

// Fix: Agregar a tipo o usar type guard
interface Logro {
  // ... existing props
  rareza?: 'común' | 'raro' | 'épico' | 'legendario';
}
```

**6.3 Dashboard Components**
```typescript
// src/app/(protected)/dashboard/page.tsx:102
// Problema: Property 'membresia' does not exist on type '{}'

// Fix: Definir tipo correcto para userInfo
interface UserInfo {
  membresia: {
    tipo: string;
    fecha_fin: string;
  } | null;
}
```

**6.4 Estudiante Dashboard**
```typescript
// src/app/estudiante/dashboard/page.tsx
// Problema: Property 'ruta_curricular' should be 'rutaCurricular'

// Fix: Cambiar snake_case a camelCase
tarea.rutaCurricular // en lugar de tarea.ruta_curricular
```

#### 7. TS2345 - Argument Type Mismatch (13 errores) - PRIORIDAD BAJA

**7.1 EstadoClase Type**
```typescript
// src/app/docente/mis-clases/page.tsx:626, 782
// Problema: "Programada" no es asignable a EstadoClase

// Fix: Usar valores correctos del enum
import { EstadoClase } from '@/types/clases.types';

// ANTES:
getEstadoBadgeClase("Programada")

// DESPUÉS:
getEstadoBadgeClase(EstadoClase.PROGRAMADA)
```

**7.2 Export Utils**
```typescript
// src/app/admin/usuarios/page.tsx:74
// Problema: AdminUser[] no es asignable a ExportableData[]

// Fix: Agregar index signature a AdminUser
interface AdminUser {
  [key: string]: string | number | boolean | null | undefined;
  // ... otras props
}
```

**7.3 Modulo descripcion**
```typescript
// src/app/estudiante/cursos/[cursoId]/page.tsx:230
// Problema: descripcion puede ser null

// Fix:
const moduloData = {
  ...modulo,
  descripcion: modulo.descripcion ?? undefined
}
```

#### 8. TS2740 - Missing Properties (7 errores) - PRIORIDAD BAJA

```typescript
// Problema: {} asignado a arrays o tipos complejos

// Fix: Inicializar con valores correctos
const [contenido, setContenido] = useState<ContenidoLeccion>({
  titulo: '',
  descripcion: '',
  ejercicios: []
});
```

#### 9. TS7053 - Element Implicitly Has 'any' Type (3 errores) - PRIORIDAD BAJA

```typescript
// src/app/estudiante/logros/page.tsx
// Problema: rareza usado como índice sin type checking

// Fix:
const rarityStyles: Record<string, { bg: string; border: string }> = {
  común: { bg: '...', border: '...' },
  // ...
};

const style = logro.rareza ? rarityStyles[logro.rareza] : rarityStyles['común'];
```

## 🚀 Plan de Acción Recomendado

### Fase 1: Quick Wins (Reducir 50+ errores en 1 hora)
1. ✅ Fix stores error handling (COMPLETADO - 15 errores)
2. Remove unused imports (41 errores) - 15 min
3. Add missing imports (12 errores) - 10 min  
4. Fix framer-motion transitions (6 errores) - 20 min
5. Add optional chaining (21 errores) - 15 min

**Resultado esperado:** ~95 errores eliminados → 140 errores restantes

### Fase 2: Medium Fixes (Reducir 40 errores en 1.5 horas)
1. Fix property errors (17 errores) - 30 min
2. Fix type mismatches (15 errores) - 45 min
3. Fix argument mismatches (10 errores) - 15 min

**Resultado esperado:** ~42 errores eliminados → ~98 errores restantes

### Fase 3: Deep Fixes (Reducir resto en 2 horas)
1. Fix calendario/page.tsx completamente (12 errores) - 45 min
2. Fix ranking/page.tsx completamente (20 errores) - 45 min
3. Fix estudiante/dashboard/page.tsx (13 errores) - 30 min

**Resultado esperado:** ~45 errores eliminados → ~53 errores restantes

### Fase 4: Final Cleanup (1 hora)
1. Fix remaining edge cases
2. Verify all fixes
3. Run full typecheck

**Objetivo final:** 0 errores TypeScript

## 📝 Scripts Útiles

```bash
# Contador de errores por tipo
npx tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error \(TS[0-9]*\):.*/\1/' | sort | uniq -c | sort -rn

# Top archivos con errores
npx tsc --noEmit 2>&1 | grep "error TS" | cut -d: -f1 | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -15

# Errores de un archivo específico
npx tsc --noEmit 2>&1 | grep "FILENAME"

# Remover unused imports automáticamente (con precaución)
npx eslint --fix src/**/*.tsx --rule '{"@typescript-eslint/no-unused-vars": "error"}'
```

## ✅ Siguiente Paso Inmediato

Ejecutar este comando para ver progreso:
```bash
cd /home/alexis/Documentos/Mateatletas-Ecosystem/apps/web
npx tsc --noEmit 2>&1 | tee /tmp/typescript-errors-current.txt
grep -c "error TS" /tmp/typescript-errors-current.txt
```

Luego empezar con Fase 1, paso 2 (unused imports).
