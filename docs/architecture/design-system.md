# Sistema de Diseño - Crash Bandicoot Style

## Manual Completo para Desarrollo de Componentes

---

## 📋 Índice

1. [Filosofía y Principios](#filosofía-y-principios)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Sistema de Sombras](#sistema-de-sombras)
5. [Espaciado y Layout](#espaciado-y-layout)
6. [Bordes y Border Radius](#bordes-y-border-radius)
7. [Componentes Base](#componentes-base)
8. [Animaciones](#animaciones)
9. [Patrones de Código](#patrones-de-código)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Sistema Responsive](#sistema-responsive)
12. [Accesibilidad](#accesibilidad)
13. [Variantes de Tamaño](#variantes-de-tamaño)
14. [Estados de Carga](#estados-de-carga)
15. [Iconografía](#iconografía)
16. [Escala de Espaciado Formal](#escala-de-espaciado-formal)
17. [Checklist de Accesibilidad](#checklist-de-accesibilidad)

---

## 🎨 Filosofía y Principios

### Estética General

- **Inspiración:** Crash Bandicoot (PlayStation 1, 1998)
- **Estilo:** Cartoon exagerado, chunky, vibrante, energético
- **Público objetivo:** Niños y estudiantes (dashboard educativo)
- **Objetivo:** Crear fascinación y engagement visual sin sacrificar legibilidad

### Principios de Diseño

1. **Colores vibrantes y saturados** - Paleta limitada pero impactante
2. **Formas chunky e irregulares** - Elementos con diferentes anchos/altos para dinamismo
3. **Sombras duras sin blur** - Profundidad mediante sombras sólidas tipo PS1
4. **Animaciones bouncy** - Movimientos exagerados y juguetones
5. **Legibilidad primero** - Sin sombras en texto, fuente clara y legible
6. **Sin rotaciones** - Elementos con tamaños irregulares en lugar de inclinaciones

---

## 🎨 Paleta de Colores

### Colores Primarios

#### Naranja (Primary)

\`\`\`css
--color-orange-light: #FFB84D /_ Naranja claro - acentos, highlights _/
--color-orange: #FF8C00 /_ Naranja principal - botones primarios, CTAs _/
--color-orange-dark: #E67300 /_ Naranja oscuro - hover states, profundidad _/
--color-orange-darker: #CC6600 /_ Naranja muy oscuro - sombras, bordes _/
\`\`\`

**Uso:**

- Botones primarios y CTAs principales
- Insignias y logros importantes
- Elementos de acción y progreso
- Acentos en títulos y destacados

#### Azul (Secondary)

\`\`\`css
--color-blue-light: #4DA6FF /_ Azul claro - fondos suaves, acentos _/
--color-blue: #1E90FF /_ Azul principal - fondos de paneles, cards _/
--color-blue-dark: #1873CC /_ Azul oscuro - bordes, hover states _/
--color-blue-darker: #0D4F8F /_ Azul muy oscuro - sombras, profundidad _/
\`\`\`

**Uso:**

- Fondos de paneles y tarjetas
- Elementos informativos
- Barras de progreso
- Overlays y modales

#### Amarillo (Accent)

\`\`\`css
--color-yellow-light: #FFE066 /_ Amarillo claro - highlights _/
--color-yellow: #FFD700 /_ Amarillo dorado - monedas, puntos, XP _/
--color-yellow-dark: #E6C200 /_ Amarillo oscuro - bordes, sombras _/
\`\`\`

**Uso:**

- Sistema de puntos y recompensas (XP, monedas)
- Elementos destacados y premium
- Indicadores de éxito y logros

#### Verde (Success)

\`\`\`css
--color-green-light: #66FF66 /_ Verde claro - acentos _/
--color-green: #00CC44 /_ Verde principal - éxito, completado _/
--color-green-dark: #00A836 /_ Verde oscuro - hover, bordes _/
\`\`\`

**Uso:**

- Estados de éxito
- Lecciones completadas
- Notificaciones positivas
- Checkmarks y confirmaciones

#### Rojo (Error/Alert)

\`\`\`css
--color-red-light: #FF6B6B /_ Rojo claro - acentos _/
--color-red: #FF3333 /_ Rojo principal - errores, alertas _/
--color-red-dark: #CC0000 /_ Rojo oscuro - hover, bordes _/
\`\`\`

**Uso:**

- Mensajes de error
- Alertas importantes
- Elementos bloqueados o deshabilitados
- Indicadores de peligro

#### Morado (Special)

\`\`\`css
--color-purple-light: #B366FF /_ Morado claro - acentos _/
--color-purple: #9933FF /_ Morado principal - elementos especiales _/
--color-purple-dark: #7A29CC /_ Morado oscuro - hover, bordes _/
\`\`\`

**Uso:**

- Insignias especiales o raras
- Elementos premium o exclusivos
- Logros épicos

### Colores Neutrales

\`\`\`css
--color-white: #FFFFFF /_ Blanco puro - fondos, texto en oscuro _/
--color-gray-100: #F5F5F5 /_ Gris muy claro - fondos alternativos _/
--color-gray-200: #E0E0E0 /_ Gris claro - bordes suaves _/
--color-gray-300: #CCCCCC /_ Gris medio claro - elementos deshabilitados _/
--color-gray-400: #999999 /_ Gris medio - texto secundario _/
--color-gray-500: #666666 /_ Gris oscuro - texto terciario _/
--color-black: #000000 /_ Negro puro - texto principal, sombras _/
\`\`\`

### Reglas de Uso de Color

1. **Contraste mínimo:** Siempre asegurar ratio 4.5:1 para texto normal, 3:1 para texto grande
2. **Máximo 3-5 colores por componente:** No sobrecargar visualmente
3. **Fondos claros con texto oscuro:** Priorizar legibilidad
4. **Sombras siempre en negro:** `rgba(0, 0, 0, X)` para consistencia
5. **Gradientes limitados:** Solo en barras de progreso con efecto metálico

---

## ✍️ Tipografía

### Fuente Principal

\`\`\`css
font-family: 'Fredoka', sans-serif;
\`\`\`

**Características:**

- Fuente redondeada y amigable
- Excelente legibilidad en todos los tamaños
- Múltiples pesos disponibles (300-700)
- Perfecta para interfaces infantiles/educativas

### Jerarquía Tipográfica

#### Títulos Principales (H1)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 600;
font-size: 2.5rem; /_ 40px _/
line-height: 1.2;
color: #000000;
\`\`\`

**Uso:** Títulos de página, headers principales

#### Títulos Secundarios (H2)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 600;
font-size: 2rem; /_ 32px _/
line-height: 1.3;
color: #000000;
\`\`\`

**Uso:** Secciones principales, títulos de cards grandes

#### Títulos Terciarios (H3)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 600;
font-size: 1.5rem; /_ 24px _/
line-height: 1.4;
color: #000000;
\`\`\`

**Uso:** Subsecciones, títulos de componentes

#### Títulos Pequeños (H4)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 600;
font-size: 1.25rem; /_ 20px _/
line-height: 1.4;
color: #000000;
\`\`\`

**Uso:** Títulos de cards pequeñas, labels destacados

#### Texto Normal (Body)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 400;
font-size: 1rem; /_ 16px _/
line-height: 1.5;
color: #000000;
\`\`\`

**Uso:** Texto de párrafos, descripciones, contenido general

#### Texto Pequeño (Small)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 400;
font-size: 0.875rem; /_ 14px _/
line-height: 1.5;
color: #666666;
\`\`\`

**Uso:** Texto secundario, metadatos, timestamps

#### Texto Muy Pequeño (Caption)

\`\`\`css
font-family: 'Fredoka', sans-serif;
font-weight: 400;
font-size: 0.75rem; /_ 12px _/
line-height: 1.5;
color: #999999;
\`\`\`

**Uso:** Captions, notas al pie, texto terciario

### Reglas Tipográficas

1. **NO usar text-shadow:** La fuente debe ser limpia y legible
2. **Peso 600 para títulos, 400 para texto:** Mantener consistencia
3. **Line-height mínimo 1.4:** Asegurar legibilidad
4. **Color negro (#000000) para texto principal:** Máximo contraste
5. **Grises para texto secundario:** Jerarquía visual clara
6. **Evitar ALL CAPS en textos largos:** Solo para labels cortos

---

## 🌑 Sistema de Sombras

### Filosofía de Sombras

- **Sombras duras sin blur:** Estilo PS1/cartoon
- **Solo en elementos, NUNCA en texto:** Priorizar legibilidad
- **Dirección consistente:** Siempre hacia abajo-derecha (X: positivo, Y: positivo)
- **Color negro sólido:** `rgba(0, 0, 0, 1)` para sombras principales

### Variantes de Sombra

#### Shadow SM (Pequeña)

\`\`\`css
box-shadow: 3px 3px 0px rgba(0, 0, 0, 1);
\`\`\`

**Uso:**

- Badges pequeños
- Botones secundarios
- Elementos de UI pequeños
- Icons con fondo

**Ejemplo Tailwind:**
\`\`\`jsx
className="shadow-[3px_3px_0px_rgba(0,0,0,1)]"
\`\`\`

#### Shadow MD (Mediana)

\`\`\`css
box-shadow: 5px 5px 0px rgba(0, 0, 0, 1);
\`\`\`

**Uso:**

- Botones primarios
- Cards medianas
- Paneles de contenido
- Elementos interactivos principales

**Ejemplo Tailwind:**
\`\`\`jsx
className="shadow-[5px_5px_0px_rgba(0,0,0,1)]"
\`\`\`

#### Shadow LG (Grande)

\`\`\`css
box-shadow: 8px 8px 0px rgba(0, 0, 0, 1);
\`\`\`

**Uso:**

- Modales y overlays
- Cards grandes destacadas
- Elementos hero
- Componentes principales de página

**Ejemplo Tailwind:**
\`\`\`jsx
className="shadow-[8px_8px_0px_rgba(0,0,0,1)]"
\`\`\`

### Sombras con Glow (Especiales)

Para elementos que necesitan destacarse con efecto de brillo:

\`\`\`css
box-shadow:
5px 5px 0px rgba(0, 0, 0, 1), /_ Sombra principal _/
0 0 20px rgba(255, 140, 0, 0.6); /_ Glow exterior _/
\`\`\`

**Uso:**

- Botones en hover state
- Elementos activos o seleccionados
- Notificaciones importantes
- Logros desbloqueados

**Ejemplo Tailwind:**
\`\`\`jsx
className="shadow-[5px_5px_0px_rgba(0,0,0,1),0_0_20px_rgba(255,140,0,0.6)]"
\`\`\`

### Reglas de Sombras

1. **Consistencia en dirección:** Siempre X e Y positivos
2. **Sin blur en sombras principales:** Mantener estilo hard/chunky
3. **Glow solo para estados especiales:** No abusar del efecto
4. **Ajustar sombra en hover:** Reducir offset para efecto de "presión"
5. **Sombras más grandes = elementos más importantes:** Jerarquía visual

---

## 📏 Espaciado y Layout

### Sistema de Espaciado (Tailwind Scale)

Usar la escala de Tailwind para consistencia:

\`\`\`
p-1 = 4px gap-1 = 4px m-1 = 4px
p-2 = 8px gap-2 = 8px m-2 = 8px
p-3 = 12px gap-3 = 12px m-3 = 12px
p-4 = 16px gap-4 = 16px m-4 = 16px
p-5 = 20px gap-5 = 20px m-5 = 20px
p-6 = 24px gap-6 = 24px m-6 = 24px
p-8 = 32px gap-8 = 32px m-8 = 32px
p-10 = 40px gap-10 = 40px m-10 = 40px
p-12 = 48px gap-12 = 48px m-12 = 48px
\`\`\`

### Espaciado Recomendado por Contexto

#### Padding Interno de Componentes

\`\`\`css
/_ Componentes pequeños (badges, pills) _/
padding: 0.5rem 1rem; /_ py-2 px-4 _/

/_ Componentes medianos (buttons, cards) _/
padding: 0.75rem 1.5rem; /_ py-3 px-6 _/

/_ Componentes grandes (panels, modals) _/
padding: 1.5rem 2rem; /_ py-6 px-8 _/
\`\`\`

#### Gap entre Elementos

\`\`\`css
/_ Elementos muy cercanos (dentro de un grupo) _/
gap: 0.5rem; /_ gap-2 _/

/_ Elementos relacionados (lista de items) _/
gap: 1rem; /_ gap-4 _/

/_ Secciones separadas _/
gap: 1.5rem; /_ gap-6 _/

/_ Secciones muy separadas _/
gap: 2rem; /_ gap-8 _/
\`\`\`

#### Margin entre Secciones

\`\`\`css
/_ Entre componentes pequeños _/
margin-bottom: 1rem; /_ mb-4 _/

/_ Entre secciones medianas _/
margin-bottom: 2rem; /_ mb-8 _/

/_ Entre secciones grandes _/
margin-bottom: 3rem; /_ mb-12 _/
\`\`\`

### Layout Method Priority

**Orden de prioridad para elegir método de layout:**

1. **Flexbox (preferido para la mayoría de casos)**
\`\`\`jsx
// Horizontal con espacio entre elementos
<div className="flex items-center justify-between gap-4">

// Vertical con elementos centrados

<div className="flex flex-col items-center gap-6">

// Wrap para elementos que pueden saltar de línea

<div className="flex flex-wrap gap-4">
\`\`\`

2. **CSS Grid (solo para layouts 2D complejos)**
\`\`\`jsx
// Grid de 3 columnas
<div className="grid grid-cols-3 gap-4">

// Grid responsive

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
\`\`\`

3. **Absolute positioning (solo casos muy específicos)**
\`\`\`jsx
// Elementos decorativos o overlays
<div className="relative">
  <div className="absolute top-2 right-2">Badge</div>
</div>
\`\`\`

### Reglas de Layout

1. **Preferir gap sobre margin:** Más limpio y predecible
2. **Mobile-first:** Diseñar para móvil primero, luego expandir
3. **Usar contenedores max-width:** Evitar líneas de texto muy largas
4. **Padding consistente:** Usar múltiplos de 4px (escala Tailwind)
5. **Evitar magic numbers:** Usar valores de la escala, no arbitrarios

---

## 🔲 Bordes y Border Radius

### Border Radius System

#### Rounded SM (Pequeño)

\`\`\`css
border-radius: 0.5rem; /_ rounded-lg en Tailwind = 8px _/
\`\`\`

**Uso:**

- Badges pequeños
- Pills
- Botones pequeños

#### Rounded MD (Mediano)

\`\`\`css
border-radius: 0.75rem; /_ rounded-xl en Tailwind = 12px _/
\`\`\`

**Uso:**

- Botones estándar
- Cards pequeñas
- Input fields

#### Rounded LG (Grande)

\`\`\`css
border-radius: 1rem; /_ rounded-2xl en Tailwind = 16px _/
\`\`\`

**Uso:**

- Cards grandes
- Paneles
- Modales

#### Rounded Full (Circular)

\`\`\`css
border-radius: 9999px; /_ rounded-full en Tailwind _/
\`\`\`

**Uso:**

- Avatares
- Badges circulares
- Botones circulares (icons)
- Burbujas

### Border Radius Irregular (Chunky Style)

Para lograr el estilo "chunky" de Crash Bandicoot, usar border-radius asimétricos:

\`\`\`jsx
// Ejemplo: Card con esquinas irregulares

<div className="rounded-tl-2xl rounded-tr-xl rounded-bl-xl rounded-br-2xl">
  {/* Contenido */}
</div>

// Ejemplo: Panel con variación

<div className="rounded-tl-3xl rounded-tr-2xl rounded-bl-2xl rounded-br-3xl">
  {/* Contenido */}
</div>
\`\`\`

**Regla:** Variar entre valores adyacentes (xl/2xl o 2xl/3xl) para dinamismo sin exageración

### Bordes (Borders)

#### Border Width

\`\`\`css
/_ Border delgado _/
border-width: 2px; /_ border-2 _/

/_ Border mediano (preferido) _/
border-width: 3px; /_ border-[3px] _/

/_ Border grueso _/
border-width: 4px; /_ border-4 _/
\`\`\`

#### Border Color

\`\`\`css
/_ Siempre usar negro para bordes principales _/
border-color: #000000; /_ border-black _/

/_ Bordes de color para estados especiales _/
border-color: #FF8C00; /_ border-orange para elementos activos _/
\`\`\`

### Reglas de Bordes

1. **Bordes siempre en negro:** Mantener consistencia con sombras
2. **Grosor mínimo 2px:** Bordes más delgados se pierden visualmente
3. **Border radius irregular para dinamismo:** Evitar simetría perfecta
4. **Combinar border + shadow:** Crear profundidad y definición
5. **Border más grueso en hover:** Indicar interactividad

---

## 🧩 Componentes Base

### Botones

#### Botón Primario (Primary Button)

**Código base:**
\`\`\`jsx
<button className="
  relative
  bg-orange text-white
  font-sans font-semibold text-lg
  px-8 py-4
  rounded-xl
  border-4 border-black
  shadow-[5px_5px_0px_rgba(0,0,0,1)]
  transition-all duration-200
  hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]
  hover:translate-x-[2px]
  hover:translate-y-[2px]
  active:shadow-[0px_0px_0px_rgba(0,0,0,1)]
  active:translate-x-[5px]
  active:translate-y-[5px]
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]
  disabled:hover:translate-x-0
  disabled:hover:translate-y-0
">
¡Jugar Ahora!
</button>
\`\`\`

**Estados:**

- **Base:** Sombra MD (5px), colores vibrantes
- **Hover:** Sombra SM (3px), translate (2px, 2px), glow opcional
- **Active/Pressed:** Sin sombra, translate (5px, 5px)
- **Disabled:** Opacity 50%, sin interacción

**Variantes de color:**
\`\`\`jsx
// Naranja (primary)
bg-orange hover:bg-orange-dark

// Azul (secondary)
bg-blue hover:bg-blue-dark

// Verde (success)
bg-green hover:bg-green-dark

// Rojo (danger)
bg-red hover:bg-red-dark
\`\`\`

#### Botón Secundario (Secondary Button)

**Código base:**
\`\`\`jsx
<button className="
  bg-white text-black
  font-sans font-semibold text-base
  px-6 py-3
  rounded-lg
  border-3 border-black
  shadow-[3px_3px_0px_rgba(0,0,0,1)]
  transition-all duration-200
  hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]
  hover:translate-x-[1px]
  hover:translate-y-[1px]
">
Ver Más
</button>
\`\`\`

**Diferencias con primario:**

- Fondo blanco en lugar de color
- Texto negro
- Sombra más pequeña (SM en lugar de MD)
- Padding más pequeño
- Border más delgado (3px en lugar de 4px)

#### Botón con Icono

**Código base:**
\`\`\`jsx
<button className="
  flex items-center gap-3
  bg-orange text-white
  font-sans font-semibold text-lg
  px-6 py-3
  rounded-xl
  border-4 border-black
  shadow-[5px_5px_0px_rgba(0,0,0,1)]
  transition-all duration-200
  hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]
  hover:translate-x-[2px]
  hover:translate-y-[2px]
">
<PlayIcon className="w-6 h-6" />
<span>Comenzar</span>
</button>
\`\`\`

### Cards

#### Card Básica

**Código base:**
\`\`\`jsx

<div className="
  bg-white
  rounded-2xl
  border-4 border-black
  shadow-[5px_5px_0px_rgba(0,0,0,1)]
  p-6
  transition-all duration-300
  hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
  hover:translate-x-[-3px]
  hover:translate-y-[-3px]
">
  {/* Contenido */}
</div>
\`\`\`

**Características:**

- Fondo blanco para contraste
- Border negro grueso (4px)
- Sombra MD que crece en hover
- Padding generoso (1.5rem)
- Border radius grande para suavidad

#### Card con Header

**Código base:**
\`\`\`jsx

<div className="
  bg-white
  rounded-2xl
  border-4 border-black
  shadow-[5px_5px_0px_rgba(0,0,0,1)]
  overflow-hidden
">
  {/* Header con color */}
  <div className="bg-blue p-4 border-b-4 border-black">
    <h3 className="font-sans font-semibold text-xl text-white">
      Título de la Card
    </h3>
  </div>
  
  {/* Contenido */}
  <div className="p-6">
    <p className="font-sans text-base text-black">
      Contenido de la card...
    </p>
  </div>
</div>
\`\`\`

#### Card Interactiva (Clickeable)

**Código base:**
\`\`\`jsx
<button className="
  w-full text-left
  bg-white
  rounded-2xl
  border-4 border-black
  shadow-[5px_5px_0px_rgba(0,0,0,1)]
  p-6
  transition-all duration-200
  hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
  hover:translate-x-[-3px]
  hover:translate-y-[-3px]
  hover:border-orange
  active:shadow-[3px_3px_0px_rgba(0,0,0,1)]
  active:translate-x-[2px]
  active:translate-y-[2px]
">
{/_ Contenido _/}
</button>
\`\`\`

**Diferencias:**

- Usar `<button>` en lugar de `<div>`
- Cambiar border color en hover (negro → naranja)
- Efecto de presión en active state

### Badges

#### Badge Básico

**Código base:**
\`\`\`jsx
<span className="
  inline-flex items-center gap-2
  bg-orange text-white
  font-sans font-semibold text-sm
  px-4 py-2
  rounded-full
  border-2 border-black
  shadow-[3px_3px_0px_rgba(0,0,0,1)]
">
Nuevo
</span>
\`\`\`

#### Badge con Icono

**Código base:**
\`\`\`jsx
<span className="
  inline-flex items-center gap-2
  bg-yellow text-black
  font-sans font-semibold text-sm
  px-4 py-2
  rounded-full
  border-2 border-black
  shadow-[3px_3px_0px_rgba(0,0,0,1)]
">
<StarIcon className="w-4 h-4" />
<span>100 XP</span>
</span>
\`\`\`

#### Badge de Notificación (Dot)

**Código base:**
\`\`\`jsx

<div className="relative">
  <BellIcon className="w-6 h-6" />
  <span className="
    absolute -top-1 -right-1
    flex items-center justify-center
    w-5 h-5
    bg-red text-white
    font-sans font-bold text-xs
    rounded-full
    border-2 border-black
    shadow-[2px_2px_0px_rgba(0,0,0,1)]
    animate-pulse
  ">
    3
  </span>
</div>
\`\`\`

### Progress Bars

#### Barra de Progreso Simple

**Código base:**
\`\`\`jsx

<div className="w-full">
  {/* Label */}
  <div className="flex justify-between items-center mb-2">
    <span className="font-sans font-semibold text-base text-black">
      Progreso del Curso
    </span>
    <span className="font-sans font-semibold text-sm text-gray-500">
      75%
    </span>
  </div>
  
  {/* Barra */}
  <div className="
    relative
    w-full h-8
    bg-gray-200
    rounded-full
    border-3 border-black
    shadow-[3px_3px_0px_rgba(0,0,0,1)]
    overflow-hidden
  ">
    {/* Progreso con gradiente metálico */}
    <div 
      className="
        relative
        h-full
        rounded-full
        transition-all duration-500 ease-out
      "
      style={{
        width: '75%',
        background: 'linear-gradient(to right, #FF8C00, #FFB84D, #FF8C00)',
        boxShadow: '0 0 15px rgba(255, 140, 0, 0.5)'
      }}
    >
      {/* Brillo viajero */}
      <div className="
        absolute inset-0
        bg-gradient-to-r from-transparent via-white/30 to-transparent
        animate-shimmer
      " />
      
      {/* Burbujas */}
      <div className="absolute bottom-1 left-[10%] w-1.5 h-1.5 bg-white/60 rounded-full animate-bubble-1" />
      <div className="absolute bottom-1 left-[30%] w-1 h-1 bg-white/50 rounded-full animate-bubble-2" />
      <div className="absolute bottom-1 left-[50%] w-2 h-2 bg-white/70 rounded-full animate-bubble-3" />
      <div className="absolute bottom-1 left-[70%] w-1 h-1 bg-white/50 rounded-full animate-bubble-1" />
      <div className="absolute bottom-1 left-[85%] w-1.5 h-1.5 bg-white/60 rounded-full animate-bubble-2" />
    </div>
  </div>
</div>
\`\`\`

**Características clave:**

- Gradiente metálico de 3 tonos para profundidad
- Brillo que viaja de izquierda a derecha
- Burbujas luminosas flotantes (efecto bebida gaseosa)
- Glow exterior sutil
- Transición suave al cambiar porcentaje

#### Barra de Progreso Segmentada

**Código base:**
\`\`\`jsx

<div className="w-full">
  <span className="font-sans font-semibold text-base text-black mb-3 block">
    Lecciones Completadas
  </span>
  
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((lesson, index) => (
      <div
        key={lesson}
        className={`
          flex-1 h-8
          rounded-lg
          border-3 border-black
          shadow-[3px_3px_0px_rgba(0,0,0,1)]
          flex items-center justify-center
          transition-all duration-300
          ${index < 3 
            ? 'bg-green' 
            : 'bg-gray-200'
          }
        `}
      >
        {index < 3 && (
          <CheckIcon className="w-5 h-5 text-white" />
        )}
      </div>
    ))}
  </div>
</div>
\`\`\`

**Características:**

- Segmentos individuales con estados (completado/pendiente)
- Checkmarks en segmentos completados
- Sin burbujas (solo en barras continuas)

#### Barra de XP con Niveles

**Código base:**
\`\`\`jsx

<div className="w-full">
  {/* Header con nivel */}
  <div className="flex justify-between items-center mb-2">
    <div className="flex items-center gap-3">
      <span className="
        font-sans font-bold text-2xl text-black
        px-4 py-2
        bg-yellow
        rounded-lg
        border-3 border-black
        shadow-[3px_3px_0px_rgba(0,0,0,1)]
      ">
        Nivel 5
      </span>
      <span className="font-sans font-semibold text-base text-gray-500">
        450 / 500 XP
      </span>
    </div>
  </div>
  
  {/* Barra de XP */}
  <div className="
    relative
    w-full h-10
    bg-gray-200
    rounded-full
    border-4 border-black
    shadow-[5px_5px_0px_rgba(0,0,0,1)]
    overflow-hidden
  ">
    <div 
      className="
        relative
        h-full
        rounded-full
        transition-all duration-700 ease-out
      "
      style={{
        width: '90%',
        background: 'linear-gradient(to right, #FFD700, #FFE066, #FFD700)',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)'
      }}
    >
      {/* Brillo viajero */}
      <div className="
        absolute inset-0
        bg-gradient-to-r from-transparent via-white/40 to-transparent
        animate-shimmer
      " />
      
      {/* Burbujas */}
      <div className="absolute bottom-1 left-[15%] w-1.5 h-1.5 bg-white/70 rounded-full animate-bubble-1" />
      <div className="absolute bottom-1 left-[35%] w-1 h-1 bg-white/60 rounded-full animate-bubble-2" />
      <div className="absolute bottom-1 left-[55%] w-2 h-2 bg-white/80 rounded-full animate-bubble-3" />
      <div className="absolute bottom-1 left-[75%] w-1 h-1 bg-white/60 rounded-full animate-bubble-1" />
    </div>
  </div>
</div>
\`\`\`

### Inputs y Forms

#### Input de Texto

**Código base:**
\`\`\`jsx

<div className="w-full">
  <label className="
    font-sans font-semibold text-base text-black
    mb-2 block
  ">
    Nombre de Usuario
  </label>
  
  <input
    type="text"
    placeholder="Ingresa tu nombre..."
    className="
      w-full
      font-sans text-base text-black
      px-4 py-3
      bg-white
      rounded-xl
      border-3 border-black
      shadow-[3px_3px_0px_rgba(0,0,0,1)]
      transition-all duration-200
      focus:outline-none
      focus:border-orange
      focus:shadow-[5px_5px_0px_rgba(0,0,0,1)]
      focus:translate-x-[-2px]
      focus:translate-y-[-2px]
      placeholder:text-gray-400
    "
  />
</div>
\`\`\`

**Estados:**

- **Base:** Border negro, sombra SM
- **Focus:** Border naranja, sombra MD, translate para "levantar"
- **Error:** Border rojo, mensaje de error debajo
- **Disabled:** Opacity 50%, cursor not-allowed

#### Checkbox

**Código base:**
\`\`\`jsx
<label className="flex items-center gap-3 cursor-pointer">
<input
    type="checkbox"
    className="
      appearance-none
      w-6 h-6
      bg-white
      rounded-md
      border-3 border-black
      shadow-[2px_2px_0px_rgba(0,0,0,1)]
      transition-all duration-200
      checked:bg-orange
      checked:border-orange
      cursor-pointer
      relative
      after:content-['']
      after:absolute
      after:inset-0
      after:bg-[url('data:image/svg+xml;base64,...')]
      after:bg-center
      after:bg-no-repeat
      after:opacity-0
      checked:after:opacity-100
    "
  />
<span className="font-sans text-base text-black">
Acepto los términos y condiciones
</span>
</label>
\`\`\`

### Notificaciones y Alertas

#### Alerta de Éxito

**Código base:**
\`\`\`jsx

<div className="
  flex items-start gap-4
  bg-green/10
  border-l-8 border-green
  rounded-xl
  p-4
  shadow-[5px_5px_0px_rgba(0,0,0,1)]
">
  <CheckCircleIcon className="w-6 h-6 text-green flex-shrink-0" />
  <div className="flex-1">
    <h4 className="font-sans font-semibold text-base text-black mb-1">
      ¡Éxito!
    </h4>
    <p className="font-sans text-sm text-gray-600">
      Tu progreso ha sido guardado correctamente.
    </p>
  </div>
  <button className="text-gray-400 hover:text-black transition-colors">
    <XIcon className="w-5 h-5" />
  </button>
</div>
\`\`\`

**Variantes:**
\`\`\`jsx
// Error
bg-red/10 border-red text-red

// Warning
bg-yellow/10 border-yellow text-yellow-dark

// Info
bg-blue/10 border-blue text-blue-dark
\`\`\`

#### Toast Notification

**Código base:**
\`\`\`jsx

<div className="
  fixed bottom-6 right-6
  flex items-center gap-3
  bg-white
  rounded-xl
  border-4 border-black
  shadow-[8px_8px_0px_rgba(0,0,0,1)]
  p-4
  min-w-[300px]
  animate-slide-in-right
">
  <div className="
    w-10 h-10
    bg-green
    rounded-full
    border-2 border-black
    flex items-center justify-center
    flex-shrink-0
  ">
    <CheckIcon className="w-6 h-6 text-white" />
  </div>
  <div className="flex-1">
    <p className="font-sans font-semibold text-base text-black">
      ¡Logro desbloqueado!
    </p>
    <p className="font-sans text-sm text-gray-600">
      Has completado 10 lecciones
    </p>
  </div>
</div>
\`\`\`

### Modales

#### Modal Básico

**Código base:**
\`\`\`jsx
{/_ Overlay _/}

<div className="
  fixed inset-0
  bg-black/60
  backdrop-blur-sm
  flex items-center justify-center
  p-4
  z-50
  animate-fade-in
">
  {/* Modal */}
  <div className="
    bg-white
    rounded-3xl
    border-4 border-black
    shadow-[12px_12px_0px_rgba(0,0,0,1)]
    max-w-md w-full
    overflow-hidden
    animate-scale-in
  ">
    {/* Header */}
    <div className="
      bg-orange
      p-6
      border-b-4 border-black
      flex items-center justify-between
    ">
      <h2 className="font-sans font-bold text-2xl text-white">
        ¡Logro Desbloqueado!
      </h2>
      <button className="
        text-white
        hover:text-black
        transition-colors
      ">
        <XIcon className="w-6 h-6" />
      </button>
    </div>
    
    {/* Contenido */}
    <div className="p-6">
      <p className="font-sans text-base text-black mb-6">
        Has completado tu primera lección. ¡Sigue así!
      </p>
      
      {/* Botones */}
      <div className="flex gap-3">
        <button className="
          flex-1
          bg-orange text-white
          font-sans font-semibold text-base
          py-3
          rounded-xl
          border-3 border-black
          shadow-[3px_3px_0px_rgba(0,0,0,1)]
          hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          transition-all duration-200
        ">
          Continuar
        </button>
        <button className="
          flex-1
          bg-white text-black
          font-sans font-semibold text-base
          py-3
          rounded-xl
          border-3 border-black
          shadow-[3px_3px_0px_rgba(0,0,0,1)]
          hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          transition-all duration-200
        ">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</div>
\`\`\`

---

## 🎬 Animaciones

### Filosofía de Animación

- **Bouncy y exagerado:** Usar easing curves con bounce
- **Rápido pero no instantáneo:** 200-300ms para interacciones, 500-700ms para transiciones grandes
- **Feedback inmediato:** Animaciones en hover/click para confirmar interacción
- **No abusar:** Solo animar lo necesario para no abrumar

### Timing y Easing

#### Duraciones Recomendadas

\`\`\`css
/_ Interacciones rápidas (hover, click) _/
transition-duration: 200ms;

/_ Transiciones medianas (modales, dropdowns) _/
transition-duration: 300ms;

/_ Transiciones grandes (page transitions, progress) _/
transition-duration: 500ms;

/_ Animaciones continuas (shimmer, pulse) _/
animation-duration: 2000ms;
\`\`\`

#### Easing Curves

\`\`\`css
/_ Para la mayoría de interacciones _/
transition-timing-function: ease-out;

/_ Para animaciones bouncy _/
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/_ Para animaciones suaves _/
transition-timing-function: ease-in-out;
\`\`\`

### Animaciones Personalizadas (CSS)

Agregar estas animaciones en `globals.css`:

\`\`\`css
@keyframes shimmer {
0% {
transform: translateX(-100%);
}
100% {
transform: translateX(200%);
}
}

@keyframes bubble-1 {
0%, 100% {
transform: translateY(0) scale(1);
opacity: 0.6;
}
50% {
transform: translateY(-20px) scale(1.2);
opacity: 0.8;
}
}

@keyframes bubble-2 {
0%, 100% {
transform: translateY(0) scale(1);
opacity: 0.5;
}
50% {
transform: translateY(-25px) scale(1.3);
opacity: 0.7;
}
}

@keyframes bubble-3 {
0%, 100% {
transform: translateY(0) scale(1);
opacity: 0.7;
}
50% {
transform: translateY(-30px) scale(1.1);
opacity: 0.9;
}
}

@keyframes pulse-glow {
0%, 100% {
box-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
}
50% {
box-shadow: 0 0 25px rgba(255, 140, 0, 0.8);
}
}

@keyframes bounce-in {
0% {
transform: scale(0) translateY(-50px);
opacity: 0;
}
50% {
transform: scale(1.1) translateY(0);
}
100% {
transform: scale(1) translateY(0);
opacity: 1;
}
}

@keyframes slide-in-right {
0% {
transform: translateX(100%);
opacity: 0;
}
100% {
transform: translateX(0);
opacity: 1;
}
}

@keyframes fade-in {
0% {
opacity: 0;
}
100% {
opacity: 1;
}
}

@keyframes scale-in {
0% {
transform: scale(0.8);
opacity: 0;
}
100% {
transform: scale(1);
opacity: 1;
}
}

@keyframes float {
0%, 100% {
transform: translateY(0);
}
50% {
transform: translateY(-10px);
}
}

@keyframes spin-slow {
0% {
transform: rotate(0deg);
}
100% {
transform: rotate(360deg);
}
}

@keyframes wiggle {
0%, 100% {
transform: rotate(0deg);
}
25% {
transform: rotate(-5deg);
}
75% {
transform: rotate(5deg);
}
}
\`\`\`

**Configurar en Tailwind (globals.css):**
\`\`\`css
@theme inline {
--animate-shimmer: shimmer 3s linear infinite;
--animate-bubble-1: bubble-1 3s ease-in-out infinite;
--animate-bubble-2: bubble-2 3.5s ease-in-out infinite 0.5s;
--animate-bubble-3: bubble-3 4s ease-in-out infinite 1s;
--animate-pulse-glow: pulse-glow 2s ease-in-out infinite;
--animate-bounce-in: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
--animate-slide-in-right: slide-in-right 0.4s ease-out;
--animate-fade-in: fade-in 0.3s ease-out;
--animate-scale-in: scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
--animate-float: float 3s ease-in-out infinite;
--animate-spin-slow: spin-slow 8s linear infinite;
--animate-wiggle: wiggle 0.5s ease-in-out;
}
\`\`\`

### Uso de Animaciones

#### Hover States (Botones, Cards)

\`\`\`jsx
className="
transition-all duration-200
hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
hover:translate-x-[-3px]
hover:translate-y-[-3px]
"
\`\`\`

#### Active/Pressed States

\`\`\`jsx
className="
active:shadow-[0px_0px_0px_rgba(0,0,0,1)]
active:translate-x-[5px]
active:translate-y-[5px]
"
\`\`\`

#### Entrada de Elementos (Mount)

\`\`\`jsx
className="animate-bounce-in"
\`\`\`

#### Elementos Flotantes

\`\`\`jsx
className="animate-float"
\`\`\`

#### Pulso/Glow

\`\`\`jsx
className="animate-pulse-glow"
\`\`\`

#### Shimmer/Brillo Viajero

\`\`\`jsx
className="animate-shimmer"
\`\`\`

### Reglas de Animación

1. **Feedback inmediato:** Hover debe responder en <200ms
2. **No animar todo:** Solo elementos interactivos o importantes
3. **Consistencia:** Usar las mismas animaciones para acciones similares
4. **Reducir movimiento:** Respetar `prefers-reduced-motion`
5. **Performance:** Animar solo `transform` y `opacity` cuando sea posible

---

## 💻 Patrones de Código

### Estructura de Componentes

#### Componente Funcional Básico

\`\`\`tsx
'use client'

import { useState } from 'react'

interface MyComponentProps {
title: string
onAction?: () => void
variant?: 'primary' | 'secondary'
}

export function MyComponent({
title,
onAction,
variant = 'primary'
}: MyComponentProps) {
const [isActive, setIsActive] = useState(false)

return (

<div className="...">
{/_ Contenido _/}
</div>
)
}
\`\`\`

### Composición de Clases

#### Usando clsx o cn para Clases Condicionales

\`\`\`tsx
import { cn } from '@/lib/utils'

<button
className={cn(
// Clases base
"font-sans font-semibold px-6 py-3 rounded-xl border-4 border-black",
"shadow-[5px_5px_0px_rgba(0,0,0,1)]",
"transition-all duration-200",

    // Clases condicionales
    variant === 'primary' && "bg-orange text-white",
    variant === 'secondary' && "bg-white text-black",

    // Estados
    isActive && "border-orange",
    disabled && "opacity-50 cursor-not-allowed"

)}

> {children}
> </button>
> \`\`\`

### Manejo de Estados

#### Estado Local Simple

\`\`\`tsx
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
\`\`\`

#### Estado con Objeto

\`\`\`tsx
const [formData, setFormData] = useState({
username: '',
email: '',
level: 1
})

// Actualizar
setFormData(prev => ({
...prev,
username: 'nuevo-nombre'
}))
\`\`\`

### Eventos y Callbacks

#### Click Handlers

\`\`\`tsx
const handleClick = () => {
console.log('[v0] Button clicked')
onAction?.()
}

<button onClick={handleClick}>
  Click Me
</button>
\`\`\`

#### Prevenir Default

\`\`\`tsx
const handleSubmit = (e: React.FormEvent) => {
e.preventDefault()
// Lógica de submit
}

<form onSubmit={handleSubmit}>
  {/* Campos */}
</form>
\`\`\`

### Renderizado Condicional

#### Operador Ternario

\`\`\`tsx
{isLoading ? (
<Spinner />
) : (
<Content />
)}
\`\`\`

#### Short-circuit (&&)

\`\`\`tsx
{isLoggedIn && (
<UserMenu />
)}
\`\`\`

#### Early Return

\`\`\`tsx
if (!data) {
return <EmptyState />
}

return <DataDisplay data={data} />
\`\`\`

### Listas y Keys

\`\`\`tsx
{items.map((item) => (

  <div key={item.id} className="...">
    {item.name}
  </div>
))}
\`\`\`

**Regla:** Siempre usar IDs únicos como keys, nunca índices del array

---

## ✅ Mejores Prácticas

### Accesibilidad

1. **Contraste de Color**
   - Mínimo 4.5:1 para texto normal
   - Mínimo 3:1 para texto grande (18px+)
   - Usar herramientas como WebAIM Contrast Checker

**Reglas de Contraste por Color de Fondo:**

**Fondos Claros (requieren texto oscuro):**
\`\`\`css
/_ Amarillo - SIEMPRE usar texto oscuro _/
bg-yellow-400 → text-gray-900 o text-black
bg-yellow-300 → text-gray-900 o text-black

/_ Gris claro - usar texto muy oscuro _/
bg-gray-300 → text-gray-900
bg-gray-200 → text-gray-800

/_ Blanco y tonos muy claros _/
bg-white → text-gray-900 o text-black
bg-gray-100 → text-gray-900
\`\`\`

**Fondos Oscuros o Saturados (requieren texto claro):**
\`\`\`css
/_ Naranja _/
bg-orange-500 → text-white
bg-orange-600 → text-white

/_ Azul _/
bg-blue-500 → text-white
bg-blue-600 → text-white

/_ Rojo _/
bg-red-500 → text-white
bg-red-600 → text-white

/_ Verde _/
bg-green-500 → text-white
bg-green-600 → text-white

/_ Morado _/
bg-purple-500 → text-white
bg-purple-600 → text-white
\`\`\`

**Gradientes (requieren análisis del tono más claro):**
\`\`\`css
/_ Si el gradiente incluye amarillo o tonos claros → texto oscuro _/
from-yellow-400 to-orange-500 → text-gray-900

/_ Si el gradiente es de tonos oscuros/saturados → texto claro _/
from-pink-500 to-orange-500 → text-white
from-blue-500 to-cyan-500 → text-white
\`\`\`

**❌ Combinaciones PROHIBIDAS:**
\`\`\`css
/_ NUNCA usar estas combinaciones _/
bg-yellow-400 + text-white (ratio: 1.8:1 - NO pasa)
bg-gray-300 + text-gray-500 (ratio: 2.1:1 - NO pasa)
bg-orange-400 + text-yellow-300 (ratio: 1.5:1 - NO pasa)
\`\`\`

**Verificación de nuestra paleta:**

\`\`\`
✅ Naranja (#FF8C00) sobre blanco: 5.2:1 (Pasa AA)
✅ Azul (#1E90FF) sobre blanco: 3.4:1 (Pasa AA para texto grande)
✅ Negro (#000000) sobre blanco: 21:1 (Pasa AAA)
✅ Blanco (#FFFFFF) sobre naranja: 5.2:1 (Pasa AA)
✅ Blanco (#FFFFFF) sobre azul: 3.4:1 (Pasa AA para texto grande)
✅ Negro (#000000) sobre amarillo: 11.7:1 (Pasa AAA)
⚠️ Amarillo (#FFD700) sobre blanco: 1.8:1 (NO pasa - usar solo para fondos con texto oscuro)
⚠️ Blanco sobre amarillo: 1.8:1 (NO pasa - NUNCA usar)
\`\`\`

2. **Texto Alternativo**
   \`\`\`jsx
   <img src="..." alt="Descripción clara de la imagen" />
   \`\`\`

3. **Labels en Inputs**
   \`\`\`jsx
   <label htmlFor="username">Nombre de Usuario</label>
   <input id="username" type="text" />
   \`\`\`

4. **ARIA cuando sea necesario**
   \`\`\`jsx
   <button aria-label="Cerrar modal" onClick={onClose}>
   <XIcon />
   </button>
   \`\`\`

5. **Focus States**
   \`\`\`jsx
   className="focus:outline-none focus:ring-4 focus:ring-orange/50"
   \`\`\`

6. **Keyboard Navigation**
   - Todos los elementos interactivos deben ser accesibles por teclado
   - Orden lógico de tab
   - Escape para cerrar modales

### Performance

1. **Optimizar Imágenes**
   - Usar Next.js Image component
   - Formatos modernos (WebP, AVIF)
   - Lazy loading para imágenes below the fold

2. **Evitar Re-renders Innecesarios**
   \`\`\`tsx
   // Usar useMemo para cálculos costosos
   const expensiveValue = useMemo(() => {
   return calculateSomething(data)
   }, [data])

// Usar useCallback para funciones
const handleClick = useCallback(() => {
doSomething()
}, [])
\`\`\`

3. **Code Splitting**
   \`\`\`tsx
   // Lazy load componentes pesados
   const HeavyComponent = lazy(() => import('./HeavyComponent'))
   \`\`\`

4. **Animar solo transform y opacity**
   - Evitar animar width, height, top, left
   - Usar transform: translate en lugar de position

### Organización de Código

1. **Estructura de Carpetas**
   \`\`\`
   /app
   /dashboard
   page.tsx
   /courses
   page.tsx
   /components
   /ui
   button.tsx
   card.tsx
   /dashboard
   badge.tsx
   progress-bar.tsx
   /lib
   utils.ts
   /docs
   design-system.md
   \`\`\`

2. **Nombres Descriptivos**
   \`\`\`tsx
   // ❌ Malo
   const btn = () => {}
   const x = data.filter(...)

// ✅ Bueno
const handleSubmit = () => {}
const completedLessons = lessons.filter(lesson => lesson.completed)
\`\`\`

3. **Comentarios Útiles**
   \`\`\`tsx
   // ❌ Malo
   // Incrementa el contador
   setCount(count + 1)

// ✅ Bueno
// Actualizar progreso del usuario después de completar lección
updateUserProgress(userId, lessonId)
\`\`\`

### Testing

1. **Componentes Visuales**
   - Verificar todos los estados (default, hover, active, disabled)
   - Probar en diferentes tamaños de pantalla
   - Verificar accesibilidad con herramientas

2. **Interacciones**
   - Click handlers funcionan correctamente
   - Forms validan y envían datos
   - Animaciones se ejecutan suavemente

3. **Edge Cases**
   - Textos muy largos
   - Listas vacías
   - Estados de carga y error
   - Datos faltantes o null

### Responsive Design

1. **Mobile First**
\`\`\`jsx
// Base: móvil
// md: tablet
// lg: desktop
<div className="
  flex flex-col gap-4
  md:flex-row md:gap-6
  lg:gap-8
">
\`\`\`

2. **Breakpoints Tailwind**
   \`\`\`
   sm: 640px
   md: 768px
   lg: 1024px
   xl: 1280px
   2xl: 1536px
   \`\`\`

3. **Touch Targets**
   - Mínimo 44x44px para elementos táctiles
   - Espaciado adecuado entre botones en móvil

### Mantenibilidad

1. **DRY (Don't Repeat Yourself)**
   - Extraer componentes reutilizables
   - Crear utilidades para lógica repetida
   - Usar constantes para valores mágicos

2. **Componentes Pequeños y Enfocados**
   - Una responsabilidad por componente
   - Máximo 200-300 líneas por archivo
   - Extraer lógica compleja a hooks personalizados

3. **Documentación**
   - Props interfaces con comentarios
   - README para componentes complejos
   - Ejemplos de uso en Storybook o similar

---

## 🎯 Checklist de Implementación

Antes de considerar un componente completo, verificar:

### Visual

- [ ] Colores correctos de la paleta
- [ ] Fuente Fredoka con pesos apropiados
- [ ] Sombras duras sin blur (SM/MD/LG según corresponda)
- [ ] Border radius apropiado (irregular si es necesario)
- [ ] Espaciado consistente con escala Tailwind
- [ ] Sin text-shadow en ningún texto

### Interactividad

- [ ] Hover state con animación suave
- [ ] Active/pressed state con efecto de presión
- [ ] Disabled state con opacity y cursor
- [ ] Focus state visible para accesibilidad
- [ ] Transiciones de 200-300ms

### Accesibilidad

- [ ] Contraste de color adecuado
- [ ] Labels en todos los inputs
- [ ] Alt text en imágenes
- [ ] ARIA labels donde sea necesario
- [ ] Navegación por teclado funcional
- [ ] Focus states visibles
- [ ] Fondos claros (amarillo, gris claro) usan texto oscuro (gray-900, black)
- [ ] Fondos oscuros/saturados (naranja, azul, rojo) usan texto claro (white)
- [ ] NUNCA usar texto blanco sobre amarillo
- [ ] NUNCA usar texto gris claro sobre gris claro

### Responsive

- [ ] Funciona en móvil (320px+)
- [ ] Funciona en tablet (768px+)
- [ ] Funciona en desktop (1024px+)
- [ ] Touch targets mínimo 44x44px
- [ ] Texto legible en todos los tamaños

### Performance

- [ ] Animaciones solo en transform/opacity
- [ ] Imágenes optimizadas
- [ ] No re-renders innecesarios
- [ ] Code splitting si es componente pesado

### Código

- [ ] Props tipadas con TypeScript
- [ ] Nombres descriptivos
- [ ] Componente reutilizable
- [ ] Sin lógica duplicada
- [ ] Comentarios donde sea necesario

---

## 📚 Recursos Adicionales

### Herramientas Recomendadas

1. **Diseño**
   - Figma para mockups
   - Coolors.co para paletas
   - WebAIM Contrast Checker para accesibilidad

2. **Desarrollo**
   - Tailwind CSS IntelliSense (VSCode extension)
   - React Developer Tools
   - Lighthouse para auditorías

3. **Testing**
   - Chrome DevTools
   - Responsive Design Mode
   - axe DevTools para accesibilidad

### Referencias

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org)

---

## ⟳ Actualizaciones del Sistema

**Versión:** 1.0.1  
**Última actualización:** 2024-07-26  
**Mantenedor:** Tu equipo de desarrollo

### Changelog

#### v1.0.1 (2024-07-26)

- Sección de Sistema Responsive añadida
- Sección de Accesibilidad ampliada con más detalles
- Secciones de Variantes de Tamaño y Estados de Carga añadidas
- Sección de Iconografía detallada
- Escala de Espaciado Formal actualizada
- Checklist de Accesibilidad detallado

#### v1.0.0 (2024)

- Sistema de diseño inicial completo
- Paleta de colores Crash Bandicoot
- Tipografía con Fredoka
- Sistema de sombras duras
- Componentes base (botones, cards, badges, progress bars)
- Animaciones y microinteracciones
- Documentación completa

---

## 💡 Ejemplos de Uso para AI

### Prompt Ejemplo 1: Crear Botón

\`\`\`
Usando el design-system.md, crea un botón primario con el texto "Comenzar Lección"
que incluya un ícono de play a la izquierda. Debe seguir exactamente el estilo
Crash Bandicoot con sombras duras, fuente Fredoka, y animaciones bouncy.
\`\`\`

### Prompt Ejemplo 2: Crear Card

\`\`\`
Siguiendo el design-system.md, crea una card de clase que muestre:

- Título de la clase
- Descripción breve
- Barra de progreso con burbujas
- Botón para acceder
  Debe usar los colores de la paleta, sombras MD, y ser interactiva en hover.
  \`\`\`

### Prompt Ejemplo 3: Crear Dashboard

\`\`\`
Usando el design-system.md como referencia, crea un dashboard estudiantil que incluya:

- Header con nombre del usuario y nivel
- Grid de cards de clases disponibles
- Sección de logros recientes con badges
- Barra de XP con niveles
  Todo debe seguir el estilo Crash Bandicoot documentado.
  \`\`\`

---

## 🌐 Sistema Responsive

### Breakpoints

Usamos los breakpoints estándar de Tailwind CSS:

\`\`\`css
/_ Mobile (base) _/
@media (min-width: 0px) { ... }

/_ Tablet _/
sm: 640px
md: 768px

/_ Desktop _/
lg: 1024px
xl: 1280px
2xl: 1536px
\`\`\`

### Estrategia Mobile-First

Siempre diseñar primero para móvil, luego agregar estilos para pantallas más grandes:

\`\`\`jsx
// ✅ Correcto: Mobile-first

<div className="
  flex flex-col gap-4 p-4
  md:flex-row md:gap-6 md:p-6
  lg:gap-8 lg:p-8
">
  {/* Contenido */}
</div>

// ❌ Incorrecto: Desktop-first

<div className="
  flex-row gap-8 p-8
  md:flex-col md:gap-4 md:p-4
">
  {/* Contenido */}
</div>
\`\`\`

### Adaptación de Componentes

#### Botones

\`\`\`jsx
// Mobile: Full width, padding reducido
// Desktop: Width auto, padding normal
<button className="
  w-full px-6 py-3 text-base
  md:w-auto md:px-8 md:py-4 md:text-lg
">
Acción
</button>
\`\`\`

#### Cards

\`\`\`jsx
// Mobile: Stack vertical, padding reducido
// Desktop: Grid horizontal, padding normal

<div className="
  flex flex-col gap-4 p-4
  md:grid md:grid-cols-2 md:gap-6 md:p-6
  lg:grid-cols-3 lg:gap-8
">
  {/* Cards */}
</div>
\`\`\`

#### Tipografía

\`\`\`jsx
// Mobile: Tamaños más pequeños
// Desktop: Tamaños completos

<h1 className="
  text-3xl
  md:text-4xl
  lg:text-5xl
  xl:text-6xl
">
  Título
</h1>
\`\`\`

#### Badges

\`\`\`jsx
// Mobile: Más pequeños, texto reducido
// Desktop: Tamaño completo
<span className="
  px-3 py-1 text-xs
  md:px-4 md:py-2 md:text-sm
">
Badge
</span>
\`\`\`

### Touch Targets

**Regla de oro:** Mínimo 44x44px para elementos táctiles en móvil

\`\`\`jsx
// Botón con touch target adecuado
<button className="
  min-w-[44px] min-h-[44px]
  px-4 py-3
">
Tap
</button>

// Checkbox con touch target adecuado
<label className="inline-flex items-center gap-3 cursor-pointer">
<input 
    type="checkbox" 
    className="w-6 h-6 cursor-pointer"
  />
<span>Opción</span>
</label>
\`\`\`

### Espaciado Responsive

\`\`\`jsx
// Espaciado que crece con el viewport

<div className="
  space-y-4
  md:space-y-6
  lg:space-y-8
">
  {/* Contenido */}
</div>
\`\`\`

### Imágenes Responsive

\`\`\`jsx
// Usar Next.js Image con sizes
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="rounded-xl"
/>
\`\`\`

---

## ♿ Accesibilidad

### Contraste de Color

**Requisitos WCAG 2.1 AA:**

- Texto normal (< 18px): Mínimo 4.5:1
- Texto grande (≥ 18px): Mínimo 3:1
- Elementos UI: Mínimo 3:1

**Reglas de Contraste por Color de Fondo:**

**Fondos Claros (requieren texto oscuro):**
\`\`\`css
/_ Amarillo - SIEMPRE usar texto oscuro _/
bg-yellow-400 → text-gray-900 o text-black
bg-yellow-300 → text-gray-900 o text-black

/_ Gris claro - usar texto muy oscuro _/
bg-gray-300 → text-gray-900
bg-gray-200 → text-gray-800

/_ Blanco y tonos muy claros _/
bg-white → text-gray-900 o text-black
bg-gray-100 → text-gray-900
\`\`\`

**Fondos Oscuros o Saturados (requieren texto claro):**
\`\`\`css
/_ Naranja _/
bg-orange-500 → text-white
bg-orange-600 → text-white

/_ Azul _/
bg-blue-500 → text-white
bg-blue-600 → text-white

/_ Rojo _/
bg-red-500 → text-white
bg-red-600 → text-white

/_ Verde _/
bg-green-500 → text-white
bg-green-600 → text-white

/_ Morado _/
bg-purple-500 → text-white
bg-purple-600 → text-white
\`\`\`

**Gradientes (requieren análisis del tono más claro):**
\`\`\`css
/_ Si el gradiente incluye amarillo o tonos claros → texto oscuro _/
from-yellow-400 to-orange-500 → text-gray-900

/_ Si el gradiente es de tonos oscuros/saturados → texto claro _/
from-pink-500 to-orange-500 → text-white
from-blue-500 to-cyan-500 → text-white
\`\`\`

**❌ Combinaciones PROHIBIDAS:**
\`\`\`css
/_ NUNCA usar estas combinaciones _/
bg-yellow-400 + text-white (ratio: 1.8:1 - NO pasa)
bg-gray-300 + text-gray-500 (ratio: 2.1:1 - NO pasa)
bg-orange-400 + text-yellow-300 (ratio: 1.5:1 - NO pasa)
\`\`\`

**Verificación de nuestra paleta:**

\`\`\`
✅ Naranja (#FF8C00) sobre blanco: 5.2:1 (Pasa AA)
✅ Azul (#1E90FF) sobre blanco: 3.4:1 (Pasa AA para texto grande)
✅ Negro (#000000) sobre blanco: 21:1 (Pasa AAA)
✅ Blanco (#FFFFFF) sobre naranja: 5.2:1 (Pasa AA)
✅ Blanco (#FFFFFF) sobre azul: 3.4:1 (Pasa AA para texto grande)
✅ Negro (#000000) sobre amarillo: 11.7:1 (Pasa AAA)
⚠️ Amarillo (#FFD700) sobre blanco: 1.8:1 (NO pasa - usar solo para fondos con texto oscuro)
⚠️ Blanco sobre amarillo: 1.8:1 (NO pasa - NUNCA usar)
\`\`\`

**Herramienta recomendada:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Estados de Foco

Todos los elementos interactivos DEBEN tener un estado de foco visible:

\`\`\`jsx
// Botón con focus state
<button className="
  bg-orange-500 text-white
  px-6 py-3 rounded-xl
  border-4 border-black
  focus:outline-none
  focus:ring-4 focus:ring-orange-300
  focus:ring-offset-2 focus:ring-offset-white
">
Acción
</button>

// Input con focus state
<input className="
  px-4 py-3 rounded-xl
  border-3 border-black
  focus:outline-none
  focus:border-orange-500
  focus:ring-4 focus:ring-orange-200
" />

// Link con focus state
<a className="
  text-blue-600 underline
  focus:outline-none
  focus:ring-2 focus:ring-blue-400
  focus:ring-offset-2
">
Enlace
</a>
\`\`\`

### ARIA Labels y Roles

#### Botones con solo íconos

\`\`\`jsx
<button aria-label="Cerrar modal" onClick={onClose}>
<XIcon className="w-6 h-6" />
</button>

<button aria-label="Reproducir lección">
  <PlayIcon className="w-6 h-6" />
</button>
\`\`\`

#### Elementos decorativos

\`\`\`jsx
// Íconos decorativos (no informativos)
<span aria-hidden="true">🎉</span>

// Imágenes decorativas
<img src="decoration.png" alt="" role="presentation" />
\`\`\`

#### Estados dinámicos

\`\`\`jsx
// Notificación con role alert

<div role="alert" aria-live="polite">
  ¡Lección completada!
</div>

// Progreso con aria-valuenow

<div 
  role="progressbar" 
  aria-valuenow={75} 
  aria-valuemin={0} 
  aria-valuemax={100}
  aria-label="Progreso del curso"
>
  <div style={{ width: '75%' }} />
</div>
\`\`\`

#### Modales

\`\`\`jsx

<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Título del Modal</h2>
  <p id="modal-description">Descripción del contenido</p>
</div>
\`\`\`

### Navegación por Teclado

**Teclas estándar que DEBEN funcionar:**

- **Tab:** Navegar al siguiente elemento interactivo
- **Shift + Tab:** Navegar al elemento anterior
- **Enter/Space:** Activar botones y links
- **Escape:** Cerrar modales y dropdowns
- **Arrow keys:** Navegar en listas y menús

\`\`\`jsx
// Modal que se cierra con Escape
useEffect(() => {
const handleEscape = (e: KeyboardEvent) => {
if (e.key === 'Escape') {
onClose()
}
}

window.addEventListener('keydown', handleEscape)
return () => window.removeEventListener('keydown', handleEscape)
}, [onClose])

// Dropdown con navegación por flechas
const handleKeyDown = (e: KeyboardEvent) => {
if (e.key === 'ArrowDown') {
// Mover al siguiente item
} else if (e.key === 'ArrowUp') {
// Mover al item anterior
} else if (e.key === 'Enter') {
// Seleccionar item actual
}
}
\`\`\`

### Reducción de Movimiento

Respetar la preferencia del usuario para reducir animaciones:

\`\`\`css
/_ En globals.css _/
@media (prefers-reduced-motion: reduce) {
_,
_::before,
\*::after {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
}
}
\`\`\`

\`\`\`jsx
// En componentes React
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<div className={prefersReducedMotion ? '' : 'animate-bounce-in'}>
  {/* Contenido */}
</div>
\`\`\`

### Texto Alternativo

\`\`\`jsx
// ✅ Correcto: Descripción clara
<img src="badge.png" alt="Insignia de Maestro del Spin - 10 lecciones completadas" />

// ✅ Correcto: Decorativo
<img src="decoration.png" alt="" role="presentation" />

// ❌ Incorrecto: Descripción vaga
<img src="badge.png" alt="insignia" />

// ❌ Incorrecto: Decorativo sin alt
<img src="decoration.png" />
\`\`\`

### Labels en Formularios

\`\`\`jsx
// ✅ Correcto: Label visible asociado
<label htmlFor="username" className="font-sans font-semibold">
Nombre de Usuario
</label>
<input id="username" type="text" />

// ✅ Correcto: Label oculto visualmente pero accesible
<label htmlFor="search" className="sr-only">
Buscar lecciones
</label>
<input id="search" type="search" placeholder="Buscar..." />

// ❌ Incorrecto: Sin label
<input type="text" placeholder="Nombre de usuario" />
\`\`\`

---

## 🎨 Variantes de Tamaño

### Sistema de Tamaños

Definir variantes consistentes para todos los componentes:

\`\`\`typescript
type Size = 'sm' | 'md' | 'lg' | 'xl'
\`\`\`

### Botones

\`\`\`jsx
// Small
<button className="px-4 py-2 text-sm rounded-lg border-2">
Pequeño
</button>

// Medium (default)
<button className="px-6 py-3 text-base rounded-xl border-3">
Mediano
</button>

// Large
<button className="px-8 py-4 text-lg rounded-xl border-4">
Grande
</button>

// Extra Large
<button className="px-10 py-5 text-xl rounded-2xl border-4">
Extra Grande
</button>
\`\`\`

### Badges

\`\`\`jsx
// Small
<span className="px-2 py-1 text-xs rounded-full border-2">
SM
</span>

// Medium
<span className="px-3 py-1.5 text-sm rounded-full border-2">
MD
</span>

// Large
<span className="px-4 py-2 text-base rounded-full border-3">
LG
</span>
\`\`\`

### Cards

\`\`\`jsx
// Small

<div className="p-4 rounded-lg border-3">
  {/* Contenido compacto */}
</div>

// Medium

<div className="p-6 rounded-xl border-4">
  {/* Contenido estándar */}
</div>

// Large

<div className="p-8 rounded-2xl border-4">
  {/* Contenido espacioso */}
</div>
\`\`\`

### Inputs

\`\`\`jsx
// Small
<input className="px-3 py-2 text-sm rounded-lg border-2" />

// Medium
<input className="px-4 py-3 text-base rounded-xl border-3" />

// Large
<input className="px-5 py-4 text-lg rounded-xl border-3" />
\`\`\`

---

## 🔄 Estados de Carga

### Spinner/Loader

\`\`\`jsx
// Spinner básico

<div className="relative w-16 h-16">
  <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
  <div 
    className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"
    style={{
      boxShadow: '0px 0px 10px rgba(255, 140, 0, 0.5)'
    }}
  ></div>
</div>

// Spinner con texto

<div className="flex flex-col items-center gap-4">
  <div className="relative w-20 h-20">
    <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
    <div 
      className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"
    ></div>
  </div>
  <p className="font-sans font-bold text-gray-700">Cargando...</p>
</div>

// Spinner inline (pequeño)

<div className="inline-flex items-center gap-2">
  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
  <span className="text-sm">Guardando...</span>
</div>
\`\`\`

### Skeleton Screens

\`\`\`jsx
// Card skeleton

<div className="bg-white p-6 rounded-xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
  {/* Header skeleton */}
  <div className="h-8 bg-gray-300 rounded-lg mb-4 animate-pulse"></div>
  
  {/* Content skeleton */}
  <div className="space-y-3">
    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
  </div>
  
  {/* Button skeleton */}
  <div className="h-12 bg-gray-300 rounded-lg mt-6 animate-pulse"></div>
</div>

// List skeleton

<div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border-3 border-black">
      <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </div>
  ))}
</div>
\`\`\`

### Estados Vacíos (Empty States)

\`\`\`jsx
// Empty state genérico

<div className="text-center py-12">
  <div className="text-8xl mb-4">📭</div>
  <h3 className="font-sans text-2xl font-bold text-gray-700 mb-2">
    No hay lecciones todavía
  </h3>
  <p className="text-gray-600 mb-6">
    Comienza tu primera lección para ver tu progreso aquí
  </p>
  <button className="bg-orange-500 text-white font-sans font-bold px-6 py-3 rounded-xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
    Comenzar Ahora
  </button>
</div>

// Empty state con ilustración

<div className="text-center py-12 max-w-md mx-auto">
  <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
    <span className="text-9xl">🎯</span>
  </div>
  <h3 className="font-sans text-2xl font-bold text-gray-700 mb-2">
    ¡Aún no has desbloqueado ninguna insignia!
  </h3>
  <p className="text-gray-600 mb-6">
    Completa lecciones y desafíos para ganar insignias épicas
  </p>
  <button className="bg-purple-500 text-white font-sans font-bold px-6 py-3 rounded-xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
    Ver Desafíos
  </button>
</div>
\`\`\`

### Loading States en Botones

\`\`\`jsx
// Botón con loading
<button
disabled={isLoading}
className="bg-orange-500 text-white font-sans font-bold px-6 py-3 rounded-xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"

> {isLoading ? (

    <span className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Guardando...
    </span>

) : (
'Guardar Progreso'
)}
</button>
\`\`\`

---

## 🎨 Iconografía

### Estilo de Íconos

**Características:**

- Líneas gruesas (3-4px de grosor)
- Esquinas redondeadas
- Colores sólidos y vibrantes
- Contorno negro de 2-3px
- Estilo cartoon/chunky

### Tamaños de Íconos

\`\`\`jsx
// Pequeño (16x16px)
<Icon className="w-4 h-4" />

// Mediano (24x24px) - Default
<Icon className="w-6 h-6" />

// Grande (32x32px)
<Icon className="w-8 h-8" />

// Extra Grande (48x48px)
<Icon className="w-12 h-12" />
\`\`\`

### Íconos con Fondo

\`\`\`jsx
// Ícono circular con fondo

<div className="
  w-12 h-12
  bg-orange-500
  rounded-full
  border-3 border-black
  shadow-[3px_3px_0px_rgba(0,0,0,1)]
  flex items-center justify-center
">
  <PlayIcon className="w-6 h-6 text-white" />
</div>

// Ícono cuadrado con fondo

<div className="
  w-12 h-12
  bg-blue-500
  rounded-lg
  border-3 border-black
  shadow-[3px_3px_0px_rgba(0,0,0,1)]
  flex items-center justify-center
">
  <BookIcon className="w-6 h-6 text-white" />
</div>
\`\`\`

### Íconos Comunes

\`\`\`jsx
// Navegación
<HomeIcon /> // Casa
<MenuIcon /> // Menú hamburguesa
<SearchIcon /> // Lupa
<BellIcon /> // Notificaciones
<UserIcon /> // Perfil

// Acciones
<PlayIcon /> // Reproducir
<PauseIcon /> // Pausar
<CheckIcon /> // Confirmar
<XIcon /> // Cerrar
<PlusIcon /> // Agregar
<MinusIcon /> // Quitar
<EditIcon /> // Editar
<TrashIcon /> // Eliminar

// Estado
<LockIcon /> // Bloqueado
<UnlockIcon /> // Desbloqueado
<StarIcon /> // Favorito/Destacado
<HeartIcon /> // Me gusta
<FireIcon /> // Racha/Popular

// Educación
<BookIcon /> // Lección
<TrophyIcon /> // Logro
<TargetIcon /> // Objetivo
<ChartIcon /> // Progreso
<ClockIcon /> // Tiempo
\`\`\`

### Íconos Animados

\`\`\`jsx
// Ícono con pulso

<div className="relative">
  <BellIcon className="w-6 h-6 text-orange-500" />
  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
</div>

// Ícono con rotación

<div className="animate-spin-slow">
  <LoaderIcon className="w-6 h-6 text-blue-500" />
</div>

// Ícono con bounce

<div className="animate-bounce">
  <TrophyIcon className="w-8 h-8 text-yellow-500" />
</div>
\`\`\`

---

## 📊 Escala de Espaciado Formal

### Escala Base (múltiplos de 4px)

\`\`\`
0 = 0px
1 = 4px
2 = 8px
3 = 12px
4 = 16px
5 = 20px
6 = 24px
8 = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
24 = 96px
32 = 128px
\`\`\`

### Uso por Contexto

#### Padding Interno

\`\`\`jsx
// Componentes muy pequeños (badges, pills)
className="p-2" // 8px

// Componentes pequeños (botones pequeños, inputs)
className="p-3" // 12px

// Componentes medianos (botones, cards pequeñas)
className="p-4" // 16px

// Componentes grandes (cards, paneles)
className="p-6" // 24px

// Componentes muy grandes (modales, secciones)
className="p-8" // 32px
\`\`\`

#### Gap entre Elementos

\`\`\`jsx
// Elementos muy cercanos (dentro de un botón)
className="gap-2" // 8px

// Elementos relacionados (lista de items)
className="gap-4" // 16px

// Secciones separadas
className="gap-6" // 24px

// Secciones muy separadas
className="gap-8" // 32px
\`\`\`

#### Margin entre Secciones

\`\`\`jsx
// Entre componentes pequeños
className="mb-4" // 16px

// Entre secciones medianas
className="mb-8" // 32px

// Entre secciones grandes
className="mb-12" // 48px

// Entre secciones muy grandes
className="mb-16" // 64px
\`\`\`

---

## 🎯 Checklist de Accesibilidad

Antes de considerar un componente completo, verificar:

### Visual

- [ ] Contraste de color mínimo 4.5:1 para texto normal
- [ ] Contraste de color mínimo 3:1 para texto grande (18px+)
- [ ] Contraste de color mínimo 3:1 para elementos UI
- [ ] Sin text-shadow que dificulte la lectura
- [ ] Tamaños de fuente legibles (mínimo 14px para texto)
- [ ] Fondos claros (amarillo, gris claro) usan texto oscuro (gray-900, black)
- [ ] Fondos oscuros/saturados (naranja, azul, rojo) usan texto claro (white)
- [ ] NUNCA usar texto blanco sobre amarillo
- [ ] NUNCA usar texto gris claro sobre gris claro

### Interactividad

- [ ] Todos los elementos interactivos tienen estado de foco visible
- [ ] Focus state tiene contraste suficiente (mínimo 3:1)
- [ ] Touch targets mínimo 44x44px en móvil
- [ ] Espaciado adecuado entre elementos táctiles

### Semántica

- [ ] HTML semántico (button, nav, main, article, etc.)
- [ ] Labels asociados a todos los inputs (htmlFor + id)
- [ ] ARIA labels en botones con solo íconos
- [ ] ARIA roles apropiados (dialog, alert, progressbar, etc.)
- [ ] Alt text descriptivo en todas las imágenes informativas
- [ ] Alt text vacío (alt="") en imágenes decorativas

### Navegación

- [ ] Navegación por teclado funcional (Tab, Shift+Tab)
- [ ] Enter/Space activan botones y links
- [ ] Escape cierra modales y dropdowns
- [ ] Orden de tab lógico y predecible
- [ ] Sin trampas de teclado (keyboard traps)

### Contenido

- [ ] Encabezados en orden jerárquico (H1 → H2 → H3)
- [ ] Texto alternativo para contenido no textual
- [ ] Transcripciones para contenido de audio
- [ ] Subtítulos para contenido de video

### Responsive

- [ ] Funciona en móvil (320px+)
- [ ] Funciona en tablet (768px+)
- [ ] Funciona en desktop (1024px+)
- [ ] Zoom hasta 200% sin pérdida de funcionalidad
- [ ] Sin scroll horizontal en móvil

### Animaciones

- [ ] Respeta prefers-reduced-motion
- [ ] Animaciones no causan mareos o náuseas
- [ ] Contenido no parpadea más de 3 veces por segundo

---

**Fin del Manual de Sistema de Diseño Completo**
