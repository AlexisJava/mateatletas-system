# Auditoría Completa: Mateatletas Studio

**Fecha:** 2025-12-05
**Objetivo:** Análisis exhaustivo antes de refactorización/reconstrucción

---

## RESUMEN EJECUTIVO

| Métrica                       | Valor                                                           |
| ----------------------------- | --------------------------------------------------------------- |
| **Componentes en catálogo**   | 95                                                              |
| **Componentes implementados** | 42                                                              |
| **Componentes pendientes**    | 53                                                              |
| **Archivos backend Studio**   | ~40                                                             |
| **Archivos frontend Studio**  | ~120                                                            |
| **Tests existentes**          | ~25 spec files                                                  |
| **Modelos Prisma Studio**     | 4 (CursoStudio, SemanaStudio, RecursoStudio, BadgeCustomStudio) |

---

## PARTE 1: AUDITORÍA DEL BACKEND

### 1.1 Estructura de Directorios

```
apps/api/src/studio/
├── catalogo/
│   ├── catalogo.controller.ts
│   ├── catalogo.module.ts
│   ├── catalogo.service.ts
│   ├── catalogo.service.spec.ts
│   └── dto/
│       └── toggle-componente.dto.ts
├── controllers/
│   ├── cursos.controller.ts
│   ├── semanas.controller.ts
│   ├── recursos.controller.ts
│   └── index.ts
├── dto/
│   ├── crear-curso.dto.ts
│   ├── actualizar-curso.dto.ts
│   ├── guardar-semana.dto.ts
│   ├── subir-recurso.dto.ts
│   └── index.ts
├── editor/
│   ├── editor.controller.ts
│   ├── editor.module.ts
│   ├── editor.service.ts
│   ├── dto/
│   │   ├── bloque.dto.ts
│   │   ├── guardar-semana.dto.ts
│   │   └── respuesta-editor.dto.ts
│   └── __tests__/
│       └── editor.service.spec.ts
├── services/
│   ├── cursos/
│   │   ├── crear-curso.service.ts
│   │   ├── obtener-curso.service.ts
│   │   ├── listar-cursos.service.ts
│   │   ├── actualizar-curso.service.ts
│   │   ├── eliminar-curso.service.ts
│   │   └── __tests__/ (5 spec files)
│   ├── recursos/
│   │   ├── subir-recurso.service.ts
│   │   ├── eliminar-recurso.service.ts
│   │   └── __tests__/ (2 spec files)
│   └── semanas/
│       ├── obtener-semana.service.ts
│       ├── guardar-semana.service.ts
│       ├── validar-semana.service.ts
│       └── __tests__/ (3 spec files)
├── interfaces/
│   └── studio.types.ts
└── studio.module.ts
```

### 1.2 Endpoints (17 total)

#### Cursos Controller (`studio/cursos`)

| Método | Ruta            | Descripción                                             |
| ------ | --------------- | ------------------------------------------------------- |
| POST   | `/`             | Crear curso desde wizard                                |
| GET    | `/`             | Listar cursos (filtros: estado, categoria, mundo, casa) |
| GET    | `/estadisticas` | Conteo por estado                                       |
| GET    | `/:id`          | Obtener curso completo                                  |
| PATCH  | `/:id`          | Actualizar curso                                        |
| DELETE | `/:id`          | Eliminar (solo DRAFT)                                   |

#### Semanas Controller (`studio/cursos/:cursoId/semanas`)

| Método | Ruta               | Descripción              |
| ------ | ------------------ | ------------------------ |
| GET    | `/`                | Listar semanas del curso |
| GET    | `/:numero`         | Obtener semana (1-12)    |
| PUT    | `/:numero`         | Guardar contenido        |
| POST   | `/:numero/validar` | Validar sin guardar      |

#### Recursos Controller (`studio/recursos`)

| Método | Ruta      | Descripción              |
| ------ | --------- | ------------------------ |
| POST   | `/upload` | Subir recurso multimedia |
| GET    | `/:id`    | Obtener recurso          |
| DELETE | `/:id`    | Eliminar recurso         |

#### Editor Controller (`studio/editor`)

| Método | Ruta                                  | Descripción            |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/cursos/:cursoId/semanas/:semanaNum` | Cargar para edición    |
| PUT    | `/cursos/:cursoId/semanas/:semanaNum` | Guardar con validación |
| POST   | `/validar`                            | Validar sin persistir  |

#### Catálogo Controller (`studio/catalogo`)

| Método | Ruta            | Descripción            |
| ------ | --------------- | ---------------------- |
| GET    | `/`             | Listar todos           |
| GET    | `/habilitados`  | Solo habilitados       |
| GET    | `/:tipo`        | Por tipo               |
| PATCH  | `/:tipo/toggle` | Habilitar/deshabilitar |

### 1.3 Servicios (11 total)

| Servicio               | Responsabilidad              | Dependencias                                         |
| ---------------------- | ---------------------------- | ---------------------------------------------------- |
| CrearCursoService      | Crear curso + semanas vacías | PrismaService                                        |
| ObtenerCursoService    | Consultar curso por ID       | PrismaService                                        |
| ListarCursosService    | Listar con filtros           | PrismaService                                        |
| ActualizarCursoService | Actualizar datos             | PrismaService, ObtenerCursoService                   |
| EliminarCursoService   | Eliminar (solo DRAFT)        | PrismaService                                        |
| ObtenerSemanaService   | Obtener semana/lista         | PrismaService                                        |
| GuardarSemanaService   | Guardar + actualizar estado  | PrismaService, ValidarSemanaService                  |
| ValidarSemanaService   | Validar JSON                 | CatalogoService (cache)                              |
| SubirRecursoService    | Upload archivos              | PrismaService                                        |
| EliminarRecursoService | Eliminar archivos            | PrismaService                                        |
| CatalogoService        | Gestionar componentes        | PrismaService                                        |
| EditorService          | Cargar/guardar semana        | PrismaService, CatalogoService, ValidarSemanaService |

### 1.4 Modelos Prisma

```prisma
model CursoStudio {
  id            String
  nombre        String
  descripcion   String @db.Text
  categoria     CategoriaStudio      // EXPERIENCIA, CURRICULAR
  mundo         MundoTipo            // CIENCIA, PROGRAMACION, etc.
  casa          CasaTipo             // QUANTUM, VERTEX, PULSAR
  tier_minimo   TierNombre
  estado        EstadoCursoStudio    // DRAFT, EN_PROGRESO, EN_REVISION, PUBLICADO
  semanas       SemanaStudio[]
  recursos      RecursoStudio[]
  // ... más campos
}

model SemanaStudio {
  id          String
  curso_id    String
  numero      Int                    // 1-12
  nombre      String?
  descripcion String? @db.Text
  contenido   Json?                  // Schema completo de actividades
  estado      EstadoSemanaStudio     // VACIA, EN_PROGRESO, COMPLETA
}

model RecursoStudio {
  id            String
  curso_id      String
  tipo          TipoRecursoStudio    // IMAGEN, AUDIO, VIDEO, DOCUMENTO
  nombre        String
  archivo       String
  tamanio_bytes Int
}

model ComponenteCatalogo {
  tipo           String @id
  nombre         String
  descripcion    String
  categoria      CategoriaComponente
  icono          String
  configSchema   Json
  ejemploConfig  Json
  implementado   Boolean
  habilitado     Boolean
  orden          Int
}
```

### 1.5 Problemas Identificados (Backend)

| Problema                                             | Severidad | Ubicación                                     |
| ---------------------------------------------------- | --------- | --------------------------------------------- |
| RecursosController usa PrismaService directo         | 🟡 Medio  | controllers/recursos.controller.ts            |
| SubirRecursoService guarda en filesystem local       | 🔴 Alto   | services/recursos/subir-recurso.service.ts    |
| EliminarRecursoService no elimina archivo físico     | 🔴 Alto   | services/recursos/eliminar-recurso.service.ts |
| EditorService duplica lógica de GuardarSemanaService | 🟡 Medio  | editor/editor.service.ts                      |
| DTOs duplicados entre editor/ y dto/                 | 🟡 Medio  | Múltiples archivos                            |
| Validación solo server-side                          | 🟡 Medio  | ValidarSemanaService                          |

---

## PARTE 2: AUDITORÍA DEL FRONTEND STUDIO

### 2.1 Páginas (6 rutas)

```
apps/web/src/app/admin/studio/
├── page.tsx                        # Dashboard principal
├── layout.tsx                      # Layout wrapper
├── biblioteca/
│   └── page.tsx                    # Biblioteca de componentes
├── nuevo/
│   ├── page.tsx                    # Wizard creación curso
│   └── components/
│       ├── WizardHeader.tsx
│       ├── WizardProgress.tsx
│       ├── WizardPaso[1-6].tsx     # 6 pasos del wizard
│       ├── shared/
│       │   ├── NavigationButtons.tsx
│       │   └── SelectionCard.tsx
│       └── index.ts
└── [cursoId]/
    ├── page.tsx                    # Vista/edición de curso
    └── semanas/[semanaNum]/
        └── page.tsx                # Editor de semana completo
```

### 2.2 Componentes Studio (70+ archivos)

#### Editor (`components/studio/editor/`)

| Componente        | Función                           |
| ----------------- | --------------------------------- |
| SemanaEditor.tsx  | Orquestador principal             |
| EditorToolbar.tsx | Toolbar (modos, guardar, preview) |
| EditorVisual.tsx  | Editor drag-drop de bloques       |
| EditorJSON.tsx    | Editor JSON crudo                 |
| EditorPreview.tsx | Preview en modal                  |
| BloqueWrapper.tsx | Wrapper con controles por bloque  |

#### Sidebar (`components/studio/sidebar/`)

| Componente              | Función                         |
| ----------------------- | ------------------------------- |
| EditorSidebar.tsx       | Contenedor colapsable           |
| ComponentePicker.tsx    | Selector de bloques             |
| PropiedadesPanel.tsx    | Editor JSON de props (PROBLEMA) |
| SemanaMetadataPanel.tsx | Editar título/descripción       |

#### Renderer (`components/studio/renderer/`)

| Componente               | Función                   |
| ------------------------ | ------------------------- |
| SemanaRenderer.tsx       | Renderiza semana con tema |
| BloqueRenderer.tsx       | Renderiza bloque por tipo |
| BloqueNoImplementado.tsx | Fallback                  |

#### Theme (`components/studio/theme/`)

| Archivo                | Función          |
| ---------------------- | ---------------- |
| StudioThemeContext.tsx | Context provider |
| useStudioTheme.ts      | Hook consumer    |
| theme-classes.ts       | Mapeo Tailwind   |
| themes/default.ts      | Tema por defecto |
| themes/casa-quantum.ts | Tema Quantum     |
| themes/casa-vertex.ts  | Tema Vertex      |
| themes/casa-pulsar.ts  | Tema Pulsar      |

#### Biblioteca (`components/studio/biblioteca/`)

| Archivo                            | Función                |
| ---------------------------------- | ---------------------- |
| BibliotecaFiltros.tsx              | Filtros UI             |
| ComponenteCard.tsx                 | Card de componente     |
| preview/ComponentePreviewModal.tsx | Modal preview          |
| preview/preview-registry.ts        | Registry de previews   |
| preview/previews/\*.tsx            | 42 archivos de preview |

### 2.3 Store (Zustand)

**Archivo:** `stores/editor-semana.store.ts`

```typescript
interface EditorSemanaState {
  // Datos
  metadata: MetadataSemana;
  bloques: BloqueJson[];
  componentesDisponibles: ComponenteMetadata[];

  // UI State
  modoEdicion: 'visual' | 'json';
  bloqueSeleccionadoId: string | null;
  panelActivo: 'componentes' | 'propiedades' | 'metadata';
  sidebarColapsada: boolean;

  // Status
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;

  // 50+ actions...
}
```

### 2.4 Services

| Servicio | Archivo                             | Funciones                                                 |
| -------- | ----------------------------------- | --------------------------------------------------------- |
| Editor   | services/studio/editor.service.ts   | cargarSemana(), guardarSemana(), validarSemana()          |
| Catálogo | services/studio/catalogo.service.ts | listarCatalogo(), listarHabilitados(), toggleComponente() |

### 2.5 Problemas Identificados (Frontend)

| Problema                                  | Severidad  | Ubicación                    |
| ----------------------------------------- | ---------- | ---------------------------- |
| PropiedadesPanel muestra JSON crudo       | 🔴 CRÍTICO | sidebar/PropiedadesPanel.tsx |
| Preview en modal separado (no split view) | 🟡 Medio   | editor/EditorPreview.tsx     |
| Estado mezclado useState + Zustand        | 🟡 Medio   | Múltiples componentes        |
| Props drilling 5+ niveles                 | 🟡 Medio   | SemanaEditor → children      |
| Sin validación client-side                | 🟡 Medio   | PropiedadesPanel             |
| Sin auto-guardado de borradores           | 🟡 Medio   | SemanaEditor                 |
| Sin templates de bloques                  | 🟡 Medio   | ComponentePicker             |

---

## PARTE 3: INVENTARIO DE COMPONENTES

### 3.1 Resumen por Categoría

| Categoría       | Total  | Implementados | Pendientes |
| --------------- | ------ | ------------- | ---------- |
| INTERACTIVO     | 15     | 15            | 0          |
| MOTRICIDAD_FINA | 10     | 2             | 8          |
| SIMULADOR       | 25     | 1             | 24         |
| EDITOR_CODIGO   | 12     | 12            | 0          |
| CREATIVO        | 10     | 0             | 10         |
| MULTIMEDIA      | 9      | 6             | 3          |
| EVALUACION      | 8      | 8             | 0          |
| MULTIPLAYER     | 8      | 0             | 8          |
| **TOTAL**       | **97** | **44**        | **53**     |

### 3.2 Componentes Implementados (44)

#### INTERACTIVOS (15) - 100% completo

| Tipo           | Nombre             | Archivo                       | Usa Theme |
| -------------- | ------------------ | ----------------------------- | --------- |
| DragAndDrop    | Arrastrar y Soltar | interactivo/DragAndDrop.tsx   | ✅        |
| MatchingPairs  | Emparejar          | interactivo/MatchingPairs.tsx | ✅        |
| OrderSequence  | Ordenar Secuencia  | interactivo/OrderSequence.tsx | ✅        |
| MultipleChoice | Opción Múltiple    | (via Quiz)                    | ✅        |
| FillBlanks     | Completar Espacios | (via Quiz)                    | ✅        |
| Slider         | Slider             | interactivo/Slider.tsx        | ✅        |
| ToggleSwitch   | Interruptor        | interactivo/ToggleSwitch.tsx  | ✅        |
| NumberInput    | Input Numérico     | interactivo/NumberInput.tsx   | ✅        |
| TextInput      | Campo de Texto     | interactivo/TextInput.tsx     | ✅        |
| Hotspot        | Hotspot            | interactivo/Hotspot.tsx       | ✅        |
| Timeline       | Línea de Tiempo    | interactivo/Timeline.tsx      | ✅        |
| SortingBins    | Clasificar         | interactivo/SortingBins.tsx   | ✅        |
| ScaleBalance   | Balanza            | interactivo/ScaleBalance.tsx  | ✅        |
| PieChart       | Gráfico Circular   | interactivo/PieChart.tsx      | ✅        |
| BarGraph       | Gráfico de Barras  | interactivo/BarGraph.tsx      | ✅        |

#### MOTRICIDAD FINA (2/10)

| Tipo      | Nombre        | Archivo                   | Usa Theme |
| --------- | ------------- | ------------------------- | --------- |
| TracePath | Trazar Camino | interactivo/TracePath.tsx | ✅        |
| DrawShape | Dibujar Forma | interactivo/DrawShape.tsx | ✅        |

#### SIMULADORES (1/25)

| Tipo            | Nombre                  | Archivo                         | Usa Theme |
| --------------- | ----------------------- | ------------------------------- | --------- |
| FunctionGrapher | Graficador de Funciones | interactivo/FunctionGrapher.tsx | ✅        |

#### EDITORES DE CÓDIGO (12) - 100% completo

| Tipo                 | Nombre                   | Archivo             | Usa Theme |
| -------------------- | ------------------------ | ------------------- | --------- |
| CodeEditor           | Editor de Código         | (Monaco)            | ✅        |
| CodePlayground       | Playground de Código     | (Monaco multi-file) | ✅        |
| CodeComparison       | Comparador de Código     | (Monaco diff)       | ✅        |
| SyntaxHighlight      | Resaltado de Sintaxis    | (Monaco readonly)   | ✅        |
| SQLPlayground        | Playground SQL           | (sql.js)            | ✅        |
| RegexTester          | Probador de Regex        | (custom)            | ✅        |
| AlgorithmViz         | Visualizador Algoritmos  | (custom)            | ✅        |
| DataStructureViz     | Visualizador Estructuras | (custom)            | ✅        |
| TerminalEmulator     | Emulador de Terminal     | (custom)            | ✅        |
| LuaPlayground        | Playground Lua           | (fengari)           | ✅        |
| JavaScriptPlayground | Playground JavaScript    | (eval sandbox)      | ✅        |

#### MULTIMEDIA (6/9)

| Tipo           | Nombre               | Archivo                        | Usa Theme |
| -------------- | -------------------- | ------------------------------ | --------- |
| VideoPlayer    | Reproductor de Video | interactivo/VideoPlayer.tsx    | ✅        |
| AudioPlayer    | Reproductor de Audio | interactivo/AudioPlayer.tsx    | ✅        |
| ImageGallery   | Galería de Imágenes  | interactivo/ImageGallery.tsx   | ✅        |
| DocumentViewer | Visor de Documentos  | interactivo/DocumentViewer.tsx | ✅        |
| StepAnimation  | Animación por Pasos  | interactivo/StepAnimation.tsx  | ✅        |
| Checkpoint     | Checkpoint           | interactivo/Checkpoint.tsx     | ✅        |

#### EVALUACIÓN (8) - 100% completo

| Tipo            | Nombre                 | Archivo                                     | Usa Theme |
| --------------- | ---------------------- | ------------------------------------------- | --------- |
| Quiz            | Quiz                   | interactivo/Quiz.tsx                        | ✅        |
| PracticeMode    | Modo Práctica          | biblioteca/preview/PracticeModePreview.tsx  | ✅        |
| ChallengeMode   | Modo Desafío           | biblioteca/preview/ChallengeModePreview.tsx | ✅        |
| Portfolio       | Portafolio             | biblioteca/preview/PortfolioPreview.tsx     | ✅        |
| Rubric          | Rúbrica                | biblioteca/preview/RubricPreview.tsx        | ✅        |
| ProgressTracker | Rastreador de Progreso | interactivo/ProgressTracker.tsx             | ✅        |
| BadgeDisplay    | Mostrar Insignias      | biblioteca/preview/BadgeDisplayPreview.tsx  | ✅        |

### 3.3 Componentes Pendientes de Implementar (53)

#### MOTRICIDAD FINA (8 pendientes)

- PinchZoom, RotateGesture, PressureControl, SwipeSequence
- TapRhythm, LongPress, MultiTouch, ScratchReveal

#### SIMULADORES (24 pendientes)

**Química (8):** MoleculeBuilder3D, ReactionChamber, pHSimulator, ElectronOrbitals, PeriodicExplorer, StateMatterSim, ElectrochemCell, GasLawsSim

**Física (9):** GravitySandbox, WaveSimulator, CircuitBuilder, ProjectileMotion, PendulumLab, OpticsTable, ThermodynamicsSim, FluidSimulator, MagnetismLab

**Biología (5):** CellExplorer, GeneticsLab, EcosystemSim, BodySystems, EvolutionSim

**Matemática (2):** GeometryCanvas, StatisticsLab

#### CREATIVOS (10 pendientes)

- PixelArtEditor, VectorDrawing, 3DModeler, StoryCreator, PresentationBuilder
- MindMapEditor, InfoGraphicMaker, ComicCreator, PodcastRecorder, VideoAnnotator

#### MULTIMEDIA (3 pendientes)

- 3DModelViewer, InteractivePresentation, NarrationWithTracking

#### MULTIPLAYER (8 pendientes)

- SharedWhiteboard, CollaborativeDoc, TeamChallenge, DebateArena
- PollLive, BrainstormCloud, PeerTutoring, GroupProject

---

## PARTE 4: PROPUESTA DE NUEVA ESTRUCTURA

### 4.1 Estructura Backend Propuesta

```
apps/api/src/studio/
├── modules/
│   ├── cursos/
│   │   ├── cursos.module.ts
│   │   ├── cursos.controller.ts
│   │   ├── services/
│   │   │   ├── crear-curso.service.ts
│   │   │   ├── obtener-curso.service.ts
│   │   │   ├── listar-cursos.service.ts
│   │   │   ├── actualizar-curso.service.ts
│   │   │   └── eliminar-curso.service.ts
│   │   ├── dto/
│   │   │   ├── crear-curso.dto.ts
│   │   │   └── actualizar-curso.dto.ts
│   │   └── __tests__/
│   │
│   ├── semanas/
│   │   ├── semanas.module.ts
│   │   ├── semanas.controller.ts
│   │   ├── services/
│   │   │   ├── obtener-semana.service.ts
│   │   │   ├── guardar-semana.service.ts
│   │   │   └── validar-semana.service.ts
│   │   ├── dto/
│   │   │   └── guardar-semana.dto.ts
│   │   └── __tests__/
│   │
│   ├── recursos/
│   │   ├── recursos.module.ts
│   │   ├── recursos.controller.ts
│   │   ├── services/
│   │   │   ├── subir-recurso.service.ts      # Integrar S3/Cloudinary
│   │   │   └── eliminar-recurso.service.ts
│   │   └── __tests__/
│   │
│   └── catalogo/
│       ├── catalogo.module.ts
│       ├── catalogo.controller.ts
│       ├── catalogo.service.ts
│       └── __tests__/
│
├── shared/
│   ├── interfaces/
│   │   └── studio.types.ts
│   ├── validators/
│   │   └── bloque-schema.validator.ts    # Validación JSON schemas
│   └── guards/
│       └── studio-access.guard.ts
│
└── studio.module.ts                       # Module principal
```

**Cambios clave:**

1. Eliminar carpeta `editor/` (duplica lógica de semanas)
2. Cada módulo auto-contenido con su controller, services, dtos, tests
3. Mover tipos compartidos a `shared/interfaces/`
4. Agregar validador de JSON schema para bloques
5. Integrar storage cloud en recursos

### 4.2 Estructura Frontend Propuesta

```
apps/web/src/
├── app/admin/studio/
│   ├── page.tsx                          # Dashboard
│   ├── layout.tsx
│   ├── biblioteca/page.tsx
│   ├── nuevo/                            # Wizard (mantener)
│   └── [cursoId]/
│       ├── page.tsx                      # Vista curso
│       └── semanas/[semanaNum]/
│           └── page.tsx                  # Editor semana
│
├── features/studio/                      # NUEVO: Feature-based
│   ├── editor/
│   │   ├── components/
│   │   │   ├── SemanaEditor.tsx          # Orquestador
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── EditorCanvas.tsx          # Reemplaza EditorVisual
│   │   │   ├── EditorSplitView.tsx       # NUEVO: Preview side-by-side
│   │   │   └── BloqueCard.tsx            # Reemplaza BloqueWrapper
│   │   ├── sidebar/
│   │   │   ├── EditorSidebar.tsx
│   │   │   ├── ComponentePicker.tsx
│   │   │   ├── PropiedadesForm.tsx       # NUEVO: Formularios visuales
│   │   │   └── MetadataForm.tsx
│   │   ├── hooks/
│   │   │   ├── useEditorState.ts         # Hook unificado
│   │   │   ├── useAutoSave.ts            # NUEVO
│   │   │   └── useBlockValidation.ts     # NUEVO
│   │   └── index.ts
│   │
│   ├── blocks/
│   │   ├── registry/
│   │   │   ├── block-registry.ts
│   │   │   ├── block-schemas.ts          # NUEVO: Schemas validación
│   │   │   └── block-forms.ts            # NUEVO: Form configs
│   │   ├── components/
│   │   │   ├── interactivo/              # 17 componentes
│   │   │   ├── codigo/                   # 12 componentes
│   │   │   ├── multimedia/               # 6 componentes
│   │   │   ├── evaluacion/               # 8 componentes
│   │   │   └── motricidad/               # 2 componentes
│   │   ├── renderer/
│   │   │   ├── BlockRenderer.tsx
│   │   │   └── BlockFallback.tsx
│   │   └── index.ts
│   │
│   ├── biblioteca/
│   │   ├── components/
│   │   │   ├── BibliotecaGrid.tsx
│   │   │   ├── ComponenteCard.tsx
│   │   │   └── PreviewModal.tsx
│   │   └── previews/                     # 42 archivos
│   │
│   ├── theme/
│   │   ├── ThemeProvider.tsx
│   │   ├── useTheme.ts
│   │   ├── themes/
│   │   │   ├── default.ts
│   │   │   ├── quantum.ts
│   │   │   ├── vertex.ts
│   │   │   └── pulsar.ts
│   │   └── helpers.ts
│   │
│   └── services/
│       ├── editor.service.ts
│       ├── catalogo.service.ts
│       └── recursos.service.ts
│
├── stores/
│   └── studio/
│       ├── editor.store.ts               # Zustand store limpio
│       ├── selectors.ts                  # NUEVO: Selectores memoizados
│       └── actions.ts                    # NUEVO: Actions separadas
│
└── components/studio/                    # DEPRECAR (mover a features/)
```

**Cambios clave:**

1. Feature-based architecture (`features/studio/`)
2. Separar bloques por categoría funcional
3. Agregar schemas de validación por bloque
4. Formularios visuales para cada tipo de bloque
5. Split view para preview en tiempo real
6. Auto-guardado con borradores locales
7. Selectores memoizados para performance

### 4.3 Sistema de Forms por Bloque (Nuevo)

```typescript
// features/studio/blocks/registry/block-forms.ts

export const BLOCK_FORMS: Record<string, BlockFormConfig> = {
  DragAndDrop: {
    sections: [
      {
        title: 'Instrucción',
        fields: [
          { name: 'instruccion', type: 'text', required: true },
          { name: 'descripcion', type: 'textarea' },
        ],
      },
      {
        title: 'Elementos',
        fields: [
          {
            name: 'elementos',
            type: 'array',
            itemFields: [
              { name: 'contenido', type: 'text' },
              { name: 'tipo', type: 'select', options: ['texto', 'imagen'] },
              { name: 'zonaCorrecta', type: 'select', dynamicOptions: 'zonas' },
            ],
          },
        ],
      },
      {
        title: 'Zonas',
        fields: [
          {
            name: 'zonas',
            type: 'array',
            itemFields: [
              { name: 'etiqueta', type: 'text' },
              { name: 'aceptaMultiples', type: 'checkbox' },
            ],
          },
        ],
      },
      {
        title: 'Feedback',
        fields: [
          { name: 'feedback.correcto', type: 'text' },
          { name: 'feedback.incorrecto', type: 'text' },
        ],
      },
    ],
  },
  // ... más configuraciones
};
```

---

## PARTE 5: PLAN DE ACCIÓN

### 5.1 Matriz de Decisión

| Archivo/Módulo                | Acción       | Razón                     | Prioridad |
| ----------------------------- | ------------ | ------------------------- | --------- |
| **BACKEND**                   |              |                           |           |
| studio.module.ts              | PRESERVAR    | Punto de entrada correcto | -         |
| services/cursos/\*            | PRESERVAR    | SRP bien implementado     | -         |
| services/semanas/\*           | PRESERVAR    | Lógica sólida             | -         |
| services/recursos/\*          | REFACTORIZAR | Agregar cloud storage     | Alta      |
| editor/\*                     | ELIMINAR     | Duplica semanas/\*        | Media     |
| catalogo/\*                   | PRESERVAR    | Funciona bien             | -         |
| dto/\*                        | REFACTORIZAR | Consolidar duplicados     | Baja      |
| interfaces/\*                 | PRESERVAR    | Tipos bien definidos      | -         |
| **FRONTEND**                  |              |                           |           |
| pages (app/admin/studio/\*)   | PRESERVAR    | Rutas correctas           | -         |
| SemanaEditor.tsx              | REFACTORIZAR | Simplificar state         | Alta      |
| EditorVisual.tsx              | REFACTORIZAR | Mejorar DX                | Media     |
| PropiedadesPanel.tsx          | ELIMINAR     | Reemplazar con forms      | Alta      |
| EditorPreview.tsx             | REFACTORIZAR | Split view                | Media     |
| blocks/interactivo/\*         | PRESERVAR    | Funcionan + theme         | -         |
| biblioteca/preview/\*         | PRESERVAR    | Buenos previews           | -         |
| theme/\*                      | PRESERVAR    | Sistema sólido            | -         |
| stores/editor-semana.store.ts | REFACTORIZAR | Separar concerns          | Media     |

### 5.2 Orden de Ejecución

```
FASE 1: Preparación (1 semana)
├── 1.1 Crear block-schemas.ts con validación Zod
├── 1.2 Crear block-forms.ts con config de formularios
└── 1.3 Implementar PropiedadesForm.tsx genérico

FASE 2: Editor Visual (2 semanas)
├── 2.1 Reemplazar PropiedadesPanel → PropiedadesForm
├── 2.2 Implementar EditorSplitView (preview lado a lado)
├── 2.3 Agregar validación client-side
└── 2.4 Implementar auto-guardado (localStorage)

FASE 3: Backend Cleanup (1 semana)
├── 3.1 Eliminar editor/* (consolidar en semanas/*)
├── 3.2 Integrar cloud storage en recursos
└── 3.3 Consolidar DTOs duplicados

FASE 4: Store Refactor (1 semana)
├── 4.1 Separar store en slices
├── 4.2 Agregar selectores memoizados
└── 4.3 Migrar useState → Zustand donde corresponda

FASE 5: Templates (1 semana)
├── 5.1 Crear templates por tipo de bloque
├── 5.2 Implementar selector de templates en ComponentePicker
└── 5.3 Agregar ejemplos pre-llenados

Total estimado: 6-7 semanas
```

### 5.3 Decisiones Pendientes

Antes de empezar, necesito confirmación sobre:

1. **Cloud Storage**: S3, Cloudinary, o Vercel Blob?
2. **Validación**: Zod (más typing) o Yup (más ecosistema)?
3. **Split View**: Side-by-side fijo o resizable?
4. **Auto-guardado**: Cada 30s, al cambiar, o manual con draft?
5. **Prioridad de bloques pendientes**: Empezar con simuladores o creativos?

---

## ANEXOS

### A. Archivos a Preservar (76 archivos)

```
# Backend (30)
apps/api/src/studio/studio.module.ts
apps/api/src/studio/services/cursos/*.ts (5)
apps/api/src/studio/services/semanas/*.ts (3)
apps/api/src/studio/services/recursos/*.ts (2)
apps/api/src/studio/catalogo/*.ts (3)
apps/api/src/studio/controllers/*.ts (4)
apps/api/src/studio/dto/*.ts (4)
apps/api/src/studio/interfaces/*.ts (1)
apps/api/src/studio/**/__tests__/*.spec.ts (~10)

# Frontend (46)
apps/web/src/app/admin/studio/**/*.tsx (6 pages)
apps/web/src/components/studio/blocks/interactivo/*.tsx (17)
apps/web/src/components/studio/biblioteca/preview/previews/*.tsx (~42, pero muchos son previews duplicados)
apps/web/src/components/studio/theme/**/*.ts (7)
apps/web/src/services/studio/*.ts (2)
```

### B. Archivos a Eliminar (8 archivos)

```
apps/api/src/studio/editor/editor.controller.ts
apps/api/src/studio/editor/editor.service.ts
apps/api/src/studio/editor/editor.module.ts
apps/api/src/studio/editor/dto/*.ts (3)
apps/web/src/components/studio/sidebar/PropiedadesPanel.tsx
```

### C. Archivos a Crear (~15 archivos)

```
# Frontend
apps/web/src/features/studio/blocks/registry/block-schemas.ts
apps/web/src/features/studio/blocks/registry/block-forms.ts
apps/web/src/features/studio/editor/components/PropiedadesForm.tsx
apps/web/src/features/studio/editor/components/EditorSplitView.tsx
apps/web/src/features/studio/editor/hooks/useAutoSave.ts
apps/web/src/features/studio/editor/hooks/useBlockValidation.ts
apps/web/src/stores/studio/selectors.ts
apps/web/src/stores/studio/actions.ts

# Backend
apps/api/src/studio/shared/validators/bloque-schema.validator.ts
```

---

_Documento generado automáticamente para auditoría de Mateatletas Studio_
