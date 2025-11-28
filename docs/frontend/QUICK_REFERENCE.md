# Quick Reference - Mateatletas Design System

> Referencia rápida para construcción de páginas. Versión para imprimir/tener abierta.

---

## 🎨 Regla de Oro: 95% Emerald / 5% Orange

```
✅ Emerald (95%):
   - Todos los bordes
   - Todos los iconos (excepto dentro de CTAs)
   - Todos los links secundarios
   - Todos los badges
   - Todos los highlights
   - Gradientes de texto destacado

✅ Orange (5%):
   - SOLO botones de CTA principal
   - "Solicitar Información"
   - "Ingresar al Portal"
   - "Comenzar"
   - Máximo 1-2 botones orange por pantalla

❌ NUNCA usar orange en:
   - Botones secundarios
   - Iconos
   - Badges
   - Links
   - Borders
```

---

## 🏗️ Template Base de Página

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Terminal, ArrowRight } from 'lucide-react';

// [Copiar MagneticButton y FloatingParticle de DESIGN_SYSTEM_EVOLVED.md]

export default function Page() {
  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px),
                          linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px)`,
          backgroundSize: '64px 64px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        {[...Array(15)].map((_, i) => <FloatingParticle key={i} delay={i * 0.3} />)}
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-black/50 backdrop-blur-2xl">
        {/* ... */}
      </nav>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Tu contenido */}
      </div>
    </div>
  );
}
```

---

## 🎯 Componentes Copy-Paste

### Botón CTA Principal (Orange)

```typescript
<MagneticButton
  href="/action"
  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/30"
>
  <span>Acción Principal</span>
  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
</MagneticButton>
```

### Botón Secundario (Emerald)

```typescript
<MagneticButton
  href="/secondary"
  className="px-5 py-2 text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-500/10 transition-all border border-emerald-500/20 hover:border-emerald-400/40"
>
  Acción Secundaria
</MagneticButton>
```

### Input con Icono

```typescript
<div className="relative group">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <Mail className="w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
  </div>
  <input
    type="email"
    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
    placeholder="tu@email.com"
  />
</div>
```

### Glassmorphism Card

```typescript
<div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-emerald-500/10 overflow-hidden">
  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
  <div className="p-8 lg:p-12">
    {/* Contenido */}
  </div>
</div>
```

### Badge

```typescript
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
  <Sparkles className="w-4 h-4 text-emerald-400" />
  <span className="text-sm text-emerald-400 font-semibold">Badge Text</span>
</div>
```

### Feature Card

```typescript
<div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 transition-all group">
  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
    <Icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
  </div>
  <div>
    <h4 className="text-sm font-semibold text-white/90">Título</h4>
    <p className="text-xs text-white/50 mt-1">Descripción</p>
  </div>
</div>
```

---

## 📐 Tipografía Quick Guide

```typescript
// Hero H1
<h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
  Texto
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
    Destacado
  </span>
</h1>

// H2
<h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">

// Body
<p className="text-lg text-white/60 leading-relaxed">

// Small
<p className="text-sm text-white/60">

// Link
<Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
```

---

## 🎬 Animaciones Quick Guide

```typescript
// Entry left
<motion.div
  initial={{ opacity: 0, x: -30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
>

// Entry right
<motion.div
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
>

// Scale
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.2 }}
>

// Staggered list
{items.map((item, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.4 + i * 0.1 }}
  >

// Loading spinner
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
/>
```

---

## 🎨 Clases Tailwind Más Usadas

```
Backgrounds:
  bg-black
  bg-black/40
  bg-emerald-500/10
  bg-gradient-to-r from-emerald-500 to-teal-500

Borders:
  border border-white/[0.08]
  border-emerald-500/20
  rounded-xl (16px)
  rounded-2xl (24px)
  rounded-3xl (32px)

Text:
  text-white/90 (headings)
  text-white/60 (body)
  text-white/40 (secondary)
  text-emerald-400 (links, highlights)

Spacing:
  p-8 lg:p-12 (card padding)
  px-6 lg:px-8 (container padding)
  gap-4, gap-8, gap-16

Shadows:
  shadow-xl shadow-emerald-500/10
  shadow-lg shadow-orange-500/25

Backdrop:
  backdrop-blur-2xl
  backdrop-blur-xl
```

---

## ✅ Checklist Pre-Deploy

```
Visual:
□ Background negro + grid emerald
□ 15 floating particles
□ Radial spotlight pulsando
□ Nav con glassmorphism
□ 95% emerald / 5% orange
□ Orange SOLO en 1-2 CTAs principales

Code:
□ MagneticButton implementado
□ FloatingParticle en background
□ Framer Motion animations
□ Lucide icons (strokeWidth={2.5})
□ TypeScript sin errores
□ Sin console.logs

Responsive:
□ Mobile (< 768px)
□ Tablet (768px - 1024px)
□ Desktop (> 1024px)

Performance:
□ Images optimizadas
□ Lazy loading donde aplique
□ Transitions <= 800ms
```

---

## ⚠️ NO HACER

```
❌ Orange en botones secundarios
❌ Más de 2 botones orange por pantalla
❌ Tech buzzwords ("revolucionario", "disruptivo")
❌ Palabra "gratis"
❌ Animaciones > 1s
❌ Sections > 100vh
❌ Carrusels automáticos
❌ Fondos de colores brillantes
❌ Más de 3 colores primarios
```

---

## 📦 Imports Estándar

```typescript
// React
import { useState, useEffect, useRef } from 'react';

// Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Framer Motion
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Icons
import {
  Terminal,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  Code2,
  Brain,
  User,
  GraduationCap,
} from 'lucide-react';
```

---

## 🚀 Para Empezar Nueva Página

1. Copia el template base de este archivo
2. Agrega tus imports específicos
3. Implementa MagneticButton y FloatingParticle
4. Crea tu contenido usando los componentes copy-paste
5. Verifica checklist pre-deploy
6. Test en mobile, tablet, desktop

---

**Referencias Completas**: Ver [DESIGN_SYSTEM_EVOLVED.md](./DESIGN_SYSTEM_EVOLVED.md)
**CSS Utilities**: Ver [design-system.css](./design-system.css)
**Ejemplos**: `/apps/web/src/app/page.tsx` y `/apps/web/src/app/login/page.tsx`
