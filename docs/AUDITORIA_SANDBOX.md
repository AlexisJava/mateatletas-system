# Auditoría Completa del Sandbox - Mateatletas

> Fecha: 2026-01-12
> Estado: Análisis completo para reconstrucción

---

## 1. Estructura de Archivos

### Árbol de Directorios

```
apps/web/src/components/admin/views/sandbox/
├── SandboxView.tsx                    # 846 líneas ⚠️ GOD COMPONENT
├── index.ts                           # 3 líneas
├── components/
│   ├── index.ts                       # 13 líneas
│   ├── TreeSidebar.tsx                # 515 líneas ⚠️ Muy grande
│   ├── StudioSidebar.tsx              # 403 líneas ⚠️ Límite excedido
│   ├── WelcomeScreen.tsx              # 405 líneas ⚠️ Límite excedido
│   ├── PlanificacionSidebar.tsx       # 312 líneas
│   ├── LessonPlayer.tsx               # 231 líneas
│   ├── SandboxIcons.tsx               # 209 líneas
│   ├── PreviewErrorBoundary.tsx       # 103 líneas
│   ├── PublishModal.tsx               # 102 líneas
│   ├── JSONRenderer.tsx               # 94 líneas
│   ├── EditorPanel.tsx                # 92 líneas
│   ├── PreviewPanel.tsx               # 86 líneas
│   ├── CodePreview.tsx                # 71 líneas
│   ├── SaveStatusIndicator.tsx        # 68 líneas
│   └── SplitView.tsx                  # 53 líneas
├── hooks/
│   ├── index.ts                       # 2 líneas
│   ├── useAutoSave.ts                 # 184 líneas
│   └── useDebounce.ts                 # 37 líneas
├── types/
│   ├── index.ts                       # 1 línea
│   └── sandbox.types.ts               # 148 líneas
├── constants/
│   ├── index.ts                       # 1 línea
│   └── sandbox.constants.ts           # 266 líneas
└── __tests__/
    ├── SandboxView.spec.tsx           # 408 líneas
    ├── SandboxView.bugs.spec.tsx      # 319 líneas
    └── useAutoSave.spec.ts            # 260 líneas
```

### Total de Líneas de Código

| Categoría            | Archivos | Líneas    |
| -------------------- | -------- | --------- |
| Componente principal | 1        | 846       |
| Subcomponentes       | 14       | 2,744     |
| Hooks                | 2        | 221       |
| Types                | 1        | 148       |
| Constants            | 1        | 266       |
| Tests                | 3        | 987       |
| **TOTAL**            | **22**   | **5,212** |

---

## 2. Funcionalidades Existentes

### 2.1 Creación de Contenido

| Funcionalidad                  | Archivo           | Líneas  | Estado      |
| ------------------------------ | ----------------- | ------- | ----------- |
| Crear Microlección             | SandboxView.tsx   | 485-509 | ✅ Funciona |
| Crear Planificación            | SandboxView.tsx   | 451-483 | ✅ Funciona |
| Selección de Casa (House)      | WelcomeScreen.tsx | 268-303 | ✅ Funciona |
| Selección de Materia (Subject) | WelcomeScreen.tsx | 307-339 | ✅ Funciona |
| Input de Título                | WelcomeScreen.tsx | 343-358 | ✅ Funciona |
| Slider de cantidad de clases   | WelcomeScreen.tsx | 361-383 | ✅ Funciona |

### 2.2 Gestión de Nodos

| Funcionalidad                        | Archivo         | Líneas  | Estado                         |
| ------------------------------------ | --------------- | ------- | ------------------------------ |
| Agregar nodo hijo                    | SandboxView.tsx | 361-384 | ✅ Funciona                    |
| Eliminar nodo                        | SandboxView.tsx | 386-419 | ✅ Funciona (con confirmación) |
| Renombrar nodo                       | SandboxView.tsx | 421-441 | ✅ Funciona                    |
| Seleccionar nodo                     | SandboxView.tsx | 348-359 | ✅ Funciona                    |
| Expandir/Colapsar nodo               | TreeSidebar.tsx | 431-441 | ✅ Funciona                    |
| Modal de confirmación de eliminación | SandboxView.tsx | 652-683 | ✅ Funciona                    |

### 2.3 Edición de Contenido

| Funcionalidad                  | Archivo           | Líneas           | Estado      |
| ------------------------------ | ----------------- | ---------------- | ----------- |
| Editor Monaco (JSON)           | EditorPanel.tsx   | 66-89            | ✅ Funciona |
| Auto-formato (Prettify)        | EditorPanel.tsx   | 22-24            | ✅ Funciona |
| Preview en tiempo real         | CodePreview.tsx   | 22-68            | ✅ Funciona |
| Vista Split (Editor + Preview) | SplitView.tsx     | 19-53            | ✅ Funciona |
| Vista Solo Editor              | SandboxView.tsx   | 821-830          | ✅ Funciona |
| Insertar componentes           | StudioSidebar.tsx | 105-143          | ✅ Funciona |
| Cambiar background             | StudioSidebar.tsx | 175-192, 290-333 | ✅ Funciona |
| Subir imagen de fondo          | StudioSidebar.tsx | 175-192          | ✅ Funciona |

### 2.4 Auto-guardado

| Funcionalidad                   | Archivo                 | Líneas  | Estado      |
| ------------------------------- | ----------------------- | ------- | ----------- |
| Debounce de cambios             | useAutoSave.ts          | 97-110  | ✅ Funciona |
| Guardado de contenido de nodo   | useAutoSave.ts          | 71-95   | ✅ Funciona |
| Guardado de metadata            | useAutoSave.ts          | 126-158 | ✅ Funciona |
| Flush antes de cambiar nodo     | SandboxView.tsx         | 348-359 | ✅ Funciona |
| Indicador de estado de guardado | SaveStatusIndicator.tsx | 20-67   | ✅ Funciona |

### 2.5 Navegación de Planificación

| Funcionalidad                 | Archivo                  | Líneas  | Estado      |
| ----------------------------- | ------------------------ | ------- | ----------- |
| Lista de clases               | PlanificacionSidebar.tsx | 274-291 | ✅ Funciona |
| Expandir/Colapsar clase       | PlanificacionSidebar.tsx | 101-213 | ✅ Funciona |
| Cambiar entre Teoría/Práctica | SandboxView.tsx          | 529-577 | ✅ Funciona |
| Indicadores de progreso       | PlanificacionSidebar.tsx | 258-271 | ✅ Funciona |

### 2.6 Preview y Player

| Funcionalidad              | Archivo                  | Líneas  | Estado      |
| -------------------------- | ------------------------ | ------- | ----------- |
| Preview de nodo actual     | PreviewPanel.tsx         | 17-86   | ✅ Funciona |
| Error boundary del preview | PreviewErrorBoundary.tsx | 23-101  | ✅ Funciona |
| Player fullscreen          | LessonPlayer.tsx         | 47-229  | ✅ Funciona |
| Navegación entre slides    | LessonPlayer.tsx         | 166-224 | ✅ Funciona |
| Barra de progreso          | LessonPlayer.tsx         | 133-143 | ✅ Funciona |

### 2.7 Publicación

| Funcionalidad        | Archivo          | Líneas  | Estado      |
| -------------------- | ---------------- | ------- | ----------- |
| Modal de publicación | PublishModal.tsx | 18-83   | ✅ Funciona |
| Publicar contenido   | SandboxView.tsx  | 580-600 | ✅ Funciona |
| Toast de éxito       | PublishModal.tsx | 89-100  | ✅ Funciona |

### 2.8 Cargar Contenido Existente

| Funcionalidad                   | Archivo         | Líneas  | Estado      |
| ------------------------------- | --------------- | ------- | ----------- |
| Cargar por URL (?id=xxx)        | SandboxView.tsx | 254-293 | ✅ Funciona |
| Mapeo de nodos backend→frontend | SandboxView.tsx | 51-61   | ✅ Funciona |

---

## 3. Componentes y Props

### 3.1 SandboxView (Componente Principal)

**Ubicación:** `SandboxView.tsx`
**Líneas:** 846
**Props:** Ninguna (usa useSearchParams)

**Responsabilidad:** Orquestador principal del editor. Maneja:

- Estado global del editor
- Lógica de CRUD de nodos
- Comunicación con APIs
- Routing interno (WelcomeScreen vs Editor)

**Dependencias internas:**

- StudioSidebar, TreeSidebar, PlanificacionSidebar
- LessonPlayer, EditorPanel, PreviewPanel, SplitView
- WelcomeScreen, PublishModal, SaveStatusIndicator
- useAutoSave, useDebouncedCallback

### 3.2 TreeSidebar

**Ubicación:** `components/TreeSidebar.tsx`
**Líneas:** 515
**Props:**

```typescript
interface TreeSidebarProps {
  nodos: NodoContenido[];
  activeNodoId: string | null;
  onSelectNodo: (nodo: NodoContenido) => void;
  onAddNodo: (parentId: string) => void;
  onDeleteNodo: (nodoId: string) => void;
  onRenameNodo: (nodoId: string, nuevoTitulo: string) => void;
}
```

**Responsabilidad:** Renderizar y gestionar el árbol de contenido con:

- Expansión/colapso de nodos
- Edición inline de títulos
- Acciones CRUD por nodo
- Visualización jerárquica con iconos

**Componente interno:** `TreeNode` (recursivo, memoizado)

### 3.3 StudioSidebar

**Ubicación:** `components/StudioSidebar.tsx`
**Líneas:** 403
**Props:**

```typescript
interface StudioSidebarProps {
  currentHouse: House;
  setHouse: (h: House) => void;
  onInsertCode: (snippet: string) => void;
  onUpdateBackground: (bg: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}
```

**Responsabilidad:** Panel lateral izquierdo con:

- Selector de House (QUANTUM/VERTEX/PULSAR)
- Tabs: Estructura / Bloques / Entorno
- Lista de componentes del Design System
- Presets de background
- Upload de imagen personalizada

### 3.4 WelcomeScreen

**Ubicación:** `components/WelcomeScreen.tsx`
**Líneas:** 405
**Props:**

```typescript
interface WelcomeScreenProps {
  onStart: (params: StartParams) => void;
}

interface StartParams {
  house: House;
  subject: Subject;
  pattern: string;
  contentType: ContentType;
  cantidadClases?: number;
  titulo?: string;
}
```

**Responsabilidad:** Pantalla inicial de configuración con:

- Step 1: Selección de tipo (Microlección/Planificación)
- Step 2: Configuración (Casa, Materia, Título, Cantidad de clases)

### 3.5 PlanificacionSidebar

**Ubicación:** `components/PlanificacionSidebar.tsx`
**Líneas:** 312
**Props:**

```typescript
interface PlanificacionSidebarProps {
  planificacion: Planificacion;
  activeClaseIndex: number;
  activeSection: ContentSection; // 'teoria' | 'practica'
  onSelectClase: (index: number, section: ContentSection) => void;
  onUpdatePlanificacion?: (plan: Planificacion) => void; // no usado
}
```

**Responsabilidad:** Navegación dentro de una planificación:

- Lista de clases con número y título
- Expandir clase para ver Teoría/Práctica
- Indicadores de estado (Publicado/Pendiente)
- Barra de progreso general

**Componente interno:** `ClaseItem`

### 3.6 LessonPlayer

**Ubicación:** `components/LessonPlayer.tsx`
**Líneas:** 231
**Props:**

```typescript
interface LessonPlayerProps {
  lesson: Lesson;
  houseStyles: HouseConfig;
  onClose: () => void;
}
```

**Responsabilidad:** Reproductor fullscreen de lecciones:

- Navega solo por nodos hoja (leaf nodes)
- HUD con progreso y controles
- Theming dinámico por House
- Botón finalizar en último slide

### 3.7 EditorPanel

**Ubicación:** `components/EditorPanel.tsx`
**Líneas:** 92
**Props:**

```typescript
interface EditorPanelProps {
  content: string;
  onChange: (value: string) => void;
  activeNodo: NodoContenido | null;
  isEditable: boolean;
}
```

**Responsabilidad:** Wrapper de Monaco Editor:

- Editor JSON con syntax highlighting
- Botón Prettify
- Estado vacío cuando no hay nodo editable

### 3.8 PreviewPanel

**Ubicación:** `components/PreviewPanel.tsx`
**Líneas:** 86
**Props:**

```typescript
interface PreviewPanelProps {
  content: string;
  houseStyles: HouseStyles;
  activeNodoId: string | null;
  refreshKey: number;
  onRefresh: () => void;
}
```

**Responsabilidad:** Panel de preview con:

- Chrome de navegador simulado
- Error boundary
- Variables CSS de House
- Botón de refresh

### 3.9 SplitView

**Ubicación:** `components/SplitView.tsx`
**Líneas:** 53
**Props:**

```typescript
interface SplitViewProps {
  content: string;
  onChange: (value: string) => void;
  activeNodo: NodoContenido | null;
  isEditable: boolean;
  houseStyles: HouseStyles;
  activeNodoId: string | null;
  refreshKey: number;
  onRefresh: () => void;
}
```

**Responsabilidad:** Layout 50/50 con EditorPanel + PreviewPanel

### 3.10 CodePreview

**Ubicación:** `components/CodePreview.tsx`
**Líneas:** 71
**Props:**

```typescript
interface CodePreviewProps {
  code: string;
  showGuidelines?: boolean;
}
```

**Responsabilidad:** Parsea JSON y renderiza con JSONRenderer:

- Muestra errores de sintaxis inline
- Safe zone guidelines opcionales

### 3.11 JSONRenderer

**Ubicación:** `components/JSONRenderer.tsx`
**Líneas:** 94
**Props:**

```typescript
interface JSONRendererProps {
  data: ContentBlock | string | undefined | null;
}
```

**Responsabilidad:** Renderiza árbol de ContentBlock como componentes React:

- Mapea tipos a componentes del Design System
- Soporta elementos HTML nativos (div, span, p, h1-h4)
- Muestra fallback para componentes desconocidos

### 3.12 PreviewErrorBoundary

**Ubicación:** `components/PreviewErrorBoundary.tsx`
**Líneas:** 103
**Props:**

```typescript
interface Props {
  children: ReactNode;
  onReset?: () => void;
}
```

**Responsabilidad:** Error boundary para el preview:

- Captura errores de render
- UI amigable con mensaje y botón reintentar

### 3.13 PublishModal

**Ubicación:** `components/PublishModal.tsx`
**Líneas:** 102
**Props:**

```typescript
interface PublishModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  lessonTitle: string;
  slideCount: number;
}
```

**Responsabilidad:** Modal de confirmación de publicación con estado de carga

**Exporta también:** `SuccessToast`

### 3.14 SaveStatusIndicator

**Ubicación:** `components/SaveStatusIndicator.tsx`
**Líneas:** 68
**Props:**

```typescript
interface SaveStatusIndicatorProps {
  status: SaveStatus; // 'draft' | 'saving' | 'saved' | 'error'
  errorMessage?: string | null;
}
```

**Responsabilidad:** Indicador visual de estado de auto-guardado

### 3.15 SandboxIcons

**Ubicación:** `components/SandboxIcons.tsx`
**Líneas:** 209
**Props:** Ninguna (objeto con componentes SVG)

**Responsabilidad:** Colección centralizada de iconos SVG:

- Desktop, Mobile, Format, Play, Upload, Refresh
- Document, Plus, Check, Arrow
- Math, Code, Science, Tree, Folder

---

## 4. Hooks Personalizados

### 4.1 useAutoSave

**Ubicación:** `hooks/useAutoSave.ts`
**Líneas:** 184

```typescript
function useAutoSave(
  contenidoId: string | null,
  options?: { debounceMs?: number; savedDisplayMs?: number },
): {
  status: SaveStatus;
  errorMessage: string | null;
  saveNodoContent: (nodoId: string, contenidoJson: string) => void;
  saveNodoTitle: (nodoId: string, titulo: string) => void;
  saveContenidoMeta: (updates: UpdateContenidoDto) => void;
  flushPendingChanges: () => Promise<void>;
  cancelPending: () => void;
};
```

**Funcionalidades:**

- Debounce de 2s por defecto
- Acumula cambios de múltiples nodos
- Guarda en paralelo con Promise.all
- Restaura cambios si falla para reintentar
- Status: draft → saving → saved → draft

**Usado en:** SandboxView.tsx (línea 199)

### 4.2 useDebouncedCallback

**Ubicación:** `hooks/useDebounce.ts`
**Líneas:** 37

```typescript
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number,
): T;
```

**Funcionalidades:**

- Debounce genérico para callbacks
- Cleanup automático en unmount
- Preserva tipos con generics

**Usado en:** SandboxView.tsx (línea 315)

---

## 5. Tipos e Interfaces

**Ubicación:** `types/sandbox.types.ts` (148 líneas)

### Enums

```typescript
enum House {
  QUANTUM = 'QUANTUM',
  VERTEX = 'VERTEX',
  PULSAR = 'PULSAR',
}

type Subject = 'MATH' | 'CODE' | 'SCIENCE';
```

### Configuración de House

```typescript
interface HouseConfig {
  name: string;
  ageRange: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
}

type HouseStyles = HouseConfig; // Alias
```

### Estructura de Contenido

```typescript
interface ContentBlock {
  type: string;
  props?: Record<string, unknown>;
  children?: ContentBlock[] | string;
}

interface NodoContenido {
  id: string;
  titulo: string;
  bloqueado: boolean;
  parentId: string | null;
  orden: number;
  contenidoJson: string | null;
  hijos: NodoContenido[];
}

interface Lesson {
  id: string;
  title: string;
  house: House;
  subject: Subject;
  estado: EstadoContenido;
  nodos: NodoContenido[];
  slides?: Slide[]; // @deprecated
}
```

### Estados

```typescript
type EstadoContenido = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
type SaveStatus = 'draft' | 'saving' | 'saved' | 'error';
type SandboxViewMode = 'split' | 'editor' | 'preview';
type PreviewMode = 'desktop' | 'mobile';
type BackgroundPattern = 'dots' | 'cyber-grid' | 'stars' | 'aurora' | 'matrix';
```

### Design System

```typescript
interface DesignSystemComponent {
  name: string;
  description: string;
  defaultStructure: ContentBlock;
  category: 'layout' | 'content';
}

interface BackgroundPreset {
  id: BackgroundPattern | string;
  name: string;
  css: string;
}
```

---

## 6. Constantes

**Ubicación:** `constants/sandbox.constants.ts` (266 líneas)

### HOUSES

```typescript
const HOUSES: Record<House, HouseConfig> = {
  QUANTUM: {
    name: 'Quantum',
    ageRange: '6-9 años',
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
    accentColor: '#f472b6',
    bgColor: '#831843',
  },
  VERTEX: { ... },
  PULSAR: { ... },
};
```

**Usado en:** StudioSidebar, WelcomeScreen, SandboxView

### INITIAL_JSON

```typescript
const INITIAL_JSON: ContentBlock = {
  type: 'Stage',
  props: { pattern: 'dots' },
  children: [
    {
      type: 'ContentZone',
      props: { variant: 'center' },
      children: [
        { type: 'LessonHeader', props: { ... } },
        { type: 'InfoAlert', props: { ... }, children: '...' },
      ],
    },
  ],
};
```

**Usado en:** SandboxView (contenido inicial de nodos nuevos)

### DESIGN_SYSTEM_COMPONENTS

```typescript
const DESIGN_SYSTEM_COMPONENTS: DesignSystemComponent[] = [
  // Layout
  { name: 'Stage', category: 'layout', ... },
  { name: 'ContentZone', category: 'layout', ... },
  { name: 'Columns', category: 'layout', ... },

  // Content
  { name: 'LessonHeader', category: 'content', ... },
  { name: 'ActionCard', category: 'content', ... },
  { name: 'STEAMChallenge', category: 'content', ... },
  { name: 'MathHero', category: 'content', ... },
  { name: 'InfoAlert', category: 'content', ... },
  { name: 'StatCard', category: 'content', ... },
  { name: 'Formula', category: 'content', ... },
  { name: 'Timeline', category: 'content', ... },
];
```

**Usado en:** StudioSidebar (para insertar snippets)

### BACKGROUND_PRESETS

```typescript
const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'dots', name: 'Standard Dots', css: '...' },
  { id: 'cyber-grid', name: 'Cyber Grid', css: '...' },
  { id: 'stars', name: 'Deep Space', css: '...' },
  { id: 'aurora', name: 'Aurora', css: '...' },
  { id: 'matrix', name: 'Matrix Rain', css: '...' },
];
```

**Usado en:** StudioSidebar (pestaña Entorno)

### SUBJECTS

```typescript
const SUBJECTS = [
  { id: 'MATH', label: 'Matemáticas' },
  { id: 'CODE', label: 'Programación' },
  { id: 'SCIENCE', label: 'Ciencias' },
];
```

**Usado en:** WelcomeScreen

---

## 7. API Calls

### Desde contenidos.api.ts

| Función             | Método | Endpoint                 | Usado en                               |
| ------------------- | ------ | ------------------------ | -------------------------------------- |
| `createContenido`   | POST   | /contenidos              | SandboxView.tsx:485                    |
| `getContenidoById`  | GET    | /contenidos/:id          | SandboxView.tsx:261                    |
| `updateContenido`   | PATCH  | /contenidos/:id          | useAutoSave.ts:136                     |
| `publicarContenido` | POST   | /contenidos/:id/publicar | SandboxView.tsx:589                    |
| `getArbol`          | GET    | /contenidos/:id/arbol    | SandboxView.tsx:262, 464, 491          |
| `createNodo`        | POST   | /contenidos/:id/nodos    | SandboxView.tsx:366                    |
| `updateNodo`        | PATCH  | /contenidos/nodos/:id    | SandboxView.tsx:426, useAutoSave.ts:83 |
| `deleteNodo`        | DELETE | /contenidos/nodos/:id    | SandboxView.tsx:400                    |

### Desde planificaciones-admin.api.ts

| Función              | Método | Endpoint               | Usado en            |
| -------------------- | ------ | ---------------------- | ------------------- |
| `crearPlanificacion` | POST   | /admin/planificaciones | SandboxView.tsx:452 |

### Helpers usados

| Función              | Propósito             | Usado en                      |
| -------------------- | --------------------- | ----------------------------- |
| `subjectToMundoTipo` | Mapea MATH→MATEMATICA | SandboxView.tsx:456, 489      |
| `mundoTipoToSubject` | Mapea MATEMATICA→MATH | SandboxView.tsx:270, 473, etc |

---

## 8. Problemas Detectados y Red Flags

### 🔴 CRÍTICO: God Components

#### SandboxView.tsx (846 líneas)

**Problema:** Viola la regla de <400 líneas por archivo.

**Contenido mezclado:**

- 7 funciones helper de árbol (líneas 51-163)
- ~25 useState hooks (líneas 180-226)
- ~15 callbacks (líneas 228-600)
- Lógica de creación de contenido (líneas 444-526)
- Lógica de navegación de planificación (líneas 529-577)
- JSX de modales inline (líneas 630-683)
- JSX del editor completo (líneas 627-843)

**Solución propuesta:**

1. Extraer helpers a `utils/tree.utils.ts`
2. Crear `useSandboxState.ts` para manejo de estado
3. Crear `useSandboxActions.ts` para callbacks
4. Extraer `DeleteConfirmationModal.tsx`
5. Extraer `SandboxNavbar.tsx`

---

#### TreeSidebar.tsx (515 líneas)

**Problema:** Contiene TreeNode recursivo + TreeSidebar + iconos inline.

**Solución propuesta:**

1. Extraer `TreeIcons.tsx`
2. Extraer `TreeNode.tsx` (componente recursivo)
3. TreeSidebar queda como orquestador (~150 líneas)

---

#### StudioSidebar.tsx (403 líneas)

**Problema:** Apenas sobre el límite, pero tiene lógica mezclada.

**Contenido:**

- Iconos inline (líneas 11-94)
- ComponentItem (líneas 100-144)
- Lógica de upload (líneas 175-192)

**Solución propuesta:**

1. Extraer `StudioIcons.tsx`
2. Extraer `ComponentItem.tsx`

---

#### WelcomeScreen.tsx (405 líneas)

**Problema:** Dos steps en un solo componente gigante.

**Solución propuesta:**

1. Extraer `ContentTypeSelector.tsx` (Step 1)
2. Extraer `ContentConfigForm.tsx` (Step 2)
3. WelcomeScreen como orquestador

---

### 🟡 ADVERTENCIA: Duplicación de Código

#### Iconos SVG duplicados

Los siguientes archivos definen iconos SVG inline:

- `TreeSidebar.tsx` - TreeIcons (150 líneas)
- `StudioSidebar.tsx` - Icons (94 líneas)
- `SandboxIcons.tsx` - SandboxIcons (209 líneas)
- `PlanificacionSidebar.tsx` - Icons (88 líneas)
- `WelcomeScreen.tsx` - ContentTypeIcons (58 líneas)

**Total:** ~600 líneas de iconos duplicados/dispersos

**Solución propuesta:**
Unificar en un solo `icons/sandbox-icons.tsx` con namespaces:

```typescript
export const SandboxIcons = {
  Tree: { ChevronRight, ChevronDown, ... },
  Studio: { Layout, Content, Image, ... },
  Actions: { Plus, Trash, Edit, ... },
};
```

---

### 🟡 ADVERTENCIA: Lógica de Negocio en Componentes

#### Tree helpers en SandboxView.tsx

Las funciones `findNodoById`, `updateNodoInTree`, `addNodoToParent`, `removeNodoFromTree`, `countDescendants` deberían estar en un archivo separado:

- Son funciones puras sin dependencias de React
- Se usan en múltiples lugares
- Tienen tests que las duplican

---

### 🟡 ADVERTENCIA: Estado Complejo sin Reducer

SandboxView maneja ~25 useState que podrían consolidarse en useReducer:

```typescript
// Estados relacionados que podrían ser un objeto
const [backendId, setBackendId] = useState<string | null>(null);
const [contentType, setContentType] = useState<ContentType>('microleccion');
const [planificacion, setPlanificacion] = useState<Planificacion | null>(null);
const [activeClaseIndex, setActiveClaseIndex] = useState<number>(0);
const [activeSection, setActiveSection] = useState<ContentSection>('teoria');
const [lesson, setLesson] = useState<Lesson>({...});
const [activeNodoId, setActiveNodoId] = useState<string | null>(null);
const [activeNodo, setActiveNodo] = useState<NodoContenido | null>(null);
const [editorContent, setEditorContent] = useState<string>(initialJsonString);
// ... 15+ más
```

---

### 🟢 NOTA: Código Deprecado

- `Slide` interface marcada como `@deprecated` en types
- `lesson.slides` marcado como `@deprecated` en Lesson interface
- No se encontró uso actual de Slide/slides

---

### 🟢 NOTA: Props no usadas

- `PlanificacionSidebar.onUpdatePlanificacion` - Definida pero nunca pasada
- `SandboxViewMode` incluye 'preview' pero solo se usan 'split' y 'editor'

---

## 9. Dependencias Externas

### Componentes de terceros

| Dependencia            | Uso         | Ubicación       |
| ---------------------- | ----------- | --------------- |
| `@monaco-editor/react` | Editor JSON | EditorPanel.tsx |

### Componentes internos del proyecto

| Dependencia                                 | Uso                      | Ubicación                                       |
| ------------------------------------------- | ------------------------ | ----------------------------------------------- |
| `@/components/lesson-renderer/DesignSystem` | Componentes para preview | JSONRenderer.tsx, PreviewPanel.tsx              |
| `@/lib/axios`                               | HTTP client              | contenidos.api.ts, planificaciones-admin.api.ts |
| `@/lib/api/contenidos.api`                  | API de contenidos        | SandboxView.tsx, useAutoSave.ts                 |
| `@/lib/api/planificaciones-admin.api`       | API de planificaciones   | SandboxView.tsx                                 |

---

## 10. Cobertura de Tests

| Archivo                   | Líneas | Cobertura                                                |
| ------------------------- | ------ | -------------------------------------------------------- |
| SandboxView.spec.tsx      | 408    | Tree helpers, confirmación de eliminación                |
| SandboxView.bugs.spec.tsx | 319    | Bug #2 (delete sin confirmación), Bug #3 (doble request) |
| useAutoSave.spec.ts       | 260    | Debounce, flush, estados, errores                        |

**Funcionalidades NO testeadas:**

- Componentes de UI (StudioSidebar, TreeSidebar, etc.)
- WelcomeScreen flow
- LessonPlayer navegación
- Integración con APIs (solo mocks)
- JSONRenderer con componentes reales

---

## 11. Resumen de Acciones Recomendadas

### Prioridad Alta (Refactoring estructural)

1. **Dividir SandboxView.tsx** en:
   - `hooks/useSandboxState.ts` - Estado consolidado con useReducer
   - `hooks/useSandboxActions.ts` - Callbacks de CRUD
   - `utils/tree.utils.ts` - Helpers de manipulación de árbol
   - `components/DeleteConfirmationModal.tsx`
   - `components/SandboxNavbar.tsx`
   - `SandboxView.tsx` - Solo orquestación y layout

2. **Dividir TreeSidebar.tsx** en:
   - `components/tree/TreeNode.tsx` - Componente recursivo
   - `components/tree/TreeIcons.tsx` - Iconos de árbol
   - `components/TreeSidebar.tsx` - Orquestador

3. **Consolidar iconos** en un solo archivo con namespaces

### Prioridad Media (Limpieza)

4. Extraer `ContentTypeSelector.tsx` y `ContentConfigForm.tsx` de WelcomeScreen
5. Eliminar tipos/props `@deprecated` (Slide, slides)
6. Remover prop no usada `onUpdatePlanificacion`

### Prioridad Baja (Mejoras)

7. Agregar tests de componentes UI
8. Agregar tests de integración E2E
9. Considerar migrar estado complejo a Zustand/Jotai

---

## 12. Diagrama de Dependencias

```
SandboxView.tsx
├── hooks/
│   ├── useAutoSave ────────────────► contenidos.api
│   └── useDebouncedCallback
├── components/
│   ├── WelcomeScreen ──────────────► constants (HOUSES, SUBJECTS)
│   ├── StudioSidebar ──────────────► constants (DESIGN_SYSTEM_COMPONENTS, BACKGROUND_PRESETS)
│   ├── TreeSidebar
│   ├── PlanificacionSidebar
│   ├── EditorPanel ────────────────► @monaco-editor/react
│   ├── PreviewPanel
│   │   ├── CodePreview
│   │   │   └── JSONRenderer ───────► @/components/lesson-renderer/DesignSystem
│   │   └── PreviewErrorBoundary
│   ├── SplitView
│   │   ├── EditorPanel
│   │   └── PreviewPanel
│   ├── LessonPlayer ───────────────► CodePreview
│   ├── PublishModal
│   ├── SaveStatusIndicator
│   └── SandboxIcons
├── types/
│   └── sandbox.types
├── constants/
│   └── sandbox.constants
└── API/
    ├── contenidos.api ─────────────► @/lib/axios
    └── planificaciones-admin.api ──► @/lib/axios
```
