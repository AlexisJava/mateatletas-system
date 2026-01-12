# Portal Estudiante - Design System

> **Fuente de verdad** para el diseño visual del Portal Estudiante de Mateatletas.
> Última actualización: 2026-01-12

## 1. Contexto y Audiencia

El Portal Estudiante está diseñado para **niños y adolescentes de 6-17 años** divididos en tres "casas":

| Casa        | Rango de Edad | Personalidad                      | Colores       |
| ----------- | ------------- | --------------------------------- | ------------- |
| **Quantum** | 6-9 años      | Amigable, cálido, divertido       | Rosa/Pink     |
| **Vertex**  | 10-12 años    | Tech, energético, curioso         | Azul/Blue     |
| **Pulsar**  | 13-17 años    | Maduro, profesional, aspiracional | Verde/Emerald |

## 2. Colores Base (Nunca Cambian)

Estos colores son **constantes** independientemente de la casa del estudiante:

```css
/* Fondo principal - Deep Space */
--estudiante-bg: #030014;

/* Superficies con glassmorphism */
--estudiante-bg-card: rgba(15, 7, 32, 0.6);
--estudiante-bg-surface: rgba(30, 27, 75, 0.5);

/* Bordes sutiles */
--estudiante-border: rgba(255, 255, 255, 0.05);
--estudiante-border-accent: rgba(255, 255, 255, 0.1);

/* BIT Mascota - ojos siempre cyan */
--bit-eyes: #06b6d4;
```

## 3. Colores por Casa (Dinámicos)

Los colores de la casa se inyectan dinámicamente según el estudiante logueado:

### Quantum (6-9 años) - Pink

```css
--house-primary: #f472b6; /* Pink-400 */
--house-secondary: #ec4899; /* Pink-500 */
--house-accent: #fbcfe8; /* Pink-200 */
```

### Vertex (10-12 años) - Blue

```css
--house-primary: #60a5fa; /* Blue-400 */
--house-secondary: #3b82f6; /* Blue-500 */
--house-accent: #bfdbfe; /* Blue-200 */
```

### Pulsar (13-17 años) - Emerald

```css
--house-primary: #34d399; /* Emerald-400 */
--house-secondary: #10b981; /* Emerald-500 */
--house-accent: #a7f3d0; /* Emerald-200 */
```

## 4. Texto

Escala de texto basada en Tailwind slate:

| Variable                      | Color               | Uso                         |
| ----------------------------- | ------------------- | --------------------------- |
| `--estudiante-text-primary`   | #f1f5f9 (slate-100) | Títulos, texto principal    |
| `--estudiante-text-secondary` | #e2e8f0 (slate-200) | Subtítulos, texto destacado |
| `--estudiante-text-tertiary`  | #cbd5e1 (slate-300) | Texto normal                |
| `--estudiante-text-muted`     | #94a3b8 (slate-400) | Texto secundario, labels    |
| `--estudiante-text-subtle`    | #64748b (slate-500) | Texto deshabilitado, hints  |

## 5. Gamificación

Colores para el sistema de gamificación:

```css
--color-xp: #fbbf24; /* Amber - XP y monedas */
--color-streak: #f97316; /* Orange - Rachas */
--color-achievement: #a855f7; /* Purple - Logros */
```

## 6. Feedback

Colores para respuestas correctas/incorrectas:

```css
--color-correct: #22c55e; /* Green */
--color-incorrect: #ef4444; /* Red */
```

## 7. Tipografía

| Contexto | Fuente         | CSS Variable     |
| -------- | -------------- | ---------------- |
| Headings | Outfit         | `--font-heading` |
| Body     | Nunito         | `--font-nunito`  |
| Code     | JetBrains Mono | `--font-mono`    |

## 8. Componentes Principales

### Card (Glassmorphism)

```tsx
<div className="
  bg-[var(--estudiante-bg-card)]
  backdrop-blur-xl
  border border-[var(--estudiante-border)]
  rounded-2xl
  p-6
">
```

### Botón Primario (House-themed)

```tsx
<button className="
  bg-[var(--house-primary)]
  hover:bg-[var(--house-secondary)]
  text-white
  font-semibold
  rounded-xl
  px-6 py-3
  transition-all
">
```

### BIT Mascota

- Cuerpo: Gradiente de `--house-primary` a `--house-secondary`
- Ojos: Siempre `--bit-eyes` (#06b6d4 cyan)
- Expresiones: Animadas con Framer Motion

## 9. Principios de Diseño

### Obligatorio (Nunca Cambiar)

- Fondo base: `#030014`
- Ojos de BIT: `#06b6d4`
- Colores de houses según la tabla de arriba
- Efectos glassmorphism en cards

### Flexible (Se Puede Ajustar)

- Tamaños de bordes redondeados
- Intensidad de blur en cards
- Duración de animaciones
- Espaciado interno de componentes

## 10. Archivos de Referencia

| Archivo                                                    | Propósito                  |
| ---------------------------------------------------------- | -------------------------- |
| `packages/ui/src/tokens/colors.ts`                         | Tokens de colores y houses |
| `apps/web/src/app/globals.css`                             | Variables CSS globales     |
| `apps/web/src/components/lesson-renderer/DesignSystem.tsx` | Componentes de lección     |

## 11. Cómo Inyectar Colores de Casa

```tsx
import { houseToCSS } from '@mateatletas/ui/tokens/colors';

function StudentLayout({ house, children }) {
  const cssVars = houseToCSS(house);

  return <div style={cssVars}>{children}</div>;
}
```

## 12. Migración de Colores Hardcodeados

Si encuentras colores hardcodeados en el código, reemplázalos:

| Hardcoded              | Reemplazar con              |
| ---------------------- | --------------------------- |
| `bg-[#030014]`         | `bg-[var(--estudiante-bg)]` |
| `#fbbf24` (XP)         | `var(--color-xp)`           |
| `#06b6d4` (ojos)       | `var(--bit-eyes)`           |
| `rgba(15, 7, 32, 0.6)` | `var(--estudiante-bg-card)` |

---

**Mantenido por**: Equipo Frontend Mateatletas
**Última revisión**: 2026-01-12
