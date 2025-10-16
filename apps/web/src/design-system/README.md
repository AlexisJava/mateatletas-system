# 🎨 Mateatletas Design System

Sistema de diseño multi-tema con identidades únicas por sección pero principios compartidos.

---

## 🌈 Filosofía

**Consistencia en principios, variedad en colores**

Todos los portales comparten:
- ✅ Glass-morphism (backdrop-blur + transparencia)
- ✅ Bordes redondeados (rounded-xl, rounded-2xl, rounded-3xl)
- ✅ Grids perfectamente simétricos (Material UI Grid)
- ✅ Animaciones sutiles con Framer Motion
- ✅ Hover effects consistentes

Pero cada portal tiene su propia paleta de colores:
- 🟣 **Estudiante**: Purple-Pink-Orange (energía, diversión)
- 🔵 **Tutor**: Blue-Cyan-Teal (profesional, confiable)
- 🟢 **Docente**: Green-Emerald-Lime (educación, crecimiento)
- 🔴 **Admin**: Red-Orange-Amber (poder, control)
- 🌌 **Landing**: Blue-Purple-Green (acogedor, innovador)

---

## 📦 Componentes Disponibles

### 1. `<GradientCard>`

Tarjeta universal con variantes temáticas.

```tsx
import { GradientCard } from '@/design-system/components';

// Tarjeta con glass-morphism
<GradientCard variant="glass">
  <h3>Título</h3>
  <p>Contenido</p>
</GradientCard>

// Tarjeta destacada con gradiente sólido
<GradientCard variant="solid">
  <h3>Destacado</h3>
</GradientCard>

// Tarjeta clickeable con animación
<GradientCard onClick={handleClick} animate>
  <p>Click me!</p>
</GradientCard>
```

**Props:**
- `variant`: `'default' | 'glass' | 'solid'` (default: `'glass'`)
- `animate`: boolean (default: `true`)
- `onClick`: Función opcional
- `className`: Clases adicionales

---

### 2. `<GradientButton>`

Botón con gradientes temáticos.

```tsx
import { GradientButton } from '@/design-system/components';

// Botón primario con gradiente
<GradientButton onClick={handleClick}>
  Acción Principal
</GradientButton>

// Botón outline
<GradientButton variant="outline" size="lg">
  Secundario
</GradientButton>

// Botón ghost
<GradientButton variant="ghost" fullWidth>
  Terciario
</GradientButton>
```

**Props:**
- `variant`: `'gradient' | 'outline' | 'ghost'` (default: `'gradient'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `fullWidth`: boolean
- `type`: `'button' | 'submit' | 'reset'`
- `disabled`: boolean

---

### 3. `<PageLayout>`

Layout universal con fondo temático y header.

```tsx
import { PageLayout } from '@/design-system/components';
import { GradientButton } from '@/design-system/components';

<PageLayout
  title="Dashboard"
  subtitle="Bienvenido a tu espacio"
  action={<GradientButton>Nueva Acción</GradientButton>}
>
  <GradientCard>Contenido de la página</GradientCard>
</PageLayout>
```

**Props:**
- `title`: Título principal (opcional)
- `subtitle`: Subtítulo (opcional)
- `action`: Acción en el header (opcional)
- `children`: Contenido

---

### 4. `<StatCard>`

Tarjeta de estadística con animación.

```tsx
import { StatCard } from '@/design-system/components';
import { Trophy, Target, Clock } from 'lucide-react';

<StatCard
  title="Puntos Totales"
  value={1250}
  icon={Trophy}
  subtitle="Nivel 5"
  animateValue
  trend={{ value: 15, isPositive: true }}
/>
```

**Props:**
- `title`: Título de la estadística
- `value`: Valor (number o string)
- `icon`: Icono de lucide-react (opcional)
- `subtitle`: Subtítulo (opcional)
- `trend`: Objeto `{ value: number, isPositive: boolean }` (opcional)
- `animateValue`: boolean (anima CountUp)
- `delay`: number (delay de animación)

---

### 5. `<ProgressBar>`

Barra de progreso con gradiente temático.

```tsx
import { ProgressBar } from '@/design-system/components';

<ProgressBar
  value={75}
  label="Nivel 5"
  showPercentage
  height="lg"
  animated
/>
```

**Props:**
- `value`: 0-100
- `label`: Etiqueta (opcional)
- `showPercentage`: boolean
- `height`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `animated`: boolean (default: `true`)

---

## 🎨 Temas

### Usar tema actual (automático por ruta)

```tsx
import { useCurrentTheme } from '@/design-system/themes';

function MyComponent() {
  const theme = useCurrentTheme(); // Detecta automáticamente

  return (
    <div className={theme.gradientBg}>
      <div className={theme.glassBg}>
        Contenido con tema actual
      </div>
    </div>
  );
}
```

### Usar tema específico

```tsx
import { getTheme } from '@/design-system/themes';

const theme = getTheme('estudiante');

<div className={theme.gradientCard}>
  Tarjeta con tema estudiante
</div>
```

### Estructura de un tema

```typescript
interface ThemeColors {
  // Colores primarios
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;

  // Gradientes predefinidos
  gradientBg: string;      // Background principal
  gradientCard: string;    // Tarjetas destacadas
  gradientButton: string;  // Botones CTA

  // Glass-morphism
  glassBg: string;
  glassBorder: string;
  glassHover: string;

  // Estados
  success: string;
  warning: string;
  error: string;
  info: string;
}
```

---

## 📐 Grid System

Usar Material UI Grid para layouts perfectos:

```tsx
import { Grid2 as Grid } from '@mui/material';
import { GradientCard } from '@/design-system/components';

<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
    <GradientCard>Card 1</GradientCard>
  </Grid>
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
    <GradientCard>Card 2</GradientCard>
  </Grid>
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
    <GradientCard>Card 3</GradientCard>
  </Grid>
</Grid>
```

---

## 🎭 Animaciones

Todas las animaciones usan Framer Motion:

```tsx
import { motion } from 'framer-motion';

// Fade in desde abajo
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Contenido
</motion.div>

// Hover scale
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Clickeable
</motion.div>

// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  <motion.div variants={{ hidden: { y: 20 }, visible: { y: 0 } }}>Item 1</motion.div>
  <motion.div variants={{ hidden: { y: 20 }, visible: { y: 0 } }}>Item 2</motion.div>
</motion.div>
```

---

## 🚀 Ejemplos Completos

### Portal Estudiante (Purple-Pink-Orange)

```tsx
import { PageLayout, StatCard, GradientCard, ProgressBar } from '@/design-system/components';
import { Trophy, Target, Zap } from 'lucide-react';
import { Grid2 as Grid } from '@mui/material';

export default function EstudianteDashboard() {
  return (
    <PageLayout title="Mi Dashboard" subtitle="¡Sigue aprendiendo!">
      <Grid container spacing={3}>
        {/* Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Puntos" value={1250} icon={Trophy} animateValue />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Clases" value={8} icon={Target} animateValue />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Racha" value="5 días" icon={Zap} />
        </Grid>

        {/* Progress */}
        <Grid size={{ xs: 12 }}>
          <GradientCard>
            <h3 className="text-xl font-bold mb-4">Progreso Nivel 5</h3>
            <ProgressBar value={75} showPercentage animated />
          </GradientCard>
        </Grid>
      </Grid>
    </PageLayout>
  );
}
```

### Portal Tutor (Blue-Cyan-Teal)

```tsx
import { PageLayout, GradientCard, GradientButton } from '@/design-system/components';
import { Grid2 as Grid } from '@mui/material';

export default function TutorDashboard() {
  return (
    <PageLayout
      title="Panel de Control"
      subtitle="Administra a tus estudiantes"
      action={<GradientButton>Nuevo Estudiante</GradientButton>}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GradientCard variant="glass">
            <h3 className="text-xl font-bold mb-2">Mis Hijos</h3>
            <p className="text-white/70">3 estudiantes activos</p>
          </GradientCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GradientCard variant="glass">
            <h3 className="text-xl font-bold mb-2">Próximas Clases</h3>
            <p className="text-white/70">5 clases programadas</p>
          </GradientCard>
        </Grid>
      </Grid>
    </PageLayout>
  );
}
```

---

## 📝 Notas de Uso

1. **Importar desde barrel export**: Siempre usar `@/design-system/components` para componentes
2. **Tema automático**: `useCurrentTheme()` detecta automáticamente basado en la ruta
3. **Responsive**: Usar Grid de Material UI con `size={{ xs, md, lg }}`
4. **Animaciones**: Casi todos los componentes tienen `animate` prop
5. **Consistencia**: Usar los componentes del design system en lugar de crear custom

---

## 🔧 Tecnologías

- **React 19** + **Next.js 15**
- **Material UI 7** (Grid system)
- **Tailwind CSS 4** (utility classes)
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **TypeScript 5** (type safety)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
