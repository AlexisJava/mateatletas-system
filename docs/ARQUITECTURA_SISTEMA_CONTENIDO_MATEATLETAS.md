# ARQUITECTURA DEL SISTEMA DE CONTENIDO EDUCATIVO MATEATLETAS 2026

> **Documento de referencia definitivo para Claude Code**
>
> Este documento contiene TODA la información necesaria para construir el sistema de contenido educativo de Mateatletas. Léelo completo antes de escribir cualquier código.

---

## ESTADO DE IMPLEMENTACIÓN (Actualizado: 2026-01-13)

### Commits Clave de Referencia

| Commit     | Descripción                                                       |
| ---------- | ----------------------------------------------------------------- |
| `8221d1f4` | FASE 0: Infraestructura packages (ui, lesson-engine, game-engine) |
| `98c0b536` | FASE 1: Schemas Zod para content system (contracts)               |
| `b25d9383` | Sandbox v2 rebuild (phases 1-4)                                   |
| `d27c3ed9` | FASE 5: Monaco Editor + panels resizables                         |
| `c2b7901c` | FASE 6: PreviewPanel con LessonRenderer                           |
| `59a8384d` | FASE 7: StartModal para crear contenido                           |
| `5eb8b3c1` | Rediseño UI con CSS Grid + tests integración                      |
| `01239602` | Normalización Design System (eliminó 14k+ líneas legacy)          |
| `6c502117` | Refactor SandboxView (extrajo componentes, CSS modules)           |

### Estado por Componente

| Componente                               | Estado         | Detalles                                                                                     |
| ---------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| **packages/contracts - schemas base**    | ✅ HECHO       | base.schema.ts, slide.schema.ts, lesson.schema.ts, game-config.schema.ts                     |
| **packages/contracts - intents schemas** | ✅ HECHO       | 6 categorías: presentation, interaction, gamification, narrative, layout, closure            |
| **packages/ui - tokens**                 | ✅ HECHO       | colors.ts (houseTokens, areaTokens), motion.ts, typography.ts                                |
| **packages/ui - hooks**                  | ✅ HECHO       | 7 hooks: useQuiz, useDragDrop, useTimer, useProgress, useGamification, useEntrance, useTheme |
| **packages/ui - primitives**             | ⚠️ PLACEHOLDER | `export {}` - Button, Card, Badge, Progress pendientes                                       |
| **packages/ui - compositions**           | ⚠️ PLACEHOLDER | `export {}` - QuizBlock, MascotGuide, Timeline pendientes                                    |
| **packages/lesson-engine - renderer**    | ✅ HECHO       | LessonRenderer.tsx, SlideContainer.tsx, IntentRegistry.ts funcionales                        |
| **packages/lesson-engine - context**     | ✅ HECHO       | LessonContext.tsx con estado, XP, navegación                                                 |
| **packages/lesson-engine - intents**     | ⚠️ PLACEHOLDER | 6 carpetas creadas pero `export {}`                                                          |
| **packages/game-engine - core**          | ⚠️ PLACEHOLDER | `export {}` - PhaserGame wrapper pendiente                                                   |
| **packages/game-engine - systems**       | ⚠️ PLACEHOLDER | Physics, Particles, Audio, Score pendientes                                                  |
| **packages/game-engine - templates**     | ⚠️ PLACEHOLDER | arcade, puzzle, memory, strategy creados pero vacíos                                         |
| **Sandbox - SandboxView**                | ✅ HECHO       | CSS Grid, dark theme, 245 líneas                                                             |
| **Sandbox - TreePanel**                  | ✅ HECHO       | Árbol de nodos con CRUD completo                                                             |
| **Sandbox - EditorPanel**                | ✅ HECHO       | Monaco Editor integrado                                                                      |
| **Sandbox - PreviewPanel**               | ✅ HECHO       | LessonRenderer integrado                                                                     |
| **Sandbox - StartModal**                 | ✅ HECHO       | Reemplazó WelcomeScreen legacy                                                               |
| **Sandbox - Tests integración**          | ✅ HECHO       | contenidos, nodos, planificaciones, seguridad                                                |
| **Admin UI - Legacy cleanup**            | ✅ HECHO       | Eliminadas 14,333 líneas obsoletas                                                           |
| **Migración colores Admin**              | ⚠️ PARCIAL     | CSS vars existen, algunos hardcoded                                                          |

### Intents Schemas (contracts) - Detalle

| Categoría        | ✅ Implementados                | ⚠️ Pendientes                                                                                            |
| ---------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Presentation** | hero, define, explain, showcase | narrate, compare, sequence, formula, quote, reveal, callout, code, image, video, animation               |
| **Interaction**  | quiz, match, sort               | trueFalse, fillBlank, classify, label, hotspot, slider, playground, simulation, drawing, flashcard, poll |
| **Gamification** | achievement, progress, levelUp  | challenge, streak                                                                                        |
| **Narrative**    | mascot, conversation            | scenario, story                                                                                          |
| **Layout**       | split, bento                    | tabs, accordion                                                                                          |
| **Closure**      | summary, nextSteps              | certificate                                                                                              |

### Resumen Ejecutivo

| Área                                  | Progreso | Notas                      |
| ------------------------------------- | -------- | -------------------------- |
| Infraestructura packages              | 100%     | Estructura completa        |
| Schemas (contracts)                   | ~60%     | Faltan intents secundarios |
| Design System tokens/hooks            | 100%     | Totalmente funcional       |
| Design System primitives/compositions | 0%       | Placeholders               |
| Lesson Engine renderer                | 100%     | Funcional                  |
| Lesson Engine intents (componentes)   | 0%       | Placeholders               |
| Game Engine                           | 0%       | Solo estructura            |
| Sandbox Editor                        | ~90%     | UI completa                |
| Admin UI normalización                | 80%      | Legacy eliminado           |

---

## TABLA DE CONTENIDOS

1. [Visión General](#1-visión-general)
2. [Reglas de Oro Inquebrantables](#2-reglas-de-oro-inquebrantables)
3. [Arquitectura de Packages](#3-arquitectura-de-packages)
4. [Sistema de Microlecciones (Intents)](#4-sistema-de-microlecciones-intents)
5. [Sistema de Juegos (Game Engine)](#5-sistema-de-juegos-game-engine)
6. [Design Tokens](#6-design-tokens)
7. [Schemas y Validación](#7-schemas-y-validación)
8. [Migración del Admin UI](#8-migración-del-admin-ui)
9. [Plan de Implementación](#9-plan-de-implementación)
10. [Precauciones y Errores Comunes](#10-precauciones-y-errores-comunes)
11. [Metodología de Trabajo](#11-metodología-de-trabajo)
12. [Checklist de Calidad](#12-checklist-de-calidad)

---

## 1. VISIÓN GENERAL

### 1.1 El Objetivo

Construir el **mejor sistema de creación de contenido educativo de 2026** donde:

```
Alexis describe el contenido en lenguaje natural
        ↓
Claude genera JSON estructurado
        ↓
Mateatletas renderiza experiencias educativas de clase mundial
        ↓
Estudiantes de 6-17 años aprenden con contenido que les vuela la cabeza
```

### 1.2 Los Tres Sistemas

| Sistema            | Propósito           | Duración   | Dónde Vive              | Tecnología            |
| ------------------ | ------------------- | ---------- | ----------------------- | --------------------- |
| **Microlecciones** | Enseñar conceptos   | 5-15 min   | Mapa de Conocimiento    | React + Framer Motion |
| **Minigames**      | Reforzar (embebido) | 30-120 seg | Slide dentro de lección | Phaser.js             |
| **Arcade**         | Practicar/jugar     | 3-10 min   | Arcade Zone             | Phaser.js             |

### 1.3 Contextos de Uso

Los **Minigames** son agnósticos al contexto. Pueden vivir en:

1. **Microlecciones** → Como un intent más (slide)
2. **Planificaciones** → Como actividad dentro de clase en vivo
3. **Arcade Zone** → Versión extendida standalone

El minigame **no sabe** dónde está corriendo. Solo recibe config JSON y ejecuta.

### 1.4 Valor del Sistema

- **Costo de desarrollo equivalente**: $450,000 - $690,000 USD
- **Diferenciador competitivo**: Sistema JSON-driven con 36+ templates de juegos que un humano puede invocar con lenguaje natural
- **Resultado**: Un game studio en un prompt

---

## 2. REGLAS DE ORO INQUEBRANTABLES

### 2.1 NO SCROLL - NUNCA

```
┌────────────────────────────────────┐
│  100vh = TODO el contenido         │
│  Sin scroll vertical               │
│  Sin scroll horizontal             │
│  Cada slide/pantalla es self-contained │
└────────────────────────────────────┘
```

**Aplica a:**

- ✅ Microlecciones (cada slide = 100vh)
- ✅ Minigames (embebido en slide, sin scroll)
- ✅ Arcade (fullscreen, sin scroll)
- ✅ Planificaciones (cada actividad = 100vh)

**Implementación técnica:**

```css
.slide-container {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport para mobile */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

### 2.2 RESPONSIVE OBLIGATORIO

```
Mobile (< 768px)   → Funciona perfecto, touch-first
Tablet (768-1024)  → Funciona perfecto
Desktop (> 1024)   → Funciona perfecto
```

**Tipografía fluida con clamp():**

```css
--text-hero: clamp(2rem, 5vw, 4rem);
--text-title: clamp(1.5rem, 3vw, 2.5rem);
--text-body: clamp(1rem, 2vw, 1.25rem);
```

### 2.3 MODELO SLIDE-BASED (Como Duolingo)

```
┌────────────────────────────────────┐
│  [Progress bar] ████████░░░░ 75%   │
├────────────────────────────────────┤
│                                    │
│         SLIDE CONTENT              │
│         (1 concepto/ejercicio)     │
│                                    │
├────────────────────────────────────┤
│  [← Anterior]  [1/12]  [Siguiente →] │
└────────────────────────────────────┘
```

### 2.4 CALIDAD DE INGENIERÍA

Del `CLAUDE.md` de Mateatletas:

```
❌ PROHIBIDO: any, @ts-ignore, as/!/? sin justificar
✅ OBLIGATORIO: TDD, tipos explícitos, Clean Architecture, 80% coverage

MÉTODO: DEFINIR → AUDITAR → TEST (falla) → IMPLEMENTAR → VERIFICAR (pasa) → SIGUIENTE
```

**Commits atómicos. 0 errores TypeScript. 0 errores ESLint.**

---

## 3. ARQUITECTURA DE PACKAGES

<!-- ✅ ESTADO: Estructura de packages creada. Falta implementar contenido interno -->

### 3.1 Estructura Propuesta

```
packages/
├── contracts/                 ← ✅ EXISTE Y FUNCIONA (schemas Zod)
│   └── src/schemas/
│       ├── content-block.schema.ts    ← ✅ IMPLEMENTADO (base.schema.ts)
│       ├── intent.schema.ts           ← ✅ IMPLEMENTADO (slide.schema.ts)
│       ├── game-config.schema.ts      ← ✅ IMPLEMENTADO
│       └── ... (existentes)
│
├── ui/                        ← ✅ EXISTE (tokens y hooks completos, primitives/compositions pendientes)
│   ├── package.json
│   ├── src/
│   │   ├── tokens/
│   │   │   ├── colors.ts      (houses, areas)
│   │   │   ├── motion.ts      (springs, easings)
│   │   │   ├── typography.ts  (fluid scales)
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useQuiz.ts
│   │   │   ├── useDragDrop.ts
│   │   │   ├── useTimer.ts
│   │   │   ├── useProgress.ts
│   │   │   ├── useGamification.ts
│   │   │   ├── useEntrance.ts
│   │   │   ├── useTheme.ts
│   │   │   └── index.ts
│   │   ├── primitives/
│   │   │   ├── Stage/
│   │   │   ├── Card/
│   │   │   ├── Button/
│   │   │   ├── Badge/
│   │   │   ├── Progress/
│   │   │   └── index.ts
│   │   ├── compositions/
│   │   │   ├── QuizBlock/
│   │   │   ├── MascotGuide/
│   │   │   ├── Timeline/
│   │   │   ├── StatShowcase/
│   │   │   └── index.ts
│   │   └── index.ts
│   └── tsconfig.json
│
├── lesson-engine/             ← NUEVO: Motor de Microlecciones
│   ├── package.json
│   ├── src/
│   │   ├── intents/
│   │   │   ├── presentation/  (hero, define, explain, etc.)
│   │   │   ├── interaction/   (quiz, match, sort, etc.)
│   │   │   ├── gamification/  (challenge, achievement, etc.)
│   │   │   ├── narrative/     (mascot, conversation, etc.)
│   │   │   ├── layout/        (split, bento, tabs, etc.)
│   │   │   ├── closure/       (summary, nextSteps, etc.)
│   │   │   └── index.ts
│   │   ├── renderer/
│   │   │   ├── LessonRenderer.tsx
│   │   │   ├── SlideContainer.tsx
│   │   │   ├── IntentRegistry.ts
│   │   │   └── index.ts
│   │   ├── context/
│   │   │   ├── LessonContext.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── tsconfig.json
│
├── game-engine/               ← NUEVO: Motor de Juegos Phaser
│   ├── package.json
│   ├── src/
│   │   ├── core/
│   │   │   ├── PhaserGame.tsx     (componente React wrapper)
│   │   │   ├── GameRegistry.ts
│   │   │   ├── BaseScene.ts
│   │   │   └── index.ts
│   │   ├── templates/
│   │   │   ├── arcade/        (catcher, shooter, runner, etc.)
│   │   │   ├── puzzle/        (match3, sokoban, pipes, etc.)
│   │   │   ├── platformer/    (platformer, gravityFlip, etc.)
│   │   │   ├── quiz/          (millionaire, fastAnswer, etc.)
│   │   │   ├── strategy/      (towerDefense, cardBattle, etc.)
│   │   │   ├── creative/      (typing, rhythm, memory, etc.)
│   │   │   └── index.ts
│   │   ├── systems/
│   │   │   ├── PhysicsSystem.ts   (Matter.js integration)
│   │   │   ├── ParticleSystem.ts
│   │   │   ├── AudioSystem.ts
│   │   │   ├── ScoreSystem.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── tsconfig.json
```

### 3.2 Dependencias Entre Packages

```
@mateatletas/contracts
       ↑
       │ (schemas compartidos)
       │
@mateatletas/ui ←──────────────────┐
       ↑                           │
       │ (componentes)             │
       │                           │
@mateatletas/lesson-engine         │
       ↑                           │
       │ (intents usan ui)         │
       │                           │
@mateatletas/game-engine ──────────┘
       ↑    (games usan ui para HUD)
       │
apps/web (consume todo)
```

### 3.3 Configuración de Package.json

```json
// packages/ui/package.json
{
  "name": "@mateatletas/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./tokens": "./dist/tokens/index.js",
    "./hooks": "./dist/hooks/index.js",
    "./primitives": "./dist/primitives/index.js",
    "./compositions": "./dist/compositions/index.js"
  },
  "dependencies": {
    "framer-motion": "^12.x",
    "@dnd-kit/core": "^6.x",
    "class-variance-authority": "^0.7.x"
  },
  "peerDependencies": {
    "react": "^18.x || ^19.x",
    "tailwindcss": "^4.x"
  }
}
```

```json
// packages/game-engine/package.json
{
  "name": "@mateatletas/game-engine",
  "version": "1.0.0",
  "dependencies": {
    "phaser": "^3.88.x",
    "matter-js": "^0.19.x",
    "@mateatletas/ui": "workspace:^",
    "@mateatletas/contracts": "workspace:^"
  }
}
```

---

## 4. SISTEMA DE MICROLECCIONES (INTENTS)

### 4.1 Filosofía: Intent-Based, No Layout-Based

**MALO** (layout-based):

```json
{ "type": "two-columns-left-text-right-image" }
```

**BUENO** (intent-based):

```json
{
  "intent": "explain",
  "concept": "La gravedad es una fuerza...",
  "visual": "gravity-animation.json"
}
```

El sistema **infiere** el layout óptimo basándose en el intent y el contenido.

### 4.2 Catálogo Completo de Intents (45)

#### PRESENTACIÓN (15 intents)

| Intent      | Usar Cuando                         | Nunca Usar Cuando          | Layout                       |
| ----------- | ----------------------------------- | -------------------------- | ---------------------------- |
| `hero`      | Abrir lección con impacto           | Mitad de lección           | Centrado, tipografía gigante |
| `define`    | Término nuevo + significado         | Explicación larga          | Card con término destacado   |
| `explain`   | Concepto + visual de soporte        | Solo texto                 | Texto + visual lado a lado   |
| `narrate`   | Storytelling puro, texto narrativo  | Hay visual para agregar    | Texto centrado, grande       |
| `showcase`  | Stats/números para impresionar      | Números en explicación     | Bento grid de StatCards      |
| `compare`   | 2-4 elementos que contrastan        | Elementos secuenciales     | 2→columnas, 3-4→bento        |
| `sequence`  | Pasos ordenados, progresión         | Orden no importa           | Timeline vertical            |
| `formula`   | Expresión matemática LaTeX          | Fórmula dentro de texto    | Card con KaTeX centrado      |
| `quote`     | Cita de personaje famoso            | Cita inventada             | Card con comillas, autor     |
| `reveal`    | Contenido oculto, spoiler           | Todo visible de entrada    | Click-to-reveal card         |
| `callout`   | Tip, warning, info destacada        | Contenido principal        | Alert con icono + borde      |
| `code`      | Bloque de código syntax-highlighted | Código inline              | Monaco-style card            |
| `image`     | Imagen como contenido principal     | Imagen decorativa          | Imagen responsive centrada   |
| `video`     | Video embebido                      | Audio solo                 | Player con controles         |
| `animation` | Lottie/Rive animación               | Imagen estática suficiente | Container con autoplay       |

#### INTERACCIÓN (14 intents)

| Intent       | Usar Cuando                    | Nunca Usar Cuando       | Layout                       |
| ------------ | ------------------------------ | ----------------------- | ---------------------------- |
| `quiz`       | Multiple choice con feedback   | Más de 5 opciones       | Card con opciones verticales |
| `trueFalse`  | Pregunta binaria V/F           | Más de 2 opciones       | Dos botones grandes          |
| `fillBlank`  | Completar oración              | Respuesta libre larga   | Input inline en texto        |
| `match`      | Conectar pares relacionados    | Más de 6 pares          | Dos columnas con líneas      |
| `sort`       | Ordenar elementos              | Orden no importa        | Lista draggable              |
| `classify`   | Arrastrar a categorías         | Solo 2 categorías       | Drop zones + items           |
| `label`      | Etiquetar partes de diagrama   | Diagrama complejo       | Imagen + hotspots            |
| `hotspot`    | Click en áreas de imagen       | Muchas áreas            | Imagen con zonas             |
| `slider`     | Ajustar valor numérico         | Respuesta exacta        | Slider con feedback          |
| `playground` | Código ejecutable              | Solo mostrar código     | Monaco + output              |
| `simulation` | Física/química interactiva     | No requiere interacción | Canvas/WebGL                 |
| `drawing`    | Dibujo libre evaluable         | Solo ver imagen         | Canvas con tools             |
| `flashcard`  | Memorización flip              | Contenido largo         | Card con flip animation      |
| `poll`       | Opinión sin respuesta correcta | Hay respuesta correcta  | Opciones + resultados        |

#### GAMIFICACIÓN (5 intents)

| Intent        | Usar Cuando                 | Props Especiales               |
| ------------- | --------------------------- | ------------------------------ |
| `challenge`   | Pregunta con XP extra       | `xpBonus`, `timeLimit`         |
| `achievement` | Desbloqueo de logro         | `achievementId`, `celebration` |
| `progress`    | Mostrar progreso de lección | `current`, `total`, `xpEarned` |
| `levelUp`     | Subió de nivel              | `newLevel`, `unlockedFeatures` |
| `streak`      | Mostrar racha de días       | `currentStreak`, `record`      |

#### NARRATIVA (4 intents)

| Intent         | Usar Cuando                      | Props Especiales                                        |
| -------------- | -------------------------------- | ------------------------------------------------------- |
| `mascot`       | BIT guía/comenta                 | `mood`: happy, thinking, excited, confused, celebrating |
| `conversation` | Diálogo entre personajes         | `speakers[]`, `messages[]`                              |
| `scenario`     | Plantear problema del mundo real | `context`, `challenge`                                  |
| `story`        | Secuencia narrativa visual       | `panels[]` con imágenes/texto                           |

#### LAYOUT (4 intents)

| Intent      | Usar Cuando            | Props Especiales                 |
| ----------- | ---------------------- | -------------------------------- |
| `split`     | Forzar 50/50 columnas  | `left`, `right`, `ratio?`        |
| `bento`     | Grid flexible          | `items[]`, `columns?`            |
| `tabs`      | Contenido con pestañas | `tabs[]` con label + content     |
| `accordion` | Secciones colapsables  | `sections[]` con title + content |

#### CIERRE (3 intents)

| Intent        | Usar Cuando               | Props Especiales                     |
| ------------- | ------------------------- | ------------------------------------ |
| `summary`     | Recap de puntos clave     | `points[]`, `takeaway`               |
| `nextSteps`   | Motivar siguiente lección | `nextLesson`, `teaser`               |
| `certificate` | Completó unidad/módulo    | `title`, `xpTotal`, `achievements[]` |

#### MINIGAME (1 intent especial)

```json
{
  "intent": "minigame",
  "template": "catcher",
  "duration": 60,
  "config": {
    "targets": {
      "correct": ["1/2", "2/4", "3/6"],
      "wrong": ["1/3", "2/5"]
    },
    "speed": { "min": 100, "max": 200 }
  }
}
```

### 4.3 Schema JSON de una Slide

```typescript
// packages/contracts/src/schemas/intent.schema.ts

import { z } from 'zod';

// Intent base
export const slideSchema = z.object({
  intent: z.string(),
  props: z.record(z.unknown()).optional(),
  animate: z.enum(['fade', 'slide', 'scale', 'none']).default('fade'),
  delay: z.number().default(0),
  on: z
    .object({
      complete: z
        .object({
          xp: z.number().optional(),
          achievement: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Lección completa
export const lessonSchema = z.object({
  metadata: z.object({
    id: z.string(),
    title: z.string(),
    area: z.enum(['math', 'code', 'science']),
    house: z.enum(['quantum', 'vertex', 'pulsar']),
    duration: z.number(), // minutos estimados
    xpTotal: z.number(),
  }),
  slides: z.array(slideSchema),
});

export type Slide = z.infer<typeof slideSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
```

### 4.4 Ejemplo Completo de Lección

```json
{
  "metadata": {
    "id": "math-fractions-101",
    "title": "Introducción a las Fracciones",
    "area": "math",
    "house": "quantum",
    "duration": 12,
    "xpTotal": 150
  },
  "slides": [
    {
      "intent": "hero",
      "props": {
        "title": "¡Fracciones Mágicas!",
        "subtitle": "Descubrí cómo dividir el mundo",
        "icon": "🍕",
        "background": "space-purple"
      },
      "animate": "scale"
    },
    {
      "intent": "mascot",
      "props": {
        "mood": "excited",
        "message": "¡Hola! Soy BIT y hoy vamos a aprender algo increíble. ¿Alguna vez compartiste una pizza con amigos?"
      }
    },
    {
      "intent": "define",
      "props": {
        "term": "Fracción",
        "definition": "Una fracción representa una parte de un todo",
        "visual": "pizza-slices.json"
      }
    },
    {
      "intent": "showcase",
      "props": {
        "items": [
          { "stat": "1/2", "label": "Mitad de pizza" },
          { "stat": "1/4", "label": "Un cuarto" },
          { "stat": "3/4", "label": "Tres cuartos" }
        ]
      }
    },
    {
      "intent": "explain",
      "props": {
        "concept": "El número de arriba (numerador) dice cuántas partes tomamos. El de abajo (denominador) dice en cuántas partes dividimos.",
        "visual": "fraction-anatomy.json"
      }
    },
    {
      "intent": "quiz",
      "props": {
        "question": "Si una pizza tiene 8 porciones y comés 3, ¿qué fracción comiste?",
        "options": ["3/5", "3/8", "8/3", "5/8"],
        "correctIndex": 1,
        "feedback": {
          "correct": "¡Exacto! 3 porciones de 8 = 3/8",
          "incorrect": "Pensá: ¿cuántas porciones comiste? ¿de cuántas en total?"
        }
      },
      "on": {
        "complete": { "xp": 20 }
      }
    },
    {
      "intent": "minigame",
      "props": {
        "template": "catcher",
        "duration": 45,
        "config": {
          "title": "¡Atrapá las Fracciones!",
          "instruction": "Atrapá solo las fracciones equivalentes a 1/2",
          "targets": {
            "correct": ["1/2", "2/4", "3/6", "4/8"],
            "wrong": ["1/3", "2/3", "1/4", "3/4"]
          }
        }
      },
      "on": {
        "complete": { "xp": 30 }
      }
    },
    {
      "intent": "summary",
      "props": {
        "points": [
          "Una fracción tiene numerador (arriba) y denominador (abajo)",
          "El denominador dice en cuántas partes dividimos",
          "El numerador dice cuántas partes tomamos"
        ],
        "takeaway": "Las fracciones nos ayudan a medir partes de un todo"
      }
    },
    {
      "intent": "achievement",
      "props": {
        "achievementId": "fraction-starter",
        "title": "¡Primer Paso Fraccionario!",
        "description": "Completaste tu primera lección de fracciones"
      }
    }
  ]
}
```

---

## 5. SISTEMA DE JUEGOS (GAME ENGINE)

### 5.1 Catálogo de Templates (36)

#### ARCADE / REFLEJOS (8)

| Template     | Mecánica                         | Ejemplo Educativo                      | Complejidad |
| ------------ | -------------------------------- | -------------------------------------- | ----------- |
| `catcher`    | Atrapar objetos que caen         | Atrapar fracciones equivalentes        | Baja        |
| `shooter`    | Disparar a targets correctos     | Destruir asteroides con números primos | Media       |
| `dodger`     | Esquivar obstáculos              | Esquivar errores de sintaxis           | Baja        |
| `runner`     | Endless runner, saltar/agacharse | Saltar solo en múltiplos de 3          | Media       |
| `breakout`   | Romper bloques con pelota        | Romper bloques de tabla periódica      | Media       |
| `pong`       | Rebote de pelota                 | Pong con operaciones matemáticas       | Baja        |
| `snake`      | Crecer comiendo correcto         | Serpiente que come solo verbos         | Baja        |
| `whackamole` | Golpear targets rápido           | Golpear la respuesta correcta          | Baja        |

#### PUZZLE / LÓGICA (8)

| Template  | Mecánica                        | Ejemplo Educativo                  | Complejidad |
| --------- | ------------------------------- | ---------------------------------- | ----------- |
| `match3`  | Conectar 3+ iguales             | Match-3 de moléculas               | Media       |
| `sokoban` | Empujar cajas a posiciones      | Mover números para formar ecuación | Alta        |
| `pipes`   | Conectar tuberías/caminos       | Completar circuitos eléctricos     | Media       |
| `jigsaw`  | Armar rompecabezas              | Armar mapa de Argentina            | Baja        |
| `tangram` | Rotar piezas geométricas        | Formar figuras con triángulos      | Media       |
| `sudoku`  | Llenar grilla con restricciones | Mini-sudoku de 4x4                 | Alta        |
| `maze`    | Encontrar camino en laberinto   | Laberinto del sistema digestivo    | Media       |
| `lights`  | Toggle que afecta vecinos       | Encender todas las luces (lógica)  | Media       |

#### PLATFORMER (5)

| Template      | Mecánica                    | Ejemplo Educativo                     | Complejidad |
| ------------- | --------------------------- | ------------------------------------- | ----------- |
| `platformer`  | Saltar plataformas clásico  | Recolectar números ordenados          | Alta        |
| `gravityFlip` | Invertir gravedad           | Física: cambiar gravedad para avanzar | Alta        |
| `doubleJump`  | Plataformas con doble salto | Llegar a alturas con potencias        | Media       |
| `timeRewind`  | Rebobinar tiempo (Braid)    | Corregir errores rebobinando          | Alta        |
| `portal`      | Crear portales para moverse | Teletransporte con coordenadas        | Alta        |

#### QUIZ / TRIVIA (4)

| Template      | Mecánica                            | Ejemplo Educativo              | Complejidad |
| ------------- | ----------------------------------- | ------------------------------ | ----------- |
| `millionaire` | Preguntas escaladas con ayudas      | Quiz de historia con lifelines | Media       |
| `fastAnswer`  | Responder antes que se acabe tiempo | Rapidez mental matemática      | Baja        |
| `duel`        | Competir contra CPU/otro            | Duelo de vocabulario           | Media       |
| `pyramid`     | Pistas que revelan respuesta        | Adivinar personaje histórico   | Media       |

#### ESTRATEGIA / SIMULACIÓN (4)

| Template       | Mecánica                         | Ejemplo Educativo                 | Complejidad |
| -------------- | -------------------------------- | --------------------------------- | ----------- |
| `towerDefense` | Colocar torres, defender oleadas | Torres matemáticas vs bugs        | Alta        |
| `idle`         | Click/upgrade incremental        | Construir civilización (historia) | Media       |
| `tycoon`       | Gestionar recursos               | Manejar ecosistema balanceado     | Alta        |
| `cardBattle`   | Jugar cartas con stats           | Batalla de elementos químicos     | Alta        |

#### CREATIVIDAD / HABILIDAD (5)

| Template   | Mecánica                   | Ejemplo Educativo               | Complejidad |
| ---------- | -------------------------- | ------------------------------- | ----------- |
| `typing`   | Escribir rápido y correcto | Typing code, typing inglés      | Baja        |
| `rhythm`   | Timing musical             | Ritmo con tablas de multiplicar | Media       |
| `drawing`  | Dibujar forma correcta     | Dibujar gráfico de función      | Media       |
| `memory`   | Memorizar y recordar       | Memory de banderas/países       | Baja        |
| `sequence` | Repetir secuencia (Simon)  | Repetir secuencia de colores    | Baja        |

#### EXPLORACIÓN (2)

| Template      | Mecánica                           | Ejemplo Educativo                    | Complejidad |
| ------------- | ---------------------------------- | ------------------------------------ | ----------- |
| `pointClick`  | Explorar escena, encontrar objetos | Explorar célula, encontrar orgánulos | Media       |
| `visualNovel` | Historia con decisiones            | Aventura histórica interactiva       | Media       |

### 5.2 Arquitectura del Game Engine

```typescript
// packages/game-engine/src/core/PhaserGame.tsx

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from '@mateatletas/contracts';
import { GameRegistry } from './GameRegistry';

interface PhaserGameProps {
  template: string;
  config: GameConfig;
  onComplete: (score: number, xp: number) => void;
  onProgress?: (state: unknown) => void;
}

export function PhaserGame({
  template,
  config,
  onComplete,
  onProgress
}: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const SceneClass = GameRegistry.get(template);
    if (!SceneClass) {
      console.error(`Template "${template}" not found`);
      return;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: '100%',
      height: '100%',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'matter',
        matter: {
          gravity: { y: 1 },
          debug: false,
        },
      },
      scene: new SceneClass(config, { onComplete, onProgress }),
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
    };
  }, [template, config]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }} // Prevent browser gestures
    />
  );
}
```

### 5.3 Schema de Configuración de Juego

```typescript
// packages/contracts/src/schemas/game-config.schema.ts

import { z } from 'zod';

// Config base para todos los juegos
export const baseGameConfigSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  duration: z.number().optional(), // segundos, undefined = sin límite
  lives: z.number().default(3),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  area: z.enum(['math', 'code', 'science']),
  house: z.enum(['quantum', 'vertex', 'pulsar']),
  scoring: z
    .object({
      correct: z.number().default(10),
      wrong: z.number().default(-5),
      timeBonus: z.boolean().default(true),
      streakBonus: z.boolean().default(true),
    })
    .default({}),
  educational: z.object({
    concept: z.string(),
    onCorrect: z.string().optional(),
    onWrong: z.string().optional(),
  }),
});

// Config específica para catcher
export const catcherConfigSchema = baseGameConfigSchema.extend({
  player: z
    .object({
      sprite: z.string().default('bucket'),
      speed: z.number().default(300),
    })
    .default({}),
  targets: z.object({
    correct: z.array(z.string()),
    wrong: z.array(z.string()),
    speed: z
      .object({
        min: z.number().default(100),
        max: z.number().default(250),
      })
      .default({}),
    spawnRate: z.number().default(1000), // ms entre spawns
  }),
});

// Union de todos los configs
export const gameConfigSchema = z.discriminatedUnion('template', [
  z.object({ template: z.literal('catcher'), config: catcherConfigSchema }),
  // ... más templates
]);

export type GameConfig = z.infer<typeof gameConfigSchema>;
```

### 5.4 Props Estándar para Integración

Todos los minigames reciben estas props cuando se usan desde PlanificacionWrapper:

```typescript
interface MinigameIntegrationProps {
  estadoInicial: JsonValue; // Estado restaurado (si existe)
  onComplete: (puntos: number) => Promise<void>; // Al terminar
  onProgress: (estado: JsonValue) => Promise<void>; // Al guardar progreso
}
```

---

## 6. DESIGN TOKENS

### 6.1 Tokens por Casa

```typescript
// packages/ui/src/tokens/colors.ts

export const houseTokens = {
  quantum: {
    // 6-9 años - Colores brillantes, amigables
    primary: '#8b5cf6', // Púrpura vibrante
    secondary: '#06b6d4', // Cyan
    accent: '#f59e0b', // Ámbar
    background: '#0f0a1e', // Púrpura muy oscuro
    surface: '#1a1033',
    text: '#f8fafc',
    gradient: 'from-purple-600 via-cyan-500 to-amber-400',
  },
  vertex: {
    // 10-12 años - Colores tech, energéticos
    primary: '#10b981', // Esmeralda
    secondary: '#3b82f6', // Azul
    accent: '#f97316', // Naranja
    background: '#030a0f', // Azul muy oscuro
    surface: '#0a1929',
    text: '#f8fafc',
    gradient: 'from-emerald-500 via-blue-500 to-orange-500',
  },
  pulsar: {
    // 13-17 años - Colores maduros, profesionales
    primary: '#ec4899', // Rosa
    secondary: '#8b5cf6', // Púrpura
    accent: '#14b8a6', // Teal
    background: '#0a0a0a', // Casi negro
    surface: '#171717',
    text: '#f8fafc',
    gradient: 'from-pink-500 via-purple-500 to-teal-500',
  },
} as const;

export type House = keyof typeof houseTokens;
```

### 6.2 Tokens por Área

```typescript
// packages/ui/src/tokens/colors.ts (continuación)

export const areaTokens = {
  math: {
    icon: '📐',
    pattern: 'blueprint', // Fondo cuadriculado
    accent: '#3b82f6', // Azul
    illustrations: 'geometric', // Estilo de ilustraciones
  },
  code: {
    icon: '💻',
    pattern: 'matrix', // Lluvia de código
    accent: '#10b981', // Verde
    illustrations: 'tech',
  },
  science: {
    icon: '🔬',
    pattern: 'molecules', // Moléculas flotantes
    accent: '#8b5cf6', // Púrpura
    illustrations: 'organic',
  },
} as const;

export type Area = keyof typeof areaTokens;
```

### 6.3 Tokens de Motion

```typescript
// packages/ui/src/tokens/motion.ts

export const motionTokens = {
  // Springs para Framer Motion
  springs: {
    snappy: { damping: 30, stiffness: 400 },
    bouncy: { damping: 15, stiffness: 300 },
    gentle: { damping: 25, stiffness: 200 },
    slow: { damping: 40, stiffness: 100 },
  },

  // Duraciones
  durations: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    dramatic: 0.8,
  },

  // Easings
  easings: {
    easeOut: [0.16, 1, 0.3, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },

  // Animaciones de entrada predefinidas
  entrances: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
    },
    pop: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', damping: 15, stiffness: 300 },
    },
  },
} as const;
```

### 6.4 Hook useTheme

```typescript
// packages/ui/src/hooks/useTheme.ts

import { useContext, useMemo } from 'react';
import { LessonContext } from '@mateatletas/lesson-engine';
import { houseTokens, areaTokens, motionTokens } from '../tokens';

export function useTheme() {
  const { metadata } = useContext(LessonContext);

  const theme = useMemo(() => {
    const house = houseTokens[metadata.house];
    const area = areaTokens[metadata.area];

    return {
      colors: {
        ...house,
        areaAccent: area.accent,
      },
      pattern: area.pattern,
      motion: motionTokens,
      css: {
        '--color-primary': house.primary,
        '--color-secondary': house.secondary,
        '--color-accent': house.accent,
        '--color-background': house.background,
        '--color-surface': house.surface,
        '--color-text': house.text,
      },
    };
  }, [metadata.house, metadata.area]);

  return theme;
}
```

---

## 7. SCHEMAS Y VALIDACIÓN

### 7.1 Estructura de Schemas en Contracts

```typescript
// packages/contracts/src/schemas/content-block.schema.ts

import { z } from 'zod';

// Schema recursivo para ContentBlock (retrocompatibilidad)
export interface ContentBlock {
  type: string;
  props?: Record<string, unknown>;
  children?: ContentBlock[] | string;
}

export const contentBlockSchema: z.ZodType<ContentBlock> = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.unknown()).optional(),
    children: z.union([z.array(contentBlockSchema), z.string()]).optional(),
  }),
);

// Schema para el nuevo sistema de intents
export const slideIntentSchema = z.object({
  intent: z.string(),
  props: z.record(z.unknown()).optional(),
  animate: z.enum(['fade', 'slide', 'scale', 'pop', 'none']).default('fade'),
  delay: z.number().default(0),
  on: z
    .object({
      complete: z
        .object({
          xp: z.number().optional(),
          achievement: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type SlideIntent = z.infer<typeof slideIntentSchema>;
```

### 7.2 Validación por Intent

```typescript
// packages/contracts/src/schemas/intents/quiz.schema.ts

import { z } from 'zod';

export const quizPropsSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  feedback: z
    .object({
      correct: z.string(),
      incorrect: z.string(),
    })
    .optional(),
  shuffle: z.boolean().default(false),
  timeLimit: z.number().optional(), // segundos
});

export type QuizProps = z.infer<typeof quizPropsSchema>;
```

### 7.3 Registry de Validadores

```typescript
// packages/contracts/src/schemas/intents/index.ts

import { z } from 'zod';
import { heroPropsSchema } from './hero.schema';
import { quizPropsSchema } from './quiz.schema';
import { minigamePropsSchema } from './minigame.schema';
// ... más imports

export const intentPropsSchemas: Record<string, z.ZodSchema> = {
  hero: heroPropsSchema,
  define: definePropsSchema,
  explain: explainPropsSchema,
  quiz: quizPropsSchema,
  minigame: minigamePropsSchema,
  // ... todos los 45+ intents
};

export function validateIntentProps(intent: string, props: unknown) {
  const schema = intentPropsSchemas[intent];
  if (!schema) {
    throw new Error(`Unknown intent: ${intent}`);
  }
  return schema.parse(props);
}
```

---

## 8. MIGRACIÓN DEL ADMIN UI

### 8.1 Estado Actual (Problemas)

| Archivo             | Problema                                           |
| ------------------- | -------------------------------------------------- |
| `SandboxView.tsx`   | 4+ colores hardcodeados (#030014, etc.)            |
| `WelcomeScreen.tsx` | 50+ colores hardcodeados                           |
| `LessonPlayer.tsx`  | 20+ colores hardcodeados                           |
| `PublishModal.tsx`  | 15+ colores hardcodeados                           |
| Botones             | Completamente diferentes entre admin y sandbox     |
| Modales             | z-index, backgrounds, border-radius inconsistentes |

### 8.2 Variables CSS Existentes (Admin)

```css
/* Usar estas, NO colores hardcodeados */
--admin-bg: #09090b;
--admin-surface-1: #111113;
--admin-surface-2: #18181b;
--admin-border: #27272a;
--admin-text: #fafafa;
--admin-text-muted: #71717a;
--admin-accent: #10b981;
--status-info: #3b82f6;
--status-pending: #a855f7;
```

### 8.3 Plan de Migración

**Paso 1: Crear componentes base unificados**

```typescript
// apps/web/src/components/admin/ui/AdminButton.tsx

import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--admin-accent)] text-black hover:bg-[var(--admin-accent)]/90',
        secondary: 'bg-[var(--admin-surface-2)] text-[var(--admin-text)] border border-[var(--admin-border)]',
        ghost: 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function AdminButton({ variant, size, className, ...props }: AdminButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

**Paso 2: Buscar y reemplazar colores hardcodeados**

```bash
# Buscar todos los colores hardcodeados en sandbox
grep -r "#030014\|#0f0720\|#a855f7\|#1e1b4b" apps/web/src/components/admin/views/sandbox/
```

**Paso 3: Reemplazar por variables CSS**

```tsx
// ANTES (malo)
<div className="bg-[#030014] border border-white/5">

// DESPUÉS (bueno)
<div className="bg-[var(--admin-bg)] border border-[var(--admin-border)]">
```

### 8.4 Archivos a Modificar

1. `SandboxView.tsx` - Backgrounds, spinners
2. `WelcomeScreen.tsx` - Cards, textos, gradientes
3. `LessonPlayer.tsx` - Modal overlay, backgrounds
4. `PublishModal.tsx` - Modal, botones, inputs
5. `TreeSidebar.tsx` - Posiblemente colores
6. `StudioSidebar.tsx` - Posiblemente colores

---

## 9. PLAN DE IMPLEMENTACIÓN

<!-- ESTADO: Fases 0-1 completadas, Fase 2 parcial, Fases 3-7 pendientes -->

### 9.1 Fase 0: Preparación ✅ COMPLETADA (commit `8221d1f4`)

- [x] Instalar Phaser.js: `yarn add phaser`
- [x] Crear estructura de `packages/ui`
- [x] Crear estructura de `packages/lesson-engine`
- [x] Crear estructura de `packages/game-engine`
- [x] Configurar exports en cada package.json
- [x] Agregar workspace references en tsconfig

### 9.2 Fase 1: packages/contracts - Schemas ✅ COMPLETADA (commit `98c0b536`)

- [x] Crear `content-block.schema.ts` → implementado como `base.schema.ts`
- [x] Crear `slide-intent.schema.ts` → implementado como `slide.schema.ts`
- [x] Crear schemas para cada intent (presentation/) → 4 implementados
- [x] Crear schemas para cada intent (interaction/) → 3 implementados
- [x] Crear schemas para cada intent (gamification/) → 3 implementados
- [x] Crear schemas para cada intent (narrative/) → 2 implementados
- [x] Crear schemas para cada intent (layout/) → 2 implementados
- [x] Crear schemas para cada intent (closure/) → 2 implementados
- [x] Crear `game-config.schema.ts`
- [ ] Tests para todos los schemas → PENDIENTE

### 9.3 Fase 2: packages/ui - Design System ⚠️ PARCIAL (commit `8221d1f4`)

- [x] Implementar tokens (colors, motion, typography) ✅
- [x] Implementar hooks headless (useQuiz, useDragDrop, etc.) ✅ 7 hooks
- [ ] Implementar primitives con Framer Motion → PENDIENTE
  - [ ] Stage
  - [ ] Card
  - [ ] Button
  - [ ] Badge
  - [ ] Progress
  - [ ] Alert
- [ ] Implementar compositions → PENDIENTE
  - [ ] QuizBlock
  - [ ] MascotGuide
  - [ ] Timeline
  - [ ] StatShowcase
- [ ] Tests para todos los componentes → PENDIENTE

### 9.4 Fase 3: packages/lesson-engine - Intents ⚠️ PARCIAL (commit `8221d1f4`)

- [x] Implementar LessonRenderer ✅
- [x] Implementar SlideContainer (100vh, no scroll) ✅
- [x] Implementar IntentRegistry ✅
- [ ] Implementar intents de presentación (15) → 0/15 componentes
- [ ] Implementar intents de interacción (14) → 0/14 componentes
- [ ] Implementar intents de gamificación (5) → 0/5 componentes
- [ ] Implementar intents de narrativa (4) → 0/4 componentes
- [ ] Implementar intents de layout (4) → 0/4 componentes
- [ ] Implementar intents de cierre (3) → 0/3 componentes
- [ ] Tests para todos los intents → PENDIENTE

### 9.5 Fase 4: packages/game-engine - Juegos ❌ PENDIENTE

- [ ] Implementar PhaserGame wrapper
- [ ] Implementar GameRegistry
- [ ] Implementar BaseScene
- [ ] Implementar sistemas (Physics, Particles, Audio, Score)
- [ ] Implementar templates arcade (8)
- [ ] Implementar templates puzzle (8)
- [ ] Implementar templates quiz (4)
- [ ] Otros templates según prioridad
- [ ] Tests para templates críticos

### 9.6 Fase 5: Integración ❌ PENDIENTE

- [ ] Integrar minigame como intent
- [ ] Integrar PhaserGame en PlanificacionWrapper
- [ ] Actualizar Sandbox para usar nuevos componentes
- [ ] Migrar imports a @mateatletas/ui
- [ ] Eliminar DesignSystem duplicados

### 9.7 Fase 6: Migración Admin UI ⚠️ PARCIAL (commits `01239602`, `b25d9383`)

- [x] Crear componentes AdminButton, AdminModal, etc. → parcial (LoadingSpinner)
- [x] Migrar SandboxView.tsx ✅ (refactorizado, CSS modules)
- [x] Migrar WelcomeScreen.tsx → ELIMINADO, reemplazado por StartModal ✅
- [x] Migrar PublishModal.tsx → ELIMINADO en rebuild
- [x] Migrar LessonPlayer.tsx → ELIMINADO en rebuild
- [ ] Verificar consistencia visual → colores hardcoded pendientes

### 9.8 Fase 7: Testing & Polish ⚠️ PARCIAL (commit `5eb8b3c1`)

- [x] Tests E2E de flujo completo → Tests integración backend ✅
- [ ] Performance audit (Lighthouse) → PENDIENTE
- [ ] Accessibility audit (axe) → PENDIENTE
- [ ] Mobile testing real → PENDIENTE
- [ ] Fix bugs encontrados → Continuo

**Progreso Total: ~50% completado**

- Fases 0-1: ✅ 100%
- Fases 2-3: ⚠️ ~40% (infraestructura hecha, componentes pendientes)
- Fases 4-5: ❌ 0%
- Fases 6-7: ⚠️ ~60% (legacy eliminado, polish pendiente)

---

## 10. PRECAUCIONES Y ERRORES COMUNES

### 10.1 ❌ NO HACER

```typescript
// ❌ NUNCA usar 'any'
const data: any = response;

// ❌ NUNCA usar @ts-ignore
// @ts-ignore
someFunction();

// ❌ NUNCA hardcodear colores
<div className="bg-[#030014]">

// ❌ NUNCA permitir scroll
<div className="overflow-y-auto">

// ❌ NUNCA crear componentes sin tests
export function NewComponent() { ... }

// ❌ NUNCA commitear sin verificar tipos
git commit -m "feat: add feature"  // sin yarn tsc primero

// ❌ NUNCA duplicar código
// Si ves código similar en 2 lugares, abstraelo
```

### 10.2 ✅ SÍ HACER

```typescript
// ✅ SIEMPRE tipos explícitos
const data: UserResponse = response;

// ✅ SIEMPRE usar CSS variables
<div className="bg-[var(--admin-bg)]">

// ✅ SIEMPRE 100vh sin scroll
<div className="h-screen overflow-hidden">

// ✅ SIEMPRE TDD
// 1. Escribir test que falla
// 2. Implementar código mínimo
// 3. Verificar que pasa
// 4. Refactorizar

// ✅ SIEMPRE validar con Zod
const validatedData = schema.parse(rawData);

// ✅ SIEMPRE commits atómicos
git commit -m "feat(lesson-engine): add hero intent"

// ✅ SIEMPRE buscar mejores prácticas antes de implementar
// (buscar en internet actualizaciones dic 2025/ene 2026)
```

### 10.3 Errores Comunes a Evitar

1. **Phaser en SSR**: Phaser usa `window`, hay que cargarlo dinámicamente

   ```typescript
   const Phaser = await import('phaser');
   ```

2. **Framer Motion layout thrashing**: Usar `layoutId` consistentes

3. **Mobile touch events**: Agregar `touch-action: none` a juegos

4. **Font loading**: Precargar fuentes antes de mostrar contenido

5. **Image optimization**: Usar Next.js Image, no `<img>` directo

6. **Memory leaks en Phaser**: Siempre `game.destroy(true)` en cleanup

7. **Z-index wars**: Usar escala consistente (modals: 50, dropdowns: 40, etc.)

---

## 11. METODOLOGÍA DE TRABAJO

### 11.1 Flujo de Desarrollo

```
1. DEFINIR
   - Leer este documento
   - Entender el intent/componente a construir
   - Identificar dependencias

2. AUDITAR
   - Revisar código existente relacionado
   - Buscar mejores prácticas 2025/2026 en internet
   - Identificar edge cases

3. TEST (que falla)
   - Escribir test del comportamiento esperado
   - Verificar que falla (red)

4. IMPLEMENTAR
   - Código mínimo para pasar el test
   - Seguir el patrón: Controller → Service → Facade → Query → Prisma
   - Para UI: Hook → Primitive → Composition

5. VERIFICAR
   - Test pasa (green)
   - TypeScript sin errores
   - ESLint sin errores

6. SIGUIENTE
   - Commit atómico
   - Próximo item
```

### 11.2 Estructura de Commits

```
feat(package): descripción corta

- Detalle 1
- Detalle 2

Closes #123
```

Prefijos:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización sin cambio de comportamiento
- `test`: Solo tests
- `docs`: Solo documentación
- `chore`: Mantenimiento (deps, config)

### 11.3 Revisión de Código

Antes de dar por terminado un feature:

1. ¿Tiene tests?
2. ¿TypeScript compila sin errores?
3. ¿ESLint pasa sin warnings?
4. ¿Es responsive?
5. ¿No tiene scroll?
6. ¿Usa variables CSS, no colores hardcodeados?
7. ¿Tiene animaciones con Framer Motion?
8. ¿Está documentado si es complejo?

---

## 12. CHECKLIST DE CALIDAD

### 12.1 Para cada Intent

- [ ] Schema Zod definido en contracts
- [ ] Props tipadas correctamente
- [ ] Componente implementado con Framer Motion
- [ ] Responsive (mobile, tablet, desktop)
- [ ] No scroll (100vh máximo)
- [ ] Usa tokens de tema (house, area)
- [ ] Tiene animación de entrada
- [ ] Tests unitarios
- [ ] Documentación de uso

### 12.2 Para cada Game Template

- [ ] Schema de config definido en contracts
- [ ] Escena Phaser implementada
- [ ] Responsive (resize handling)
- [ ] Touch support
- [ ] Keyboard support
- [ ] Sistema de puntuación
- [ ] Feedback visual (partículas, sonidos)
- [ ] onComplete callback funciona
- [ ] onProgress callback funciona
- [ ] Tests básicos
- [ ] Ejemplo de config JSON

### 12.3 Para el Sistema Completo

- [ ] Todos los schemas validan correctamente
- [ ] LessonRenderer parsea JSON de ejemplo
- [ ] Minigames se embeben en slides
- [ ] PlanificacionWrapper integra juegos
- [ ] Arcade Zone funciona standalone
- [ ] Admin UI consistente (sin colores hardcodeados)
- [ ] Performance < 3s first paint
- [ ] Accessibility score > 90
- [ ] Mobile testing completado

---

_Documento de referencia para Claude Code - Mateatletas 2026_
