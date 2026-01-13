# Auditoría UX del Sandbox Editor

> **Fecha**: 2026-01-12
> **Objetivo**: Evaluar la usabilidad del Sandbox desde la perspectiva de docentes STEAM que crean contenido educativo diariamente
> **Usuarios objetivo**: Docentes no técnicos que necesitan crear contenido visual rápidamente

---

## Resumen Ejecutivo

El Sandbox actual tiene un diseño visual atractivo pero presenta **barreras significativas** para usuarios no técnicos. El problema más crítico es que **requiere editar JSON crudo** para crear contenido, lo cual es inaceptable para docentes que necesitan crear material educativo de forma rápida y visual.

**Puntuación general**: 4/10 para el usuario objetivo (docente no técnico)

---

## 1. Lista Priorizada de Problemas de Usabilidad

### CRÍTICO (Bloquea uso efectivo)

| #   | Problema                           | Ubicación     | Impacto                                             |
| --- | ---------------------------------- | ------------- | --------------------------------------------------- |
| C1  | **Edición JSON obligatoria**       | Monaco Editor | Docentes no pueden crear contenido sin conocer JSON |
| C2  | **Sin preview de componentes**     | StudioSidebar | No se ve cómo quedará antes de insertar             |
| C3  | **Sin validación pre-publicación** | SandboxView   | Contenido puede publicarse incompleto/roto          |

### ALTO (Impacta productividad significativamente)

| #   | Problema                                  | Ubicación   | Impacto                                         |
| --- | ----------------------------------------- | ----------- | ----------------------------------------------- |
| A1  | **Doble-click oculto para renombrar**     | TreeSidebar | El hint está en footer, fácil de ignorar        |
| A2  | **Sin undo/redo global**                  | SandboxView | Error = pérdida de trabajo                      |
| A3  | **Acciones destructivas poco protegidas** | TreeSidebar | Delete aparece igual que otras acciones         |
| A4  | **Sin guardado manual explícito**         | SandboxView | Solo autosave, no hay botón "Guardar"           |
| A5  | **Jerarquía confusa**                     | TreeSidebar | Área vs SubÁrea vs Microlección no es intuitiva |

### MEDIO (Causa fricción innecesaria)

| #   | Problema                            | Ubicación     | Impacto                          |
| --- | ----------------------------------- | ------------- | -------------------------------- |
| M1  | **Patrón hardcoded**                | WelcomeScreen | pattern='cyber-grid' sin opción  |
| M2  | **Sin templates prediseñados**      | WelcomeScreen | Siempre empezar de cero          |
| M3  | **Iconos crípticos de componentes** | StudioSidebar | Solo 2 letras (TT, BT, etc.)     |
| M4  | **Sin drag & drop para reordenar**  | TreeSidebar   | Solo flechas arriba/abajo        |
| M5  | **Sin breadcrumbs**                 | SandboxView   | Perderse en árboles profundos    |
| M6  | **Tabs con funcionalidad solapada** | StudioSidebar | "Estructura" duplica TreeSidebar |

### BAJO (Mejoras nice-to-have)

| #   | Problema                            | Ubicación   | Impacto                 |
| --- | ----------------------------------- | ----------- | ----------------------- |
| B1  | **Sin atajos de teclado**           | Global      | Flujo más lento         |
| B2  | **Sin historial de versiones**      | SandboxView | No hay rollback         |
| B3  | **Sin colaboración en tiempo real** | Global      | Solo un editor a la vez |
| B4  | **Sin modo oscuro/claro toggle**    | Global      | Solo dark mode          |

---

## 2. Análisis Detallado por Área

### 2.1 Flujo de Creación (WelcomeScreen)

**Archivo**: `WelcomeScreen.tsx` (405 líneas)

#### Lo que funciona bien:

- Diseño visual atractivo y moderno
- Selección de tipo de contenido clara (Planificación vs Microlección)
- Cards explicativas con descripción de cada tipo
- Selector de "Facción" (House) visualmente distintivo
- Slider para cantidad de clases intuitivo

#### Problemas identificados:

**C1-relacionado: Sin templates**

```
┌─────────────────────────────────────────────────────────────┐
│  ACTUAL                    │  PROPUESTO                     │
├─────────────────────────────────────────────────────────────┤
│                            │                                │
│  ┌──────────┐ ┌──────────┐ │  ┌──────────┐ ┌──────────┐     │
│  │Planific. │ │Microlec. │ │  │Desde cero│ │Templates │     │
│  └──────────┘ └──────────┘ │  └──────────┘ └──────────┘     │
│                            │       │             │          │
│  (directo a config)        │       ↓             ↓          │
│                            │  ┌──────────────────────┐      │
│                            │  │ Galería de templates │      │
│                            │  │ - Intro a fracciones │      │
│                            │  │ - Scratch básico     │      │
│                            │  │ - Variables Python   │      │
│                            │  └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**M1: Patrón visual hardcoded**

```typescript
// Línea 94: pattern siempre es 'cyber-grid'
onStart({
  house: selectedHouse,
  subject: selectedSubject,
  pattern: 'cyber-grid',  // ← No hay selector de patrón
  ...
});
```

**Solución propuesta**: Agregar paso de selección de patrón visual con previews.

---

### 2.2 Navegación del Árbol (TreeSidebar)

**Archivo**: `TreeSidebar.tsx` (515 líneas)

#### Lo que funciona bien:

- Estructura jerárquica visible
- Iconos de tipo de nodo (Teoría, Práctica, Evaluación)
- Indicadores de estado (bloqueado, guardando)
- Colapsar/expandir nodos

#### Problemas identificados:

**A1: Hint de renombrar invisible**

```
┌──────────────────────────────────────┐
│ Estructura                       [+] │
├──────────────────────────────────────┤
│ ▸ Área 1                             │
│   ▸ SubÁrea 1.1                      │
│     📘 Lección A           [···]     │  ← Menú contextual aparece en hover
│     📘 Lección B                     │
│                                      │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│ Doble clic para renombrar    ← AQUÍ  │  ← Hint en footer, 8px, fácil ignorar
└──────────────────────────────────────┘
```

**Solución propuesta**:

1. Tooltip al hacer hover sobre nodo: "Doble clic para renombrar"
2. Opción "Renombrar" en menú contextual [···]
3. Enter directo activa modo edición cuando nodo está seleccionado

**A5: Jerarquía confusa**

```
Usuario ve:                     Usuario entiende:
─────────────────────────────────────────────────────
▸ "Sección 1"                   "¿Es un área? ¿Una carpeta?"
  ▸ "Subsección"                "¿Por qué hay 2 niveles antes del contenido?"
    📘 "Mi lección"             "¡Por fin el contenido!"
```

**Solución propuesta**:

- Usar terminología educativa: "Módulo > Unidad > Lección"
- Mostrar tipo de nodo al lado del nombre: "[Módulo] Números"
- Onboarding que explique la estructura

**M4: Sin drag & drop**

```
ACTUAL:                         PROPUESTO:
─────────────────────────────────────────────────────
📘 Lección A    [↑] [↓]         📘 Lección A    ⋮⋮  (drag handle)
📘 Lección B    [↑] [↓]         📘 Lección B    ⋮⋮
📘 Lección C    [↑] [↓]         📘 Lección C    ⋮⋮

(3 clicks para mover 1 pos)     (1 drag para cualquier posición)
```

---

### 2.3 Experiencia de Edición de Contenido

**Archivo**: `SandboxView.tsx` (846 líneas)

#### EL PROBLEMA CENTRAL (C1):

**El usuario DEBE editar JSON crudo para crear contenido.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ÁRBOL  │                    EDITOR MONACO                              │
│         │                                                               │
│ ▸ Área  │  1  {                                                         │
│  📘 L1  │  2    "slides": [                                             │
│  📘 L2  │  3      {                                                     │
│  📘 L3  │  4        "tipo": "TITULO",                  ← ¿Qué tipos     │
│         │  5        "titulo": "Bienvenidos",             existen?       │
│         │  6        "subtitulo": "Clase de hoy",                        │
│         │  7        "fondo": {                                          │
│         │  8          "tipo": "PATRON",                                 │
│         │  9          "patron": "cyber-grid",          ← ¿Cuáles hay?   │
│         │ 10          "color": "#a855f7"                                │
│         │ 11        }                                                   │
│         │ 12      },                                                    │
│         │ 13      {                                                     │
│         │ 14        "tipo": "BLOQUE_TEXTO",            ← Sin autocomplete│
│         │ 15        "contenido": "..."                                  │
│         │ 16      }                                                     │
│         │ 17    ]                                                       │
│         │ 18  }                                                         │
│         │                                                               │
│         │  ❌ Sin preview  ❌ Sin validación  ❌ Sin sugerencias         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Este es un DEAL-BREAKER para docentes no técnicos.**

**Impacto en el usuario**:

- No saben qué `tipos` de slides existen
- No saben qué propiedades tiene cada tipo
- Errores de sintaxis JSON rompen todo
- No hay preview de cómo se verá
- Copiar/pegar de ejemplos = única forma de aprender

**Solución propuesta (Editor Visual WYSIWYG)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ÁRBOL  │  COMPONENTES  │           CANVAS VISUAL                       │
│         │               │                                               │
│ ▸ Área  │  [+ Título]   │  ┌───────────────────────────────────────┐    │
│  📘 L1  │  [+ Texto]    │  │                                       │    │
│  📘 L2  │  [+ Imagen]   │  │        🎨 Bienvenidos                 │    │
│  📘 L3  │  [+ Video]    │  │          Clase de hoy                 │    │
│         │  [+ Quiz]     │  │                                       │    │
│         │  [+ Código]   │  │     (Click para editar texto)         │    │
│         │               │  │                                       │    │
│         │  ──────────   │  └───────────────────────────────────────┘    │
│         │  Drag & drop  │                                               │
│         │  para agregar │  [◀ Slide 1/5 ▶]   [▶ Preview]   [💾 Guardar]│
│         │               │                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.4 Panel de Componentes (StudioSidebar)

**Archivo**: `StudioSidebar.tsx` (403 líneas)

#### Problemas identificados:

**C2: Sin preview de componentes**

```
ACTUAL:                              PROPUESTO:
─────────────────────────────────────────────────────────────────
┌─────────────────────┐              ┌─────────────────────┐
│ TT  Título          │              │ ┌─────────────────┐ │
│     Slide de título │              │ │  🎨 TÍTULO      │ │  ← Mini preview
│     y subtítulo     │              │ │   Subtítulo     │ │
│                     │              │ └─────────────────┘ │
│ [+ Agregar]         │              │ Título y subtítulo  │
└─────────────────────┘              │ centrado            │
                                     │ [+ Agregar]         │
                                     └─────────────────────┘
```

**M3: Iconos crípticos**

```
TT = Título               BT = Bloque de Texto
CL = Código en Línea      CB = Código con Tabs
IC = Imagen Centrada      ...

El usuario no sabe qué significa "CL" vs "CB" sin leer descripción.
```

**Solución propuesta**:

- Iconos pictográficos en lugar de letras
- Hover muestra preview real del componente
- Categorías más claras: "Texto", "Media", "Interactivos", "Código"

**M6: Tab "Estructura" duplica TreeSidebar**

```
┌───────────────────────────────────────────────────────────┐
│  Tab "Estructura" en StudioSidebar                        │
│  vs                                                       │
│  TreeSidebar (panel izquierdo)                           │
│                                                           │
│  → Ambos muestran el árbol de nodos                      │
│  → Confuso: ¿Cuál usar?                                  │
└───────────────────────────────────────────────────────────┘
```

**Solución**: Eliminar tab "Estructura" de StudioSidebar.

---

### 2.5 Flujo de Publicación

**Archivo**: `SandboxView.tsx` (líneas 580-600)

#### Problemas identificados:

**C3: Sin validación pre-publicación**

```typescript
// Código actual (simplificado)
const handlePublish = async () => {
  if (!backendId) {
    showError('No hay contenido guardado para publicar');
    return;
  }
  try {
    await publicarContenido(backendId);
    // ← NO valida: ¿Hay slides? ¿JSON válido? ¿Imágenes cargadas?
    setLesson((prev) => ({ ...prev, estado: 'PUBLICADO' }));
  } catch (error) {
    showError('Error al publicar...');
  }
};
```

**Solución propuesta: Checklist de publicación**

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Verificación antes de publicar                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ Tiene al menos 1 slide con contenido                    │
│  ✅ Todas las lecciones tienen título                       │
│  ⚠️  3 imágenes no tienen texto alternativo                 │
│  ❌ La lección "Intro" está vacía                           │
│                                                             │
│  [Publicar de todos modos]  [Corregir problemas]           │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.6 Problemas Generales de UX

**A2: Sin undo/redo**

- Un error de edición puede destruir trabajo
- El usuario no tiene forma de revertir cambios
- Solo el autosave (que puede guardar el error)

**A4: Sin guardado manual**

```
ACTUAL:                         EXPECTATIVA DEL USUARIO:
─────────────────────────────────────────────────────────────
[Indicador: "Guardado ✓"]       [Botón: 💾 Guardar]

"¿Guardó? ¿Cuándo? ¿Todo?"     "Hago clic y sé que guardó"
```

El autosave es bueno, pero los usuarios necesitan **control explícito** y **feedback claro**.

**M5: Sin breadcrumbs en árbol profundo**

```
Cuando el usuario está en:
Planificación > Módulo 3 > Unidad 2 > Lección 5 > Sección B

No hay indicador visual de "dónde estoy" además del highlight en el árbol.
```

---

## 3. Benchmark de Herramientas Similares

### 3.1 Notion

**Fortalezas a copiar**:

- Editor de bloques drag & drop (no JSON)
- `/` command para insertar cualquier cosa
- Barra lateral colapsable con jerarquía
- Templates reutilizables
- Colaboración en tiempo real
- Historial de versiones automático

**UX destacable**:

```
Notion: Escribís "/" y aparecen todos los bloques disponibles
        con preview y búsqueda instantánea.

Sandbox: Tenés que buscar en StudioSidebar, hacer clic,
         y escribir JSON manualmente.
```

### 3.2 Canva for Education

**Fortalezas a copiar**:

- **All-in-one Visual Suite**: plan, assign, teach, assess en un lugar
- **Templates masivos**: miles de diseños listos para usar
- **Drag & drop real**: arrastrar elementos al canvas
- **Magic Insights**: AI que analiza datos de estudiantes
- **Quiz/Poll integrados**: agregar interactividad con un clic
- **Traducción automática**: 100+ idiomas con AI

**UX destacable**:

```
Canva: Elegís template → personalizás con drag & drop → publicás
       Todo visual, cero código.

Sandbox: Elegís tipo → configurás casa → escribís JSON → rezás
```

### 3.3 Genially

**Fortalezas a copiar**:

- **Interactividad nativa**: hotspots, flip cards, swipe
- **1000+ templates** por categoría
- **Canvas-based editor**: WYSIWYG real
- **Gamification fácil**: escape rooms, quizzes
- **AI para imágenes**: genera visuals desde descripción
- **Alignment aids**: rulers, guides, snap-to-grid
- **Integración Canva**: export bidireccional

**UX destacable**:

```
Genially: Click en slide → toolbar aparece → editar inline
          Drag hotspot → configurar popup → listo

Sandbox: Editar JSON → esperar que funcione → no hay hotspots
```

### 3.4 Google Slides + Add-ons

**Fortalezas a copiar**:

- **Familiaridad**: UI que todos conocen
- **Templates educativos**: refresh 2025 con templates para escuelas
- **Add-ons ecosystem**: Nearpod, Pear Deck, etc.
- **Colaboración real-time**: múltiples editores simultáneos
- **AI Quick Insert**: generar imágenes con AI directamente
- **Class tools**: compartir pantalla, ver screens de estudiantes

**Limitación**: No es tan interactivo como Genially/Canva nativamente.

### 3.5 Nearpod

**Fortalezas a copiar**:

- **Import desde PPT/Slides**: transformar presentaciones existentes
- **20+ tipos de actividades**: Draw It, Polls, Drag & Drop, VR
- **Teacher Dashboard**: ver respuestas en tiempo real
- **AI Lesson Builder**: generar lecciones desde un prompt
- **Live vs Student-Paced**: cambiar modo on-the-fly
- **SCORM export**: integración con LMS

**UX destacable**:

```
Nearpod: Upload PPT → agregar quiz con 2 clicks → launch
         Ver respuestas de 30 alumnos en tiempo real

Sandbox: Crear desde cero en JSON → sin feedback de estudiantes
```

---

## 4. Recomendaciones Priorizadas

### Fase 1: Eliminar Barrera de JSON (CRÍTICO)

1. **Implementar editor visual WYSIWYG**
   - Canvas donde los componentes se renderizan
   - Click para editar inline
   - Drag & drop para reordenar

2. **Property Panel para componentes seleccionados**
   - Formularios con inputs tipados
   - Dropdowns para opciones válidas
   - Color pickers, image uploaders

3. **Mantener JSON como "modo avanzado"**
   - Toggle: "Vista visual" | "Vista código"
   - Para usuarios que quieran precisión

### Fase 2: Mejorar Discoverability (ALTO)

1. **Agregar previews a componentes**
   - Thumbnail visual de cada tipo de slide
   - Hover para ver en grande

2. **Slash commands estilo Notion**
   - `/titulo`, `/texto`, `/imagen`, `/quiz`
   - Con autocompletado y preview

3. **Mejorar renombrado**
   - F2 o Enter para activar
   - Opción en menú contextual

### Fase 3: Seguridad y Feedback (ALTO)

1. **Agregar undo/redo**
   - Ctrl+Z / Ctrl+Y funcionando
   - Historial visual de cambios

2. **Validación pre-publicación**
   - Checklist de requisitos
   - Warnings visuales

3. **Botón de guardado explícito**
   - Además del autosave
   - Feedback claro de estado

### Fase 4: Templates y Onboarding (MEDIO)

1. **Galería de templates**
   - Por materia: Math, Code, Science
   - Por tipo: Intro, Ejercicio, Evaluación

2. **Tutorial interactivo**
   - Primer uso guiado
   - Tooltips contextuales

3. **Ejemplos pre-cargados**
   - "Ver cómo se hace" en cada componente

---

## 5. Mockup: Editor Visual Propuesto

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SANDBOX EDITOR v3.0                                    [👁 Preview] [📤 Publicar] │
├──────────────┬──────────────────────────────────────────┬───────────────────────┤
│              │                                          │                       │
│  📁 ÁRBOL    │            🎨 CANVAS                     │  ⚙️ PROPIEDADES       │
│              │                                          │                       │
│  ▸ Módulo 1  │  ┌──────────────────────────────────┐    │  Slide: Título        │
│    📘 Intro  │  │                                  │    │  ───────────────────  │
│    📘 Teoría │  │     Bienvenidos a Python         │    │  Título:              │
│  ▸ Módulo 2  │  │     Tu primer programa           │    │  [________________]   │
│              │  │                                  │    │                       │
│  ───────────  │  │      🐍                          │    │  Subtítulo:           │
│              │  │                                  │    │  [________________]   │
│  [+ Módulo]  │  │     (Click para editar)          │    │                       │
│              │  │                                  │    │  Fondo:               │
│              │  └──────────────────────────────────┘    │  [▼ Patrón cyber-grid]│
│              │                                          │                       │
│              │  ◀ 1/5 ▶   [+ Slide]  [🗑️ Eliminar]      │  Color:               │
│              │                                          │  [■ #a855f7        ]  │
│              │  ─────────────────────────────────────── │                       │
│              │  / Escribí para buscar componentes...    │  [Vista JSON ↗]       │
│              │                                          │                       │
├──────────────┴──────────────────────────────────────────┴───────────────────────┤
│  [↶ Deshacer] [↷ Rehacer]    Guardado automático ✓ hace 2s    [💾 Guardar ahora] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Conclusión

El Sandbox actual es técnicamente funcional pero **no está diseñado para su usuario objetivo**. Un docente de matemáticas no debería necesitar saber JSON para crear una lección sobre fracciones.

**Prioridades inmediatas**:

1. Editor visual (eliminar dependencia de JSON para usuarios)
2. Templates prediseñados (no empezar de cero)
3. Validación y feedback claro (evitar errores silenciosos)

**Métricas de éxito propuestas**:

- Tiempo para crear primera lección: < 10 minutos (actual: 30+ min si no sabe JSON)
- Tasa de abandono en primer uso: < 20% (actual: estimado 60%+ sin conocimiento técnico)
- Satisfacción de docentes: > 4/5 (actual: no medido)

---

## Fuentes del Benchmark

### Notion

- [Notion for Maximum Productivity (2025)](https://davidtries.com/notion-for-maximum-productivity/)
- [Notion for UI/UX Designers Guide](https://www.landmarklabs.co/blog/notion-for-ui-ux-designers-ultimate-guide-2024)
- [Why Teachers Use Notion in 2025](https://classplusapp.com/growth/notion-for-lesson-planning-teachers/)

### Canva for Education

- [What's New in Canva Education - Canva Create 2025](https://www.canva.com/newsroom/news/canva-create-2025-education/)
- [Interactive Features for Learning](https://www.canva.com/education/features/)
- [Canva for Teachers](https://www.canva.com/education/teachers/)

### Genially

- [Genially Interactive Content Creator](https://genially.com/features/interactive-content/)
- [What's New in Genially 2025](https://blog.genially.com/en/new-features/)
- [TeachersFirst: Genially Review](https://teachersfirst.com/blog/2025/02/tech-tool-of-the-month-genially-part-1-2/)

### Google Slides

- [New Google Education Tools 2025](https://blog.google/products-and-platforms/products/education/google-tools-education-2025/)
- [Interactive Google Slides Resources](https://ditchthattextbook.com/google-slides/)
- [Google Slides Games & Templates 2025](https://skywork.ai/blog/google-slides-games-templates-2025/)

### Nearpod

- [How to Create Interactive Lessons with Nearpod](https://nearpod.com/blog/tips-tricks-to-create-your-own-nearpod-lesson/)
- [10 Ways to Use Nearpod in the Classroom](https://nearpod.com/blog/nearpod-in-the-classroom/)
- [Nearpod Teacher Dashboard](https://nearpod.zendesk.com/hc/en-us/articles/4416963117972-Live-lesson-Teacher-Dashboard)
