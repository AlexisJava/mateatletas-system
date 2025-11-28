# Componentes de Gamificación V2

Sistema completo de gamificación para Mateatletas con logros, niveles, racha y recursos.

## 📦 Componentes Disponibles

### RecursosBar

Barra superior que muestra nivel, XP, monedas y progreso de nivel del estudiante.

```tsx
import { RecursosBar } from '@/components/gamificacion';

<RecursosBar estudianteId="abc123" />;
```

**Props:**

- `estudianteId: string` - ID del estudiante

**Features:**

- Muestra nivel actual con badge animado
- Progreso de XP con barra animada
- Total de monedas y XP
- Loading state con skeleton
- Animaciones con Framer Motion

---

### ProgresoNivel

Barra de progreso del nivel actual con XP restante.

```tsx
import { ProgresoNivel } from '@/components/gamificacion';

<ProgresoNivel recursos={recursos} />;
```

**Props:**

- `recursos: RecursosEstudiante & { racha: RachaEstudiante }` - Datos de recursos

**Features:**

- Barra de progreso animada
- Etiqueta de porcentaje
- XP necesario para siguiente nivel
- Efecto de shimmer animado

---

### RachaWidget

Widget de racha de días consecutivos con animaciones de fuego.

```tsx
import { RachaWidget } from '@/components/gamificacion';

<RachaWidget estudianteId="abc123" />;
```

**Props:**

- `estudianteId: string` - ID del estudiante

**Features:**

- Racha actual, récord y total de días
- Llamas animadas de fondo
- Alerta si la racha está en riesgo (últimas 4 horas)
- Badge de advertencia pulsante
- Loading state

---

### LogroCard

Card individual de logro con modal de detalles.

```tsx
import { LogroCard } from '@/components/gamificacion';

<LogroCard logro={logro} desbloqueado={true} fecha_desbloqueo={new Date()} />;
```

**Props:**

- `logro: Logro` - Datos del logro
- `desbloqueado: boolean` - Si está desbloqueado
- `fecha_desbloqueo?: Date | null` - Fecha de desbloqueo

**Features:**

- Badge de rareza (común, raro, épico, legendario)
- Gradiente según rareza
- Icono animado si está desbloqueado
- Logros secretos ("???")
- Efecto brillante animado
- Click abre modal con detalles completos
- Grayscale si está bloqueado

---

### LogroModal

Modal con detalles completos del logro.

```tsx
import { LogroModal } from '@/components/gamificacion';

<LogroModal
  logro={logro}
  desbloqueado={true}
  fecha_desbloqueo={new Date()}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>;
```

**Props:**

- `logro: Logro` - Datos del logro
- `desbloqueado: boolean` - Si está desbloqueado
- `fecha_desbloqueo?: Date | null` - Fecha de desbloqueo
- `isOpen: boolean` - Estado del modal
- `onClose: () => void` - Callback al cerrar

**Features:**

- Header con gradiente según rareza
- Icono animado (rotación continua)
- Descripción completa
- Recompensas (monedas y XP) con gradientes
- Extras (bonus adicionales)
- Fecha de desbloqueo formateada
- Backdrop con blur
- Animaciones de entrada/salida (scale + fade)

---

### ListaLogros

Grid completo de logros con filtros por categoría.

```tsx
import { ListaLogros } from '@/components/gamificacion';

<ListaLogros estudianteId="abc123" />;
```

**Props:**

- `estudianteId: string` - ID del estudiante

**Features:**

- Filtros por categoría (consistencia, maestría, precisión, etc.)
- Toggle "Solo desbloqueados"
- Card de estadísticas globales con porcentaje
- Barra de progreso animada
- Grid responsivo (1/3/4 columnas)
- Loading state con skeleton
- Contador por categoría
- Layout animado con Framer Motion

---

## 🎨 Estilos

Todos los componentes usan:

- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Gradientes vibrantes** según rareza/tipo
- **Glassmorphism** con `backdrop-blur`
- **Dark mode** compatible
- **Responsive** mobile-first

## 📊 Datos Requeridos

### Tipos TypeScript

```typescript
interface Logro {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  monedas_recompensa: number;
  xp_recompensa: number;
  icono: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  secreto: boolean;
  titulo?: string;
  extras?: string[];
}

interface RecursosEstudiante {
  id: string;
  estudiante_id: string;
  monedas_total: number;
  xp_total: number;
  nivel: number;
  xp_progreso: number;
  xp_necesario: number;
  porcentaje_nivel: number;
}

interface RachaEstudiante {
  id: string;
  estudiante_id: string;
  racha_actual: number;
  racha_maxima: number;
  ultima_actividad: Date | null;
  total_dias_activos: number;
}
```

## 🎮 Hooks Asociados

```typescript
import { useRecursos, useRacha } from '@/hooks/useRecursos';
import { useProgresoLogros } from '@/hooks/useLogros';

// En tu componente
const { data: recursos } = useRecursos(estudianteId);
const { data: racha } = useRacha(estudianteId);
const { data: progreso } = useProgresoLogros(estudianteId);
```

## 🚀 Ejemplo de Uso Completo

```tsx
'use client';

import { RecursosBar, RachaWidget, ListaLogros } from '@/components/gamificacion';

export default function GamificacionPage() {
  const estudianteId = 'abc123'; // Obtener del contexto/auth

  return (
    <div className="space-y-6 p-6">
      {/* Barra de recursos superior */}
      <RecursosBar estudianteId={estudianteId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget de racha */}
        <div className="lg:col-span-1">
          <RachaWidget estudianteId={estudianteId} />
        </div>

        {/* Lista de logros */}
        <div className="lg:col-span-2">
          <ListaLogros estudianteId={estudianteId} />
        </div>
      </div>
    </div>
  );
}
```

## 🎯 Categorías de Logros

- 🔥 **Consistencia** - Rachas y práctica diaria
- 🎓 **Maestría** - Dominio de temas
- 🎯 **Precisión** - Respuestas correctas
- ⚡ **Velocidad** - Tiempo de resolución
- 👥 **Social** - Trabajo en equipo
- 📚 **Asistencia** - Clases completadas
- 🏆 **Desafíos** - Retos semanales
- ⭐ **Especialización** - Áreas específicas
- 📊 **Niveles** - Progreso de nivel
- 🔒 **Secretos** - Logros ocultos

## 🎨 Rareza de Logros

| Rareza     | Color  | Gradiente                       |
| ---------- | ------ | ------------------------------- |
| Común      | Slate  | `from-slate-400 to-slate-600`   |
| Raro       | Blue   | `from-blue-400 to-blue-600`     |
| Épico      | Purple | `from-purple-400 to-purple-600` |
| Legendario | Amber  | `from-amber-400 to-amber-600`   |

## ⚙️ Configuración

Asegúrate de tener instaladas las dependencias:

```json
{
  "framer-motion": "^12.23.24",
  "@tanstack/react-query": "^5.90.5",
  "lucide-react": "^0.545.0"
}
```

Y las utilidades:

```typescript
import {
  formatearNumero,
  getColorRareza,
  getEmojiCategoria,
  estaEnRiesgoRacha,
} from '@/lib/utils/gamificacion.utils';
```

---

**Versión:** 1.0.0
**Última actualización:** 30 de Octubre, 2025
