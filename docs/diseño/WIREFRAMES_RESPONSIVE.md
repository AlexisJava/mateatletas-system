# 🎨 WIREFRAMES RESPONSIVE - PORTAL ESTUDIANTE MATEATLETAS

## 📱 MOBILE LANDSCAPE (480px - 667px)

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────┬─────────────────────────────────────────────┬─────────┐ │  HEADER (8vh)
│ │ 👤  │ ALEX • NIVEL 12 • 🔥 GRUPO FÉNIX         │ 💰 🔥  │ │
│ └─────┴─────────────────────────────────────────────┴─────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │  MAIN CONTENT
│ │              ┌─────────────────────┐                        │ │  (84vh - scrollable)
│ │              │                     │                        │ │
│ │              │   AVATAR 3D         │ ◄── 30vh height       │ │
│ │              │   (compacto)        │                        │ │
│ │              │                     │                        │ │
│ │              └─────────────────────┘                        │ │
│ │                                                             │ │
│ │  ┌───────────────────────────────────────────────────────┐ │ │
│ │  │ ┌─────────────────┐                                   │ │ │
│ │  │ │  NIVEL 12       │  PROGRESO AL NIVEL 13             │ │ │
│ │  │ └─────────────────┘  ████████░░░░  850/1000 XP        │ │ │
│ │  └───────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │  ┌────────────┬────────────┬────────────┐                  │ │
│ │  │  🔥        │  🏆        │  🎯        │ ◄── Stats 3 cols│ │
│ │  │  7 días    │  12/50     │  85%       │     gap-2       │ │
│ │  │  RACHA     │  LOGROS    │  ÁLGEBRA   │                 │ │
│ │  └────────────┴────────────┴────────────┘                  │ │
│ │                                                             │ │
│ │  ┌───────────────────────────────────────────────────────┐ │ │
│ │  │ 📅  PRÓXIMA CLASE • HOY • 14:00 hs           🔴      │ │ │
│ │  └───────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │  ┌───────────────────────────────────────────────────────┐ │ │
│ │  │          ¡ENTRENAR MATEMÁTICAS!                       │ │ │  CTA Gigante
│ │  │        Resolvé desafíos y dominá números              │ │ │  h-16
│ │  └───────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │  BOTTOM NAV (8vh)
│ │ ┌──────────┐     MATEATLETAS STEAM     ┌──────────────┐   │ │
│ │ │ 💰 🔥   │                            │ ☰ MENÚ      │   │ │
│ │ └──────────┘                            └──────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

CARACTERÍSTICAS:
- Scroll vertical activado
- 1 columna vertical
- Avatar reducido (30vh)
- Navegación inferior minimalista
- Tipografía: text-sm → text-base
- Padding: px-3 py-2
- Gaps: gap-2
```

---

## 📱 TABLET LANDSCAPE (768px - 1024px)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┬────────────────────────────────────────────────────────┬──────────┐ │  HEADER (10vh)
│ │ 👤   │            MATEATLETAS CLUB STEAM                      │ 💰 🔥  │ │
│ │ ALEX │                                                        │         │ │
│ └──────┴────────────────────────────────────────────────────────┴──────────┘ │
│                                                                                │
│ ┌────────────────────────────────────────────────────────────────────────────┐ │  MAIN CONTENT
│ │                                                                            │ │  (80vh - sin scroll)
│ │  ┌─────────────────────────────┬────────────────────────────────────────┐ │ │
│ │  │                             │                                        │ │ │
│ │  │                             │  ┌──────────────┐                      │ │ │
│ │  │        AVATAR 3D            │  │  NIVEL 12    │                      │ │ │
│ │  │     (50% ancho)             │  └──────────────┘                      │ │ │
│ │  │                             │                                        │ │ │
│ │  │   Resplandor animado        │  PROGRESO AL NIVEL 13                 │ │ │
│ │  │   Clickeable para           │  ██████████░░  850/1000 XP            │ │ │
│ │  │   activar animaciones       │                                        │ │ │
│ │  │                             │  ┌─────────┬─────────┬─────────┐      │ │ │
│ │  │                             │  │  🔥     │  🏆    │  🎯     │      │ │ │  Stats
│ │  │                             │  │ 7 días  │ 12/50  │ 85%     │      │ │ │  3 cols
│ │  │                             │  │ RACHA   │ LOGROS │ ÁLGEBRA │      │ │ │  gap-4
│ │  │                             │  └─────────┴─────────┴─────────┘      │ │ │
│ │  │                             │                                        │ │ │
│ │  │                             │  ┌────────────────────────────────────┐│ │ │
│ │  │                             │  │ 📅 PRÓXIMA CLASE                  ││ │ │
│ │  │                             │  │ Álgebra Lineal                    ││ │ │
│ │  │                             │  │ HOY • 14:00 hs • 60 min   EN VIVO ││ │ │
│ │  │                             │  └────────────────────────────────────┘│ │ │
│ │  │                             │                                        │ │ │
│ │  │                             │  ┌────────────────────────────────────┐│ │ │
│ │  │                             │  │  ¡ENTRENAR MATEMÁTICAS!            ││ │ │  CTA
│ │  │                             │  │  Resolvé desafíos y dominá números ││ │ │  h-20
│ │  │                             │  └────────────────────────────────────┘│ │ │
│ │  │                             │                                        │ │ │
│ │  └─────────────────────────────┴────────────────────────────────────────┘ │ │
│ │                                                                            │ │
│ └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│ ┌────────────────────────────────────────────────────────────────────────────┐ │  BOTTOM NAV
│ │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │ │  (10vh)
│ │  │ 🏠   │  │ 🧠   │  │ 📖   │  │ 🏆   │  │ 🛒   │  │ ✨   │  │ ☰    │  │ │  Dock Bar
│ │  │ HUB  │  │ENTRE │  │TAREAS│  │LOGROS│  │TIENDA│  │ANIMA │  │MENÚ  │  │ │  7 botones
│ │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │ │
│ └────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘

CARACTERÍSTICAS:
- Sin scroll vertical
- Layout 50/50 (Avatar | Info)
- Dock bar inferior con 5-7 botones
- Tipografía: text-base → text-lg
- Padding: px-6 py-4
- Gaps: gap-4
```

---

## 💻 DESKTOP (1280px+)

```
┌───┬───────────────────────────────────────────────────────────────────────┬───┐
│ 🏠│ ┌──────┬──────────────────────────────────────────────────┬──────────┐│ 🎨│
│   │ │ 👤  │         MATEATLETAS CLUB STEAM                    │ 💰 🔥  ││   │
│ 🧠│ │ ALEX │                                                   │         ││ 👥│  HEADER
│ │ │ │      │                                                   │         ││ │ │  (10vh)
│ 📖│ └──────┴──────────────────────────────────────────────────┴──────────┘│ 📊│
│ │ │                                                                        │ │ │
│ 🏆│ ┌──────────────────────────────────────────────────────────────────────┐│ 🔔│  MAIN
│ │ │ │                                                                      ││ │ │  (90vh)
│ 🛒│ │  ┌─────────────────────────────┬──────────────────────────────────┐ ││ 🚪│
│   │ │  │                             │                                  │ ││   │
│ N │ │  │                             │  ┌────────────────┐              │ ││ N │
│ A │ │  │                             │  │   NIVEL 12     │              │ ││ A │
│ V │ │  │        AVATAR 3D            │  └────────────────┘              │ ││ V │
│   │ │  │     (50% ancho)             │                                  │ ││   │
│ L │ │  │                             │  PROGRESO AL NIVEL 13            │ ││ R │
│ E │ │  │   Resplandor animado        │  ████████████░░  850/1000 XP     │ ││ I │
│ F │ │  │   grande y brillante        │                                  │ ││ G │
│ T │ │  │                             │  ┌───────┬───────┬───────┐       │ ││ H │
│   │ │  │   Clickeable para           │  │  🔥   │  🏆  │  🎯  │       │ ││ T │
│ 5 │ │  │   activar animaciones       │  │7 días │12/50 │ 85%  │       │ ││   │
│   │ │  │                             │  │ RACHA │LOGROS│ÁLGEB │       │ ││ 5 │
│ B │ │  │                             │  └───────┴───────┴───────┘       │ ││   │
│ T │ │  │                             │                                  │ ││ B │
│ N │ │  │                             │  ┌──────────────────────────────┐│ ││ T │
│ S │ │  │                             │  │ 📅 PRÓXIMA CLASE             ││ ││ N │
│   │ │  │                             │  │ Álgebra Lineal               ││ ││ S │
│   │ │  │                             │  │ VIERNES 31 OCT • 14:00 hs    ││ ││   │
│   │ │  │                             │  │ 60 min • Grupo Fénix EN VIVO ││ ││   │
│   │ │  │                             │  └──────────────────────────────┘│ ││   │
│   │ │  │                             │                                  │ ││   │
│   │ │  │                             │  ┌──────────────────────────────┐│ ││   │
│   │ │  │                             │  │ ¡ENTRENAR MATEMÁTICAS!       ││ ││   │
│   │ │  │                             │  │ Resolvé desafíos y dominá    ││ ││   │
│   │ │  │                             │  │ números                      ││ ││   │
│   │ │  │                             │  └──────────────────────────────┘│ ││   │
│   │ │  │                             │                                  │ ││   │
│   │ │  └─────────────────────────────┴──────────────────────────────────┘ ││   │
│   │ │                                                                      ││   │
│   │ └──────────────────────────────────────────────────────────────────────┘│   │
└───┴───────────────────────────────────────────────────────────────────────┴───┘

CARACTERÍSTICAS:
- Sin scroll vertical
- Navegación lateral fija (10 botones)
- Layout 50/50 (Avatar | Info)
- Sin bottom nav
- Tooltips expandidos en hover
- Tipografía: text-lg → text-xl
- Padding: px-8 py-6
- Gaps: gap-6
```

---

## 🔄 PANTALLA DE BLOQUEO PORTRAIT

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         ✨ ✨ ✨           │
│                             │
│      ┌─────────────┐        │
│      │             │        │
│      │   📱 ↻      │        │  Campo de estrellas
│      │             │        │  animado de fondo
│      └─────────────┘        │
│                             │
│         🔄                  │  Emoji gigante rotando
│                             │
│   ┌─────────────────────┐   │
│   │ ROTA TU TELÉFONO    │   │  Título holográfico
│   └─────────────────────┘   │  con glow cian/púrpura
│                             │
│  El Gimnasio está diseñado  │
│  para jugarse en modo       │
│  horizontal                 │
│                             │
│  ┌─────────────────────────┐│
│  │ 🔄 Gira tu dispositivo  ││  Instrucción con
│  │    para continuar       ││  glassmorphism
│  └─────────────────────────┘│
│                             │
│         ↻  ↻  ↻            │  Flechas pulsantes
│                             │
│  Una experiencia inmersiva  │
│  te espera                  │
│                             │
└─────────────────────────────┘

CARACTERÍSTICAS:
- Fondo: gradiente from-slate-900 via-purple-900 to-slate-900
- Campo de estrellas: 100 partículas animadas (twinkle)
- Nebulosas pulsantes: púrpura y cian con blur-[120px]
- Icono smartphone: rotación [0, 90, 90, 0] cada 3s
- Emoji: rotación 360° continua
- Título: textShadow pulsante cian/púrpura
- Card central: backdrop-blur-md con border animado
- Flechas: bounce infinito con delay
```

---

## 🎯 JERARQUÍA VISUAL Y ESPACIADO

### Escala de Tamaños por Breakpoint

| Elemento             | Mobile        | Tablet        | Desktop       |
| -------------------- | ------------- | ------------- | ------------- |
| **Avatar 3D**        | 30vh          | 50% width     | 50% width     |
| **Header**           | 8vh           | 10vh          | 10vh          |
| **Bottom Nav**       | 8vh           | 10vh          | -             |
| **Main Content**     | 84vh (scroll) | 80vh (fixed)  | 90vh (fixed)  |
| **Stat Card**        | p-3 gap-2     | p-4 gap-2     | p-6 gap-3     |
| **Nav Button**       | w-14 h-14     | w-14 h-14     | w-20 h-20     |
| **CTA Button**       | h-16          | h-20          | h-24          |
| **Grid Gaps**        | gap-2         | gap-4         | gap-6         |
| **Padding**          | px-3 py-2     | px-6 py-4     | px-8 py-6     |

### Escala Tipográfica

| Elemento             | Mobile        | Tablet        | Desktop       |
| -------------------- | ------------- | ------------- | ------------- |
| **H1 (Logo)**        | text-3xl      | text-4xl      | text-6xl      |
| **H2 (Títulos)**     | text-2xl      | text-3xl      | text-5xl      |
| **Body (Normal)**    | text-base     | text-lg       | text-xl       |
| **Small (Labels)**   | text-sm       | text-base     | text-lg       |
| **Tiny (Metadata)**  | text-xs       | text-sm       | text-base     |

---

## 🎨 PALETA DE COLORES ADAPTATIVA

### Gradientes de Fondo (HubView)

```css
/* Base espacial animado */
background: linear-gradient(
  135deg,
  rgba(139, 92, 246, 0.3) 0%,
  rgba(168, 85, 247, 0.25) 25%,
  rgba(99, 102, 241, 0.3) 50%,
  rgba(79, 70, 229, 0.25) 75%,
  rgba(67, 56, 202, 0.3) 100%
);

/* Acentos radiales neón */
background: radial-gradient(ellipse at 25% 25%, rgba(6, 182, 212, 0.4) 0%, transparent 40%),
  radial-gradient(ellipse at 75% 75%, rgba(236, 72, 153, 0.35) 0%, transparent 40%);
```

### Gradientes de Componentes

| Componente             | Gradiente                                            | Glow Color |
| ---------------------- | ---------------------------------------------------- | ---------- |
| **HUB (Nav)**          | from-blue-500 via-cyan-500 to-blue-600               | cyan       |
| **Entrenamientos**     | from-pink-500 via-rose-500 to-red-500                | pink       |
| **Tareas Asignadas**   | from-purple-500 via-violet-500 to-indigo-600         | purple     |
| **Mis Logros**         | from-yellow-400 via-amber-500 to-orange-600          | yellow     |
| **Tienda**             | from-green-500 via-emerald-500 to-teal-600           | green      |
| **Racha (Stat)**       | from-orange-500 to-red-600                           | orange     |
| **Próxima Clase**      | from-green-400 via-emerald-500 to-teal-500           | green      |
| **CTA Principal**      | from-yellow-400 via-orange-500 to-red-500            | orange     |
| **Modal Bloqueo**      | from-slate-900 via-purple-900 to-slate-900           | purple     |

---

## 🧪 TESTING MATRIX

### Dispositivos de Prueba Recomendados

| Dispositivo              | Resolución   | Orientación  | Breakpoint |
| ------------------------ | ------------ | ------------ | ---------- |
| **iPhone SE**            | 568 x 320    | Landscape    | Mobile XS  |
| **iPhone 13 Mini**       | 812 x 375    | Landscape    | Mobile XS  |
| **iPhone 13 Pro**        | 844 x 390    | Landscape    | Mobile SM  |
| **iPad**                 | 1024 x 768   | Landscape    | Tablet MD  |
| **iPad Pro 11"**         | 1194 x 834   | Landscape    | Tablet MD  |
| **iPad Pro 12.9"**       | 1366 x 1024  | Landscape    | Desktop LG |
| **Laptop 1080p**         | 1920 x 1080  | Landscape    | Desktop XL |
| **Desktop 1440p**        | 2560 x 1440  | Landscape    | Desktop XL |
| **Ultra-wide 4K**        | 3840 x 1600  | Landscape    | Desktop XL |

### Checklist de Validación

- [ ] ✅ Avatar 3D se renderiza correctamente en todos los tamaños
- [ ] ✅ Navegación cambia entre sidebar/dock/menu según breakpoint
- [ ] ✅ Tipografía escalable sin overflow
- [ ] ✅ Stats visibles sin scroll horizontal
- [ ] ✅ Próxima Clase card cambia entre compact/expanded
- [ ] ✅ CTA button siempre visible en viewport
- [ ] ✅ Pantalla de bloqueo aparece en portrait
- [ ] ✅ Animaciones fluidas sin lag (60fps)
- [ ] ✅ Safe areas respetadas en notch devices
- [ ] ✅ Accesibilidad: contraste mínimo 4.5:1

---

**Autor:** Claude (Anthropic)
**Fecha:** 2025-10-31
**Versión:** 1.0.0
