# Plan de Migración: Ciudad-Mateatleta → Ecosystem Web

## Resumen Ejecutivo

- **Archivos en Ciudad**: 243 archivos .tsx
- **Objetivo**: Migrar contenido educativo (juegos, simulaciones, slides) a ecosystem/apps/web
- **NO migrar**: Auth, layout base, design-system (ya existe en ecosystem)

---

## PASO 1: Inventario de Ciudad-Mateatleta

### A) COMPONENTES REUTILIZABLES (`components/`)

#### 1. Core - Componentes base para contenido educativo

```
components/core/
├── ProfileResults.tsx      # Resultados de perfil/quiz
├── WeekViewer.tsx          # Visor de semanas/clases
├── QuizQuestion.tsx        # Pregunta de quiz individual
├── DragDropGame.tsx        # Juego drag & drop genérico
├── OptionButton.tsx        # Botón de opción multiple choice
├── NASAImage.tsx           # Componente para API NASA
├── MatchingGame.tsx        # Juego de emparejar
└── OrdenarGame.tsx         # Juego de ordenar secuencias
```

#### 2. UI - Componentes de interfaz para juegos

```
components/ui/
├── GameCard.tsx            # Card para juegos
├── ProgressBar.tsx         # Barra de progreso
├── SquareCanvas.tsx        # Canvas cuadrado responsive
├── FeedbackPanel.tsx       # Panel de feedback
├── BaseCanvas.tsx          # Canvas base
└── SlideContainer.tsx      # Contenedor de slides
```

#### 3. Química - Componentes de química

```
components/quimica/
├── SlideViewer.tsx         # Visor de slides química
├── ChemistryEditor.tsx     # Editor de química
├── Cohete.tsx              # Animación cohete
├── ModoAprendizaje.tsx     # Modo aprendizaje
├── ModoDesafios.tsx        # Modo desafíos
├── MisionEspacial.tsx      # Misión espacial
├── SimulacionExperimento.tsx
├── SelectorIngredientes.tsx
├── Desafio2Nuevo.tsx
└── Desafio2Compacto.tsx
```

#### 4. Roblox/Programación - Editor Luau y slides

```
components/roblox/
├── LuauEditor.tsx          # Editor Luau (Monaco)
├── EditorLuauIntegrado.tsx # Editor integrado
├── SlidesPresentation.tsx  # Presentación de slides
├── PreviewBloque.tsx       # Preview de bloques Roblox
├── QuizInteractivo.tsx     # Quiz interactivo
├── SimuladorRoblox3D.tsx   # Simulador 3D (three.js)
├── SimuladorRoblox2D.tsx   # Simulador 2D
├── MenuNavegacion.tsx      # Menú navegación
├── SeccionCuriosidad.tsx   # Sección curiosidad
├── SeccionTeoria.tsx       # Sección teoría
├── TareaInteractiva.tsx    # Tarea interactiva
├── TestimonioCard.tsx      # Card testimonio
└── ClaseBloqueada.tsx      # Clase bloqueada
```

#### 5. Simulaciones de Física (matter.js)

```
components/simulations/fisica/
├── SimulacionRampaAceleracion.tsx
├── MisionLunaSimulation.tsx
├── FuerzasSimulation.tsx
├── InerciaLabSimulation.tsx
├── FuerzaMasaSimulation.tsx
├── CoheteSimulation.tsx
├── SimulacionEspacioSinFriccion.tsx
├── SimulacionInercia.tsx
├── VientoSimulation.tsx
├── ColisionesSimulation.tsx
├── SimulacionFuerzaComparacion.tsx
├── SistemaSolarB3Simulation.tsx
├── FriccionSimulation.tsx
├── GravedadSimulation.tsx
├── SistemaSolarB2Simulation.tsx
└── CalculadoraFuerzaSimulation.tsx

components/simulations/quimica/
└── SimulacionExperimento.tsx
```

#### 6. Games - Componentes de juegos matemáticos

```
components/games/
├── QuizGameEngine.tsx      # Motor de quiz genérico
└── matematicas/
    ├── cambio-justo/       # Juego del cambio
    │   ├── ProductCard.tsx
    │   ├── TotalDisplay.tsx
    │   ├── PaymentZone.tsx
    │   ├── MoneyItem.tsx
    │   └── MoneyPanel.tsx
    └── bien-servicio/      # Juego bien vs servicio
        ├── GameContainer.tsx
        ├── ResultsScreen.tsx
        └── AnswerButtons.tsx
```

---

### B) PÁGINAS/RUTAS (`app/`)

#### 1. Programación Roblox

```
app/programacion/roblox/
├── clase-1/ → clase-5/     # Clases individuales
├── semana-1/ → semana-3/   # Semanas
├── ejercicios-luau/        # Ejercicios
└── game-design-fundamentos/
```

#### 2. Matemáticas Finanzas

```
app/matematicas/finanzas/
├── clase-1/ → clase-8/     # Clases de finanzas
│   └── clase-7/
│       ├── juego/[nivel]/  # Juego con niveles
│       ├── resultado/      # Pantalla resultado
│       └── components/game/ # Componentes del juego
│   └── clase-8/
│       └── juego1-4/       # 4 mini-juegos
```

#### 3. Ciencias

```
app/ciencias/
├── quimica/clase-1-3/      # Clases de química
└── astronomia/
    ├── clase-1-6/          # Clases astronomía
    └── clase-8/juego/      # Juego espacial complejo
        └── components/anomalies/  # 10 anomalías/puzzles
            ├── particles/
            ├── stars/
            ├── matter/
            ├── planets/
            ├── energy/
            ├── temperature/
            ├── quantum/
            ├── gravity/
            ├── blackhole/
            └── warp/
```

#### 4. Juegos Matemáticos

```
app/juegos/matematicas/
├── presupuesto-semanal/
├── suma-billetes/
├── cajero-automatico/
├── comparador-precios/
├── cambio-justo/
├── bien-o-servicio/
├── detector-necesidades/
├── tarjeta-habilidades/
├── semana-4/
│   ├── valida-tu-idea/
│   ├── elegi-tu-negocio/
│   └── calculadora-rentabilidad/
├── semana-5/simulador/
└── semana-6/simulador/
```

#### 5. Juegos Astronomía

```
app/juegos/astro/
├── semana-1/
│   ├── construi-atomo/
│   └── arma-moleculas/
└── preguntados-moleculares/
```

#### 6. Mes de Ciencia (rutas dinámicas)

```
app/mes-ciencia/[grupo]/
├── quimica/semana-1/
├── fisica/semana-3/
├── astronomia/semana-2/
├── informatica/semana-4/
└── [materia]/[semana]/     # Ruta genérica
```

---

## PASO 2: Estructura Propuesta en Ecosystem/Web

```
apps/web/src/
├── app/
│   └── (protected)/
│       └── cursos/
│           ├── programacion/
│           │   └── roblox/
│           │       └── [claseId]/
│           ├── matematicas/
│           │   └── finanzas/
│           │       └── [claseId]/
│           ├── ciencias/
│           │   ├── quimica/[claseId]/
│           │   └── astronomia/[claseId]/
│           └── juegos/
│               ├── matematicas/[juegoId]/
│               └── ciencias/[juegoId]/
│
├── components/
│   └── cursos/                      # ← NUEVO
│       ├── core/                    # Componentes base
│       │   ├── QuizQuestion.tsx
│       │   ├── DragDropGame.tsx
│       │   ├── MatchingGame.tsx
│       │   ├── OrdenarGame.tsx
│       │   ├── OptionButton.tsx
│       │   ├── NASAImage.tsx
│       │   ├── WeekViewer.tsx
│       │   └── ProfileResults.tsx
│       │
│       ├── ui/                      # UI para juegos
│       │   ├── GameCard.tsx
│       │   ├── ProgressBar.tsx
│       │   ├── FeedbackPanel.tsx
│       │   ├── BaseCanvas.tsx
│       │   ├── SquareCanvas.tsx
│       │   └── SlideContainer.tsx
│       │
│       ├── slides/                  # Sistema de slides
│       │   ├── SlideViewer.tsx
│       │   └── SlidesPresentation.tsx
│       │
│       ├── editores/                # Editores de código
│       │   ├── LuauEditor.tsx
│       │   └── ChemistryEditor.tsx
│       │
│       ├── simulaciones/            # Simulaciones físicas
│       │   ├── fisica/
│       │   │   ├── GravedadSimulation.tsx
│       │   │   ├── FriccionSimulation.tsx
│       │   │   ├── InerciaSimulation.tsx
│       │   │   ├── ColisionesSimulation.tsx
│       │   │   ├── FuerzasSimulation.tsx
│       │   │   ├── CoheteSimulation.tsx
│       │   │   └── SistemaSolarSimulation.tsx
│       │   └── quimica/
│       │       └── ExperimentoSimulation.tsx
│       │
│       ├── juegos/                  # Juegos interactivos
│       │   ├── engine/
│       │   │   └── QuizGameEngine.tsx
│       │   ├── matematicas/
│       │   │   ├── cambio-justo/
│       │   │   ├── bien-servicio/
│       │   │   ├── presupuesto/
│       │   │   └── calculadora/
│       │   ├── quimica/
│       │   │   └── mision-espacial/
│       │   └── astronomia/
│       │       ├── construir-atomo/
│       │       └── anomalias/
│       │
│       └── roblox/                  # Específico Roblox
│           ├── PreviewBloque.tsx
│           ├── SimuladorRoblox2D.tsx
│           ├── SimuladorRoblox3D.tsx
│           └── QuizInteractivo.tsx
│
└── lib/
    └── cursos/                      # ← NUEVO
        ├── nasa-api.ts              # Cliente NASA API
        ├── game-state.ts            # Estado de juegos
        └── slide-utils.ts           # Utils para slides
```

---

## PASO 3: Dependencias a Agregar

### Ya existen en Ecosystem (OK):

- `@monaco-editor/react` ✅
- `framer-motion` ✅
- `matter-js` ✅
- `canvas-confetti` ✅
- `react-confetti` ✅
- `react-hook-form` ✅
- `zod` ✅

### FALTAN en Ecosystem:

```bash
# Agregar a apps/web/package.json
yarn workspace web add @react-three/fiber @react-three/drei three
yarn workspace web add fengari-web  # Interprete Lua
yarn workspace web add marked       # Markdown parser
yarn workspace web add react-use    # React hooks utilities
yarn workspace web add uuid @types/uuid
```

### Tipos faltantes:

```bash
yarn workspace web add -D @types/three
```

---

## PASO 4: Conflictos Detectados

### 1. Componentes UI que podrían colisionar:

| Ciudad               | Ecosystem                | Acción                                             |
| -------------------- | ------------------------ | -------------------------------------------------- |
| `ui/ProgressBar.tsx` | `ui/ProgressBar.tsx`?    | Verificar si existe, renombrar a `GameProgressBar` |
| `ui/GameCard.tsx`    | `features/GameCard.tsx`? | Verificar, posible merge                           |

### 2. Versiones de dependencias:

| Dependencia | Ciudad  | Ecosystem | Acción                                     |
| ----------- | ------- | --------- | ------------------------------------------ |
| Next.js     | 14.2.33 | 15.5.4    | Usar Ecosystem (15.x)                      |
| React       | 18.x    | 19.1.0    | Usar Ecosystem (19.x) - **REVISAR COMPAT** |
| Zod         | 4.1.12  | 3.25.76   | Ciudad usa v4! **INCOMPATIBLE**            |
| Tailwind    | 3.4.1   | 4.x       | Usar Ecosystem (4.x)                       |

### 3. Incompatibilidades Críticas:

#### ZOD v4 vs v3

Ciudad usa `zod@4.x` y Ecosystem usa `zod@3.x`. Las APIs son diferentes.
**Solución**: Migrar schemas de Ciudad a Zod v3 syntax.

#### React 18 vs 19

Ciudad usa React 18, Ecosystem usa React 19.
**Solución**: Revisar uso de `use()` hook y otras APIs nuevas.

---

## PASO 5: Tabla de Mapeo Completo

### Componentes Core

| Origen (Ciudad)                      | Destino (Ecosystem)                         |
| ------------------------------------ | ------------------------------------------- |
| `components/core/QuizQuestion.tsx`   | `components/cursos/core/QuizQuestion.tsx`   |
| `components/core/DragDropGame.tsx`   | `components/cursos/core/DragDropGame.tsx`   |
| `components/core/MatchingGame.tsx`   | `components/cursos/core/MatchingGame.tsx`   |
| `components/core/OrdenarGame.tsx`    | `components/cursos/core/OrdenarGame.tsx`    |
| `components/core/OptionButton.tsx`   | `components/cursos/core/OptionButton.tsx`   |
| `components/core/NASAImage.tsx`      | `components/cursos/core/NASAImage.tsx`      |
| `components/core/WeekViewer.tsx`     | `components/cursos/core/WeekViewer.tsx`     |
| `components/core/ProfileResults.tsx` | `components/cursos/core/ProfileResults.tsx` |

### Componentes UI

| Origen (Ciudad)                    | Destino (Ecosystem)                           |
| ---------------------------------- | --------------------------------------------- |
| `components/ui/GameCard.tsx`       | `components/cursos/ui/GameCard.tsx`           |
| `components/ui/ProgressBar.tsx`    | `components/cursos/ui/GameProgressBar.tsx`    |
| `components/ui/FeedbackPanel.tsx`  | `components/cursos/ui/FeedbackPanel.tsx`      |
| `components/ui/BaseCanvas.tsx`     | `components/cursos/ui/BaseCanvas.tsx`         |
| `components/ui/SquareCanvas.tsx`   | `components/cursos/ui/SquareCanvas.tsx`       |
| `components/ui/SlideContainer.tsx` | `components/cursos/slides/SlideContainer.tsx` |

### Editores

| Origen (Ciudad)                             | Destino (Ecosystem)                                  |
| ------------------------------------------- | ---------------------------------------------------- |
| `components/roblox/LuauEditor.tsx`          | `components/cursos/editores/LuauEditor.tsx`          |
| `components/roblox/EditorLuauIntegrado.tsx` | `components/cursos/editores/LuauEditorIntegrado.tsx` |
| `components/quimica/ChemistryEditor.tsx`    | `components/cursos/editores/ChemistryEditor.tsx`     |

### Slides

| Origen (Ciudad)                            | Destino (Ecosystem)                               |
| ------------------------------------------ | ------------------------------------------------- |
| `components/quimica/SlideViewer.tsx`       | `components/cursos/slides/SlideViewer.tsx`        |
| `components/roblox/SlidesPresentation.tsx` | `components/cursos/slides/SlidesPresentation.tsx` |

### Simulaciones Física

| Origen (Ciudad)                                              | Destino (Ecosystem)                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `components/simulations/fisica/GravedadSimulation.tsx`       | `components/cursos/simulaciones/fisica/GravedadSimulation.tsx`     |
| `components/simulations/fisica/FriccionSimulation.tsx`       | `components/cursos/simulaciones/fisica/FriccionSimulation.tsx`     |
| `components/simulations/fisica/SimulacionInercia.tsx`        | `components/cursos/simulaciones/fisica/InerciaSimulation.tsx`      |
| `components/simulations/fisica/ColisionesSimulation.tsx`     | `components/cursos/simulaciones/fisica/ColisionesSimulation.tsx`   |
| `components/simulations/fisica/FuerzasSimulation.tsx`        | `components/cursos/simulaciones/fisica/FuerzasSimulation.tsx`      |
| `components/simulations/fisica/CoheteSimulation.tsx`         | `components/cursos/simulaciones/fisica/CoheteSimulation.tsx`       |
| `components/simulations/fisica/SistemaSolarB2Simulation.tsx` | `components/cursos/simulaciones/fisica/SistemaSolarSimulation.tsx` |
| `components/simulations/fisica/MisionLunaSimulation.tsx`     | `components/cursos/simulaciones/fisica/MisionLunaSimulation.tsx`   |
| ... (14 más)                                                 | ...                                                                |

### Juegos Matemáticas

| Origen (Ciudad)                                | Destino (Ecosystem)                                    |
| ---------------------------------------------- | ------------------------------------------------------ |
| `components/games/QuizGameEngine.tsx`          | `components/cursos/juegos/engine/QuizGameEngine.tsx`   |
| `components/games/matematicas/cambio-justo/*`  | `components/cursos/juegos/matematicas/cambio-justo/*`  |
| `components/games/matematicas/bien-servicio/*` | `components/cursos/juegos/matematicas/bien-servicio/*` |

### Componentes Roblox

| Origen (Ciudad)                           | Destino (Ecosystem)                              |
| ----------------------------------------- | ------------------------------------------------ |
| `components/roblox/PreviewBloque.tsx`     | `components/cursos/roblox/PreviewBloque.tsx`     |
| `components/roblox/SimuladorRoblox2D.tsx` | `components/cursos/roblox/SimuladorRoblox2D.tsx` |
| `components/roblox/SimuladorRoblox3D.tsx` | `components/cursos/roblox/SimuladorRoblox3D.tsx` |
| `components/roblox/QuizInteractivo.tsx`   | `components/cursos/roblox/QuizInteractivo.tsx`   |
| `components/roblox/SeccionTeoria.tsx`     | `components/cursos/roblox/SeccionTeoria.tsx`     |
| `components/roblox/TareaInteractiva.tsx`  | `components/cursos/roblox/TareaInteractiva.tsx`  |

### Componentes Química

| Origen (Ciudad)                                | Destino (Ecosystem)                                                |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `components/quimica/MisionEspacial.tsx`        | `components/cursos/juegos/quimica/MisionEspacial.tsx`              |
| `components/quimica/Cohete.tsx`                | `components/cursos/juegos/quimica/Cohete.tsx`                      |
| `components/quimica/SimulacionExperimento.tsx` | `components/cursos/simulaciones/quimica/ExperimentoSimulation.tsx` |
| `components/quimica/SelectorIngredientes.tsx`  | `components/cursos/juegos/quimica/SelectorIngredientes.tsx`        |
| `components/quimica/ModoAprendizaje.tsx`       | `components/cursos/juegos/quimica/ModoAprendizaje.tsx`             |
| `components/quimica/ModoDesafios.tsx`          | `components/cursos/juegos/quimica/ModoDesafios.tsx`                |

---

## Resumen de Acciones

### Antes de migrar:

1. [ ] Agregar dependencias faltantes (three.js, fengari-web, etc.)
2. [ ] Verificar conflictos de componentes UI
3. [ ] Preparar migración Zod v4 → v3

### Orden de migración sugerido:

1. **Fase 1**: Componentes core y UI (base para todo)
2. **Fase 2**: Sistema de slides
3. **Fase 3**: Simulaciones física (matter.js)
4. **Fase 4**: Editores (Monaco/Luau)
5. **Fase 5**: Juegos matemáticas
6. **Fase 6**: Juegos ciencias/astronomía
7. **Fase 7**: Rutas/páginas

### Estimación:

- ~80 archivos de componentes
- ~160 archivos de páginas/rutas
- **Total**: ~240 archivos a migrar
