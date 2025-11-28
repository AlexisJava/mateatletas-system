# 🚀 ESTRATEGIA COMPLETA DE LANDING PAGE - MATEATLETAS

**Documento:** Estrategia de Marketing Web y Landing Page
**Fecha:** 2025-11-02
**Versión:** 1.0
**Estado:** Propuesta estratégica completa

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis del Producto](#análisis-del-producto)
3. [Arquitectura de la Web](#arquitectura-de-la-web)
4. [Landing Principal](#landing-principal)
5. [Páginas Específicas](#páginas-específicas)
6. [Diseño Visual](#diseño-visual)
7. [Copywriting y Mensajes](#copywriting-y-mensajes)
8. [CTAs y Conversión](#ctas-y-conversión)
9. [Stack Técnico](#stack-técnico)
10. [Plan de Implementación](#plan-de-implementación)
11. [Métricas y KPIs](#métricas-y-kpis)

---

## 🎯 RESUMEN EJECUTIVO

### Propuesta de Valor Central

**Mateatletas** es una plataforma EdTech revolucionaria que combina:

- ✅ Educación STEAM de alta calidad (Matemática + Programación + Robótica + Ciencias)
- ✅ Gamificación profunda estilo videojuegos AAA
- ✅ Clases en vivo con profesores especializados + cursos auto-dirigidos
- ✅ Economía virtual dual (estudiantes ganan monedas → canjean cursos premium)
- ✅ Tecnología world-class (NestJS + Next.js + PostgreSQL)

### Desafío de Marketing

Con **más de 20 funcionalidades principales**, crear una landing page que:

1. ❌ **NO** abrume al usuario con información excesiva
2. ✅ **SÍ** capture atención en 60 segundos
3. ✅ **SÍ** comunique valor claramente
4. ✅ **SÍ** genere conversión (registro → prueba gratis)

### Solución Propuesta

**Arquitectura Híbrida:**

- 🏠 **Landing Principal:** Breve, enfocada, persuasiva (5 secciones, 2-3 min lectura)
- 📄 **Páginas Específicas:** Profundas, detalladas, por audiencia (9+ páginas)
- 🎯 **User Journey:** Landing → Página específica → Registro

---

## 📊 ANÁLISIS DEL PRODUCTO

### Funcionalidades Principales Identificadas

#### 1️⃣ **Sistema de Membresías y Precios**

**Productos:**

- **Club de Matemáticas:** $50,000 ARS/mes (~$50-60 USD)
  - Acceso a clases en vivo ilimitadas
  - Sistema de gamificación completo
  - Dashboard de progreso

- **Cursos Especializados:** $55,000 ARS/mes (~$55-65 USD)
  - Todo lo del Club + currículos especializados
  - Preparación para olimpiadas
  - Programación avanzada

**Sistema de Descuentos Automáticos:**

| Escenario                       | Precio/Actividad | Descuento | Ejemplo          |
| ------------------------------- | ---------------- | --------- | ---------------- |
| 1 hijo, 1 actividad             | $50,000          | 0%        | $50,000/mes      |
| 1 hijo, 2+ actividades          | $44,000          | 12%       | $88,000/mes      |
| 2+ hermanos, 1 actividad        | $44,000          | 12%       | $88,000/mes      |
| **2+ hermanos, 2+ actividades** | **$38,000**      | **24%**   | **$152,000/mes** |
| Socios AACREA                   | Base - 20%       | 20%       | $40,000/mes      |

**Valor Agregado:**

- Sin permanencia mínima
- Cancela cuando quieras
- Débito automático disponible
- Primera semana gratis

---

#### 2️⃣ **Sistema de Clases en Vivo**

**Características:**

- **Flexibilidad Total:** Calendario semanal con múltiples horarios
- **Grupos Reducidos:** Máximo 8-12 estudiantes por clase
- **6 Rutas Curriculares:** Lógica, Álgebra, Geometría, Trigonometría, Programación, Robótica
- **3 Niveles Pedagógicos:**
  - B1-B3: Básicos (6-10 años)
  - A1-A2: Avanzados (11-14 años)
  - OLIMP: Preparación olímpica (todas las edades)
- **Integración Jitsi Meet:** Videollamadas HD
- **Sistema de Asistencia:** Registro automático + feedback personalizado

---

#### 3️⃣ **Sistema de Gamificación (El Corazón)**

**Recursos Duales:**

| Recurso              | Función                             | Cómo Ganar                                 |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| **XP (Experiencia)** | Sube niveles 1-10+ (nunca se gasta) | Asistir a clases, completar tareas, logros |
| **Monedas**          | Canjea cursos STEAM premium         | 2-500 monedas por actividad                |
| **Gemas (Fase 2)**   | Items legendarios exclusivos        | Competencias especiales                    |

**Fórmula de Niveles:**

- Nivel 1: 0 XP
- Nivel 5: 2,500 XP
- Nivel 10: 10,000 XP
- Fórmula: `nivel = floor(sqrt(XP / 100)) + 1`

**Sistema de Equipos Competitivos:**

1. 🔥 **Equipo Fénix** (Naranja/Rojo) - "Renacemos del fracaso"
2. 🐉 **Equipo Dragón** (Verde/Esmeralda) - "Sabiduría y poder"
3. 🐅 **Equipo Tigre** (Amarillo/Oro) - "Velocidad y precisión"
4. 🦅 **Equipo Águila** (Azul/Celeste) - "Visión y estrategia"

**Competencias:**

- Rankings semanales por equipo
- Rankings individuales Top 10
- Premios: Monedas bonus, logros exclusivos, items legendarios

**Sistema de Logros (50+ Achievements):**

| Categoría        | Ejemplos                       | Recompensas                        |
| ---------------- | ------------------------------ | ---------------------------------- |
| **Consistencia** | Racha 7/30/90 días             | 30-600 monedas + animaciones       |
| **Maestría**     | Completar módulo 100%          | 250-1,000 monedas + badges         |
| **Precisión**    | 10/50/100 ejercicios perfectos | 80-500 monedas + efectos visuales  |
| **Social**       | Ayudar 5/25 estudiantes        | 60-400 monedas + títulos           |
| **Velocidad**    | Resolver en <30s               | 40-150 monedas + animaciones Flash |

**Rareza:** Común (gris) → Raro (azul) → Épico (morado) → Legendario (dorado)

**Tienda Virtual:**

- Animaciones: "Victoria Épica", "Baile del Fuego" (80-150 monedas)
- Skins de Avatar: "Científico Loco", "Hacker Elite" (120 monedas)
- Efectos de Partículas: Estrellas, Código Matrix (60-80 monedas)
- Títulos: "Maestro Matemático" (50-100 monedas)
- Marcos de Avatar: Oro, Platino (70-150 monedas)

**Sin Pay-to-Win:** Todas las monedas se ganan estudiando.

---

#### 4️⃣ **Marketplace de Cursos STEAM**

**Catálogo de +50 Cursos:**

**Programación:**

- Videojuegos con Scratch (6 clases) - 500 monedas ($25 USD)
- Python desde Cero (12 clases) - 1,000 monedas ($50 USD)
- React para Principiantes (15 clases) - 1,600 monedas ($80 USD)
- Machine Learning con Python (20 clases) - 3,200 monedas ($160 USD)

**Ciencias:**

- Química Explosiva Virtual (8 clases) - 700 monedas ($35 USD)
- Astronomía Interactiva (6 clases) - 600 monedas ($30 USD)
- Física con Simuladores (8 clases) - 700 monedas ($35 USD)

**Robótica:**

- Arduino desde Cero (8 clases) - 700 monedas ($35 USD)
- Robot Móvil con Arduino (10 clases) - 1,000 monedas ($50 USD)
- Internet of Things (15 clases) - 1,800 monedas ($90 USD)

**Diseño 3D:**

- Blender 3D: Modelado Básico (10 clases) - 1,000 monedas ($50 USD)
- Unity Básico: Juegos 3D (15 clases) - 2,000 monedas ($100 USD)

**Maestrías Completas:**

- Full Stack Web Developer (30 clases) - 4,000 monedas ($200 USD)
- Inteligencia Artificial Aplicada (40 clases) - 6,000 monedas ($300 USD)

**Sistema de Aprobación Padre:**

1. Estudiante solicita canje con monedas
2. Padre recibe notificación
3. Padre elige opción de pago:
   - Padre paga todo: 100% USD, 0 monedas
   - 50/50: 50% USD + 50% monedas
   - Hijo paga todo: 0 USD + 100% monedas
4. Curso se habilita automáticamente

---

#### 5️⃣ **Plataforma de Cursos Auto-Dirigidos**

**Estructura:**

```
Producto (Curso)
└── Módulos (3-10 por curso)
    └── Lecciones (5-20 por módulo)
        ├── Tipo: Video (YouTube, Vimeo)
        ├── Tipo: Texto (Markdown)
        ├── Tipo: Quiz (JSON interactivo)
        └── Tipo: Tarea (Asignación práctica)
```

**Best Practices Ed-Tech:**

- Chunking: Contenido en bloques digeribles
- Microlearning: Lecciones 5-15 minutos
- Progressive Disclosure: Lecciones se desbloquean secuencialmente
- Multi-modal Learning: Videos + Texto + Quizzes + Tareas
- Immediate Feedback: Puntos instantáneos al completar

---

#### 6️⃣ **Avatares 3D y Personalización**

**Ready Player Me Integration:**

- Creación de avatar 3D personalizado
- URL permanente del avatar
- Animaciones idle personalizables
- 10 gradientes de fondo predefinidos

**Sistema de Animaciones:**

- Animaciones base incluidas
- Animaciones desbloqueables por logros
- Animaciones premium en tienda

---

#### 7️⃣ **Dashboards Especializados**

**Dashboard Tutor/Padre:**

- Resumen Financiero: Inscripciones activas, próximo pago, descuentos
- Progreso de Hijos: XP, nivel, monedas, logros por estudiante
- Calendario de Clases: Próximas clases reservadas
- Historial de Pagos: Facturas, estados
- Sistema de Canjes: Aprobar/rechazar solicitudes
- Puntos Padre: Balance y catálogo de premios

**Dashboard Estudiante (Gimnasio Mental):**

- Hub 3D Interactivo con avatar
- Stats en Tiempo Real: XP, nivel, monedas, racha
- Logros Recientes: Últimos 5 desbloqueados
- Ranking de Equipo: Posición + top 3
- Ranking Individual: Tu posición + vecinos
- Próximas Clases: Calendario semanal
- Notificaciones: Logros, puntos, clases
- Acceso a Tienda y Catálogo

**Dashboard Docente:**

- KPIs: Clases dictadas, estudiantes activos, asistencia promedio
- Calendario Mensual: Vista de todas las clases/eventos
- Próximas Clases: Lista con cupos y estudiantes
- Gestión de Asistencia: Marcar presente/ausente + observaciones
- Otorgamiento de Puntos: Selección rápida de acciones
- Reportes con Gráficos: Chart.js

---

#### 8️⃣ **Tecnología y Seguridad**

**Frontend:**

- Next.js 15.5 con App Router y Turbopack
- React 19 + TypeScript estricto
- Tailwind CSS 4.0 con design system custom
- Framer Motion para animaciones fluidas
- React Query para server state (98% menos requests)
- Chart.js + Recharts para gráficos

**Backend:**

- NestJS 11 con arquitectura modular limpia
- Prisma ORM con 22 modelos optimizados
- PostgreSQL con índices estratégicos
- Redis Cache con fallback a memoria (95% hit rate)
- Winston Logger con rotación diaria
- Helmet + CSRF + Rate Limiting para seguridad
- JWT en httpOnly cookies (máxima seguridad)

**Calidad:**

- 99 tests automatizados pasando
- 0 errores TypeScript
- 0 N+1 queries (eager loading optimizado)
- 0ms UI response time (optimistic updates)
- 0 memory leaks (auto-cleanup)

---

#### 9️⃣ **Sistema de Puntos Padre**

**Concepto:** Los padres también ganan recompensas

**Cómo Ganar Puntos:**

- Pagar puntualmente
- Revisar progreso de hijos regularmente
- Referir amigos/familias
- Asistir a reuniones virtuales
- Completar encuestas de satisfacción

**Cómo Canjear:**

- Monedas para regalar a hijos
- Cursos STEAM gratis
- Descuentos adicionales en suscripciones
- Acceso a contenido exclusivo para padres

---

### Ventajas Competitivas

**vs. Khan Academy:**

- ✅ Clases EN VIVO con profesores reales
- ✅ Gamificación 10x más profunda
- ✅ Avatares 3D personalizables
- ✅ Economía virtual con canjes tangibles

**vs. IXL Learning:**

- ✅ Flexibilidad total de horarios
- ✅ Sistema de equipos competitivos
- ✅ Marketplace de cursos STEAM premium
- ✅ Descuentos familiares inteligentes

**vs. Matific:**

- ✅ Cubre hasta universidad (no solo primaria)
- ✅ Multi-materia (matemática + programación + robótica + ciencias)
- ✅ Sistema de recompensas dual (estudiantes + padres)
- ✅ Localizado para LATAM (español, ARS, MercadoPago)

---

## 🏗️ ARQUITECTURA DE LA WEB

### Estructura Propuesta: Híbrida

**Concepto:** Landing principal breve + Páginas específicas profundas

### Sitemap Completo

```
/ (Landing Principal - BREVE)
├── #hero
├── #propuesta-valor
├── #como-funciona
├── #social-proof
└── #cta-final

/para-estudiantes (Página profunda)
├── Sistema de gamificación completo
├── Avatares 3D
├── Logros y equipos
├── Tienda virtual
└── Dashboard demo

/para-padres (Página profunda)
├── Dashboard con métricas
├── Sistema de descuentos
├── Control de canjes
├── Puntos Padre
└── Calculadora interactiva

/para-docentes (Página profunda)
├── Herramientas de enseñanza
├── Calendario inteligente
├── Sistema de asistencia
└── Reportes automáticos

/cursos-steam (Marketplace)
├── Catálogo completo (+50 cursos)
├── Filtros por categoría
├── Detalles de cada curso
└── Sistema de canjes explicado

/clases-en-vivo
├── Sistema de clases detallado
├── Horarios y calendario
├── Niveles pedagógicos
├── Perfiles de docentes
└── Sistema de reservas

/precios
├── Tabla comparativa de planes
├── Sistema de descuentos explicado
├── Calculadora interactiva
├── FAQ de precios
└── Métodos de pago

/como-funciona
├── Tutorial paso a paso
├── Videos demostrativos
├── Casos de uso
└── Preguntas frecuentes

/tecnologia
├── Stack técnico
├── Seguridad y privacidad
├── Métricas de calidad
└── Documentación API

/testimonios
├── Historias de familias
├── Videos testimoniales
├── Estadísticas de impacto
└── Casos de éxito

/blog (Futuro - SEO)
├── Artículos educativos
├── Tips de aprendizaje
├── Noticias de la plataforma
└── Recursos gratuitos

/register
└── Formulario de registro completo

/login
└── Página de login existente

/demo
└── Demo interactiva de la plataforma

/legal
├── /terminos
├── /privacidad
└── /cookies
```

---

## 🏠 LANDING PRINCIPAL (Diseño Detallado)

### Objetivo

Capturar atención en **60 segundos** y generar conversión rápida.

### Características

- ⚡ **Tiempo de lectura:** 2-3 minutos
- 📱 **Mobile-first responsive**
- 🎯 **5 secciones core**
- 🚀 **Carga rápida:** <2 segundos

---

### SECCIÓN 1: HERO

#### Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [Navbar Sticky]                                      │
│   Logo | Plataforma ▼ | Cursos | Precios | Testimonios│
│                            [Ingresar] [Prueba Gratis]  │
│                                                         │
│   ─────────────────────────────────────────────────     │
│                                                         │
│   ┌─────────────────────┐  ┌─────────────────────┐   │
│   │                     │  │                     │   │
│   │  [Video 15 seg      │  │  "Tus hijos         │   │
│   │   o GIF animado     │  │   aprenden jugando  │   │
│   │   del dashboard     │  │   y ganan cursos    │   │
│   │   + avatar 3D]      │  │   STEAM gratis"     │   │
│   │                     │  │                     │   │
│   │                     │  │  Clases en vivo +   │   │
│   │                     │  │  Gamificación AAA + │   │
│   │                     │  │  50 cursos de       │   │
│   │                     │  │  Programación a IA  │   │
│   │                     │  │                     │   │
│   └─────────────────────┘  │  [Prueba 7 Días    │   │
│                             │   Gratis 🟠]       │   │
│                             │  [Ver Cómo         │   │
│                             │   Funciona ▶️]     │   │
│                             │                     │   │
│                             │  ⭐⭐⭐⭐⭐         │   │
│                             │  500+ familias     │   │
│                             │  4.9/5 rating      │   │
│                             │  Sin tarjeta       │   │
│                             └─────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Elementos Clave

**Video/GIF (15 segundos):**

- Niño usando la plataforma
- Avatar 3D moviéndose
- Logros desbloqueándose
- Monedas ganándose
- Ranking subiendo

**Headline:**

```
"Tus hijos aprenden jugando
y ganan cursos STEAM gratis"
```

**Subheadline:**

```
Clases en vivo + Gamificación AAA + 50 cursos de Programación a IA
```

**CTAs:**

- 🟠 Primario: "Prueba 7 Días Gratis" → `/register`
- ▶️ Secundario: "Ver Cómo Funciona" → Video modal o scroll a #como-funciona

**Trust Badges:**

- ⭐ 4.9/5 rating
- 👥 500+ familias activas
- 🔒 Sin tarjeta de crédito
- ✅ Cancela cuando quieras

---

### SECCIÓN 2: PROPUESTA DE VALOR TRIPLE

#### Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         "Mateatletas es para toda la familia"          │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│   │              │  │              │  │             ││
│   │   🎮         │  │   👨‍👩‍👧‍👦      │  │   👨‍🏫      ││
│   │              │  │              │  │             ││
│   │   PARA       │  │   PARA       │  │   PARA      ││
│   │ ESTUDIANTES  │  │   PADRES     │  │  DOCENTES   ││
│   │              │  │              │  │             ││
│   │ • Aprende    │  │ • Hasta      │  │ • Enseña    ││
│   │   jugando    │  │   24% OFF    │  │   con       ││
│   │ • Gana XP    │  │   hermanos   │  │   tecno-    ││
│   │   y logros   │  │ • Dashboard  │  │   logía     ││
│   │ • Avatar 3D  │  │   métricas   │  │   de punta  ││
│   │ • Canjea     │  │ • Control    │  │ • Grupos    ││
│   │   cursos     │  │   total      │  │   reducidos ││
│   │   STEAM      │  │ • Puntos     │  │ • Gamifi-   ││
│   │              │  │   Padre      │  │   cación    ││
│   │              │  │              │  │   incluida  ││
│   │ [Explorar]   │  │ [Explorar]   │  │ [Explorar]  ││
│   │              │  │              │  │             ││
│   └──────────────┘  └──────────────┘  └─────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Elementos Clave

**Cards Interactivos:**

- Hover effect: Elevación + sombra chunky
- Click: Navega a página específica
- Colores distintivos por audiencia

**Navegación:**

- [Explorar] → `/para-estudiantes`
- [Explorar] → `/para-padres`
- [Explorar] → `/para-docentes`

---

### SECCIÓN 3: CÓMO FUNCIONA

#### Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              "3 Pasos para Empezar"                    │
│                                                         │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐         │
│   │    1️⃣    │   │    2️⃣    │   │    3️⃣    │         │
│   │          │→  │          │→  │          │         │
│   │Regístrate│   │  Elige   │   │ Empieza  │         │
│   │  gratis  │   │activida- │   │ a ganar  │         │
│   │          │   │des para  │   │  desde   │         │
│   │(2 mins)  │   │tus hijos │   │   hoy    │         │
│   │          │   │          │   │          │         │
│   └──────────┘   └──────────┘   └──────────┘         │
│                                                         │
│   ┌─────────────────────────────────────────────┐     │
│   │                                             │     │
│   │    [Video Demo Interactivo 30 segundos]    │     │
│   │                                             │     │
│   │  Muestra: Registro → Dashboard → Primera   │     │
│   │           clase → Ganar XP → Canjear curso │     │
│   │                                             │     │
│   └─────────────────────────────────────────────┘     │
│                                                         │
│            [Empezar Ahora 🟠]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Elementos Clave

**Video Demo (30 segundos):**

- Registro rápido
- Dashboard estudiante
- Primera clase en vivo
- Ganar XP y monedas
- Canjear curso STEAM

**CTA:**

- "Empezar Ahora" → `/register`

---

### SECCIÓN 4: SOCIAL PROOF

#### Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         "Lo que dicen nuestras familias"               │
│                                                         │
│   ┌─────────────────┐  ┌─────────────────┐           │
│   │ [Foto María]    │  │ [Foto Roberto]  │           │
│   │                 │  │                 │           │
│   │ ⭐⭐⭐⭐⭐      │  │ ⭐⭐⭐⭐⭐      │           │
│   │                 │  │                 │           │
│   │ "Mi hija pasó   │  │ "El descuento   │           │
│   │ de odiar mate   │  │ por hermanos me │           │
│   │ a pedir clases  │  │ salvó. Pago     │           │
│   │ extra. Ya       │  │ $152k/mes por 4 │           │
│   │ canjeó 2 cursos │  │ actividades."   │           │
│   │ de programa-    │  │                 │           │
│   │ ción."          │  │ — Roberto F.,   │           │
│   │                 │  │   padre de 3    │           │
│   │ — María G.,     │  │                 │           │
│   │   madre de 2    │  └─────────────────┘           │
│   └─────────────────┘                                 │
│                                                         │
│   ┌─────────────────┐  ┌─────────────────┐           │
│   │ [Foto Laura]    │  │ [Números]       │           │
│   │                 │  │                 │           │
│   │ ⭐⭐⭐⭐⭐      │  │  500+           │           │
│   │                 │  │  Familias       │           │
│   │ "El dashboard   │  │                 │           │
│   │ me permite ver  │  │  15,000+        │           │
│   │ todo: asisten-  │  │  Clases         │           │
│   │ cia, progreso,  │  │                 │           │
│   │ observaciones." │  │  4.9/5          │           │
│   │                 │  │  Rating         │           │
│   │ — Laura R.,     │  │                 │           │
│   │   madre de 1    │  └─────────────────┘           │
│   └─────────────────┘                                 │
│                                                         │
│          [Ver Más Historias] → /testimonios            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Elementos Clave

**Testimonios (3-4):**

- Fotos reales de familias
- Nombres completos + ciudad
- Calificación 5 estrellas
- Quote corto y específico

**Estadísticas:**

- 500+ familias activas
- 15,000+ clases dictadas
- 4.9/5 rating promedio
- 99% satisfacción

**CTA:**

- "Ver Más Historias" → `/testimonios`

---

### SECCIÓN 5: CTA FINAL + FOOTER

#### Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ╔═══════════════════════════════════════════════╗   │
│   ║                                               ║   │
│   ║   🚀 Empieza Hoy, Sin Riesgo                 ║   │
│   ║                                               ║   │
│   ║   7 Días Gratis • Sin Tarjeta • Cancela      ║   │
│   ║              Cuando Quieras                   ║   │
│   ║                                               ║   │
│   ║   ┌─────────────────────────────────────┐   ║   │
│   ║   │ Nombre: [________________]          │   ║   │
│   ║   │ Email: [________________]           │   ║   │
│   ║   │ WhatsApp: [________________]        │   ║   │
│   ║   │ Número de hijos: [_2_] ▲▼          │   ║   │
│   ║   │                                      │   ║   │
│   ║   │ [Empezar Mi Prueba Gratuita 🟠]    │   ║   │
│   ║   └─────────────────────────────────────┘   ║   │
│   ║                                               ║   │
│   ╚═══════════════════════════════════════════════╝   │
│                                                         │
│   ─────────────────────────────────────────────────     │
│                                                         │
│   [Logo] 🏆 Mateatletas                                │
│   "El gimnasio mental más épico de América Latina"    │
│                                                         │
│   📚 Recursos          👥 Comunidad                    │
│   • Para Estudiantes   • Testimonios                   │
│   • Para Padres        • Blog                          │
│   • Para Docentes      • Soporte                       │
│   • Cursos STEAM       • WhatsApp: +54 xxx            │
│   • Precios            • Email: soporte@...            │
│   • Cómo Funciona                                      │
│                                                         │
│   🛠️ Plataforma       ⚖️ Legal                        │
│   • Tecnología         • Términos de Uso               │
│   • Seguridad          • Privacidad                    │
│   • API Docs           • Cookies                       │
│   • Estado Sistema     • Derechos AAIP                 │
│                                                         │
│   ─────────────────────────────────────────────────     │
│                                                         │
│   © 2025 Mateatletas. Todos los derechos reservados.  │
│   Hecho con ❤️ en Argentina                            │
│                                                         │
│   [Facebook] [Instagram] [LinkedIn] [YouTube]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Elementos Clave

**Banner CTA:**

- Fondo degradado naranja-amarillo
- Sombra chunky estilo Crash Bandicoot
- Formulario de captura rápido (4 campos)
- Botón grande naranja

**Footer Completo:**

- Logo + tagline
- 4 columnas de links
- Redes sociales
- Copyright

---

## 📄 PÁGINAS ESPECÍFICAS (Diseño Detallado)

### 1. PARA ESTUDIANTES (/para-estudiantes)

#### Objetivo

Mostrar TODO el sistema de gamificación y engagement.

#### Secciones (Puede ser larga - ya capturaste su atención)

```
1. Hero Específico
   "Tu Gimnasio Mental Épico"
   [Video demo del dashboard estudiante]

2. Sistema de Gamificación Completo
   • XP y Niveles (con gráfico de progresión)
   • Monedas virtuales (cómo ganar)
   • Fórmula de niveles explicada
   • Ejemplos visuales

3. Sistema de Logros (50+ Achievements)
   • Categorías: Consistencia, Maestría, Precisión, Social, Velocidad
   • Rareza: Común → Legendario
   • Cards de logros con recompensas
   • Galería interactiva

4. Avatares 3D Ready Player Me
   • Personalización completa
   • Animaciones desbloqueables
   • Demo interactivo
   • Galería de skins

5. Equipos Competitivos
   • 4 equipos con identidad visual
   • Sistema de rankings
   • Premios semanales
   • Tabla de posiciones en vivo (mock)

6. Tienda Virtual
   • Catálogo completo de items
   • Animaciones, skins, efectos, títulos
   • Sin pay-to-win destacado
   • Precios en monedas

7. Dashboard Demo Interactivo
   • Screenshot anotado o demo real
   • Hub 3D explicado
   • Stats en tiempo real
   • Notificaciones

8. Testimonios de Estudiantes
   • Videos cortos de niños usando la plataforma
   • Quotes de estudiantes

9. CTA Final
   "Crea Tu Avatar y Empieza a Ganar"
   [Botón grande → /register]
```

---

### 2. PARA PADRES (/para-padres)

#### Objetivo

Convencer con transparencia, control y valor económico.

#### Secciones

```
1. Hero Específico
   "La Mejor Inversión en el Futuro de Tus Hijos"
   [Dashboard padre screenshot]

2. Dashboard con Métricas en Tiempo Real
   • Screenshot anotado
   • Progreso de cada hijo
   • Próximo pago y descuentos
   • Calendario de clases
   • Historial de pagos

3. Sistema de Descuentos Explicado
   • Tabla completa de escenarios
   • Ejemplos reales de ahorro
   • Calculadora interactiva
   • Comparación con competencia

4. Calculadora de Descuentos (Widget Interactivo)
   Inputs:
   - Número de hijos: [_2_] ▲▼
   - Actividades por hijo: [_2_] ▲▼
   - ¿Socio AACREA? [Sí/No]

   Output:
   - Precio sin descuento: $200,000/mes
   - Tu precio: $152,000/mes
   - Ahorras: $48,000/mes (24%)
   - Ahorras al año: $576,000

5. Sistema de Control de Canjes
   • Cómo funciona paso a paso
   • Capturas del flujo
   • Opciones de pago (100%, 50/50, 0%)
   • Notificaciones en tiempo real

6. Sistema de Puntos Padre
   • Cómo ganar puntos
   • Catálogo de recompensas
   • Ejemplos de canjes

7. Transparencia Total
   • Reportes semanales de docentes
   • Observaciones personalizadas
   • Sin costos ocultos
   • Política de cancelación clara

8. Testimonios de Padres
   • Videos de padres hablando del valor
   • Estadísticas de satisfacción

9. FAQ Específico de Padres
   • ¿Cómo funcionan los descuentos?
   • ¿Puedo cancelar cuando quiera?
   • ¿Cómo controlo los gastos?
   • ¿Qué pasa si mi hijo suspende?

10. CTA Final
    "Calcula Tu Descuento y Empieza Gratis"
    [Botón → /register con pre-carga de calculadora]
```

---

### 3. CURSOS STEAM (/cursos-steam)

#### Objetivo

Mostrar todo el catálogo como marketplace atractivo.

#### Secciones

```
1. Hero con Buscador
   "Más de 50 Cursos de Scratch a Inteligencia Artificial"
   [Buscador + Filtros]

2. Categorías Principales
   • Programación (15 cursos)
   • Robótica (8 cursos)
   • Ciencias (12 cursos)
   • Diseño 3D (6 cursos)
   • Matemática Avanzada (5 cursos)
   • Maestrías Completas (4 cursos)

3. Cursos Destacados (Cards)
   Para cada curso:
   - Imagen/thumbnail
   - Título
   - Descripción corta
   - Número de clases
   - Precio en monedas + USD
   - Nivel requerido
   - Rating
   - [Ver Detalles]

4. Sistema de Canjes Explicado
   • Infográfico del flujo
   • Rol del padre en aprobación
   • Opciones de pago

5. Cursos Más Canjeados (Top 10)
   • Ranking con estadísticas
   • Testimonios de estudiantes

6. Filtros y Búsqueda
   • Por categoría
   • Por nivel (principiante, intermedio, avanzado)
   • Por duración
   • Por precio en monedas
   • Por popularidad

7. Roadmaps Sugeridos
   "De Principiante a Experto"
   • Roadmap Programador Web
   • Roadmap Ingeniero de IA
   • Roadmap Maker (Arduino + Robótica)
   • Roadmap Científico

8. CTA Final
   "Inscríbete y Empieza a Ganar Monedas para Canjear"
```

---

### 4. PRECIOS (/precios)

#### Objetivo

Máxima claridad sobre planes, descuentos, métodos de pago.

#### Secciones

```
1. Hero
   "Planes Accesibles con Descuentos Inteligentes"

2. Tabla Comparativa de Planes
   ┌────────────────────┬────────────────────┐
   │ Club de Matemáticas│Cursos Especializados│
   ├────────────────────┼────────────────────┤
   │ $50,000 ARS/mes    │ $55,000 ARS/mes    │
   │ (~$50-60 USD)      │ (~$55-65 USD)      │
   ├────────────────────┼────────────────────┤
   │ ✅ Clases en vivo  │ ✅ Todo lo del Club│
   │ ✅ Gamificación    │ ✅ Currículos      │
   │ ✅ Dashboard       │    especializados  │
   │ ✅ Avatares 3D     │ ✅ Olimpiadas      │
   │ ✅ Marketplace     │ ✅ Programación    │
   │ ✅ Sin permanencia │    avanzada        │
   ├────────────────────┼────────────────────┤
   │ [Empezar Gratis]   │ [Empezar Gratis]   │
   └────────────────────┴────────────────────┘

3. Sistema de Descuentos COMPLETO
   Tabla con todos los escenarios:
   - 1 hijo, 1 actividad → 0%
   - 1 hijo, 2+ actividades → 12%
   - 2+ hermanos, 1 actividad → 12%
   - 2+ hermanos, 2+ actividades → 24%
   - Socios AACREA → 20%

4. Calculadora Interactiva GRANDE
   (Misma que en /para-padres pero más prominente)

5. Comparación con Competencia
   Tabla:
   | Feature | Mateatletas | Khan Academy | IXL | Matific |
   |---------|-------------|--------------|-----|---------|
   | Clases en vivo | ✅ | ❌ | ❌ | ❌ |
   | Gamificación | ✅✅✅ | ⭐ | ⭐⭐ | ⭐⭐ |
   | Cursos STEAM | ✅ 50+ | ✅ Básico | ❌ | ❌ |
   | Descuentos hermanos | ✅ 24% | ❌ | ❌ | ❌ |
   | Precio/mes | $50 | Gratis | $80 | $60 |

6. Métodos de Pago
   • MercadoPago (tarjetas, efectivo)
   • Débito automático
   • Transferencia bancaria
   • Logos de tarjetas aceptadas

7. Política de Cancelación
   • Sin permanencia mínima
   • Cancela desde dashboard
   • Sin cláusulas escondidas
   • Reembolso prorrateado

8. FAQ de Precios (15-20 preguntas)
   • ¿Cuándo se cobra?
   • ¿Cómo funciona el descuento?
   • ¿Puedo cambiar de plan?
   • ¿Qué pasa si no uso todas las clases?
   • ¿Hay cargos ocultos?

9. CTA Final
   "Prueba 7 Días Gratis - Sin Tarjeta"
```

---

### 5. CÓMO FUNCIONA (/como-funciona)

#### Objetivo

Tutorial completo paso a paso.

#### Secciones

```
1. Hero
   "De la Inscripción a tu Primera Clase en 10 Minutos"
   [Video tutorial completo 3-5 min]

2. Paso 1: Registro (con screenshots)
   • Formulario simple
   • Datos del tutor
   • Datos de los hijos
   • Verificación email
   • Tiempo: 2 minutos

3. Paso 2: Configuración Inicial
   • Creación de avatares
   • Selección de equipo
   • Preferencias de horario
   • Tiempo: 3 minutos

4. Paso 3: Elección de Actividades
   • Club de Matemáticas vs Cursos Especializados
   • Cálculo automático de descuentos
   • Confirmación de inscripción
   • Tiempo: 2 minutos

5. Paso 4: Primera Clase
   • Reserva de clase en calendario
   • Notificación recordatorio
   • Ingreso a videollamada
   • Ganar primeros puntos

6. Paso 5: Exploración del Dashboard
   • Tour guiado del gimnasio mental
   • Explicación de XP, monedas, logros
   • Tienda virtual
   • Catálogo de cursos

7. Flujos Específicos (con diagramas)
   • Flujo: Asistir a clase → Ganar puntos
   • Flujo: Desbloquear logro → Ganar monedas
   • Flujo: Solicitar canje → Aprobación padre → Curso habilitado
   • Flujo: Pago mensual → Aplicación de descuentos

8. Preguntas Frecuentes

9. CTA: "¿Listo? Empieza Tu Prueba Gratis"
```

---

### 6. TECNOLOGÍA (/tecnologia)

#### Objetivo

Demostrar calidad técnica y seguridad.

#### Secciones

```
1. Hero
   "Tecnología de Clase Mundial"
   "La misma que usan empresas Fortune 500"

2. Stack Técnico (Visual con logos)

   Frontend:
   • Next.js 15.5 + React 19
   • TypeScript estricto
   • Tailwind CSS 4.0
   • Framer Motion
   • React Query

   Backend:
   • NestJS 11
   • PostgreSQL + Prisma
   • Redis Cache
   • Winston Logger
   • JWT + Cookies

3. Métricas de Calidad (Cards grandes)

   🏆 99 Tests Automatizados
   "Cada función verificada automáticamente"

   ✅ 0 Errores TypeScript
   "Código type-safe al 100%"

   ⚡ 98% Menos Requests
   "Caching inteligente con Redis"

   🚀 0ms UI Response Time
   "Actualizaciones optimistas instantáneas"

   💾 95% Cache Hit Rate
   "Performance optimizada"

   🔄 0 N+1 Queries
   "Eager loading en todas las relaciones"

4. Seguridad (con iconos de verificación)

   ✅ Autenticación JWT en httpOnly cookies
   ✅ Protección CSRF activa
   ✅ Rate limiting avanzado
   ✅ Helmet security headers
   ✅ Datos encriptados end-to-end
   ✅ Integración MercadoPago certificada
   ✅ Auditorías de seguridad regulares
   ✅ Backups automáticos diarios

5. Infraestructura
   • Hosting: Railway (99.99% uptime)
   • CDN: Vercel Edge Network
   • Database: PostgreSQL managed
   • Cache: Redis Cloud
   • Storage: Vercel Blob

6. Performance
   • Lighthouse Score: 95+
   • Time to Interactive: <2s
   • First Contentful Paint: <1s
   • Total Blocking Time: <100ms

7. Integraciones
   • MercadoPago (pagos)
   • Jitsi Meet (videollamadas)
   • Ready Player Me (avatares 3D)
   • Vercel Blob (almacenamiento)

8. API Pública (para desarrolladores)
   • Documentación Swagger
   • REST API completa
   • Rate limits generosos
   • Webhooks disponibles

9. Certificaciones y Compliance
   • HTTPS 100%
   • GDPR compliant
   • AAIP (Argentina)
   • PCI DSS (pagos)

10. CTA: "Confía en Nuestra Tecnología"
```

---

## 🎨 DISEÑO VISUAL (Sistema de Diseño)

### Identidad: "Crash Bandicoot Style"

#### Paleta de Colores

```css
/* Colores Principales */
--naranja-primary: #ff8c00; /* CTAs, acciones */
--naranja-hover: #ff7700; /* Hover state */
--naranja-light: #ffb347; /* Fondos suaves */

--azul-info: #1e90ff; /* Información, paneles */
--azul-dark: #1873cc; /* Hover azul */
--azul-light: #4da6ff; /* Fondos azules */

--amarillo-xp: #ffd700; /* XP, monedas, progreso */
--amarillo-light: #ffed4e; /* Highlights */

--verde-success: #00cc44; /* Éxito, confirmaciones */
--verde-dark: #00a838; /* Hover verde */

--morado-premium: #9933ff; /* Premium, legendario */
--morado-dark: #7a29cc; /* Hover morado */

--rojo-error: #ff4444; /* Errores, alertas */
--rojo-dark: #cc0000; /* Hover rojo */

/* Grises */
--gris-900: #1a1a1a; /* Texto principal */
--gris-700: #4a4a4a; /* Texto secundario */
--gris-500: #9e9e9e; /* Texto deshabilitado */
--gris-300: #d4d4d4; /* Bordes */
--gris-100: #f5f5f5; /* Fondos claros */
--blanco: #ffffff;

/* Colores de Equipos */
--equipo-fenix: #ff6b35; /* Naranja/Rojo */
--equipo-dragon: #00d9a3; /* Verde/Esmeralda */
--equipo-tigre: #ffd93d; /* Amarillo/Oro */
--equipo-aguila: #4ecdc4; /* Azul/Celeste */
```

#### Tipografía

```css
/* Fuentes */
@import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');

--font-heading: 'Lilita One', cursive;
--font-body: 'Fredoka', sans-serif;
--font-code: 'JetBrains Mono', monospace;

/* Tamaños */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */
--text-6xl: 3.75rem; /* 60px */
```

#### Elementos Característicos

```css
/* Sombras Chunky */
.shadow-chunky {
  box-shadow: 5px 5px 0px rgba(0, 0, 0, 1);
}

.shadow-chunky-lg {
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 1);
}

.shadow-chunky-xl {
  box-shadow: 12px 12px 0px rgba(0, 0, 0, 1);
}

/* Bordes Gruesos */
.border-chunky {
  border: 4px solid #000;
}

.border-chunky-lg {
  border: 6px solid #000;
}

/* Border Radius Asimétrico */
.rounded-asymmetric {
  border-radius: 30px 15px 30px 15px;
}

.rounded-asymmetric-reverse {
  border-radius: 15px 30px 15px 30px;
}

/* Botón Primario */
.btn-primary {
  @apply bg-naranja-primary text-white font-bold px-6 py-3;
  @apply rounded-asymmetric border-chunky shadow-chunky;
  @apply transition-all duration-200;
  @apply hover:translate-x-1 hover:translate-y-1 hover:shadow-none;
}

/* Botón Secundario */
.btn-secondary {
  @apply bg-azul-info text-white font-bold px-6 py-3;
  @apply rounded-asymmetric border-chunky shadow-chunky;
  @apply transition-all duration-200;
  @apply hover:translate-x-1 hover:translate-y-1 hover:shadow-none;
}

/* Card */
.card-chunky {
  @apply bg-white rounded-asymmetric border-chunky shadow-chunky;
  @apply p-6 transition-all duration-300;
  @apply hover:-translate-y-2 hover:shadow-chunky-xl;
}
```

#### Animaciones (Framer Motion)

```tsx
// Bounce suave
const bounceVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 300, damping: 10 },
  },
  tap: { scale: 0.95 },
};

// Slide desde abajo
const slideUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Stagger para listas
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

#### Componentes Visuales Únicos

**Badge de Logro:**

```tsx
<div className="relative">
  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amarillo-xp to-naranja-primary border-chunky shadow-chunky flex items-center justify-center">
    <span className="text-4xl">🏆</span>
  </div>
  <div className="absolute -top-2 -right-2 bg-morado-premium text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-black">
    ÉPICO
  </div>
</div>
```

**Progress Bar con XP:**

```tsx
<div className="relative w-full h-8 bg-gris-300 rounded-full border-chunky overflow-hidden">
  <motion.div
    className="h-full bg-gradient-to-r from-amarillo-xp to-naranja-primary"
    initial={{ width: 0 }}
    animate={{ width: '75%' }}
    transition={{ duration: 1, ease: 'easeOut' }}
  />
  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gris-900">
    4,280 / 5,000 XP
  </div>
</div>
```

---

## 📝 COPYWRITING Y MENSAJES

### Principios de Copy

1. **Claridad > Creatividad**
2. **Beneficios > Características**
3. **Específico > Genérico**
4. **Emoción + Lógica**
5. **Urgencia sin presión**

### Headlines Principales

**Landing Hero:**

```
"Tus hijos aprenden jugando y ganan cursos STEAM gratis"
```

**Para Estudiantes:**

```
"Tu Gimnasio Mental Épico: Aprende, Juega, Gana"
```

**Para Padres:**

```
"La Mejor Inversión en el Futuro de Tus Hijos"
"Control Total, Transparencia Absoluta, Hasta 24% de Descuento"
```

**Para Docentes:**

```
"Enseña con la Mejor Tecnología EdTech de América Latina"
```

**Cursos STEAM:**

```
"De Scratch a Inteligencia Artificial: +50 Cursos Premium"
```

**Precios:**

```
"Planes Accesibles con Descuentos Inteligentes"
"Paga Menos con Hermanos, Recibe Más Valor"
```

### Subheadlines

**Landing:**

```
"Clases en vivo + Gamificación AAA + 50 cursos de Programación a IA"
```

**Para Estudiantes:**

```
"Gana XP, sube niveles, desbloquea logros épicos y canjea cursos de Programación, Robótica e IA"
```

**Para Padres:**

```
"Dashboard con métricas en tiempo real, descuentos automáticos hasta 24% y control total de gastos"
```

### Bullets de Valor (Repetir en múltiples páginas)

```
✅ Clases en vivo con profesores apasionados
✅ Gamificación AAA con XP, niveles y logros
✅ Avatares 3D personalizables Ready Player Me
✅ Marketplace con +50 cursos STEAM premium
✅ Hasta 24% descuento con hermanos
✅ Gana monedas estudiando → Canjea por cursos gratis
✅ Dashboard para padres con métricas en tiempo real
✅ Sin permanencia, cancela cuando quieras
```

### Microcopy Importante

**Botones CTA:**

- "Prueba 7 Días Gratis" (no "Registrarse")
- "Empezar Mi Prueba Gratuita" (no "Sign up")
- "Ver Cómo Funciona" (no "Learn more")
- "Explorar Cursos STEAM" (no "Ver cursos")
- "Calcula Tu Descuento" (no "Ver precios")

**Trust Elements:**

- "Sin tarjeta de crédito"
- "Cancela cuando quieras"
- "500+ familias confían en nosotros"
- "4.9/5 estrellas"
- "Primera semana gratis"

**Objeciones y Respuestas:**

| Objeción               | Respuesta en Copy                                                                 |
| ---------------------- | --------------------------------------------------------------------------------- |
| "Es caro"              | "Hasta 24% descuento con hermanos - Paga $38,000 en vez de $50,000 por actividad" |
| "No tengo tiempo"      | "Flexibilidad total - Tus hijos eligen cuándo asistir"                            |
| "¿Y si no les gusta?"  | "7 días gratis, sin tarjeta, cancela cuando quieras"                              |
| "¿Es seguro?"          | "Seguridad bancaria: JWT, CSRF, encriptación end-to-end"                          |
| "¿Realmente aprenden?" | "Dashboard con métricas reales: asistencia, progreso, observaciones de docentes"  |

---

## 🎯 CTAs Y CONVERSIÓN

### Jerarquía de CTAs

**CTA Primario (Naranja):**

- "Prueba 7 Días Gratis"
- "Empezar Mi Prueba Gratuita"
- "Empezar Ahora"

**Destino:** `/register`

**CTA Secundario (Azul):**

- "Ver Cómo Funciona"
- "Explorar Cursos STEAM"
- "Calcula Tu Descuento"
- "Ver Demo"

**Destino:** Video modal, página específica, o calculadora

**CTA Terciario (Texto con flecha):**

- "Ver Más Historias →"
- "Explorar →"
- "Conoce Más →"

**Destino:** Páginas profundas

### Estrategia de Múltiples Puntos de Conversión

**Landing Page:**

- Hero: CTA primario visible inmediatamente
- Propuesta de Valor: CTAs en cada card (explorar)
- Cómo Funciona: CTA después del video
- Social Proof: CTA "Únete a 500+ familias"
- Footer: Formulario de captura + CTA grande

**Total:** 5+ oportunidades de conversión en una página

### Formulario de Registro Optimizado

**Campos Mínimos (Captura Rápida):**

```
1. Nombre completo
2. Email
3. WhatsApp
4. Número de hijos
```

**NO pedir:**

- ❌ Contraseña en primer paso (crear después)
- ❌ Tarjeta de crédito
- ❌ Dirección completa
- ❌ Documento de identidad

**Flujo:**

```
Landing → Formulario corto → Email verificación → Completar perfil → Dashboard
```

### Calculadora de Descuentos (Widget Clave)

**Inputs:**

```tsx
<div className="calculator">
  <label>Número de hijos:</label>
  <input type="number" min="1" max="10" value={2} />

  <label>Actividades por hijo:</label>
  <input type="number" min="1" max="5" value={2} />

  <label>¿Socio AACREA?</label>
  <input type="checkbox" />
</div>
```

**Output (Actualización en Tiempo Real):**

```tsx
<div className="result">
  <div className="line-through text-gris-500">Precio sin descuento: $200,000/mes</div>
  <div className="text-4xl font-bold text-verde-success">Tu precio: $152,000/mes</div>
  <div className="text-xl text-naranja-primary">⚡ Ahorras: $48,000/mes (24%)</div>
  <div className="text-base text-gris-700">Ahorro anual: $576,000</div>

  <button className="btn-primary mt-4">Empezar con Este Descuento</button>
</div>
```

**Ubicación:**

- `/para-padres` (prominente)
- `/precios` (mega prominente)
- Landing footer (opcional)

### Exit Intent Popup (Opcional)

**Trigger:** Usuario mueve mouse hacia cerrar tab

**Contenido:**

```
┌─────────────────────────────────────┐
│   ⚠️ ¡Espera!                       │
│                                     │
│   Antes de irte, ¿sabías que       │
│   puedes probar 7 días GRATIS?     │
│                                     │
│   ✅ Sin tarjeta de crédito        │
│   ✅ Cancela cuando quieras         │
│   ✅ Acceso completo                │
│                                     │
│   Email: [_____________]            │
│                                     │
│   [Enviarme Acceso Gratis]         │
│                                     │
│   [No gracias, ya decidí]          │
└─────────────────────────────────────┘
```

---

## 🛠️ STACK TÉCNICO (Implementación)

### Arquitectura de Carpetas

```
apps/web/src/
├── app/
│   ├── (marketing)/              # Layout para páginas públicas
│   │   ├── layout.tsx           # Layout sin sidebar de app
│   │   ├── page.tsx             # Landing principal
│   │   │
│   │   ├── para-estudiantes/
│   │   │   └── page.tsx
│   │   │
│   │   ├── para-padres/
│   │   │   └── page.tsx
│   │   │
│   │   ├── para-docentes/
│   │   │   └── page.tsx
│   │   │
│   │   ├── cursos-steam/
│   │   │   ├── page.tsx
│   │   │   └── [cursoId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── clases-en-vivo/
│   │   │   └── page.tsx
│   │   │
│   │   ├── precios/
│   │   │   └── page.tsx
│   │   │
│   │   ├── como-funciona/
│   │   │   └── page.tsx
│   │   │
│   │   ├── tecnologia/
│   │   │   └── page.tsx
│   │   │
│   │   └── testimonios/
│   │       └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   └── login/
│       └── page.tsx
│
├── components/
│   ├── marketing/               # Componentes de marketing
│   │   ├── LandingNavbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── PropuestaValorTriple.tsx
│   │   ├── ComoFuncionaSection.tsx
│   │   ├── SocialProofSection.tsx
│   │   ├── FooterCTA.tsx
│   │   ├── ScrollProgress.tsx
│   │   ├── CalculadoraDescuentos.tsx
│   │   ├── VideoDemo.tsx
│   │   ├── TestimonialCard.tsx
│   │   └── CursoCard.tsx
│   │
│   └── ui/                      # Componentes UI reutilizables
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── ProgressBar.tsx
│
├── styles/
│   ├── globals.css              # Estilos globales + variables CSS
│   └── marketing.css            # Estilos específicos de marketing
│
└── lib/
    ├── utils.ts
    └── animations.ts            # Variantes de Framer Motion
```

### Componentes Clave a Crear

**1. LandingNavbar.tsx**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-chunky' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Implementación completa */}
    </motion.nav>
  );
}
```

**2. CalculadoraDescuentos.tsx**

```tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export function CalculadoraDescuentos() {
  const [numHijos, setNumHijos] = useState(2);
  const [actividadesPorHijo, setActividadesPorHijo] = useState(2);
  const [esAACREA, setEsAACREA] = useState(false);

  const resultado = useMemo(() => {
    // Lógica de cálculo de descuentos
    const precioBase = 50000;
    let descuento = 0;

    if (numHijos >= 2 && actividadesPorHijo >= 2) {
      descuento = 0.24;
    } else if (numHijos >= 2 || actividadesPorHijo >= 2) {
      descuento = 0.12;
    }

    if (esAACREA) {
      descuento = Math.max(descuento, 0.2);
    }

    const totalActividades = numHijos * actividadesPorHijo;
    const precioConDescuento = precioBase * (1 - descuento);
    const precioTotal = precioConDescuento * totalActividades;
    const precioSinDescuento = precioBase * totalActividades;
    const ahorro = precioSinDescuento - precioTotal;

    return {
      precioTotal,
      precioSinDescuento,
      ahorro,
      descuentoPorcentaje: descuento * 100,
      ahorroAnual: ahorro * 12,
    };
  }, [numHijos, actividadesPorHijo, esAACREA]);

  return <div className="card-chunky">{/* Implementación completa */}</div>;
}
```

**3. ScrollProgress.tsx**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-naranja-primary via-amarillo-xp to-verde-success origin-left z-50"
      style={{ scaleX }}
    />
  );
}
```

### SEO y Meta Tags

**Layout principal:**

```tsx
// apps/web/src/app/(marketing)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mateatletas - Plataforma Educativa STEAM con Gamificación | Argentina',
  description:
    'La plataforma educativa que tus hijos amarán. Clases de matemática en vivo + cursos STEAM con gamificación AAA. Hasta 24% descuento con hermanos. Prueba 7 días gratis.',
  keywords: [
    'clases de matemática',
    'educación STEAM',
    'gamificación educativa',
    'cursos de programación para niños',
    'robótica para niños',
    'clases online Argentina',
    'clases virtuales matemática',
    'cursos STEM Argentina',
  ],
  authors: [{ name: 'Mateatletas' }],
  openGraph: {
    title: 'Mateatletas - El Gimnasio Mental Más Épico',
    description: 'Tus hijos aprenden jugando y ganan cursos STEAM gratis',
    url: 'https://mateatletas.com',
    siteName: 'Mateatletas',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mateatletas Dashboard',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateatletas - Educación STEAM Gamificada',
    description: 'Clases en vivo + Gamificación AAA + 50 cursos premium',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'GOOGLE_SITE_VERIFICATION_CODE',
    yandex: 'YANDEX_VERIFICATION_CODE',
  },
};
```

### Analytics y Tracking

**Google Analytics 4:**

```tsx
// apps/web/src/components/marketing/Analytics.tsx
'use client';

import Script from 'next/script';

export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
    </>
  );
}
```

**Eventos de Conversión:**

```tsx
// lib/analytics.ts
export const trackEvent = (eventName: string, eventParams?: object) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Eventos importantes:
trackEvent('view_landing_page');
trackEvent('click_cta_prueba_gratis', { location: 'hero' });
trackEvent('click_cta_prueba_gratis', { location: 'footer' });
trackEvent('open_calculator', { num_hijos: 2 });
trackEvent('calculate_discount', { descuento: 24, ahorro_mensual: 48000 });
trackEvent('start_registration');
trackEvent('complete_registration');
trackEvent('watch_video_demo', { duration: 30 });
```

---

## 📅 PLAN DE IMPLEMENTACIÓN

### Fase 1: Landing Principal + Infraestructura (Semana 1)

**Días 1-2:**

- ✅ Setup de carpetas y arquitectura
- ✅ Configurar layout (marketing)
- ✅ Crear sistema de diseño (CSS variables)
- ✅ Implementar LandingNavbar
- ✅ Implementar ScrollProgress

**Días 3-4:**

- ✅ Implementar Hero Section
- ✅ Implementar Propuesta de Valor Triple
- ✅ Implementar Cómo Funciona Section
- ✅ Implementar Social Proof Section

**Días 5-7:**

- ✅ Implementar Footer con CTA
- ✅ Responsive design completo
- ✅ Animaciones con Framer Motion
- ✅ SEO meta tags
- ✅ Testing mobile/desktop

**Entregable:** Landing principal funcional y responsive

---

### Fase 2: Páginas Principales (Semana 2)

**Días 1-2: /para-estudiantes**

- ✅ Hero específico
- ✅ Sección gamificación completa
- ✅ Sistema de logros con cards
- ✅ Avatares 3D
- ✅ Equipos competitivos
- ✅ Tienda virtual
- ✅ Dashboard demo

**Días 3-4: /para-padres**

- ✅ Hero específico
- ✅ Dashboard con métricas
- ✅ Sistema de descuentos explicado
- ✅ **Calculadora de descuentos interactiva** (componente clave)
- ✅ Control de canjes
- ✅ Puntos Padre
- ✅ Testimonios de padres

**Días 5-7: /precios**

- ✅ Hero
- ✅ Tabla comparativa de planes
- ✅ Tabla completa de descuentos
- ✅ **Calculadora prominente**
- ✅ Comparación con competencia
- ✅ Métodos de pago
- ✅ FAQ de precios (15-20 preguntas)

**Entregable:** 3 páginas principales completas

---

### Fase 3: Páginas Secundarias (Semana 3)

**Días 1-2: /cursos-steam**

- ✅ Hero con buscador
- ✅ Categorías principales
- ✅ Catálogo completo con filtros
- ✅ Componente CursoCard reutilizable
- ✅ Sistema de canjes explicado
- ✅ Top 10 cursos más canjeados

**Días 3-4: /clases-en-vivo**

- ✅ Hero
- ✅ Sistema de clases detallado
- ✅ 6 rutas curriculares
- ✅ 3 niveles pedagógicos
- ✅ Perfiles de docentes
- ✅ Calendario mock
- ✅ Sistema de reservas explicado

**Días 5-7: /como-funciona**

- ✅ Hero con video tutorial
- ✅ 5 pasos con screenshots
- ✅ Flujos específicos con diagramas
- ✅ FAQ
- ✅ CTA final

**Entregable:** 3 páginas secundarias completas

---

### Fase 4: Páginas Complementarias (Semana 4)

**Días 1-2: /para-docentes**

- ✅ Hero específico
- ✅ Herramientas de enseñanza
- ✅ Calendario inteligente
- ✅ Sistema de asistencia
- ✅ Reportes automáticos
- ✅ Testimonios de docentes

**Días 3-4: /tecnologia**

- ✅ Hero
- ✅ Stack técnico visual
- ✅ Métricas de calidad (cards)
- ✅ Seguridad detallada
- ✅ Infraestructura
- ✅ Performance
- ✅ Certificaciones

**Días 5-7: /testimonios**

- ✅ Hero
- ✅ Galería de testimonios
- ✅ Videos testimoniales (embeds)
- ✅ Estadísticas de impacto
- ✅ Casos de éxito detallados
- ✅ Filtros por tipo de usuario

**Entregable:** Sitio web completo

---

### Fase 5: Optimización y Testing (Semana 5)

**Días 1-2: Performance**

- ✅ Optimización de imágenes (Next.js Image)
- ✅ Lazy loading de componentes pesados
- ✅ Code splitting
- ✅ Preload de fuentes críticas
- ✅ Audit con Lighthouse
- ✅ Objetivo: Score 95+

**Días 3-4: SEO**

- ✅ Meta tags en todas las páginas
- ✅ Structured data (JSON-LD)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Open Graph images
- ✅ Canonical URLs

**Días 5-7: Analytics y Testing**

- ✅ Google Analytics 4 setup
- ✅ Eventos de conversión
- ✅ Facebook Pixel (opcional)
- ✅ Hotjar (heatmaps)
- ✅ A/B testing setup (Vercel Edge Config)
- ✅ Cross-browser testing
- ✅ Mobile testing en dispositivos reales

**Entregable:** Sitio optimizado y listo para producción

---

### Timeline Visual

```
Semana 1: [████████] Landing Principal
          Navbar, Hero, Secciones, Footer, Responsive

Semana 2: [████████] Páginas Principales
          /para-estudiantes, /para-padres, /precios

Semana 3: [████████] Páginas Secundarias
          /cursos-steam, /clases-en-vivo, /como-funciona

Semana 4: [████████] Páginas Complementarias
          /para-docentes, /tecnologia, /testimonios

Semana 5: [████████] Optimización
          Performance, SEO, Analytics, Testing

TOTAL: 5 semanas (25 días laborables)
```

---

## 📊 MÉTRICAS Y KPIS

### Objetivos de Conversión

**Conversión Principal:**

- **Landing → Registro:** 5-8%
- **Prueba Gratis → Pago:** 20-30%

**Conversiones Secundarias:**

- Landing → Página específica: 30-40%
- Página específica → Registro: 10-15%
- Calculadora usada → Registro: 15-20%
- Video demo visto completo: 40-50%

### Métricas de Engagement

**Landing Page:**

- Time on page: 2-3 minutos (objetivo)
- Bounce rate: <50%
- Scroll depth: 70%+ de usuarios llegan a footer
- CTA clicks: 3-5% por CTA

**Páginas Específicas:**

- Time on page: 4-6 minutos
- Bounce rate: <30%
- Página → Registro: 10-15%

**Calculadora de Descuentos:**

- Uso: 20-30% de visitantes de /precios
- Calculadora → Registro: 15-20%

### Métricas Técnicas

**Performance:**

- Lighthouse Score: 95+ (objetivo)
- Time to Interactive: <2s
- First Contentful Paint: <1s
- Total Blocking Time: <100ms
- Largest Contentful Paint: <2.5s

**SEO:**

- Core Web Vitals: Todos en verde
- Mobile-friendly: 100%
- Accesibilidad: 90+

### Dashboard de Analytics (Google Analytics 4)

**Eventos a Trackear:**

```javascript
// Conversiones
'start_registration'
'complete_registration'
'start_free_trial'
'purchase' (primer pago)

// Engagement
'view_landing_page'
'view_para_estudiantes'
'view_para_padres'
'view_precios'
'view_cursos_steam'

// Interacciones
'click_cta_prueba_gratis' (con parámetro location)
'click_video_demo'
'watch_video_complete'
'use_calculator'
'calculate_discount' (con parámetros: descuento, ahorro)
'click_testimonial'
'click_curso_card'

// Navegación
'scroll_to_section' (con parámetro section_name)
'open_menu_mobile'
'click_navbar_link' (con parámetro destination)
```

### A/B Testing Propuestos

**Test 1: Hero Headline**

- Variante A: "Tus hijos aprenden jugando y ganan cursos STEAM gratis"
- Variante B: "La plataforma educativa que tus hijos amarán usar"
- Métrica: Tasa de scroll / clicks en CTA

**Test 2: CTA Button Color**

- Variante A: Naranja (#FF8C00)
- Variante B: Verde (#00CC44)
- Métrica: Click-through rate

**Test 3: Hero Media**

- Variante A: Video 15 segundos
- Variante B: GIF animado
- Variante C: Imagen estática
- Métrica: Time on page / CTA clicks

**Test 4: Calculadora Position**

- Variante A: Prominente arriba en /precios
- Variante B: Después de tabla de planes
- Métrica: Uso de calculadora / conversión

---

## 🎯 CONCLUSIÓN

### Resumen de la Estrategia

✅ **Arquitectura Híbrida:** Landing breve + Páginas específicas profundas
✅ **Enfoque por Audiencia:** Estudiantes, Padres, Docentes con páginas dedicadas
✅ **Calculadora Interactiva:** Widget clave para demostrar valor económico
✅ **Diseño Crash Bandicoot:** Identidad visual única y memorable
✅ **Múltiples Puntos de Conversión:** 5+ CTAs en landing, formularios optimizados
✅ **Stack Técnico Moderno:** Next.js 15 + Framer Motion + TypeScript
✅ **SEO y Performance:** Optimizado para conversión y descubrimiento

### Próximos Pasos

1. **Aprobar estrategia** y hacer ajustes necesarios
2. **Iniciar Fase 1:** Landing principal (Semana 1)
3. **Iterar con feedback:** Ajustar basándose en métricas reales
4. **Escalar contenido:** Blog, recursos adicionales
5. **Optimizar conversión:** A/B testing continuo

### Recursos Necesarios

**Contenido:**

- ✅ 3-4 testimonios reales con fotos (padres + estudiantes)
- ✅ 1 video demo de 30 segundos (dashboard estudiante)
- ✅ 1 video demo de 15 segundos (hero)
- ✅ Screenshots de dashboards (estudiante, padre, docente)
- ✅ Fotos de docentes para perfiles
- ✅ Imágenes de avatares 3D

**Técnico:**

- ✅ Dominio configurado (mateatletas.com)
- ✅ Google Analytics 4 ID
- ✅ Facebook Pixel (opcional)
- ✅ Hotjar account (opcional)
- ✅ Open Graph images (1200x630px)

---

**Documento creado:** 2025-11-02
**Versión:** 1.0
**Próxima revisión:** Al finalizar Fase 1

---
