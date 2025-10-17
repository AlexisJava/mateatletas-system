# Design System EVOLVED - Mateatletas
## Paleta Emerald/Orange Premium - Sistema de Construcción Frontend

> **Fecha de establecimiento**: Octubre 2025
> **Versión**: 2.0 (Evolved)
> **Estatus**: ✅ Production Ready

Este documento define el design system definitivo para Mateatletas, establecido después de múltiples iteraciones y refinamientos. Úsalo como referencia única para todo desarrollo frontend futuro.

---

## 🎨 Paleta de Colores

### Colores Primarios

```typescript
// Emerald/Teal - Identidad principal (95% del diseño)
const colors = {
  emerald: {
    50: 'rgb(236, 253, 245)',
    100: 'rgb(209, 250, 229)',
    200: 'rgb(167, 243, 208)',
    300: 'rgb(110, 231, 183)',   // Gradientes de texto
    400: 'rgb(52, 211, 153)',    // PRIMARY - Bordes, iconos, highlights
    500: 'rgb(16, 185, 129)',    // Botones secundarios, links
    600: 'rgb(5, 150, 105)',
    700: 'rgb(4, 120, 87)',
    800: 'rgb(6, 95, 70)',
    900: 'rgb(6, 78, 59)',
    950: 'rgba(16, 185, 129, 0.05)',  // Backgrounds sutiles
  },
  teal: {
    400: 'rgb(45, 212, 191)',
    500: 'rgb(20, 184, 166)',
    950: 'rgba(20, 184, 166, 0.05)',
  },

  // Orange - SOLO para CTAs principales (5% del diseño)
  orange: {
    500: 'rgb(255, 107, 53)',    // CTA principal
    600: 'rgb(234, 88, 12)',     // CTA hover
    700: 'rgb(194, 65, 12)',
  },

  // Neutrales
  black: 'rgb(0, 0, 0)',         // Background principal
  zinc: {
    900: 'rgb(24, 24, 27)',      // Cards, modales
    950: 'rgb(9, 9, 11)',        // Variantes de background
  },
  white: {
    full: 'rgb(255, 255, 255)',
    90: 'rgba(255, 255, 255, 0.9)',
    80: 'rgba(255, 255, 255, 0.8)',
    60: 'rgba(255, 255, 255, 0.6)',
    50: 'rgba(255, 255, 255, 0.5)',
    40: 'rgba(255, 255, 255, 0.4)',
    30: 'rgba(255, 255, 255, 0.3)',
    10: 'rgba(255, 255, 255, 0.1)',
    8: 'rgba(255, 255, 255, 0.08)',
    5: 'rgba(255, 255, 255, 0.05)',
    3: 'rgba(255, 255, 255, 0.03)',
  },
};
```

### Reglas de Uso de Color

#### ✅ DO (Hacer):
- **Emerald 95% / Orange 5%**: Mantener esta proporción estricta
- **Orange SOLO para CTAs principales**: "Solicitar Información", "Ingresar al Portal", "Comenzar"
- **Emerald para todo lo demás**: Bordes, iconos, links secundarios, badges, highlights
- **Gradientes emerald-to-teal**: Para textos destacados y efectos visuales
- **Backgrounds negros**: `bg-black` como base principal

#### ❌ DON'T (No hacer):
- No uses orange en botones secundarios
- No uses orange en iconos o badges
- No mezcles orange y emerald en el mismo elemento (excepto hover states)
- No uses colores fuera de la paleta definida
- No uses fondos de colores brillantes (mantener negro)

---

## 🏗️ Componentes Base

### MagneticButton Component

Componente reutilizable para todos los botones con efecto magnético:

```typescript
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';

function MagneticButton({
  children,
  className = '',
  href,
  type = 'button',
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const button = (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );

  return href ? <Link href={href}>{button}</Link> : button;
}
```

**Variantes de uso:**

```typescript
// CTA Principal (Orange)
<MagneticButton
  href="/action"
  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/30"
>
  <span>Acción Principal</span>
  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
</MagneticButton>

// Botón Secundario (Emerald)
<MagneticButton
  href="/secondary"
  className="px-6 py-3 text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-500/10 transition-all border border-emerald-500/20 hover:border-emerald-400/40"
>
  Acción Secundaria
</MagneticButton>

// Botón Submit con Loading
<MagneticButton
  type="submit"
  disabled={isLoading}
  className="w-full group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all inline-flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? (
    <>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
      />
      <span>Cargando...</span>
    </>
  ) : (
    <>
      <span>Enviar</span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
    </>
  )}
</MagneticButton>
```

### FloatingParticle Component

Partículas animadas para backgrounds:

```typescript
function FloatingParticle({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [-20, -100],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
      className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
      style={{
        left: `${Math.random() * 100}%`,
        bottom: 0,
      }}
    />
  );
}

// Uso:
{[...Array(15)].map((_, i) => (
  <FloatingParticle key={i} delay={i * 0.3} />
))}
```

### AnimatedCounter Component

Para estadísticas con animación de conteo:

```typescript
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.replace(/\D/g, ''));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = targetValue;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [targetValue]);

  return (
    <div ref={ref} className="text-3xl font-bold tabular-nums">
      {count}
      {suffix}
    </div>
  );
}
```

---

## 🎭 Patrones de Layout

### Background Pattern Standard

Usa este background en TODAS las páginas:

```typescript
<div className="min-h-screen relative bg-black overflow-hidden">
  {/* Animated Background */}
  <div className="fixed inset-0">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20" />

    {/* Grid Pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px),
                        linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px)`,
        backgroundSize: '64px 64px',
      }}
    />

    {/* Radial gradient spotlight */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

    {/* Floating Particles */}
    {[...Array(15)].map((_, i) => (
      <FloatingParticle key={i} delay={i * 0.3} />
    ))}
  </div>

  {/* Tu contenido aquí */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</div>
```

### Navigation Bar Standard

```typescript
<nav className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-black/50 backdrop-blur-2xl">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
          </motion.div>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">Mateatletas</h1>
          <p className="text-[9px] text-emerald-400/40 font-medium uppercase tracking-wider">
            Entrenamiento Mental
          </p>
        </div>
      </Link>

      {/* Navigation Links + CTAs */}
      <div className="hidden md:flex items-center gap-8">
        {['Programa', 'Método', 'Docentes', 'Admisión'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm text-white/50 hover:text-emerald-400 transition-colors font-medium"
          >
            {item}
          </a>
        ))}

        {/* Botón secundario */}
        <MagneticButton
          href="/login"
          className="px-5 py-2 text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-500/10 transition-all border border-emerald-500/20 hover:border-emerald-400/40"
        >
          Iniciar Sesión
        </MagneticButton>

        {/* CTA principal */}
        <MagneticButton
          href="/admision"
          className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
        >
          Solicitar Información
        </MagneticButton>
      </div>
    </div>
  </div>
</nav>
```

### Glassmorphism Card Pattern

```typescript
<div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-emerald-500/10 overflow-hidden">
  {/* Card header glow */}
  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

  <div className="p-8 lg:p-12">
    {/* Tu contenido aquí */}
  </div>
</div>
```

### Split-Screen Layout (Desktop)

Úsalo para páginas de autenticación, onboarding, features:

```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
  {/* Left Side - Branding/Info */}
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="relative hidden lg:block"
  >
    {/* Decorative blurs */}
    <div className="absolute -top-4 -left-4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
    <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]" />

    <div className="relative z-10 space-y-8">
      {/* Contenido izquierdo */}
    </div>
  </motion.div>

  {/* Right Side - Form/Action */}
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="relative"
  >
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-[60px] opacity-30" />

    {/* Contenido derecho */}
  </motion.div>
</div>
```

---

## 📝 Inputs & Forms

### Input Field Standard

```typescript
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-semibold text-white/80">
    Correo electrónico
  </label>
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Mail className="w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
    </div>
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      placeholder="tu@email.com"
      className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
    />
  </div>
</div>
```

### Password Input con Toggle

```typescript
<div className="space-y-2">
  <label htmlFor="password" className="block text-sm font-semibold text-white/80">
    Contraseña
  </label>
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Lock className="w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
    </div>
    <input
      id="password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      placeholder="••••••••"
      className="w-full pl-12 pr-12 py-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-emerald-400 transition-colors"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
</div>
```

### Toggle/Switch Pattern

Para selección de opciones (ej: Tutor/Estudiante):

```typescript
<div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08]">
  <button
    type="button"
    onClick={() => setOption('option1')}
    className={`relative py-3 px-4 rounded-xl font-semibold transition-all ${
      selectedOption === 'option1'
        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-emerald-500/30'
        : 'text-white/40 hover:text-white/60'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      <Icon1 className="w-4 h-4" strokeWidth={2.5} />
      <span>Opción 1</span>
    </div>
  </button>

  <button
    type="button"
    onClick={() => setOption('option2')}
    className={`relative py-3 px-4 rounded-xl font-semibold transition-all ${
      selectedOption === 'option2'
        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-emerald-500/30'
        : 'text-white/40 hover:text-white/60'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      <Icon2 className="w-4 h-4" strokeWidth={2.5} />
      <span>Opción 2</span>
    </div>
  </button>
</div>
```

---

## 🎬 Animaciones con Framer Motion

### Entry Animations Standard

```typescript
// Fade + Slide desde izquierda
<motion.div
  initial={{ opacity: 0, x: -30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
>
  {/* Contenido */}
</motion.div>

// Fade + Slide desde derecha
<motion.div
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
>
  {/* Contenido */}
</motion.div>

// Fade + Scale (para badges, cards pequeñas)
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.2 }}
>
  {/* Contenido */}
</motion.div>

// Staggered children (lista de items)
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.4 + index * 0.1 }}
  >
    {/* Item */}
  </motion.div>
))}
```

### Loading Spinner

```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
/>
```

### Error/Alert Slide Down

```typescript
{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-xl"
  >
    <p className="text-red-400 text-sm flex items-center gap-2">
      <span className="text-lg">⚠️</span>
      {error}
    </p>
  </motion.div>
)}
```

---

## 📐 Typography

### Headings

```typescript
// Hero H1 (Landing pages)
<h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
  Texto normal
  <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
    Texto con gradiente destacado
  </span>
</h1>

// H2 (Secciones)
<h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
  Título de Sección
</h2>

// H3 (Subsecciones)
<h3 className="text-3xl font-bold tracking-tight">
  Subsección
</h3>

// H4 (Cards, features)
<h4 className="text-sm font-semibold text-white/90">
  Título de Card
</h4>
```

### Body Text

```typescript
// Párrafo principal
<p className="text-lg text-white/60 leading-relaxed">
  Texto descriptivo principal
</p>

// Párrafo secundario
<p className="text-sm text-white/60">
  Texto secundario o de apoyo
</p>

// Texto pequeño (legal, footer)
<p className="text-xs text-white/40">
  Texto muy pequeño
</p>
```

### Links

```typescript
// Link principal
<Link
  href="/ruta"
  className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
>
  Link de Acción
</Link>

// Link secundario
<Link
  href="/ruta"
  className="text-sm text-white/50 hover:text-emerald-400 transition-colors font-medium"
>
  Link Secundario
</Link>

// Link con underline
<Link
  href="/ruta"
  className="text-emerald-400/80 hover:text-emerald-300 transition-colors font-medium underline"
>
  Link con Subrayado
</Link>
```

---

## 🎯 Badges & Pills

### Badge Standard

```typescript
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
  <Sparkles className="w-4 h-4 text-emerald-400" />
  <span className="text-sm text-emerald-400 font-semibold">
    Texto del Badge
  </span>
</div>
```

### Status Badge

```typescript
// Activo/Éxito
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Activo
</span>

// Warning
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
  Pendiente
</span>

// Error
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
  Error
</span>
```

---

## 📦 Feature Cards

### Feature Card con Hover

```typescript
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.4 }}
  className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 transition-all group"
>
  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
    <Icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
  </div>
  <div>
    <h4 className="text-sm font-semibold text-white/90">Título Feature</h4>
    <p className="text-xs text-white/50 mt-1">Descripción del feature</p>
  </div>
</motion.div>
```

---

## 🎨 Efectos Especiales

### SVG Photon Animation (Terminal Border)

Para crear el efecto de "electricidad" alrededor de un elemento:

```typescript
{/* SVG Photon Animation */}
<svg
  className="absolute inset-0 w-full h-full pointer-events-none"
  style={{
    filter: 'drop-shadow(0 0 12px rgba(16, 255, 180, 0.8)) drop-shadow(0 0 4px rgba(16, 255, 180, 1))'
  }}
>
  <defs>
    <linearGradient id="photon-trail" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="transparent" stopOpacity="0" />
      <stop offset="30%" stopColor="rgba(16, 185, 129, 0.15)" stopOpacity="0.15" />
      <stop offset="50%" stopColor="rgba(16, 211, 153, 0.4)" stopOpacity="0.4" />
      <stop offset="65%" stopColor="rgba(16, 240, 180, 0.7)" stopOpacity="0.7" />
      <stop offset="80%" stopColor="rgba(16, 255, 180, 0.95)" stopOpacity="0.95" />
      <stop offset="90%" stopColor="#10ffb4" stopOpacity="1" />
      <stop offset="96%" stopColor="#5fffcf" stopOpacity="0.8" />
      <stop offset="100%" stopColor="rgba(16, 255, 180, 0)" stopOpacity="0" />
    </linearGradient>
  </defs>
  <rect
    x="1" y="1"
    width="calc(100% - 2px)"
    height="calc(100% - 2px)"
    rx="24" ry="24"
    fill="none"
    stroke="url(#photon-trail)"
    strokeWidth="4"
    strokeDasharray="150 1300"
    strokeDashoffset="0"
    strokeLinecap="round"
    style={{ animation: 'dash 4s linear infinite' }}
  />
</svg>

{/* Agregar keyframe en el mismo componente */}
<style jsx>{`
  @keyframes dash {
    to {
      stroke-dashoffset: -1450;
    }
  }
`}</style>
```

### Floating Card (Rotación sutil)

```typescript
<motion.div
  initial={{ opacity: 0, y: 20, rotate: 6 }}
  animate={{ opacity: 1, y: 0, rotate: 6 }}
  transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
  className="absolute bottom-20 right-8 bg-gradient-to-br from-zinc-900/95 to-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-emerald-500/20 max-w-[240px] hover:scale-105 transition-transform"
  style={{ rotate: 6 }}
>
  {/* Contenido */}
</motion.div>
```

---

## 📱 Responsive Design

### Breakpoints Tailwind

```typescript
// Mobile first approach
sm: '640px'   // Tablet pequeña
md: '768px'   // Tablet
lg: '1024px'  // Desktop pequeño
xl: '1280px'  // Desktop
2xl: '1536px' // Desktop grande
```

### Patrones Responsive Comunes

```typescript
// Grid 2 columnas en desktop, 1 en mobile
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

// Ocultar en mobile, mostrar en desktop
<div className="hidden lg:block">

// Mostrar solo en mobile
<div className="lg:hidden">

// Tamaños de texto responsive
<h1 className="text-5xl lg:text-6xl">

// Padding responsive
<div className="px-6 lg:px-8">

// Espaciado responsive
<div className="space-y-6 lg:space-y-8">
```

---

## ✅ Checklist de Construcción

Antes de considerar una página "completa", verifica:

### Visual
- [ ] Background negro con grid pattern emerald
- [ ] Floating particles (15 partículas)
- [ ] Radial gradient spotlight con pulse
- [ ] Navigation bar con glassmorphism
- [ ] Ratio 95% emerald / 5% orange
- [ ] Orange SOLO en CTA principal
- [ ] Todos los iconos son lucide-react
- [ ] Glassmorphism cards con border glow

### Animaciones
- [ ] Entry animations (fade + slide)
- [ ] Magnetic buttons funcionando
- [ ] Loading states con spinner
- [ ] Hover states en todos los elementos interactivos
- [ ] Transitions suaves (0.3s-0.8s)

### Tipografía
- [ ] Headings con gradiente emerald en palabras clave
- [ ] Body text en white/60 o white/80
- [ ] Font weights correctos (bold para headings, semibold para buttons)
- [ ] Line-height adecuado (leading-relaxed para párrafos)

### Funcionalidad
- [ ] Responsive (mobile + tablet + desktop)
- [ ] Accesibilidad básica (labels, aria-labels)
- [ ] Estados disabled en inputs/buttons
- [ ] Error handling visible
- [ ] Loading states durante operaciones async

### Código
- [ ] Componentes reutilizables extraídos
- [ ] TypeScript types definidos
- [ ] Imports organizados (React → Next → External → Internal → Icons)
- [ ] Sin console.logs en producción
- [ ] Comentarios en secciones complejas

---

## 🚀 Quick Start Template

Para crear una nueva página rápidamente:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Terminal,
  ArrowRight,
  // ... otros iconos
} from 'lucide-react';

// MagneticButton Component
function MagneticButton({ children, className = '', href, type = 'button', disabled = false, onClick }: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const button = (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );

  return href ? <Link href={href}>{button}</Link> : button;
}

// FloatingParticle Component
function FloatingParticle({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [-20, -100],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
      className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
      style={{
        left: `${Math.random() * 100}%`,
        bottom: 0,
      }}
    />
  );
}

export default function YourPage() {
  const [state, setState] = useState('');

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px),
                            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        {[...Array(15)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-black/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
              </motion.div>
              <div>
                <h1 className="text-base font-bold tracking-tight">Mateatletas</h1>
                <p className="text-[9px] text-emerald-400/40 font-medium uppercase tracking-wider">
                  Entrenamiento Mental
                </p>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 py-20">
          {/* Tu contenido aquí */}
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 Referencias

### Iconos (Lucide React)
- Documentación: https://lucide.dev
- Instalación: `npm install lucide-react`
- Uso: Siempre con `strokeWidth={2}` o `strokeWidth={2.5}`

### Framer Motion
- Documentación: https://www.framer.com/motion/
- Instalación: `npm install framer-motion`
- Focus: `motion.div`, `useMotionValue`, `useSpring`, `animate`

### Tailwind CSS
- Documentación: https://tailwindcss.com
- Custom colors ya están en `tailwind.config.js`
- Usa arbitrary values cuando necesites: `bg-[#10B981]`

---

## ⚠️ Anti-Patterns (NO HACER)

### ❌ Colores
- No uses tech startup colors (azul, púrpura genérico)
- No uses múltiples colores primarios
- No uses orange en más del 5% del diseño
- No uses gradientes de más de 2 colores (emerald → teal ok, emerald → teal → blue NO)

### ❌ Lenguaje
- No uses "gratis" en ningún lugar
- No uses tech buzzwords ("revolucionario", "disruptivo", "innovador")
- No uses emojis excesivamente (solo cuando sea 100% natural)
- SÍ usa lenguaje deportivo sutil ("entrenamiento", "progreso", "nivel")

### ❌ Layout
- No hagas sections demasiado largas (max 100vh por sección)
- No pongas más de 3 CTAs en la misma pantalla
- No uses carrusels automáticos
- No uses popups/modales agresivos

### ❌ Animaciones
- No hagas animaciones de más de 1s de duración (excepto loops)
- No animes demasiados elementos a la vez
- No uses easing súper exagerados
- No hagas parallax extremo

---

## 🎯 Resumen Ejecutivo

**La fórmula ganadora:**
1. **95% Emerald + 5% Orange** estricto
2. **Glassmorphism** en todos los cards
3. **Magnetic buttons** en CTAs
4. **Floating particles** en background
5. **Grid pattern emerald** como textura base
6. **Framer Motion** para todas las animaciones
7. **Lucide React** para todos los iconos
8. **Split-screen** para páginas de auth/features
9. **Black background** siempre
10. **Lenguaje educativo premium** sin tech buzzwords

---

**Última actualización**: Octubre 2025
**Mantenido por**: Claude Code
**Estado**: Production Ready ✅
