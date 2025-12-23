# INFORME: Arquitectura de Contenido Educativo - Mateatletas

**Fecha**: 2025-12-23
**Rama**: `refactor-studio`
**Autor**: Claude Code

---

## Resumen Ejecutivo

Este informe documenta exhaustivamente la arquitectura de contenido educativo de Mateatletas, incluyendo:

- **17 bloques interactivos** implementados
- **16 temas visuales** disponibles
- **Studio Editor** funcional con drag & drop
- **Sistema de planificaciones** flexible
- **95 componentes planificados** en roadmap

---

## 1. Sistema de Bloques Interactivos

### 1.1 Ubicación

```
apps/web/src/components/blocks/
├── registry.ts          # Registry maestro
├── types.ts             # Tipos base
├── index.ts             # Exports
└── interactivo/
    ├── types.ts         # 1057 líneas de tipos
    └── *.tsx            # 17 componentes
```

### 1.2 Bloques Implementados (17)

| Bloque              | Categoría   | Icono | Tamaño Default | Uso                                          |
| ------------------- | ----------- | ----- | -------------- | -------------------------------------------- |
| **Quiz**            | EVALUACION  | ❓    | 400×300        | Evaluaciones: múltiple, V/F, respuesta corta |
| **AudioPlayer**     | MULTIMEDIA  | 🔊    | 400×120        | Reproductor con transcripción sincronizada   |
| **BarGraph**        | INTERACTIVO | 📊    | 500×350        | Gráfico de barras interactivo                |
| **DragAndDrop**     | INTERACTIVO | 🎯    | 600×400        | Arrastrar elementos a zonas                  |
| **Hotspot**         | INTERACTIVO | 📍    | 600×450        | Puntos calientes en imágenes                 |
| **ImageGallery**    | MULTIMEDIA  | 🖼️    | 500×400        | Galería con zoom y autoplay                  |
| **MatchingPairs**   | INTERACTIVO | 🔗    | 600×400        | Emparejar elementos                          |
| **NumberInput**     | INTERACTIVO | 🔢    | 300×150        | Entrada numérica validada                    |
| **OrderSequence**   | INTERACTIVO | 📝    | 400×350        | Ordenar secuencia correcta                   |
| **PieChart**        | INTERACTIVO | 🥧    | 400×400        | Gráfico circular                             |
| **ProgressTracker** | EVALUACION  | 📈    | 350×200        | Seguimiento de progreso                      |
| **ScaleBalance**    | SIMULADOR   | ⚖️    | 500×400        | Balanza para equilibrar                      |
| **Slider**          | INTERACTIVO | 🎚️    | 400×100        | Deslizador con tolerancia                    |
| **SortingBins**     | INTERACTIVO | 🗂️    | 600×450        | Clasificar en categorías                     |
| **TextInput**       | INTERACTIVO | ✏️    | 400×150        | Entrada de texto con regex                   |
| **Timeline**        | INTERACTIVO | 📅    | 700×300        | Línea de tiempo ordenable                    |
| **ToggleSwitch**    | INTERACTIVO | 🔘    | 200×80         | Interruptor booleano                         |

### 1.3 Categorías (8)

| Categoría       | Implementados | Planificados |
| --------------- | ------------- | ------------ |
| INTERACTIVO     | 12            | 15           |
| EVALUACION      | 2             | 8            |
| MULTIMEDIA      | 2             | 9            |
| SIMULADOR       | 1             | 25           |
| MOTRICIDAD_FINA | 0             | 10           |
| EDITOR_CODIGO   | 0             | 10           |
| CREATIVO        | 0             | 10           |
| MULTIPLAYER     | 0             | 8            |

### 1.4 Arquitectura de Props

```typescript
// Props base para todos los bloques
interface StudioBlockProps<TConfig> {
  id: string; // UUID único
  config: TConfig; // Configuración específica
  modo: 'preview' | 'estudiante' | 'editor';
  disabled?: boolean;
  onComplete?: (resultado: BloqueResultado) => void;
  onProgress?: (progreso: number) => void;
  onConfigChange?: (nuevoConfig: TConfig) => void;
}

// Resultado al completar
interface BloqueResultado {
  completado: boolean;
  puntuacion: number; // 0-100
  respuesta: unknown;
  tiempoMs: number;
  intentos: number;
}
```

---

## 2. Studio - Editor Visual

### 2.1 Ubicación

```
apps/web/src/studio/
├── stores/
│   └── canvas.store.ts      # Zustand store (289 líneas)
├── types/
│   └── canvas.types.ts      # Tipos del canvas
├── components/
│   ├── StudioEditor.tsx     # Componente principal
│   ├── StudioCanvas.tsx     # Canvas de renderizado
│   ├── CanvasElement.tsx    # Elemento arrastrable
│   ├── Toolbar.tsx          # Barra de herramientas
│   └── panels/
│       ├── ComponentPanel.tsx   # Panel izquierdo
│       └── PropertiesPanel.tsx  # Panel derecho
├── hooks/
│   └── useCanvasKeyboard.ts # Atajos de teclado
└── utils/
    └── snap.utils.ts        # Utilidades de grid
```

### 2.2 Página de Acceso

**URL**: `http://localhost:3000/studio/editor`

### 2.3 Canvas Store (Zustand + Immer)

#### Estado:

```typescript
interface CanvasState {
  elements: CanvasElement[]; // Elementos en el canvas
  selectedId: string | null; // Elemento seleccionado
  zoom: number; // 0.1 - 3.0
  gridSize: number; // Tamaño del grid (px)
  snapToGrid: boolean; // Habilitar snap
  themeId: string; // Tema actual
  history: CanvasElement[][]; // Historial undo/redo
  historyIndex: number;
}
```

#### Acciones Disponibles:

| Acción                            | Descripción                     |
| --------------------------------- | ------------------------------- |
| `addElement(type, position?)`     | Agregar bloque con defaultProps |
| `removeElement(id)`               | Eliminar bloque                 |
| `duplicateElement(id)`            | Duplicar con offset +20px       |
| `selectElement(id)`               | Seleccionar/deseleccionar       |
| `updatePosition(id, {x, y})`      | Mover bloque                    |
| `updateSize(id, {width, height})` | Redimensionar                   |
| `updateProps(id, props)`          | Actualizar propiedades          |
| `bringToFront(id)`                | Subir en z-index                |
| `sendToBack(id)`                  | Bajar en z-index                |
| `undo()`                          | Deshacer                        |
| `redo()`                          | Rehacer                         |
| `setZoom(zoom)`                   | Cambiar zoom                    |
| `toggleSnapToGrid()`              | Toggle snap                     |
| `setTheme(themeId)`               | Cambiar tema                    |
| `exportToJson()`                  | Exportar canvas                 |
| `importFromJson(json)`            | Importar canvas                 |
| `clear()`                         | Limpiar todo                    |

### 2.4 Layout del Editor

```
┌─────────────────────────────────────────────────────────┐
│                      TOOLBAR                            │
│  🎨 Studio | Sin título | ↩️ ↪️ | ➖ 100% ➕ | 🌐 | 💾  │
├─────────────┬───────────────────────────┬───────────────┤
│ COMPONENT   │                           │  PROPERTIES   │
│   PANEL     │       STUDIO CANVAS       │    PANEL      │
│   (280px)   │       (1920×1080)         │   (320px)     │
│             │                           │               │
│ 🔍 Buscar   │   ┌─────────┐             │  Position     │
│             │   │ Element │             │  X: [100]     │
│ ▼ Interac.  │   │  Quiz   │             │  Y: [100]     │
│   ❓ Quiz   │   └─────────┘             │               │
│   🎯 D&D    │                           │  Size         │
│   🔗 Match  │        ┌─────────┐        │  W: [400]     │
│             │        │ Element │        │  H: [300]     │
│ ▼ Evaluac.  │        │ BarGraph│        │               │
│   📊 Quiz   │        └─────────┘        │  [Duplicate]  │
│             │                           │  [Delete]     │
└─────────────┴───────────────────────────┴───────────────┘
```

---

## 3. Design System / Temas

### 3.1 Ubicación

```
apps/web/src/design-system/
├── types.ts                 # 150+ líneas de tipos
├── themes/
│   ├── programming/         # 5 temas
│   │   ├── terminal.ts      # 💻 CRT verde fósforo
│   │   ├── retro.ts         # 🕹️ Retro 80s
│   │   ├── cyber.ts         # 🌐 Cyberpunk
│   │   ├── hacker.ts        # 👨‍💻 Matrix-style
│   │   └── scratch.ts       # 🧩 Scratch blocks
│   ├── math/                # 5 temas
│   │   ├── industrial.ts    # 🏭 Estilo fábrica
│   │   ├── blueprint.ts     # 📐 Planos técnicos
│   │   ├── chalkboard.ts    # 📝 Pizarra
│   │   ├── minimal.ts       # ⚪ Minimalista
│   │   └── bunker.ts        # 🏚️ Bunker retro
│   └── science/             # 6 temas
│       ├── lab.ts           # 🧪 Laboratorio
│       ├── space.ts         # 🚀 Espacio
│       ├── nature.ts        # 🌿 Naturaleza
│       ├── electric.ts      # ⚡ Eléctrico
│       └── robot.ts         # 🤖 Robótico
├── tokens/
│   ├── typography.ts
│   ├── spacing.ts
│   └── animations.ts
└── components/
    ├── layout/              # Card, Container, Divider
    ├── typography/          # HeaderBlock, TextBlock
    ├── form/                # Button, Input
    ├── feedback/            # Badge, Tooltip, PostItNote
    ├── code/                # CodeEditor, TerminalOutput
    ├── interactive/         # QuizBlock, DraggableChip
    ├── progress/            # ProgressBar, XPCounter
    └── mascot/              # MascotBIT, AchievementPopup
```

### 3.2 Estructura de un Tema

```typescript
interface ThemeConfig {
  id: string;
  area: 'programming' | 'math' | 'science';
  name: string;
  emoji: string;
  description: string;

  colors: {
    primary: string;
    primaryGlow: string;
    secondary: string;
    accent: string;
    bgMain: string;
    bgCard: string;
    textMain: string;
    textDim: string;
    textMuted: string;
    codeBg: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    xp: string;
  };

  syntax: {
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    variable: string;
    operator: string;
  };

  effects: {
    scanlines?: boolean;
    glow?: boolean;
    particles?: boolean;
  };

  classes: {
    container: string;
    card: string;
    button: string;
    text: string;
  };
}
```

---

## 4. Sistema de Planificaciones

### 4.1 Ubicación

```
apps/web/src/planificaciones/
├── shared/
│   ├── types/index.ts           # Tipos compartidos
│   ├── PlanificacionWrapper.tsx # Componente envolvente
│   ├── usePlanificacion.ts      # Hook principal
│   └── components/
│       ├── GameScore.tsx
│       ├── AchievementPopup.tsx
│       ├── ActivityTimer.tsx
│       └── ProgressTracker.tsx
├── 2025-11-nivel-1/
├── 2025-11-nivel-2/
├── 2025-11-nivel-3/
├── 2025-11-mes-ciencia-*/
└── ejemplo-minimo.tsx
```

### 4.2 Estructura de Datos

```typescript
interface PlanificacionMetadata {
  id: string;
  codigo: string; // '2025-11-nivel-1'
  titulo: string;
  descripcion: string;
  nivel: number;
  edades: string; // '6-8'
  mes: number;
  anio: number;
  grupos_objetivo: string[];
  tematica_principal: string;
  narrativa: string;
  duracion_semanas: number;
  duracion_minutos_por_sesion: number;
  objetivos_aprendizaje: string[];
  semanas: SemanaMetadata[];
  recursos_necesarios: string[];
}

interface SemanaMetadata {
  numero: number;
  titulo: string;
  objetivo: string;
  duracion_minutos: number;
}

interface PlanificacionState {
  puntos: number;
  nivel_actual: number;
  semana_actual: number;
  actividades_completadas: string[];
  tiempo_total: number;
  ultimo_guardado: Date;
}
```

---

## 5. Visualizaciones y Juegos Educativos

### 5.1 Visualizaciones

```
apps/web/src/components/cursos/visualizaciones/
├── astro/                    # 20+ componentes espaciales
│   ├── FloatingGlass.tsx     # Vidrio flotando en el espacio
│   ├── DiamondPlanet.tsx     # Planeta de diamante
│   ├── SuperEarth.tsx        # Super-Tierras
│   ├── PlanetWASP121b.tsx    # Exoplaneta real
│   ├── JupiterLayers.tsx     # Capas de Júpiter
│   ├── GreatAttractor.tsx    # Gran Atractor
│   ├── MethaneLakes.tsx      # Lagos de metano
│   └── ... (15+ más)
├── fisica/
│   ├── VibratingAtoms.tsx
│   ├── NuclearPasta.tsx
│   └── LHCCollision.tsx
└── quimica/
    └── ... (pendiente)
```

### 5.2 Juegos Educativos

```
apps/web/src/components/cursos/juegos/informatica/
├── BusquedaBinaria/         # Juego de búsqueda binaria
├── CompresorRLE/            # Compresión de imágenes RLE
├── RobotBuscador/           # Robot de búsqueda A*
├── LagPingSimulator/        # Simulador de latencia
├── FiltrosSimulator/        # Procesamiento de imágenes
└── GrafoVisualizer.tsx      # Visualizador de grafos
```

---

## 6. API y Modelos de Datos

### 6.1 Estructura de Cursos

```typescript
// Módulo de un curso
interface Modulo {
  id: string;
  producto_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  duracion_estimada_minutos: number;
  puntos_totales: number;
  publicado: boolean;
  lecciones?: Leccion[];
}

// Lección dentro de un módulo
interface Leccion {
  id: string;
  modulo_id: string;
  titulo: string;
  descripcion?: string;
  tipo_contenido: TipoContenido;
  contenido: Record<string, JsonValue>; // JSON flexible
  orden: number;
  duracion_estimada_minutos: number;
  puntos?: number;
  publicado: boolean;
}

// Tipos de contenido
enum TipoContenido {
  VIDEO = 'VIDEO',
  TEXTO = 'TEXTO',
  QUIZ = 'QUIZ',
  TAREA = 'TAREA',
  SIMULADOR = 'SIMULADOR',
  PROYECTO = 'PROYECTO',
  INTERACTIVO = 'INTERACTIVO',
}
```

### 6.2 Progreso del Estudiante

```typescript
interface ProgresoLeccion {
  id: string;
  estudiante_id: string;
  leccion_id: string;
  progreso_porcentaje: number;
  tiempo_invertido_minutos: number;
  completado: boolean;
  calificacion: number | null;
  intentos: number;
  fecha_completado: string | null;
}

interface ProgresoCurso {
  producto_id: string;
  total_modulos: number;
  total_lecciones: number;
  lecciones_completadas: number;
  porcentaje_completado: number;
  puntos_ganados: number;
  siguiente_leccion: Leccion | null;
}
```

---

## 7. Flujos de Trabajo

### 7.1 Flujo del Docente (Crear Contenido)

```
1. Acceder a /studio/editor
2. Arrastrar bloques desde ComponentPanel
3. Configurar props en PropertiesPanel
4. Previsualizar con diferentes temas
5. Exportar a JSON
6. Guardar en lección/planificación
```

### 7.2 Flujo del Estudiante (Consumir Contenido)

```
1. Acceder a lección/planificación
2. Cargar bloques en modo='estudiante'
3. Interactuar con bloques (responder, arrastrar, etc)
4. onComplete dispara BloqueResultado
5. Guardar progreso en API
6. Mostrar feedback (logros, puntos)
```

### 7.3 Flujo de Renderizado

```
Canvas Store (Zustand)
    ↓
CanvasElement (componentType: 'Quiz')
    ↓
Registry.getBlockDefinition('Quiz')
    ↓
Quiz Component (modo='editor')
    ↓
ThemeConfig aplicado vía clases
    ↓
Renderizado final
```

---

## 8. Roadmap de Componentes

### 8.1 Implementados (17)

- ✅ Quiz, DragAndDrop, MatchingPairs, OrderSequence
- ✅ Slider, ToggleSwitch, NumberInput, TextInput
- ✅ PieChart, BarGraph, Hotspot, Timeline
- ✅ SortingBins, ScaleBalance, ProgressTracker
- ✅ ImageGallery, AudioPlayer

### 8.2 Pendientes (78)

**Motricidad Fina (10):**

- PinchZoom, RotateGesture, TracePath, PressureControl
- SwipeSequence, TapRhythm, LongPress, MultiTouch
- DrawShape, ScratchReveal

**Simuladores (25):**

- Química: ReactionBalancer, MoleculeBuilder, PeriodicExplorer...
- Física: PendulumSim, CircuitBuilder, WaveSimulator...
- Biología: CellDivision, EcosystemSim, DNAReplicator...
- Matemática: FractionVisualizer, GeometryProof, GraphCalculator

**Editores de Código (10):**

- BlockEditor, PythonEditor, LuaEditor, JavaScriptEditor
- HTMLCSSEditor, SQLPlayground, RegexTester, AlgorithmViz
- DataStructureViz, TerminalEmulator

**Creativos (10):**

- PixelArtEditor, VectorDrawing, 3DModeler, StoryCreator
- MindMapEditor, InfoGraphicMaker, ComicCreator...

**Evaluación (8):**

- PracticeMode, ChallengeMode, PeerReview, Portfolio
- Rubric, BadgeDisplay...

**Multiplayer (8):**

- SharedWhiteboard, CollaborativeDoc, TeamChallenge
- DebateArena, PollLive, BrainstormCloud...

---

## 9. Archivos Clave (Referencia Rápida)

### Bloques

- `apps/web/src/components/blocks/registry.ts` - Registry maestro
- `apps/web/src/components/blocks/types.ts` - Tipos base
- `apps/web/src/components/blocks/interactivo/types.ts` - 1057 líneas

### Studio

- `apps/web/src/studio/stores/canvas.store.ts` - Estado global
- `apps/web/src/studio/components/StudioEditor.tsx` - Editor principal
- `apps/web/src/app/studio/editor/page.tsx` - Página Next.js

### Design System

- `apps/web/src/design-system/themes/index.ts` - Exports de temas
- `apps/web/src/design-system/themes/programming/terminal.ts` - Ejemplo tema

### Planificaciones

- `apps/web/src/planificaciones/shared/types/index.ts` - Tipos
- `apps/web/src/planificaciones/shared/usePlanificacion.ts` - Hook

### API

- `apps/web/src/lib/api/cursos.api.ts` - API de cursos
- `apps/api/src/catalogo/productos.service.ts` - Servicio backend

---

## 10. Conclusiones

### Fortalezas

1. **Arquitectura modular**: Bloques independientes y reutilizables
2. **Tipado fuerte**: TypeScript en todo el stack
3. **Editor visual funcional**: Drag & drop, undo/redo, export/import
4. **16 temas visuales**: Adaptables a diferentes áreas
5. **Tests comprehensivos**: 26+ tests unitarios

### Oportunidades de Mejora

1. **Implementar más bloques**: Solo 17 de 95 planificados
2. **Persistencia del Studio**: Guardar/cargar proyectos
3. **Colaboración en tiempo real**: Múltiples docentes
4. **Versionado de contenido**: Control de cambios
5. **Analytics**: Tracking de uso de bloques

### Próximos Pasos Recomendados

1. Completar bloques de Motricidad Fina (críticos para nivel inicial)
2. Implementar persistencia del Studio en backend
3. Agregar modo preview en tiempo real
4. Crear plantillas de lecciones pre-armadas
5. Implementar simuladores de ciencias

---

_Informe generado automáticamente por Claude Code_
