# 🎨 SISTEMA DE DISEÑO RESPONSIVE LANDSCAPE - MATEATLETAS CLUB STEAM

## 📐 Filosofía del Diseño

**Premisa fundamental:** El Portal Estudiante está optimizado EXCLUSIVAMENTE para uso en **orientación horizontal (landscape)** en todos los dispositivos.

**Razón:** Maximizar el espacio horizontal para visualizar:
- Avatar 3D interactivo a tamaño completo
- Dashboard con múltiples tarjetas de información
- Navegación visual sin scroll excesivo
- Experiencia inmersiva tipo videojuego

---

## 🖥️ SISTEMA DE BREAKPOINTS LANDSCAPE

### Definición de Breakpoints

```typescript
// apps/web/src/lib/constants/responsive.ts
export const BREAKPOINTS = {
  // Mobile landscape (teléfonos horizontales)
  xs: { min: 480, max: 667, name: 'Mobile Landscape' },

  // Tablet landscape (tablets horizontales)
  md: { min: 768, max: 1024, name: 'Tablet Landscape' },

  // Desktop y laptops
  lg: { min: 1280, max: 1920, name: 'Desktop' },

  // Pantallas ultra-wide
  xl: { min: 1920, max: Infinity, name: 'Ultra-Wide' }
} as const;

// Ratios de aspecto objetivo
export const ASPECT_RATIOS = {
  mobile: '16:9',   // iPhone landscape, Android landscape
  tablet: '4:3',    // iPad landscape
  desktop: '16:10'  // Laptops estándar
} as const;
```

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        // Landscape-first breakpoints
        'landscape-xs': {
          raw: '(min-width: 480px) and (max-width: 667px) and (orientation: landscape)'
        },
        'landscape-sm': {
          raw: '(min-width: 668px) and (max-width: 767px) and (orientation: landscape)'
        },
        'landscape-md': {
          raw: '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)'
        },
        'landscape-lg': {
          raw: '(min-width: 1025px) and (max-width: 1279px) and (orientation: landscape)'
        },
        'landscape-xl': {
          raw: '(min-width: 1280px) and (orientation: landscape)'
        },

        // Shortcuts para mobile/tablet/desktop
        'mobile-l': { raw: '(max-width: 767px) and (orientation: landscape)' },
        'tablet-l': { raw: '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)' },
        'desktop': { min: '1025px' },
      },

      // Alturas viewport adaptativas
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
        'screen-header': 'calc(100vh - 8vh)',
      },

      // Anchos máximos por sección
      maxWidth: {
        'avatar-section': '500px',
        'info-section': '600px',
        'dashboard-card': '350px',
      }
    }
  }
}
```

---

## 🏗️ ARQUITECTURA DE LAYOUT POR BREAKPOINT

### 1. Mobile Landscape (480px - 667px)

**Objetivo:** Una columna vertical con scroll, navegación inferior compacta.

#### Layout Structure

```
┌─────────────────────────────────────────────────┐
│  HEADER (8vh)                                   │
│  Avatar | Nombre | Monedas + Racha             │
├─────────────────────────────────────────────────┤
│                                                 │
│  MAIN CONTENT (84vh - scrollable)              │
│  ┌───────────────────────────────────────┐     │
│  │  AVATAR 3D (30vh)                     │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │  NIVEL + XP BAR                       │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │  STATS (3 cols grid)                  │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │  PRÓXIMA CLASE                        │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │  CTA GIGANTE                          │     │
│  └───────────────────────────────────────┘     │
│                                                 │
├─────────────────────────────────────────────────┤
│  BOTTOM NAV (8vh)                               │
│  Recursos | Logo | Menú                         │
└─────────────────────────────────────────────────┘
```

#### Características Clave

- **Header compacto:** 8vh de altura
- **Navegación inferior tipo dock:** 1 botón MENÚ central
- **Avatar 3D:** Reducido a 30vh, centrado
- **Grid de stats:** 3 columnas compactas (gap-2)
- **Scroll vertical:** Activado solo si el contenido excede viewport
- **Tipografía escalada:** `text-sm` → `text-base`

#### Código de Ejemplo

```tsx
// HubView.tsx - Mobile Landscape Variant
<div className="mobile-l:flex-col mobile-l:h-screen mobile-l:overflow-y-auto">
  {/* Header */}
  <header className="mobile-l:h-[8vh] mobile-l:px-3">
    <div className="mobile-l:flex mobile-l:items-center mobile-l:gap-2">
      {/* Avatar pequeño + nombre compacto */}
      <div className="mobile-l:w-8 mobile-l:h-8">...</div>

      {/* Recursos en la derecha */}
      <div className="mobile-l:ml-auto mobile-l:flex mobile-l:gap-1">
        <ResourcePill icon={<Coins />} value={monedas} />
        <ResourcePill icon={<Flame />} value={racha_dias} />
      </div>
    </div>
  </header>

  {/* Main Content - Scrollable */}
  <main className="mobile-l:flex-1 mobile-l:overflow-y-auto mobile-l:px-4 mobile-l:py-4">
    {/* Avatar 3D - Compacto */}
    <div className="mobile-l:h-[30vh] mobile-l:mb-4">
      <AnimatedAvatar3D
        scale={0.9}
        cameraPosition={[0, 0.5, 2.2]}
      />
    </div>

    {/* Nivel + XP */}
    <div className="mobile-l:mb-4">
      <NivelBadge nivel={estudiante.nivel_actual} />
      <XPBar progress={porcentajeProgresoNivel} />
    </div>

    {/* Stats - 3 columnas compactas */}
    <div className="mobile-l:grid mobile-l:grid-cols-3 mobile-l:gap-2 mobile-l:mb-4">
      <StatCard label="RACHA" value={`${racha_dias}d`} />
      <StatCard label="LOGROS" value="12/50" />
      <StatCard label="ÁLGEBRA" value="85%" />
    </div>

    {/* Próxima Clase */}
    {proximaClase && (
      <div className="mobile-l:mb-4">
        <ProximaClaseCard clase={proximaClase} />
      </div>
    )}

    {/* CTA Gigante */}
    <button className="mobile-l:w-full mobile-l:h-16 mobile-l:text-2xl">
      ¡ENTRENAR MATEMÁTICAS!
    </button>
  </main>

  {/* Bottom Navigation */}
  <nav className="mobile-l:h-[8vh] mobile-l:flex mobile-l:items-center mobile-l:justify-between mobile-l:px-4">
    {/* Recursos izquierda */}
    <div className="mobile-l:flex mobile-l:gap-2">
      <ResourcePill icon={<Coins />} value={monedas} />
      <ResourcePill icon={<Flame />} value={racha_dias} />
    </div>

    {/* Logo centro (oculto en muy pequeño) */}
    <div className="mobile-l:hidden landscape-sm:block">
      <span>Mateatletas STEAM</span>
    </div>

    {/* Menú derecha */}
    <button className="mobile-l:bg-gradient-to-r mobile-l:from-cyan-500 mobile-l:to-purple-600">
      <Menu /> MENÚ
    </button>
  </nav>
</div>
```

---

### 2. Tablet Landscape (768px - 1024px)

**Objetivo:** Dos columnas (Avatar | Info), sidebar lateral opcional.

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (10vh)                                          │
│  Avatar | Nombre | LOGO CENTRO | Monedas + Racha       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MAIN CONTENT (80vh)                                    │
│  ┌──────────────────────┬──────────────────────┐       │
│  │                      │                      │       │
│  │  AVATAR 3D          │  NIVEL + XP          │       │
│  │  (50% ancho)        │                      │       │
│  │                      │  STATS (3 cols)      │       │
│  │  Resplandor animado │                      │       │
│  │  Clickeable         │  PRÓXIMA CLASE       │       │
│  │                      │                      │       │
│  │                      │  CTA GIGANTE         │       │
│  │                      │                      │       │
│  └──────────────────────┴──────────────────────┘       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  BOTTOM NAV (10vh) - SOLO EN TABLET                     │
│  Menú | Recursos | Notificaciones                       │
└─────────────────────────────────────────────────────────┘
```

#### Características Clave

- **Header más espacioso:** 10vh
- **Layout 50/50:** Avatar izquierda, Info derecha
- **Sin scroll:** Todo el contenido visible en viewport
- **Navegación inferior:** Dock bar con 3-5 botones principales
- **Sidebar opcional:** Se puede activar con swipe desde la izquierda
- **Tipografía escalada:** `text-base` → `text-lg`

#### Código de Ejemplo

```tsx
// HubView.tsx - Tablet Landscape Variant
<div className="tablet-l:h-screen tablet-l:flex tablet-l:flex-col">
  {/* Header */}
  <header className="tablet-l:h-[10vh] tablet-l:px-6 tablet-l:flex tablet-l:items-center">
    {/* Avatar + Nombre */}
    <div className="tablet-l:flex tablet-l:items-center tablet-l:gap-3">
      <div className="tablet-l:w-12 tablet-l:h-12">...</div>
      <div>
        <div className="tablet-l:text-base">{estudiante.nombre}</div>
        <div className="tablet-l:text-xs">Nivel {nivelCalculado}</div>
      </div>
    </div>

    {/* Logo Centro */}
    <div className="tablet-l:absolute tablet-l:left-1/2 tablet-l:-translate-x-1/2">
      <span className="tablet-l:text-2xl">Mateatletas Club STEAM</span>
    </div>

    {/* Recursos Derecha */}
    <div className="tablet-l:ml-auto tablet-l:flex tablet-l:gap-2">
      <ResourcePill icon={<Coins />} value={monedas} />
      <ResourcePill icon={<Flame />} value={racha_dias} />
    </div>
  </header>

  {/* Main Content - 50/50 Split */}
  <main className="tablet-l:flex-1 tablet-l:flex tablet-l:items-center tablet-l:px-8">
    <div className="tablet-l:flex tablet-l:w-full tablet-l:gap-8 tablet-l:h-full">

      {/* Columna Izquierda - AVATAR */}
      <div className="tablet-l:w-1/2 tablet-l:relative tablet-l:flex tablet-l:items-center tablet-l:justify-center">
        <AnimatedAvatar3D
          width="100%"
          height="100%"
          scale={1.1}
          cameraPosition={[0, 0.6, 2.4]}
        />
      </div>

      {/* Columna Derecha - INFO */}
      <div className="tablet-l:w-1/2 tablet-l:flex tablet-l:flex-col tablet-l:justify-center tablet-l:gap-6">
        {/* Nivel Badge */}
        <div className="tablet-l:flex tablet-l:justify-center">
          <NivelBadge nivel={estudiante.nivel_actual} size="lg" />
        </div>

        {/* XP Bar */}
        <XPBar progress={porcentajeProgresoNivel} />

        {/* Stats - 3 columnas */}
        <div className="tablet-l:grid tablet-l:grid-cols-3 tablet-l:gap-4">
          <StatCard icon={<Zap />} value={`${racha_dias} días`} label="RACHA" />
          <StatCard icon={<Trophy />} value="12/50" label="LOGROS" />
          <StatCard icon={<Target />} value="85%" label="ÁLGEBRA" />
        </div>

        {/* Próxima Clase */}
        {proximaClase && (
          <ProximaClaseCard clase={proximaClase} />
        )}

        {/* CTA Gigante */}
        <button className="tablet-l:w-full tablet-l:h-20 tablet-l:text-3xl">
          ¡ENTRENAR MATEMÁTICAS!
        </button>
      </div>

    </div>
  </main>

  {/* Bottom Navigation - Dock Bar */}
  <nav className="tablet-l:h-[10vh] tablet-l:flex tablet-l:items-center tablet-l:justify-center tablet-l:gap-6">
    <NavButtonDock icon={<Home />} label="HUB" />
    <NavButtonDock icon={<Brain />} label="ENTRENAR" badge={3} />
    <NavButtonDock icon={<Trophy />} label="LOGROS" />
    <NavButtonDock icon={<ShoppingBag />} label="TIENDA" />
    <NavButtonDock icon={<Menu />} label="MENÚ" />
  </nav>
</div>
```

---

### 3. Desktop (1280px+)

**Objetivo:** Navegación lateral fija, dashboard completo, sin scroll.

#### Layout Structure

```
┌────┬────────────────────────────────────────────────────┬────┐
│    │  HEADER (10vh)                                     │    │
│    │  Avatar | LOGO CENTRO | Monedas + Racha            │    │
│ N  ├────────────────────────────────────────────────────┤  N │
│ A  │                                                     │  A │
│ V  │  MAIN CONTENT (80vh)                               │  V │
│    │  ┌──────────────────────┬──────────────────────┐  │    │
│ L  │  │                      │                      │  │  R │
│ E  │  │  AVATAR 3D          │  NIVEL + XP          │  │  I │
│ F  │  │  (50% ancho)        │                      │  │  G │
│ T  │  │                      │  STATS (3 cols)      │  │  H │
│    │  │  Resplandor animado │                      │  │  T │
│    │  │  Clickeable         │  PRÓXIMA CLASE       │  │    │
│ 5  │  │                      │                      │  │  5 │
│    │  │                      │  CTA GIGANTE         │  │    │
│ B  │  │                      │                      │  │  B │
│ T  │  └──────────────────────┴──────────────────────┘  │  T │
│ N  │                                                     │  N │
│ S  │                                                     │  S │
│    │                                                     │    │
└────┴────────────────────────────────────────────────────┴────┘
```

#### Características Clave

- **Navegación lateral fija:** Botones verticales grandes con tooltips
- **Layout 50/50:** Avatar izquierda, Info derecha
- **Sin scroll:** Todo visible en viewport
- **Sidebar izquierda:** 5 botones principales (HUB, Entrenamientos, Tareas, Logros, Tienda)
- **Sidebar derecha:** 5 botones secundarios (Animaciones, Mi Grupo, Progreso, Notificaciones, Salir)
- **Header espacioso:** Logo central grande
- **Tipografía escalada:** `text-lg` → `text-xl`

#### Código Actual (ya implementado)

```tsx
// HubView.tsx - Desktop Layout (YA IMPLEMENTADO)
<div className="relative w-full h-screen overflow-hidden">
  {/* NAVEGACIÓN LATERAL IZQUIERDA - SOLO DESKTOP */}
  <nav className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
    {NAV_LEFT.map((item) => (
      <NavButtonUltra item={item} isActive={activeView === item.id} onClick={...} />
    ))}
  </nav>

  {/* NAVEGACIÓN LATERAL DERECHA - SOLO DESKTOP */}
  <nav className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
    {NAV_RIGHT.map((item) => (
      <NavButtonUltra item={item} isActive={activeView === item.id} onClick={...} />
    ))}
  </nav>

  {/* HEADER */}
  <header className="lg:h-[10vh] lg:px-8 flex items-center justify-between">
    {/* Avatar + Nombre */}
    <div className="lg:flex lg:items-center lg:gap-3">...</div>

    {/* Logo Centro */}
    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
      <span className="lg:text-4xl">Mateatletas Club STEAM</span>
    </div>

    {/* Recursos Derecha */}
    <div className="lg:flex lg:gap-2">...</div>
  </header>

  {/* MAIN CONTENT - 50/50 Split */}
  <div className="flex-1 flex items-center justify-center lg:px-32 lg:py-8">
    <div className="w-full max-w-7xl flex lg:flex-row gap-8 h-full">
      {/* Columna Izquierda - AVATAR */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center">
        <AnimatedAvatar3D ... />
      </div>

      {/* Columna Derecha - INFO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center gap-8">
        <NivelBadge ... />
        <XPBar ... />
        <StatsGrid ... />
        <ProximaClaseCard ... />
        <CTAButton ... />
      </div>
    </div>
  </div>
</div>
```

---

## 🧩 COMPONENTES ADAPTATIVOS

### 1. NavButton - Navegación Responsiva

```tsx
// components/NavButton.tsx
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
  variant: 'sidebar' | 'dock' | 'menu';
}

export function NavButton({ icon, label, badge, onClick, variant }: NavButtonProps) {
  // SIDEBAR (Desktop - lateral)
  if (variant === 'sidebar') {
    return (
      <motion.button
        whileHover={{ scale: 1.15 }}
        onClick={onClick}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center relative"
      >
        {icon}
        {badge && <Badge count={badge} position="top-right" />}
      </motion.button>
    );
  }

  // DOCK (Tablet - bottom bar)
  if (variant === 'dock') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="flex flex-col items-center gap-1 px-4 py-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-bold">{label}</span>
        {badge && <Badge count={badge} position="top-right" size="sm" />}
      </motion.button>
    );
  }

  // MENU (Mobile - modal full-screen)
  if (variant === 'menu') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r hover:scale-105 transition-all"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <div className="text-lg font-black">{label}</div>
          <div className="text-sm text-white/70">Descripción</div>
        </div>
        {badge && <Badge count={badge} position="inline" />}
      </motion.button>
    );
  }
}
```

### 2. StatCard - Tarjeta de Estadísticas Adaptativa

```tsx
// components/StatCard.tsx
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatCard({ icon, value, label, size = 'md' }: StatCardProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3 rounded-xl',
      icon: 'w-5 h-5',
      value: 'text-lg',
      label: 'text-[10px]'
    },
    md: {
      container: 'p-4 rounded-2xl',
      icon: 'w-6 h-6',
      value: 'text-2xl',
      label: 'text-xs'
    },
    lg: {
      container: 'p-6 rounded-3xl',
      icon: 'w-8 h-8',
      value: 'text-4xl',
      label: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${classes.container}
        bg-gradient-to-br from-purple-600 to-pink-600
        shadow-[0_8px_0_rgba(0,0,0,0.3)]
        border-4 border-white/20
        cursor-pointer
        transition-all
      `}
    >
      <div className="text-center">
        <div className={`flex items-center justify-center mb-2 ${classes.icon}`}>
          {icon}
        </div>
        <div className={`text-white font-black ${classes.value}`}>{value}</div>
        <div className={`text-white/80 font-bold uppercase ${classes.label}`}>{label}</div>
      </div>
    </motion.div>
  );
}

// Uso adaptativo
<div className="
  mobile-l:grid mobile-l:grid-cols-3 mobile-l:gap-2
  tablet-l:grid tablet-l:grid-cols-3 tablet-l:gap-4
  lg:grid lg:grid-cols-3 lg:gap-6
">
  <StatCard
    icon={<Zap />}
    value="7 días"
    label="RACHA"
    size={
      isMobile ? 'sm' :
      isTablet ? 'md' :
      'lg'
    }
  />
</div>
```

### 3. ProximaClaseCard - Tarjeta de Próxima Clase Responsiva

```tsx
// components/ProximaClaseCard.tsx
interface ProximaClaseCardProps {
  clase: ClaseDetalle;
  variant?: 'compact' | 'expanded';
}

export function ProximaClaseCard({ clase, variant = 'expanded' }: ProximaClaseCardProps) {
  const fecha = new Date(clase.fecha_hora_inicio);
  const esHoy = isToday(fecha);

  // COMPACT (Mobile)
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-3 border-2 border-green-400/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-black uppercase">Próxima Clase</div>
            <div className="text-white/90 text-xs font-bold">
              {esHoy ? 'HOY' : format(fecha, 'dd/MM')} • {format(fecha, 'HH:mm')}
            </div>
          </div>
          {esHoy && (
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  // EXPANDED (Tablet/Desktop)
  return (
    <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl p-6 border-4 border-white/20 shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white/80 text-xs font-bold uppercase tracking-wide mb-1">
            Próxima Clase
          </div>
          <div className="text-white text-2xl font-black mb-2">
            {clase.titulo || 'Clase de Matemáticas'}
          </div>
          <div className="flex items-center gap-4 text-white/90 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {esHoy ? 'HOY' : format(fecha, 'dd/MM/yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {format(fecha, 'HH:mm')} hs
            </div>
          </div>
        </div>
        {esHoy && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 border-2 border-white/30">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-black uppercase">EN VIVO</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Uso adaptativo
<ProximaClaseCard
  clase={proximaClase}
  variant={isMobile ? 'compact' : 'expanded'}
/>
```

---

## 📱 PANTALLA DE BLOQUEO PORTRAIT - DISEÑO MEJORADO

### Componente LandscapeOnlyGuard Mejorado

```tsx
// components/LandscapeOnlyGuard.tsx (VERSION MEJORADA)
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, RotateCw } from 'lucide-react';

export function LandscapeOnlyGuard({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      // Detectar tipo de dispositivo
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      // Mostrar warning SOLO en mobile/tablet Y en portrait
      setShowWarning(width < 1024 && isPortrait);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <>
      {children}

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
          >
            {/* CAMPO DE ESTRELLAS ANIMADO */}
            <div className="absolute inset-0">
              {[...Array(100)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* NEBULOSAS DE FONDO */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] -top-40 left-1/2 -translate-x-1/2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                }}
              />
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[100px] -bottom-40 left-1/2 -translate-x-1/2"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="relative z-20 text-center px-6 max-w-md">
              {/* ICONO ANIMADO DE ROTACIÓN */}
              <motion.div
                className="mb-8 flex justify-center"
                animate={{
                  rotate: [0, 90, 90, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative">
                  {/* Glow pulsante */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-cyan-400/50 blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />

                  {/* Smartphone Icon */}
                  <Smartphone className="w-24 h-24 text-cyan-400 relative z-10" strokeWidth={1.5} />
                </div>
              </motion.div>

              {/* EMOJI GIGANTE ROTANDO */}
              <motion.div
                className="text-8xl mb-6"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                🔄
              </motion.div>

              {/* TÍTULO CON EFECTO HOLOGRÁFICO */}
              <motion.h1
                className="text-5xl font-black text-white mb-4 font-[family-name:var(--font-lilita)]"
                style={{
                  textShadow: '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)',
                }}
                animate={{
                  textShadow: [
                    '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)',
                    '0 0 30px rgba(34, 211, 238, 1), 0 0 60px rgba(139, 92, 246, 0.6)',
                    '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                ROTA TU {deviceType === 'mobile' ? 'TELÉFONO' : 'TABLET'}
              </motion.h1>

              {/* SUBTÍTULO */}
              <p className="text-xl text-cyan-300 font-bold mb-2">
                El Gimnasio está diseñado para
              </p>
              <p className="text-xl text-cyan-300 font-bold mb-8">
                jugarse en modo horizontal
              </p>

              {/* INSTRUCCIÓN CON GLASSMORPHISM */}
              <motion.div
                className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                animate={{
                  borderColor: ['rgba(34, 211, 238, 0.4)', 'rgba(34, 211, 238, 0.8)', 'rgba(34, 211, 238, 0.4)'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <p className="text-white text-base font-bold flex items-center justify-center gap-3">
                  <RotateCw className="w-5 h-5 text-cyan-400" />
                  Gira tu dispositivo para continuar
                </p>
              </motion.div>

              {/* ANIMACIÓN DE FLECHAS INDICANDO ROTACIÓN */}
              <div className="mt-8 flex justify-center gap-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="text-cyan-400 text-3xl font-black"
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    ↻
                  </motion.div>
                ))}
              </div>

              {/* MENSAJE ADICIONAL */}
              <motion.p
                className="mt-8 text-white/60 text-sm font-medium"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                Una experiencia inmersiva te espera
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 🎨 SISTEMA DE TIPOGRAFÍA RESPONSIVA

### Font Scale System

```typescript
// lib/constants/typography.ts
export const FONT_SCALE = {
  mobile: {
    h1: 'text-3xl',      // 30px
    h2: 'text-2xl',      // 24px
    h3: 'text-xl',       // 20px
    body: 'text-base',   // 16px
    small: 'text-sm',    // 14px
    tiny: 'text-xs',     // 12px
  },
  tablet: {
    h1: 'text-4xl',      // 36px
    h2: 'text-3xl',      // 30px
    h3: 'text-2xl',      // 24px
    body: 'text-lg',     // 18px
    small: 'text-base',  // 16px
    tiny: 'text-sm',     // 14px
  },
  desktop: {
    h1: 'text-6xl',      // 60px
    h2: 'text-5xl',      // 48px
    h3: 'text-4xl',      // 36px
    body: 'text-xl',     // 20px
    small: 'text-lg',    // 18px
    tiny: 'text-base',   // 16px
  }
} as const;

// Uso con Tailwind
<h1 className="
  mobile-l:text-3xl
  tablet-l:text-4xl
  lg:text-6xl
  font-black
">
  Título Responsivo
</h1>
```

---

## 📏 ESPACIADO Y PADDING ADAPTATIVO

```tsx
// Patrón de espaciado fluido
<div className="
  mobile-l:px-3 mobile-l:py-2 mobile-l:gap-2
  tablet-l:px-6 tablet-l:py-4 tablet-l:gap-4
  lg:px-8 lg:py-6 lg:gap-6
">
  ...
</div>

// Alturas de viewport seguras
<div className="
  mobile-l:h-[8vh]
  tablet-l:h-[10vh]
  lg:h-[12vh]
">
  Header
</div>

<div className="
  mobile-l:h-[84vh]
  tablet-l:h-[80vh]
  lg:h-[80vh]
">
  Main Content
</div>

<div className="
  mobile-l:h-[8vh]
  tablet-l:h-[10vh]
  lg:hidden
">
  Bottom Nav
</div>
```

---

## 🔧 UTILIDADES DE DETECCIÓN DE DISPOSITIVO

```typescript
// hooks/useDeviceType.ts
import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Tipo de dispositivo basado en ancho
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      // Orientación
      setIsLandscape(width > height);
    };

    detectDevice();

    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return { deviceType, isLandscape };
}

// Uso en componentes
function MyComponent() {
  const { deviceType, isLandscape } = useDeviceType();

  return (
    <div>
      {deviceType === 'mobile' && <MobileLayout />}
      {deviceType === 'tablet' && <TabletLayout />}
      {deviceType === 'desktop' && <DesktopLayout />}
    </div>
  );
}
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Desktop (1280px+)
- [x] Navegación lateral fija (izquierda + derecha)
- [x] Layout 50/50 (Avatar | Info)
- [x] Header con logo central
- [x] Sin scroll vertical
- [x] Tooltips en navegación
- [x] Tipografía grande y legible

### ⚠️ Tablet Landscape (768px - 1024px)
- [ ] Navegación inferior tipo dock bar
- [x] Layout 50/50 adaptado
- [ ] Header compacto
- [ ] Bottom nav con 5 botones principales
- [ ] Tipografía escalada (md)
- [ ] Sin scroll vertical

### ⚠️ Mobile Landscape (480px - 667px)
- [ ] Navegación inferior minimalista (1 botón MENÚ)
- [ ] Layout vertical con scroll
- [ ] Header ultra-compacto (8vh)
- [ ] Avatar 3D reducido (30vh)
- [ ] Stats en grid 3 columnas compactas
- [ ] Tipografía pequeña (sm)
- [ ] Modal de menú full-screen

### ✅ Portrait Blocking
- [x] LandscapeOnlyGuard implementado
- [x] Mensaje visual elegante
- [x] Animaciones de rotación
- [x] Detección de orientación

---

## 📚 RECURSOS ADICIONALES

### Patrones de Diseño Recomendados

1. **Mobile-first con landscape-override:**
   ```tsx
   <div className="
     flex-col gap-2           /* Mobile portrait (fallback) */
     mobile-l:flex-row gap-4  /* Mobile landscape (override) */
     tablet-l:gap-6           /* Tablet landscape */
     lg:gap-8                 /* Desktop */
   ">
   ```

2. **Conditional rendering basado en viewport:**
   ```tsx
   <div className="mobile-l:hidden tablet-l:block">
     Solo visible en tablet+
   </div>
   ```

3. **Aspect ratio containers:**
   ```tsx
   <div className="aspect-video w-full">
     Contenido 16:9
   </div>
   ```

### Testing en Diferentes Dispositivos

```bash
# Chrome DevTools - Custom Devices
# iPhone 13 Pro Landscape: 844 x 390
# iPad Pro 11" Landscape: 1194 x 834
# Desktop: 1920 x 1080
```

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar tablet layout:**
   - Crear dock bar inferior
   - Adaptar componentes a tamaño medio

2. **Implementar mobile layout:**
   - Crear MenuModal full-screen
   - Reducir tamaño de avatar y stats
   - Activar scroll vertical

3. **Testing exhaustivo:**
   - iPhone SE landscape
   - iPad Pro landscape
   - Desktop 1080p, 1440p, 4K

4. **Optimización de performance:**
   - Lazy loading de componentes pesados
   - Reducir animaciones en mobile
   - Optimizar imágenes por breakpoint

---

**Autor:** Claude (Anthropic)
**Fecha:** 2025-10-31
**Versión:** 1.0.0
