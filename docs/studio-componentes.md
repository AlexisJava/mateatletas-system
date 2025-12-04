# Catálogo de Componentes del Studio

> Documentación actualizada de todos los componentes del Studio de Mateatletas.
> **Total: 95 componentes** | **Implementados con Preview: 42** | **Pendientes: 53**

---

## Resumen por Categoría

| Categoría            | Total | Implementados | Pendientes |
| -------------------- | ----- | ------------- | ---------- |
| Interactivos Básicos | 15    | 15            | 0          |
| Motricidad Fina      | 10    | 2             | 8          |
| Simuladores          | 25    | 1             | 24         |
| Editores de Código   | 10    | 10            | 0          |
| Creativos            | 10    | 0             | 10         |
| Multimedia           | 9     | 6             | 3          |
| Evaluación           | 8     | 8             | 0          |
| Multiplayer          | 8     | 0             | 8          |

---

## 1. Interactivos Básicos (15 componentes)

Los componentes fundamentales presentes en casi todas las actividades.

| Componente         | Tipo             | Icono | Estado          |
| ------------------ | ---------------- | ----- | --------------- |
| Arrastrar y Soltar | `DragAndDrop`    | 🎯    | ✅ Implementado |
| Emparejar          | `MatchingPairs`  | 🔗    | ✅ Implementado |
| Ordenar Secuencia  | `OrderSequence`  | 📋    | ✅ Implementado |
| Opción Múltiple    | `MultipleChoice` | 🔘    | ✅ Implementado |
| Completar Espacios | `FillBlanks`     | 📝    | ✅ Implementado |
| Slider             | `Slider`         | 🎚️    | ✅ Implementado |
| Interruptor        | `ToggleSwitch`   | 🔛    | ✅ Implementado |
| Input Numérico     | `NumberInput`    | 🔢    | ✅ Implementado |
| Campo de Texto     | `TextInput`      | ✏️    | ✅ Implementado |
| Hotspot            | `Hotspot`        | 📍    | ✅ Implementado |
| Línea de Tiempo    | `Timeline`       | 📅    | ✅ Implementado |
| Clasificar         | `SortingBins`    | 🗂️    | ✅ Implementado |
| Balanza            | `ScaleBalance`   | ⚖️    | ✅ Implementado |
| Gráfico Circular   | `PieChart`       | 🥧    | ✅ Implementado |
| Gráfico de Barras  | `BarGraph`       | 📊    | ✅ Implementado |

---

## 2. Motricidad Fina (10 componentes)

Componentes únicos de Mateatletas para enseñar habilidades físicas mediante gestos táctiles.

| Componente          | Tipo              | Icono | Estado          |
| ------------------- | ----------------- | ----- | --------------- |
| Pellizcar para Zoom | `PinchZoom`       | 🔍    | ⏳ Pendiente    |
| Rotar con Gestos    | `RotateGesture`   | 🔄    | ⏳ Pendiente    |
| Trazar Camino       | `TracePath`       | ✍️    | ✅ Implementado |
| Control de Presión  | `PressureControl` | 💧    | ⏳ Pendiente    |
| Secuencia de Swipes | `SwipeSequence`   | 👆    | ⏳ Pendiente    |
| Ritmo de Taps       | `TapRhythm`       | 🥁    | ⏳ Pendiente    |
| Presión Sostenida   | `LongPress`       | ⏱️    | ⏳ Pendiente    |
| Multi-Touch         | `MultiTouch`      | 🖐️    | ⏳ Pendiente    |
| Dibujar Forma       | `DrawShape`       | 🖌️    | ✅ Implementado |
| Raspar para Revelar | `ScratchReveal`   | 🪙    | ⏳ Pendiente    |

---

## 3. Simuladores Científicos (25 componentes)

El corazón de la diferenciación de Mateatletas. Simuladores nivel Universe Sandbox.

### 3.1 Química (8 simuladores)

| Componente                    | Tipo                | Icono | Estado       |
| ----------------------------- | ------------------- | ----- | ------------ |
| Constructor de Moléculas 3D   | `MoleculeBuilder3D` | 🧬    | ⏳ Pendiente |
| Cámara de Reacción            | `ReactionChamber`   | ⚗️    | ⏳ Pendiente |
| Simulador de pH               | `pHSimulator`       | 🧪    | ⏳ Pendiente |
| Orbitales Electrónicos        | `ElectronOrbitals`  | ⚛️    | ⏳ Pendiente |
| Explorador de Tabla Periódica | `PeriodicExplorer`  | 📊    | ⏳ Pendiente |
| Simulador Estados de Materia  | `StateMatterSim`    | 🌡️    | ⏳ Pendiente |
| Celda Electroquímica          | `ElectrochemCell`   | 🔋    | ⏳ Pendiente |
| Simulador Leyes de Gases      | `GasLawsSim`        | 💨    | ⏳ Pendiente |

### 3.2 Física (9 simuladores)

| Componente                 | Tipo                | Icono | Estado       |
| -------------------------- | ------------------- | ----- | ------------ |
| Sandbox de Gravedad        | `GravitySandbox`    | 🌍    | ⏳ Pendiente |
| Simulador de Ondas         | `WaveSimulator`     | 🌊    | ⏳ Pendiente |
| Constructor de Circuitos   | `CircuitBuilder`    | 🔌    | ⏳ Pendiente |
| Movimiento de Proyectil    | `ProjectileMotion`  | 🎯    | ⏳ Pendiente |
| Laboratorio de Péndulo     | `PendulumLab`       | 🕰️    | ⏳ Pendiente |
| Mesa de Óptica             | `OpticsTable`       | 🔭    | ⏳ Pendiente |
| Simulador de Termodinámica | `ThermodynamicsSim` | 🔥    | ⏳ Pendiente |
| Simulador de Fluidos       | `FluidSimulator`    | 💧    | ⏳ Pendiente |
| Laboratorio de Magnetismo  | `MagnetismLab`      | 🧲    | ⏳ Pendiente |

### 3.3 Biología (5 simuladores)

| Componente              | Tipo           | Icono | Estado       |
| ----------------------- | -------------- | ----- | ------------ |
| Explorador Celular      | `CellExplorer` | 🔬    | ⏳ Pendiente |
| Laboratorio de Genética | `GeneticsLab`  | 🧬    | ⏳ Pendiente |
| Simulador de Ecosistema | `EcosystemSim` | 🌲    | ⏳ Pendiente |
| Sistemas del Cuerpo     | `BodySystems`  | ❤️    | ⏳ Pendiente |
| Simulador de Evolución  | `EvolutionSim` | 🦎    | ⏳ Pendiente |

### 3.4 Matemáticas (3 simuladores)

| Componente                 | Tipo              | Icono | Estado          |
| -------------------------- | ----------------- | ----- | --------------- |
| Graficador de Funciones    | `FunctionGrapher` | 📈    | ✅ Implementado |
| Canvas de Geometría        | `GeometryCanvas`  | 📐    | ⏳ Pendiente    |
| Laboratorio de Estadística | `StatisticsLab`   | 🎲    | ⏳ Pendiente    |

---

## 4. Editores de Código (10 componentes)

Para el mundo de Programación. Cada uno adaptado por Casa.

| Componente                  | Tipo                   | Icono | Estado          |
| --------------------------- | ---------------------- | ----- | --------------- |
| Editor de Bloques           | `BlockEditor`          | 🧩    | ⏳ Pendiente    |
| Editor de Código            | `CodeEditor`           | 📝    | ✅ Implementado |
| Playground de Código        | `CodePlayground`       | 🎮    | ✅ Implementado |
| Comparador de Código        | `CodeComparison`       | ⚖️    | ✅ Implementado |
| Resaltado de Sintaxis       | `SyntaxHighlight`      | 🎨    | ✅ Implementado |
| Playground SQL              | `SQLPlayground`        | 🗄️    | ✅ Implementado |
| Probador de Regex           | `RegexTester`          | 🔎    | ✅ Implementado |
| Visualizador de Algoritmos  | `AlgorithmViz`         | 🔄    | ✅ Implementado |
| Visualizador de Estructuras | `DataStructureViz`     | 🌳    | ✅ Implementado |
| Emulador de Terminal        | `TerminalEmulator`     | 💻    | ✅ Implementado |
| Playground Lua              | `LuaPlayground`        | 🌙    | ✅ Implementado |
| Playground JavaScript       | `JavaScriptPlayground` | ⚡    | ✅ Implementado |

> **Nota:** LuaPlayground y JavaScriptPlayground son extensiones especializadas del CodePlayground.

---

## 5. Creativos (10 componentes)

Expresión creativa con propósito educativo.

| Componente                    | Tipo                  | Icono | Estado       |
| ----------------------------- | --------------------- | ----- | ------------ |
| Editor Pixel Art              | `PixelArtEditor`      | 🎨    | ⏳ Pendiente |
| Dibujo Vectorial              | `VectorDrawing`       | ✏️    | ⏳ Pendiente |
| Modelador 3D                  | `3DModeler`           | 🧊    | ⏳ Pendiente |
| Creador de Historias          | `StoryCreator`        | 📖    | ⏳ Pendiente |
| Constructor de Presentaciones | `PresentationBuilder` | 📊    | ⏳ Pendiente |
| Editor de Mapas Mentales      | `MindMapEditor`       | 🧠    | ⏳ Pendiente |
| Creador de Infografías        | `InfoGraphicMaker`    | 📋    | ⏳ Pendiente |
| Creador de Cómics             | `ComicCreator`        | 💬    | ⏳ Pendiente |
| Grabador de Podcast           | `PodcastRecorder`     | 🎙️    | ⏳ Pendiente |
| Anotador de Video             | `VideoAnnotator`      | 🎬    | ⏳ Pendiente |

---

## 6. Multimedia (9 componentes)

Contenido pasivo pero enriquecido + componentes de presentación.

| Componente                | Tipo                      | Icono | Estado          |
| ------------------------- | ------------------------- | ----- | --------------- |
| Reproductor de Video      | `VideoPlayer`             | ▶️    | ✅ Implementado |
| Reproductor de Audio      | `AudioPlayer`             | 🎵    | ✅ Implementado |
| Galería de Imágenes       | `ImageGallery`            | 🖼️    | ✅ Implementado |
| Visor de Documentos       | `DocumentViewer`          | 📄    | ✅ Implementado |
| Visor de Modelos 3D       | `3DModelViewer`           | 🧊    | ⏳ Pendiente    |
| Presentación Interactiva  | `InteractivePresentation` | 📽️    | ⏳ Pendiente    |
| Narración con Seguimiento | `NarrationWithTracking`   | 🗣️    | ⏳ Pendiente    |
| Animación por Pasos       | `StepAnimation`           | 🎞️    | ✅ Implementado |
| Checkpoint                | `Checkpoint`              | 🏁    | ✅ Implementado |

---

## 7. Evaluación (8 componentes)

Para assessment formativo y sumativo.

| Componente             | Tipo              | Icono | Estado          |
| ---------------------- | ----------------- | ----- | --------------- |
| Quiz                   | `Quiz`            | 📝    | ✅ Implementado |
| Modo Práctica          | `PracticeMode`    | 🎯    | ✅ Implementado |
| Modo Desafío           | `ChallengeMode`   | ⏱️    | ✅ Implementado |
| Revisión de Pares      | `PeerReview`      | 👥    | ⏳ Pendiente    |
| Portafolio             | `Portfolio`       | 📁    | ✅ Implementado |
| Rúbrica                | `Rubric`          | 📋    | ✅ Implementado |
| Rastreador de Progreso | `ProgressTracker` | 📊    | ✅ Implementado |
| Mostrar Insignias      | `BadgeDisplay`    | 🏅    | ✅ Implementado |

---

## 8. Multiplayer / Colaborativo (8 componentes)

Interacción en tiempo real entre estudiantes.

| Componente             | Tipo               | Icono | Estado       |
| ---------------------- | ------------------ | ----- | ------------ |
| Pizarra Compartida     | `SharedWhiteboard` | 📋    | ⏳ Pendiente |
| Documento Colaborativo | `CollaborativeDoc` | 📝    | ⏳ Pendiente |
| Desafío por Equipos    | `TeamChallenge`    | 🏆    | ⏳ Pendiente |
| Arena de Debate        | `DebateArena`      | 🎤    | ⏳ Pendiente |
| Encuesta en Vivo       | `PollLive`         | 📊    | ⏳ Pendiente |
| Nube de Ideas          | `BrainstormCloud`  | 💭    | ⏳ Pendiente |
| Tutoría entre Pares    | `PeerTutoring`     | 🤝    | ⏳ Pendiente |
| Proyecto Grupal        | `GroupProject`     | 👥    | ⏳ Pendiente |

---

## Componentes con Preview Interactivo Registrado

Los siguientes 42 componentes tienen preview completo en la Biblioteca del Studio:

```
1.  MultipleChoice       22. StepAnimation
2.  FillBlanks           23. TracePath
3.  VideoPlayer          24. DrawShape
4.  DragAndDrop          25. FunctionGrapher
5.  MatchingPairs        26. CodeEditor
6.  OrderSequence        27. CodePlayground
7.  Slider               28. CodeComparison
8.  ToggleSwitch         29. SyntaxHighlight
9.  NumberInput          30. SQLPlayground
10. TextInput            31. RegexTester
11. Hotspot              32. AlgorithmViz
12. Timeline             33. DataStructureViz
13. SortingBins          34. TerminalEmulator
14. ScaleBalance         35. PracticeMode
15. PieChart             36. ChallengeMode
16. BarGraph             37. Portfolio
17. AudioPlayer          38. LuaPlayground
18. ImageGallery         39. JavaScriptPlayground
19. Quiz                 40. Checkpoint
20. ProgressTracker      41. BadgeDisplay
21. DocumentViewer       42. Rubric
```

---

## Arquitectura de Componentes

### Estructura de archivos

```
apps/web/src/components/studio/biblioteca/preview/
├── preview-registry.ts          # Registry central de previews
├── register-previews.ts         # Auto-registro de componentes
├── types.ts                     # Tipos compartidos
└── previews/                    # Componentes de preview
    ├── MultipleChoicePreview.tsx
    ├── FillBlanksPreview.tsx
    ├── VideoPlayerPreview.tsx
    ├── ...
    ├── LuaPlaygroundPreview.tsx
    └── JavaScriptPlaygroundPreview.tsx
```

### Interfaz de Preview

Cada preview implementa la interfaz `PreviewDefinition`:

```typescript
interface PreviewDefinition {
  component: React.ComponentType<PreviewComponentProps>;
  exampleData: Record<string, unknown>;
  propsDocumentation: PropDocumentation[];
}

interface PreviewComponentProps {
  exampleData: Record<string, unknown>;
  interactive: boolean;
}

interface PropDocumentation {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}
```

### Registro de componentes

Para agregar un nuevo preview:

1. Crear archivo en `previews/NuevoComponentePreview.tsx`
2. Exportar `PreviewDefinition`
3. Importar y registrar en `register-previews.ts`:

```typescript
import { NuevoComponentePreview } from './previews/NuevoComponentePreview';
registerPreview('NuevoComponente', NuevoComponentePreview);
```

---

## Próximos pasos recomendados

### Alta prioridad

1. **BlockEditor** - Programación visual tipo Scratch para principiantes
2. **CircuitBuilder** - Simulador de circuitos muy solicitado
3. **MoleculeBuilder3D** - Diferenciador clave para química

### Media prioridad

4. **PinchZoom / RotateGesture** - Mejorar experiencia táctil
5. **3DModelViewer** - Visualización de modelos científicos
6. **SharedWhiteboard** - Colaboración en tiempo real

### Baja prioridad (dependen de infraestructura multiplayer)

7. Componentes de la categoría Multiplayer
8. PeerReview
9. Componentes creativos avanzados

---

_Última actualización: Diciembre 2024_
