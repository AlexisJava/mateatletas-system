# Sistema de Planificaciones Auto-Detectables

## Filosofía: Convention over Configuration

**Principio fundamental:** Una planificación es simplemente un archivo React. El sistema lo detecta automáticamente sin necesidad de configuración manual.

---

## 🎯 Lo que VOS hacés (Developer Workflow)

### 1. Crear una Planificación Simple (4 semanas)

```tsx
// apps/web/src/planificaciones/2025-03-multiplicaciones-b1.tsx

'use client';

import { PlanificacionWrapper } from '@/planificaciones/shared';
import { useState } from 'react';

// ============================================================================
// CONFIGURACIÓN (solo estas 6 líneas)
// ============================================================================
export const PLANIFICACION_CONFIG = {
  codigo: '2025-03-multiplicaciones-b1', // Debe coincidir con el nombre del archivo
  titulo: 'Multiplicaciones - Marzo 2025',
  grupo: 'B1',
  mes: 3,
  anio: 2025,
  semanas: 4,
};

// ============================================================================
// TU PLANIFICACIÓN (libertad total)
// ============================================================================
export default function Multiplicaciones2025Marzo() {
  const [semanaActual, setSemanaActual] = useState(1);

  return (
    <PlanificacionWrapper config={PLANIFICACION_CONFIG}>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          Multiplicaciones - Marzo 2025
        </h1>

        {/* Semana 1 */}
        {semanaActual === 1 && (
          <div>
            <h2>Semana 1: Tablas del 1 al 3</h2>
            {/* Tu contenido aquí */}
          </div>
        )}

        {/* Semana 2 */}
        {semanaActual === 2 && (
          <div>
            <h2>Semana 2: Tablas del 4 al 6</h2>
            {/* Tu contenido aquí */}
          </div>
        )}

        {/* Semanas 3 y 4 */}

        {/* Navegación */}
        <div className="flex gap-4 justify-center mt-8">
          <button onClick={() => setSemanaActual((prev) => Math.max(1, prev - 1))}>
            ← Semana Anterior
          </button>
          <button onClick={() => setSemanaActual((prev) => Math.min(4, prev + 1))}>
            Siguiente Semana →
          </button>
        </div>
      </div>
    </PlanificacionWrapper>
  );
}
```

**Eso es TODO. No metadata.json, no comandos, nada más.**

---

### 2. Crear una Planificación Modular (recomendado)

Para mantener el código organizado, podés dividir en múltiples archivos:

```
apps/web/src/planificaciones/
└── 2025-03-multiplicaciones-b1/
    ├── index.tsx                    ← Archivo principal con PLANIFICACION_CONFIG
    ├── semana-1.tsx                 ← Componente Semana 1
    ├── semana-2.tsx                 ← Componente Semana 2
    ├── semana-3.tsx
    ├── semana-4.tsx
    └── components/
        ├── JuegoTabla.tsx           ← Juegos reutilizables
        └── QuizMultiplicacion.tsx
```

**Archivo principal (`index.tsx`):**

```tsx
'use client';

import { PlanificacionWrapper } from '@/planificaciones/shared';
import { useState } from 'react';
import Semana1 from './semana-1';
import Semana2 from './semana-2';
import Semana3 from './semana-3';
import Semana4 from './semana-4';

// ============================================================================
// CONFIGURACIÓN (mismo formato)
// ============================================================================
export const PLANIFICACION_CONFIG = {
  codigo: '2025-03-multiplicaciones-b1',
  titulo: 'Multiplicaciones - Marzo 2025',
  grupo: 'B1',
  mes: 3,
  anio: 2025,
  semanas: 4,
};

// ============================================================================
// ORQUESTADOR DE SEMANAS
// ============================================================================
export default function Multiplicaciones2025Marzo() {
  const [semanaActual, setSemanaActual] = useState(1);

  // El wrapper maneja automáticamente:
  // - Verificar si el estudiante tiene acceso
  // - Guardar progreso
  // - Tracking de tiempo
  return (
    <PlanificacionWrapper config={PLANIFICACION_CONFIG}>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
        {/* Renderizar semana actual */}
        {semanaActual === 1 && <Semana1 onComplete={() => setSemanaActual(2)} />}
        {semanaActual === 2 && <Semana2 onComplete={() => setSemanaActual(3)} />}
        {semanaActual === 3 && <Semana3 onComplete={() => setSemanaActual(4)} />}
        {semanaActual === 4 && <Semana4 onComplete={() => alert('¡Completaste!')} />}

        {/* Navegación */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={() => setSemanaActual((prev) => Math.max(1, prev - 1))}
            disabled={semanaActual === 1}
            className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl"
          >
            ← Anterior
          </button>
          <span className="px-6 py-3 bg-white/30 backdrop-blur-lg rounded-xl">
            Semana {semanaActual} / 4
          </span>
          <button
            onClick={() => setSemanaActual((prev) => Math.min(4, prev + 1))}
            disabled={semanaActual === 4}
            className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </PlanificacionWrapper>
  );
}
```

**Semana individual (`semana-1.tsx`):**

```tsx
'use client';

import JuegoTabla from './components/JuegoTabla';
import QuizMultiplicacion from './components/QuizMultiplicacion';

export default function Semana1({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="p-8">
      <h2 className="text-4xl font-bold text-white mb-6">Semana 1: Tablas del 1 al 3</h2>

      {/* Día 1: Clase Online */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          📅 Día 1: Introducción (Clase Online)
        </h3>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <p className="text-white mb-4">Clase sincrónica: Lunes 18:00 - 19:30</p>
          <a
            href="https://meet.google.com/abc-defg-hij"
            target="_blank"
            className="px-6 py-3 bg-green-500 text-white rounded-xl inline-block"
          >
            🎥 Unirse a Google Meet
          </a>
        </div>
      </section>

      {/* Día 2: Juego Tabla del 1 */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">🎮 Día 2: Juego - Tabla del 1</h3>
        <JuegoTabla tabla={1} />
      </section>

      {/* Día 3: Juego Tabla del 2 */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">🎮 Día 3: Juego - Tabla del 2</h3>
        <JuegoTabla tabla={2} />
      </section>

      {/* Día 4: Juego Tabla del 3 */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">🎮 Día 4: Juego - Tabla del 3</h3>
        <JuegoTabla tabla={3} />
      </section>

      {/* Día 5: Quiz Semanal */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">📝 Día 5: Quiz Semanal</h3>
        <QuizMultiplicacion tablas={[1, 2, 3]} onComplete={onComplete} />
      </section>
    </div>
  );
}
```

---

### 3. Crear un Curso Largo (8-12 semanas)

```tsx
// apps/web/src/planificaciones/astro-exploradores.tsx

export const PLANIFICACION_CONFIG = {
  codigo: 'astro-exploradores',
  titulo: 'AstroExploradores - Viaje por el Cosmos',
  grupo: 'B1',
  anio: 2025,
  semanas: 8, // Curso de 8 semanas
  mes: null, // No tiene mes específico (curso anual)
};

export default function AstroExploradores() {
  // Tu contenido de 8 semanas aquí
  return <div>{/* ... */}</div>;
}
```

---

## 🤖 Lo que el SISTEMA hace automáticamente

### Durante el Build (npm run build)

1. **Escanea** `/apps/web/src/planificaciones/**/*.tsx`
2. **Lee** todos los archivos que exportan `PLANIFICACION_CONFIG`
3. **Registra** en la base de datos:
   - Código
   - Título
   - Grupo
   - Mes/Año
   - Total de semanas
   - Path del archivo

**Estado inicial:** `DETECTADA`

### El build genera esto en la BD:

```sql
INSERT INTO planificaciones_simples (
  codigo,
  titulo,
  grupo_codigo,
  mes,
  anio,
  semanas_total,
  archivo_path,
  estado
) VALUES (
  '2025-03-multiplicaciones-b1',
  'Multiplicaciones - Marzo 2025',
  'B1',
  3,
  2025,
  4,
  'planificaciones/2025-03-multiplicaciones-b1',
  'DETECTADA'
);
```

**NO necesitás correr ningún comando. El build de Next.js lo hace automáticamente.**

---

## 👨‍💼 Panel Admin

### Vista de Planificaciones

```
┌─────────────────────────────────────────────────────────┐
│ 📚 PLANIFICACIONES DEL SISTEMA                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✅ Multiplicaciones - Marzo 2025 (B1)                   │
│    Estado: DETECTADA                                    │
│    Archivo: 2025-03-multiplicaciones-b1.tsx            │
│    [👤 Asignar a Docente]                               │
│                                                         │
│ ✅ AstroExploradores (B1)                               │
│    Estado: ASIGNADA (María González)                    │
│    Archivo: astro-exploradores.tsx                     │
│    [👁️ Ver Asignaciones]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Asignar a Docente

Click en "👤 Asignar a Docente":

```
┌─────────────────────────────────────────────────────────┐
│ Asignar: Multiplicaciones - Marzo 2025                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Docente:                                                │
│ [▼] María González                                      │
│                                                         │
│ Grupo/Comisión:                                         │
│ [▼] B1 - Lunes 19:30 (15 estudiantes)                  │
│                                                         │
│         [Cancelar]  [✅ Asignar]                        │
└─────────────────────────────────────────────────────────┘
```

**Eso es TODO lo que hace el admin.**

---

## 👩‍🏫 Panel Docente

### Vista de Planificaciones Asignadas

```
┌─────────────────────────────────────────────────────────┐
│ 📚 MIS PLANIFICACIONES                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📐 Multiplicaciones - Marzo 2025                        │
│    Grupo: B1 - Lunes 19:30                             │
│                                                         │
│    ┌─────────────────────────────────────────────┐    │
│    │ Semana 1: Tablas 1-3                        │    │
│    │ Estado: ⚪ INACTIVA                          │    │
│    │ [▶️ Activar] [📅 Programar para 01/03]     │    │
│    └─────────────────────────────────────────────┘    │
│                                                         │
│    ┌─────────────────────────────────────────────┐    │
│    │ Semana 2: Tablas 4-6                        │    │
│    │ Estado: ⚪ INACTIVA                          │    │
│    │ [📅 Programar]                              │    │
│    └─────────────────────────────────────────────┘    │
│                                                         │
│    ┌─────────────────────────────────────────────┐    │
│    │ Semana 3: Tablas 7-9                        │    │
│    │ Estado: ⚪ INACTIVA                          │    │
│    └─────────────────────────────────────────────┘    │
│                                                         │
│    ┌─────────────────────────────────────────────┐    │
│    │ Semana 4: Repaso General                    │    │
│    │ Estado: ⚪ INACTIVA                          │    │
│    └─────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Activar Semana

Click en "▶️ Activar":

```
┌─────────────────────────────────────────────────────────┐
│ ¿Activar Semana 1 ahora?                                │
├─────────────────────────────────────────────────────────┤
│ Los 15 estudiantes del grupo B1 - Lunes 19:30          │
│ podrán acceder inmediatamente a esta semana.            │
│                                                         │
│         [Cancelar]  [✅ Sí, Activar]                   │
└─────────────────────────────────────────────────────────┘
```

Después de activar:

```
│    ┌─────────────────────────────────────────────┐    │
│    │ Semana 1: Tablas 1-3                        │    │
│    │ Estado: 🟢 ACTIVA (desde 25/10/2025)        │    │
│    │ Progreso: 8/15 estudiantes iniciaron        │    │
│    │ [📊 Ver Detalles] [⏸️ Pausar]              │    │
│    └─────────────────────────────────────────────┘    │
```

---

## 🎮 Dashboard Estudiante

```
┌─────────────────────────────────────────────────────────┐
│ 🎮 MIS ACTIVIDADES                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📐 Multiplicaciones - Marzo 2025                        │
│                                                         │
│    ┌───────────────────────────────────────────────┐   │
│    │ Semana 1: Tablas 1-3                          │   │
│    │ Estado: Disponible ✅                         │   │
│    │                                               │   │
│    │ [▶️ EMPEZAR] ← Botón grande                   │   │
│    └───────────────────────────────────────────────┘   │
│                                                         │
│    ┌───────────────────────────────────────────────┐   │
│    │ Semana 2: Tablas 4-6                          │   │
│    │ 🔒 Disponible desde 08/03/2025                │   │
│    └───────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Click en "▶️ EMPEZAR":

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [Tu planificación React aquí]              │
│                                                         │
│  Se renderiza el componente completo con toda tu lógica │
│  El PlanificacionWrapper maneja automáticamente:        │
│  - Guardar progreso cada 30 segundos                    │
│  - Registrar tiempo de juego                            │
│  - Persistir estado del juego                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 API del PlanificacionWrapper

Tu componente React recibe automáticamente estos hooks:

```tsx
import { usePlanificacionProgress } from '@/planificaciones/shared';

export default function MiPlanificacion() {
  const {
    // Estado
    progreso, // { semana_actual, tiempo_total_minutos, puntos_totales }

    // Acciones
    guardarEstado, // (estado: any) => Promise<void>
    avanzarSemana, // () => Promise<void>
    completarSemana, // (puntos: number) => Promise<void>

    // Info
    semanaActual, // 1-4
    semanasActivas, // [1, 2] (qué semanas activó la docente)
    puedeAcceder, // (semana: number) => boolean
  } = usePlanificacionProgress();

  return (
    <div>
      {/* Tu contenido */}

      <button onClick={() => guardarEstado({ nivel: 3, vidas: 2 })}>Guardar Progreso</button>

      <button onClick={() => completarSemana(100)}>Completar Semana (100 puntos)</button>
    </div>
  );
}
```

---

## 📊 Base de Datos

### Tablas Principales

**`planificaciones_simples`**

- `codigo` (único)
- `titulo`
- `grupo_codigo`
- `mes`, `anio`
- `semanas_total`
- `archivo_path`
- `estado` (DETECTADA | ASIGNADA | ARCHIVADA)

**`asignaciones_planificacion`**

- `planificacion_id`
- `docente_id`
- `clase_grupo_id`
- `activa`

**`semanas_activas`**

- `asignacion_id`
- `numero_semana` (1-12)
- `activa` (true/false)
- `fecha_activacion`

**`progreso_estudiante_planificacion`**

- `estudiante_id`
- `planificacion_id`
- `semana_actual`
- `estado_guardado` (JSON flexible)
- `tiempo_total_minutos`
- `puntos_totales`

---

## 🚀 Deployment

### Producción

```bash
# 1. Commit tu planificación
git add apps/web/src/planificaciones/2025-03-multiplicaciones-b1.tsx
git commit -m "feat: Planificación Multiplicaciones Marzo 2025"
git push

# 2. El CI/CD hace el build
npm run build  # ← Detecta y registra automáticamente

# 3. Deploy
# Las planificaciones están disponibles inmediatamente
```

### Desarrollo

```bash
# Modo desarrollo
npm run dev

# Tu planificación está disponible en:
# http://localhost:3000/planificaciones/2025-03-multiplicaciones-b1
```

---

## ✅ Checklist: Crear una Planificación

- [ ] Crear archivo `.tsx` en `/planificaciones/`
- [ ] Exportar `PLANIFICACION_CONFIG` con 6 campos
- [ ] Programar tu contenido React (libertad total)
- [ ] Usar `PlanificacionWrapper` para envolver
- [ ] Commit y push
- [ ] El sistema lo detecta automáticamente
- [ ] Admin asigna a docente
- [ ] Docente activa semanas
- [ ] Estudiantes acceden

**NO necesitás:**

- ❌ Llenar JSONs de metadata
- ❌ Correr comandos manualmente
- ❌ Registrar en base de datos
- ❌ Crear rutas en Next.js
- ❌ Configurar nada

---

## 🎯 Resumen Visual

```
VOS PROGRAMÁS:
┌─────────────────────────────────┐
│ 2025-03-multiplicaciones-b1.tsx │
│                                 │
│ export const PLANIFICACION_     │
│   CONFIG = { ... }              │
│                                 │
│ export default function() {    │
│   return <div>...</div>         │
│ }                               │
└─────────────────────────────────┘
                ↓
         npm run build
                ↓
┌─────────────────────────────────┐
│ BASE DE DATOS                   │
│ ✅ Auto-registrada              │
│ Estado: DETECTADA               │
└─────────────────────────────────┘
                ↓
         Admin asigna
                ↓
┌─────────────────────────────────┐
│ DOCENTE CONTROLA                │
│ Activa semanas 1, 2, 3, 4       │
└─────────────────────────────────┘
                ↓
         Estudiantes acceden
                ↓
┌─────────────────────────────────┐
│ TU APP REACT SE EJECUTA         │
│ Tracking automático             │
└─────────────────────────────────┘
```

---

## 📝 Ejemplo Completo Mínimo

```tsx
// apps/web/src/planificaciones/ejemplo-minimo.tsx

'use client';

import { PlanificacionWrapper } from '@/planificaciones/shared';

export const PLANIFICACION_CONFIG = {
  codigo: 'ejemplo-minimo',
  titulo: 'Ejemplo Mínimo',
  grupo: 'B1',
  mes: 3,
  anio: 2025,
  semanas: 2,
};

export default function EjemploMinimo() {
  return (
    <PlanificacionWrapper config={PLANIFICACION_CONFIG}>
      <div className="min-h-screen bg-blue-500 p-8">
        <h1 className="text-white text-4xl">¡Hola Mundo!</h1>
        <p className="text-white">Esto es una planificación.</p>
      </div>
    </PlanificacionWrapper>
  );
}
```

**Eso es TODO. 15 líneas de código.**

---

## 🔥 Ventajas del Sistema

1. **Zero Config:** No configuración externa
2. **Type-Safe:** TypeScript valida todo
3. **Auto-Detect:** Build automático
4. **Modular:** Divide en archivos como quieras
5. **Flexible:** JSON para guardar cualquier estado
6. **Simple Admin:** Solo asignar, nada más
7. **Control Docente:** Activa/desactiva semanas fácilmente
8. **Tracking Automático:** Sin código extra

---

## 🆘 Troubleshooting

**"Mi planificación no aparece en el admin"**

- ¿Exportaste `PLANIFICACION_CONFIG`?
- ¿El `codigo` es único?
- ¿Corriste `npm run build`?

**"El estudiante no puede acceder"**

- ¿La docente activó la semana?
- ¿El estudiante pertenece al grupo correcto?

**"El progreso no se guarda"**

- ¿Usaste `PlanificacionWrapper`?
- ¿Llamaste a `guardarEstado()`?

---

**Documentación actualizada:** 25/10/2025
**Versión:** 1.0.0 MVP
