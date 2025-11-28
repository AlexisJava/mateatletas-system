# Frontend Documentation - Mateatletas

Documentación completa del sistema de diseño y construcción frontend para Mateatletas.

## 📚 Índice de Documentos

### 1. [DESIGN_SYSTEM_EVOLVED.md](./DESIGN_SYSTEM_EVOLVED.md)

**Guía completa del Design System v2.0**

Incluye:

- 🎨 Paleta de colores (Emerald/Orange 95/5)
- 🏗️ Componentes base reutilizables (MagneticButton, FloatingParticle, AnimatedCounter)
- 🎭 Patrones de layout (Split-screen, Glassmorphism, Backgrounds)
- 📝 Sistema de inputs y forms
- 🎬 Animaciones con Framer Motion
- 📐 Sistema de tipografía
- 🎯 Badges, cards y elementos UI
- ✅ Checklist de construcción
- 🚀 Quick start template

**Cuándo usar**: Antes de empezar cualquier página nueva. Es tu referencia principal.

---

### 2. [design-system.css](./design-system.css)

**CSS con variables y utility classes**

Incluye:

- CSS Custom Properties (variables)
- Utility classes listas para usar
- Glassmorphism presets
- Botones, inputs, badges predefinidos
- Animaciones CSS
- Grid layouts
- Responsive utilities
- Accesibilidad

**Cuándo usar**: Importa este archivo en tu proyecto para tener acceso inmediato a todas las clases del design system.

---

## 🎨 Design System Overview

### Paleta de Colores (Regla 95/5)

```
Emerald/Teal: 95% del diseño
├── Bordes, iconos, links
├── Gradientes de texto destacado
├── Backgrounds sutiles
└── Estados hover/focus

Orange: 5% del diseño (SOLO CTAs)
└── Botones principales de acción
```

### Stack Tecnológico

- **Framework**: Next.js 15.5.4 con Turbopack
- **Styling**: Tailwind CSS + CSS Variables
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **TypeScript**: Para type safety

---

## 🚀 Quick Start

### 1. Crear una nueva página

```bash
# Copia el template desde DESIGN_SYSTEM_EVOLVED.md
# Sección: "Quick Start Template"
```

### 2. Importar el CSS

```typescript
// En tu layout.tsx o _app.tsx
import '@/docs/frontend/design-system.css';
```

### 3. Usar componentes base

```typescript
// Copiar MagneticButton, FloatingParticle desde DESIGN_SYSTEM_EVOLVED.md
// O crear un archivo /components/ui/index.ts con todos los componentes
```

---

## ✅ Checklist Antes de Crear Nueva Página

### Visual

- [ ] Background negro con grid pattern emerald
- [ ] Floating particles (15 partículas)
- [ ] Radial gradient spotlight con pulse
- [ ] Navigation bar con glassmorphism
- [ ] Ratio 95% emerald / 5% orange
- [ ] Orange SOLO en CTA principal

### Componentes

- [ ] MagneticButton implementado
- [ ] FloatingParticle en background
- [ ] Glassmorphism cards con border glow
- [ ] Iconos de lucide-react

### Animaciones

- [ ] Entry animations (fade + slide)
- [ ] Hover states en elementos interactivos
- [ ] Loading states con spinner
- [ ] Transitions suaves (0.3s-0.8s)

### Responsive

- [ ] Mobile (< 768px) probado
- [ ] Tablet (768px - 1024px) probado
- [ ] Desktop (> 1024px) probado
- [ ] Grid layouts responsive

---

## 🎯 Componentes Esenciales

### MagneticButton

Botón con efecto magnético que sigue el cursor.

**Usos**:

- CTAs principales (orange)
- Botones secundarios (emerald)
- Navigation links

**Código**: Ver DESIGN_SYSTEM_EVOLVED.md sección "MagneticButton Component"

---

### FloatingParticle

Partículas animadas para backgrounds.

**Usos**:

- Todas las páginas (15 partículas)
- Efectos ambientales

**Código**: Ver DESIGN_SYSTEM_EVOLVED.md sección "FloatingParticle Component"

---

### AnimatedCounter

Contador animado con Intersection Observer.

**Usos**:

- Estadísticas
- Métricas
- Números destacados

**Código**: Ver DESIGN_SYSTEM_EVOLVED.md sección "AnimatedCounter Component"

---

## 📐 Layouts Recomendados

### 1. Split-Screen (Login, Auth, Features)

- Izquierda: Branding, info, features
- Derecha: Formulario, acción principal

### 2. Hero + Sections (Landing Pages)

- Hero con 2 columnas (texto + visual)
- Secciones apiladas
- CTAs estratégicos

### 3. Dashboard (Portal Interno)

- Sidebar navigation
- Main content area
- Cards con glassmorphism

---

## 🎨 Patrones de Uso

### Background Standard

Usa en TODAS las páginas:

```css
.bg-mateatletas
.bg-grid-emerald
.bg-spotlight-emerald
FloatingParticles (15x)
```

### Glassmorphism Card

Usa para: modales, forms, feature cards

```css
.glass-card
```

### Buttons

```css
.btn-cta-primary     /* Orange - Solo CTAs principales */
.btn-secondary       /* Emerald - Acciones secundarias */
.btn-link           /* Links destacados */
```

---

## ⚠️ Anti-Patterns (NO HACER)

### Colores

- ❌ Orange en más del 5% del diseño
- ❌ Múltiples colores primarios
- ❌ Fondos de colores brillantes

### Lenguaje

- ❌ "Gratis" en cualquier parte
- ❌ Tech buzzwords ("revolucionario", "disruptivo")
- ❌ Emojis excesivos

### Layout

- ❌ Sections de más de 100vh
- ❌ Más de 3 CTAs en misma pantalla
- ❌ Carrusels automáticos

### Animaciones

- ❌ Animaciones de más de 1s
- ❌ Demasiados elementos animados simultáneamente
- ❌ Parallax extremo

---

## 🔗 Referencias Externas

### Framer Motion

- Docs: https://www.framer.com/motion/
- Focus: motion.div, useMotionValue, useSpring

### Lucide React

- Docs: https://lucide.dev
- Uso: `strokeWidth={2}` o `strokeWidth={2.5}`

### Tailwind CSS

- Docs: https://tailwindcss.com
- Custom config ya configurado

---

## 📝 Ejemplos Completos

### Páginas de Referencia

1. **Landing Page**: `/apps/web/src/app/page.tsx`
   - Hero con terminal animado
   - Photon effect SVG
   - Floating cards rotados
   - Stats con AnimatedCounter

2. **Login Page**: `/apps/web/src/app/login/page.tsx`
   - Split-screen layout
   - Glassmorphism form
   - Toggle Tutor/Estudiante
   - Loading states

---

## 🚀 Comandos Útiles

```bash
# Iniciar dev server
npm run dev

# Build para producción
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📞 Soporte

Para preguntas o mejoras al design system:

1. Consulta primero DESIGN_SYSTEM_EVOLVED.md
2. Revisa las páginas de ejemplo
3. Abre un issue en el repo

---

**Última actualización**: Octubre 2025
**Versión del Design System**: 2.0 (Evolved)
**Status**: ✅ Production Ready
