# 📚 Planificaciones Mensuales - Mateatletas

## 🎯 Propósito

Esta carpeta contiene las **aplicaciones React completamente personalizadas** para cada planificación mensual inmersiva.

Cada planificación es una experiencia educativa única con su propia narrativa, juegos, y progresión pedagógica.

---

## 📁 Estructura de Carpetas

Cada planificación sigue esta convención de nomenclatura:

```
{AÑO}-{MES}-nivel-{NIVEL}/
```

Ejemplos:
- `2025-11-nivel-1/` → Noviembre 2025, Nivel 1 (6-7 años)
- `2025-11-nivel-2/` → Noviembre 2025, Nivel 2 (8-9 años)
- `2025-11-nivel-3/` → Noviembre 2025, Nivel 3 (10-12 años)

---

## 🎮 Niveles

### Nivel 1 (6-7 años)
- **Grupos**: B1
- **Enfoque**: Introducción lúdica a conceptos matemáticos básicos
- **Duración por sesión**: 60-75 minutos
- **Carpeta**: `2025-11-nivel-1/`

### Nivel 2 (8-9 años)
- **Grupos**: B2, B3
- **Enfoque**: Consolidación de operaciones y resolución de problemas
- **Duración por sesión**: 75-90 minutos
- **Carpeta**: `2025-11-nivel-2/`

### Nivel 3 (10-12 años)
- **Grupos**: B4, L1, L2
- **Enfoque**: Matemática avanzada y pensamiento crítico
- **Duración por sesión**: 90-120 minutos
- **Carpeta**: `2025-11-nivel-3/`

---

## 🏗️ Estructura de Cada Planificación

Dentro de cada carpeta encontrarás:

```
2025-11-nivel-X/
├── README.md                    # ⚠️ ARMAR AQUÍ TU PLANIFICACIÓN
├── index.tsx                    # Componente principal exportado
├── metadata.json                # Metadatos de la planificación
├── semanas/                     # Actividades semanales
│   ├── semana-1/
│   │   ├── index.tsx
│   │   ├── juegos/             # Juegos personalizados
│   │   └── assets/             # Imágenes, sonidos, etc.
│   ├── semana-2/
│   ├── semana-3/
│   └── semana-4/
├── components/                  # Componentes reutilizables dentro de esta planif
│   └── ...
└── assets/                      # Recursos globales de la planificación
    ├── images/
    ├── sounds/
    └── videos/
```

---

## 🚀 Cómo Crear una Planificación

### 1️⃣ Diseña la Experiencia

En el `README.md` de cada planificación, documentá:
- **Narrativa principal** (tema, misión, personajes)
- **Objetivos pedagógicos** por semana
- **Progresión de dificultad**
- **Roles y dinámicas de juego**
- **Recursos necesarios**

### 2️⃣ Programa la Aplicación React

Construí tu aplicación React personalizada:

```tsx
// 2025-11-nivel-1/index.tsx
'use client';

import { PlanificacionApp } from '@/planificaciones/shared';

export default function PlanificacionNoviembre2025Nivel1() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-1"
      titulo="El Reino de los Números Mágicos"
      descripcion="Una aventura mágica donde los estudiantes descubren..."
    >
      {/* TU APLICACIÓN PERSONALIZADA AQUÍ */}
      <MiJuegoPersonalizado />
      <MiActividadUnica />
      <MiNarrativaInmersiva />
    </PlanificacionApp>
  );
}
```

### 3️⃣ Configura los Metadatos

Editá `metadata.json`:

```json
{
  "id": "2025-11-nivel-1",
  "codigo": "2025-11-nivel-1",
  "titulo": "El Reino de los Números Mágicos",
  "descripcion": "Una aventura mágica...",
  "nivel": 1,
  "mes": 11,
  "anio": 2025,
  "grupos_objetivo": ["B1"],
  "tematica_principal": "Suma y resta con reagrupamiento",
  "duracion_semanas": 4,
  "duracion_minutos_por_sesion": 75,
  "objetivos_aprendizaje": [
    "Dominar suma con reagrupamiento hasta 100",
    "Resolver problemas contextualizados",
    "Desarrollar pensamiento lógico-matemático"
  ]
}
```

---

## 🎨 Componentes Compartidos Disponibles

El sistema provee componentes base que podés usar (o no):

```tsx
import {
  PlanificacionApp,      // Wrapper principal con tracking automático
  ProgressTracker,       // Barra de progreso del estudiante
  GameScore,             // Sistema de puntaje
  WeekNavigation,        // Navegación entre semanas
  StudentProfile,        // Perfil y avatar del estudiante
  ActivityTimer,         // Temporizador de actividad
  AchievementPopup,      // Notificación de logros
} from '@/planificaciones/shared';
```

**Pero podés crear TODO desde cero si querés.** Estos componentes solo facilitan tareas repetitivas.

---

## 🔗 Integración con el Sistema

### Automático:
- ✅ Autenticación de estudiantes
- ✅ Tracking de progreso
- ✅ Guardado automático de estado
- ✅ Puntos de gamificación
- ✅ Visibilidad para docentes

### Manual (vos decidís):
- 🎮 Lógica de juegos
- 🎨 Diseño visual
- 📖 Narrativa
- 🎯 Mecánicas pedagógicas
- 🎵 Sonidos y animaciones

---

## 📊 Dashboard de Docentes

Los docentes podrán:
1. Ver todas las planificaciones disponibles
2. Revisar el contenido completo
3. Asignar a sus grupos
4. Ver progreso en tiempo real de cada estudiante
5. Acceder a sugerencias pedagógicas

---

## 🎯 Vista de Estudiantes

Los estudiantes verán:
1. Planificaciones asignadas por su docente
2. Progreso semanal
3. Actividades desbloqueadas
4. Puntos y logros acumulados

---

## 💡 Tips

1. **Inmersión total**: Creá una narrativa cohesiva que envuelva todas las 4 semanas
2. **Progresión pedagógica**: Cada semana debe construir sobre la anterior
3. **Feedback inmediato**: Los estudiantes deben saber si acertaron o no
4. **Celebración de logros**: Animaciones y sonidos al completar objetivos
5. **Mobile-friendly**: Muchos estudiantes usarán tablets

---

## 🆘 Soporte Técnico

Si necesitás ayuda con:
- Persistencia de estado → Usá `usePlanificacionState()`
- Tracking de progreso → Usá `useProgressTracker()`
- Puntos y gamificación → Usá `useGameScore()`
- Autenticación → Ya está integrado automáticamente

Ver documentación en: `apps/web/src/planificaciones/shared/README.md`

---

## ⚠️ IMPORTANTE

**CADA PLANIFICACIÓN ES ÚNICA**

No estás limitado por templates ni componentes. Podés crear:
- Juegos 2D con canvas
- Animaciones con Three.js
- Drag & drop personalizado
- Cualquier cosa que React permita

La única regla: debe integrarse con el `PlanificacionApp` wrapper para tracking automático.

---

¡A crear experiencias increíbles! 🚀
