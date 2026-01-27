# Design Reference - Sandbox Editor

Referencia visual y tokens extraídos de `sandbox_refactorizado.pen` para el reemplazo del frontend.

## Estructura

```
design-reference/
├── docs/
│   └── COMPONENTS.md      # Documentación detallada de cada componente
├── tokens/
│   ├── design-tokens.ts   # Tokens de diseño exportables
│   └── index.ts           # Exports
└── README.md              # Este archivo
```

## Pantallas Diseñadas

| Pantalla                 | Descripción                                           |
| ------------------------ | ----------------------------------------------------- |
| 1. Selector de Tipo      | Elegir entre Micro-lección o Planificación            |
| 2a. Config Micro-lección | Estructura Intro → Contenido → Cierre                 |
| 2b. Config Planificación | Selector de cantidad de clases                        |
| 3. Editor Principal      | Layout completo con sidebar, JSON editor, preview     |
| 4-9. Estados             | Tooltip, Error, Shortcuts, Onboarding, Focus, Loading |
| 10. Vista Estudiante     | Preview fullscreen para estudiantes                   |
| 11-12. Intent Selection  | Selección de intents desde la library                 |

## Design System

### Estilo Visual

**Dark Glassmorphism Gaming Premium**

- Inspiración: PS5 UI, Apple Liquid Glass, Microsoft Fluent Design

### Colores Principales

| Token              | Valor     | Uso                |
| ------------------ | --------- | ------------------ |
| `--bg-deep`        | `#08080c` | Fondo más profundo |
| `--bg-canvas`      | `#0c0c12` | Fondo del canvas   |
| `--bg-elevated`    | `#1c1c28` | Cards, modals      |
| `--accent-violet`  | `#8b5cf6` | Acento principal   |
| `--accent-cyan`    | `#06b6d4` | Acento secundario  |
| `--text-primary`   | `#ffffff` | Texto principal    |
| `--text-secondary` | `#a0a0b8` | Texto secundario   |

### Efectos Glass

```css
/* Card estándar */
background: rgba(26, 26, 36, 0.25);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.36);
```

### Background Glows

Todas las pantallas tienen dos ellipses con gradientes radiales:

- **Violet**: esquina superior izquierda (#8b5cf6, 7% opacity)
- **Cyan**: esquina inferior derecha (#06b6d4, 6% opacity)

## Uso

```tsx
import { colors, glassEffects, spacing } from './design-reference/tokens';

// Ejemplo de uso
const cardStyle = {
  background: glassEffects.card.background,
  backdropFilter: `blur(${glassEffects.card.backdropBlur})`,
  border: `1px solid ${glassEffects.card.border}`,
  boxShadow: glassEffects.card.shadow,
  borderRadius: sizing.radius.lg,
  padding: spacing.lg,
};
```

## Archivo Fuente

El diseño original está en:

```
/home/alexis/Documentos/diseños-pencil/sandbox_refactorizado.pen
```

Para ver los screenshots, abrir el archivo .pen en Pencil o consultar la documentación en `docs/COMPONENTS.md`.
