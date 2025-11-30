# MATEATLETAS STUDIO

## Sistema de Planificación Educativa

> Documento de diseño, construcción e implementación
> Estado: EN DISEÑO
> Última actualización: 2024-11-29

---

## ÍNDICE

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Formulario de Configuración Inicial](#3-formulario-de-configuración-inicial)
4. [Flujo Post-Plantilla](#4-flujo-post-plantilla)
5. [Schema de Plantilla (JSON Madre)](#5-schema-de-plantilla-json-madre)
6. [Schema de Semana](#6-schema-de-semana)
7. [Catálogo de Componentes](#7-catálogo-de-componentes)
8. [Sistema de Simuladores](#8-sistema-de-simuladores) _(TODO)_
9. [Reglas de Validación](#9-reglas-de-validación)
10. [Sistema de Recursos](#10-sistema-de-recursos)
11. [Sistema de Badges](#11-sistema-de-badges)
12. [Adaptación por Casa](#12-adaptación-por-casa) _(TODO)_
13. [Preview Renderer](#13-preview-renderer) _(TODO)_
14. [Biblioteca y Reutilización](#14-biblioteca-y-reutilización)
15. [Telemetría](#15-telemetría) _(TODO)_
16. [Implementación](#16-implementación) _(TODO)_

---

## 1. VISIÓN GENERAL

### 1.1 ¿Qué es Mateatletas Studio?

Mateatletas Studio es el motor de experiencias educativas gamificadas de Mateatletas. No es un LMS. No es un creador de cursos. Es un **engine de experiencias de aprendizaje**.

Cada curso creado en Studio es una aventura interactiva con simuladores científicos, desafíos adaptativos, y progresión tipo videojuego. Es el "Unity de la educación" - una plataforma donde se diseñan experiencias de aprendizaje inmersivas que se sienten como juegos de PS5, no como cursos online tradicionales.

**Studio permite:**

- Diseñar experiencias educativas de calidad AAA sin escribir código
- Previsualizar en tiempo real exactamente lo que verá el estudiante
- Validar automáticamente que el contenido cumpla estándares de calidad
- Reutilizar componentes, simuladores y estructuras entre cursos
- Crear contenido adaptado por edad (6-17 años) con configuración automática

**Studio NO es:**

- Un page builder genérico (cada componente está diseñado para educación)
- Un repositorio de videos (las experiencias son interactivas, no pasivas)
- Una herramienta para crear contenido masivo de baja calidad

### 1.2 ¿Qué problema resuelve?

**El problema de la industria:**
La educación online está atrapada entre dos extremos. Por un lado, plataformas como Moodle o Google Classroom que son funcionales pero aburridas. Por otro, experiencias custom de alto presupuesto que cuestan millones y meses de desarrollo.

No existe una herramienta que permita crear educación gamificada premium de forma sistemática.

**El problema del creador:**
Crear contenido educativo de calidad AAA es lento y requiere equipos de programadores, diseñadores y pedagogos trabajando en conjunto. Un curso que debería tomar una semana termina llevando meses.

**El problema del estudiante:**
La educación online tradicional no compite con videojuegos, redes sociales, o streaming por la atención de los estudiantes. El contenido es estático, el feedback es lento, y la experiencia es olvidable.

**La solución - Mateatletas Studio:**
Un sistema donde el creador diseña la experiencia pedagógica, el motor se encarga de la implementación técnica, y el estudiante recibe una experiencia que rivaliza con los mejores videojuegos educativos del mercado.

### 1.3 Principios Fundamentales

> Estos principios guían todas las decisiones de diseño de Mateatletas Studio. No son sugerencias - son reglas inviolables.

**1. Calidad AAA, sin excepciones**
No hay "versión rápida" o "después lo mejoramos". Cada experiencia que sale del Studio tiene que estar al nivel de un juego profesional. Animaciones fluidas, feedback instantáneo, cero bugs visuales.

**2. Cero fricción entre querer y hacer**
Si el estudiante quiere interactuar, arrastra y pasa. Si quiere avanzar, un click. Nada de tutoriales obligatorios, pantallas de carga, o pasos innecesarios. La interfaz desaparece y solo queda la experiencia.

**3. El contenido se diseña, no se programa**
Los creadores piensan en pedagogía y experiencia, no en código. El sistema se encarga de que funcione. Si hay que escribir código, es un bug del sistema, no una limitación del creador.

**4. Mejor 5 cursos perfectos que 50 mediocres. Si se rompe en el frontend, no debería haber llegado ahí.**
La calidad no se negocia. El sistema de validación garantiza que solo llegue contenido impecable al estudiante. Un JSON inválido nunca toca producción.

**5. Todo lo que ves es lo que obtiene el estudiante. El sistema mejora con cada curso creado.**
Preview en tiempo real, pixel por pixel idéntico a producción. Y cada curso completado alimenta la biblioteca de componentes reutilizables para el siguiente, haciendo el sistema más poderoso con el uso.

### 1.4 Propuesta de Valor

| Para el creador                  | Para el estudiante                  | Para el negocio                      |
| -------------------------------- | ----------------------------------- | ------------------------------------ |
| Crea en horas, no semanas        | Experiencia nivel videojuego        | Contenido premium diferenciado       |
| Sin código, con preview real     | Feedback instantáneo en cada acción | Escalable sin perder calidad         |
| Biblioteca reutilizable crece    | Progresión y gamificación real      | Sistema que mejora con el uso        |
| Validación automática de calidad | Adaptado a su edad automáticamente  | Barrera de entrada para competidores |

### 1.5 Diferenciación Competitiva

| Característica           | Moodle/Canvas | Duolingo    | Matific    | **Mateatletas Studio**        |
| ------------------------ | ------------- | ----------- | ---------- | ----------------------------- |
| Interactividad           | ❌ Estático   | ✅ Limitada | ✅ Buena   | ✅ **Nivel videojuego**       |
| Simuladores científicos  | ❌ No         | ❌ No       | ⚠️ Básicos | ✅ **Universe Sandbox level** |
| Personalización por edad | ❌ No         | ⚠️ Limitada | ✅ Sí      | ✅ **3 Casas diferenciadas**  |
| Gamificación             | ❌ Básica     | ✅ Buena    | ✅ Buena   | ✅ **Sistema completo**       |
| Creación sin código      | ✅ Sí         | ❌ N/A      | ❌ N/A     | ✅ **Con preview real**       |
| Reutilización            | ❌ Manual     | ❌ N/A      | ❌ N/A     | ✅ **Biblioteca inteligente** |
| Validación automática    | ❌ No         | ❌ N/A      | ❌ N/A     | ✅ **Schema + reglas**        |

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Capas del Sistema

Mateatletas Studio se compone de 5 capas:

| Capa                  | Función                                                | Fase |
| --------------------- | ------------------------------------------------------ | ---- |
| **Studio UI**         | Interfaz donde se diseñan los cursos                   | 1    |
| **Validation Engine** | Verifica que los JSONs cumplan el schema y reglas      | 1    |
| **Preview Renderer**  | Muestra el curso exactamente como lo ve el estudiante  | 1    |
| **Biblioteca**        | Almacena cursos, componentes y templates reutilizables | 1    |
| **Telemetría**        | Trackea uso y métricas para mejora continua            | 2    |

### 2.2 Flujo de Datos

**Arquitectura híbrida:**

- Mientras diseñás → Todo pasa en el navegador (instantáneo)
- Cuando guardás → Backend persiste en DB + JSON

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR                              │
│                                                             │
│   Studio UI → Validation Engine → Preview Renderer          │
│       ↓                                                     │
│   (todo instantáneo, sin esperar servidor)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ Solo al guardar
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVIDOR                               │
│                                                             │
│   Backend API → PostgreSQL (metadata)                       │
│              → JSON Files (contenido)                       │
│              → Biblioteca (indexado para reutilización)     │
└─────────────────────────────────────────────────────────────┘
```

**Beneficios:**

- Preview instantáneo mientras trabajás
- No dependés de internet para diseñar
- Backend solo se usa para persistir

### 2.3 Estados del Curso

```
DRAFT → EN_PROGRESO → EN_REVISIÓN → PUBLICADO
```

| Estado          | Descripción                            | Acciones permitidas                      |
| --------------- | -------------------------------------- | ---------------------------------------- |
| **DRAFT**       | Configuración inicial, plantilla vacía | Editar config, generar plantilla         |
| **EN_PROGRESO** | Cargando contenido semana a semana     | Subir JSONs, preview, ajustar            |
| **EN_REVISIÓN** | Curso completo, revisión final         | Preview completo, configurar visibilidad |
| **PUBLICADO**   | Visible según configuración            | Editar crea nueva versión DRAFT          |

### 2.4 Flujo de Creación

```
DRAFT (Configuración inicial)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Studio UI: Configurás mundo, casa, tipo, tier, estética...
        ↓
Genera plantilla JSON vacía (metadata + semanas sin contenido)
        ↓
Estado → EN_PROGRESO


EN_PROGRESO (Cargando semanas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────────────────────┐
│                                      │
↓                                      │
Semana N: Generás JSON con Claude      │
        ↓                              │
Subís al Studio                        │
        ↓                              │
Preview instantáneo                    │
        ↓                              │
¿OK? ─── No ───→ Ajustás ─────────────┘
 │
 Sí → ¿Todas las semanas completas? → No → Loop
      │
      Sí → Estado → EN_REVISIÓN


EN_REVISIÓN (Preview final)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Preview del curso completo
Configurás visibilidad y fechas
        ↓
¿Todo perfecto? → No → Volvés a EN_PROGRESO
 │
 Sí → Estado → PUBLICADO


PUBLICADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Curso visible según configuración de visibilidad.
Si querés editar → Crea versión DRAFT (no afecta el publicado)
```

### 2.5 Modelo de Publicación

```typescript
interface CursoPublicado {
  // Acceso por tier
  tier_minimo: 'ARCADE' | 'ARCADE+' | 'PRO';

  // Dónde se muestra
  visibilidad: {
    landing_mundo: boolean; // Landing de Matemática/Programación/Ciencias
    landing_home: boolean; // Home principal como destacado
    catalogo_interno: boolean; // Catálogo para estudiantes inscriptos
    notificar_upgrade: boolean; // Notifica a tiers inferiores para upgrade
  };

  // Fechas
  fecha_venta: Date; // Cuándo se puede comprar
  fecha_disponible: Date; // Cuándo se puede cursar
}
```

**Lógica de notificación:**

- Si `notificar_upgrade = true` y `tier_minimo = 'ARCADE+'`:
  → Padres con ARCADE reciben: "Nuevo curso disponible. ¿Upgrade a ARCADE+?"
- Si `tier_minimo = 'PRO'`:
  → Padres con ARCADE y ARCADE+ reciben notificación de upgrade

### 2.6 Configuración del Curso

```typescript
interface ConfiguracionCurso {
  // Identificación
  nombre: string;
  descripcion: string;

  // Clasificación
  mundo: 'matematica' | 'programacion' | 'ciencias';
  casa: 'QUANTUM' | 'VERTEX' | 'PULSAR';
  tier_minimo: 'ARCADE' | 'ARCADE+' | 'PRO';

  // Tipo de producto
  categoria: 'experiencia' | 'curricular';

  // Si es experiencia
  tipo_experiencia?:
    | 'narrativo'
    | 'expedicion'
    | 'laboratorio'
    | 'simulacion'
    | 'proyecto'
    | 'desafio';

  // Si es curricular
  materia?: 'matematica_escolar' | 'fisica' | 'quimica' | 'programacion_basica';

  // Estética
  estetica: {
    base: string; // Heredada del mundo (automático)
    variante?: string; // Opcional: "Harry Potter", "Minecraft", etc.
  };

  // Duración
  duracion: {
    semanas: number;
    actividades_por_semana: number;
  };
}
```

### 2.7 Sistema de Estética

La estética mantiene coherencia visual a nivel plataforma mientras permite creatividad a nivel curso.

**Estética Base por Mundo (obligatoria):**

| Mundo            | Base Visual           | Paleta                               | Elementos                        |
| ---------------- | --------------------- | ------------------------------------ | -------------------------------- |
| **Matemática**   | Geométrica, abstracta | Cálidos (naranjas, amarillos, rojos) | Formas, patrones, fractales      |
| **Programación** | Tech, cyber           | Fríos (cyans, verdes neón, azules)   | Código, circuitos, interfaces    |
| **Ciencias**     | Espacial, natural     | Profundos (violetas, azules oscuros) | Estrellas, moléculas, naturaleza |

**Variantes Temáticas (opcionales):**

| Mundo            | Variantes Disponibles                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Ciencias**     | Default (cosmos), Harry Potter (fantasía), Dinosaurios (jurásico), Océanos (submarino) |
| **Matemática**   | Default (geométrico), Minecraft (bloques), Arte (patrones), Juegos (dados, cartas)     |
| **Programación** | Default (cyber), Roblox (gaming), Robots (robótica), Apps (mobile UI)                  |

**Regla:** La variante temática siempre respeta la paleta base del mundo. Esto garantiza que un estudiante siempre sepa "en qué mundo está" por el look & feel.

### 2.8 Ubicación en el Sistema

- **Studio UI** vive dentro del Admin Panel (`/admin/studio`)
- **Biblioteca** almacena:
  - Metadata en PostgreSQL (búsqueda rápida, filtros)
  - Contenido en archivos JSON (fácil versionado, exportable)

---

## 3. FORMULARIO DE CONFIGURACIÓN INICIAL

El formulario de configuración es un wizard de 6 pasos que guía la creación de un nuevo curso.

### 3.1 Paso 1: ¿Qué vas a crear?

El usuario elige entre dos tipos de producto:

```
┌─────────────────────────────────────────┐
│ 🚀 EXPERIENCIA TEMÁTICA                 │
│                                         │
│ Cursos inmersivos tipo videojuego.      │
│ Narrativa, exploración, simulación.     │
│ Ej: "La Química de Harry Potter"        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📚 CURSO CURRICULAR                     │
│                                         │
│ Apoyo escolar estructurado.             │
│ Alineado al programa oficial.           │
│ Ej: "Fracciones para 5to grado"         │
└─────────────────────────────────────────┘
```

### 3.2 Paso 2: ¿Para quién?

Selección secuencial de Casa (edad) y Mundo (área).

**Pantalla 2a: ¿Para qué edad?**

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   QUANTUM    │ │    VERTEX    │ │    PULSAR    │
│    6-9       │ │    10-12     │ │    13-17     │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Pantalla 2b: ¿Qué mundo?**

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│      🔢      │ │      💻      │ │      🔬      │
│  Matemática  │ │ Programación │ │   Ciencias   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 3.3 Paso 3: ¿Qué tipo?

Las opciones dependen de lo elegido en Paso 1.

**Si eligió EXPERIENCIA TEMÁTICA:**

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   📖 NARRATIVO  │ │  🧭 EXPEDICIÓN  │ │  🔬 LABORATORIO │
│                 │ │                 │ │                 │
│ Historia con    │ │ Exploración y   │ │ Experimentos    │
│ personajes      │ │ descubrimiento  │ │ prácticos       │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  🎮 SIMULACIÓN  │ │  🛠️ PROYECTO    │ │  ⚔️ DESAFÍO     │
│                 │ │                 │ │                 │
│ Simular         │ │ Construir algo  │ │ Competitivo,    │
│ escenarios      │ │ concreto        │ │ resolver retos  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Si eligió CURRICULAR:**

```
┌─────────────────┐ ┌─────────────────┐
│  🔢 MATEMÁTICA  │ │  ⚛️ FÍSICA      │
└─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐
│  🧪 QUÍMICA     │ │  💻 PROGRAMACIÓN│
└─────────────────┘ └─────────────────┘
```

**Nota:** El nivel de complejidad lo determina la Casa elegida en Paso 2.

| Casa    | Programación                    |
| ------- | ------------------------------- |
| QUANTUM | Bloques, Scratch, lógica básica |
| VERTEX  | Lua/Roblox, Python intro        |
| PULSAR  | Python avanzado, JS, algoritmos |

### 3.4 Paso 4: Detalles del curso

| Campo             | Tipo   | Requerido | Descripción                     |
| ----------------- | ------ | --------- | ------------------------------- |
| Nombre del curso  | texto  | ✅        | Título del curso                |
| Descripción corta | texto  | ✅        | Para catálogo y landing         |
| Variante temática | select | ❌        | Opciones según el Mundo elegido |
| Conceptos clave   | tags   | ❌        | Para búsqueda y filtros         |

**Variantes temáticas disponibles por Mundo:**

| Mundo        | Variantes                                            |
| ------------ | ---------------------------------------------------- |
| Ciencias     | Default (cosmos), Harry Potter, Dinosaurios, Océanos |
| Matemática   | Default (geométrico), Minecraft, Arte, Juegos        |
| Programación | Default (cyber), Roblox, Robots, Apps                |

### 3.5 Paso 5: Duración y Tier

| Campo                  | Tipo   | Descripción                   |
| ---------------------- | ------ | ----------------------------- |
| Semanas                | número | Cantidad de semanas del curso |
| Actividades por semana | número | Actividades por cada semana   |
| Tier mínimo            | select | ARCADE / ARCADE+ / PRO        |

**Tiers:**

| Tier    | Descripción                                |
| ------- | ------------------------------------------ |
| ARCADE  | Incluido en plan base ($30k)               |
| ARCADE+ | Requiere upgrade, notifica a padres ($60k) |
| PRO     | Solo plan premium con clases sync ($75k)   |

### 3.6 Paso 6: Confirmación

Resumen de toda la configuración con opción de volver a editar o generar plantilla.

Al clickear **GENERAR PLANTILLA**:

1. Se crea el JSON con metadata + semanas vacías
2. Estado del curso pasa a DRAFT
3. Redirige a la vista de carga de semanas

---

## 4. FLUJO POST-PLANTILLA

### 4.1 Vista de Carga de Semanas (Estado: EN_PROGRESO)

Una vez generada la plantilla, el usuario ve:

| Semana   | Estado                | Acciones               |
| -------- | --------------------- | ---------------------- |
| Semana 1 | ○ Vacía / ✅ Completa | [Subir JSON] [Preview] |
| Semana 2 | ○ Vacía / ✅ Completa | [Subir JSON] [Preview] |
| ...      | ...                   | ...                    |
| Semana N | ○ Vacía / ✅ Completa | [Subir JSON] [Preview] |

**Acciones disponibles:**

- **Descargar plantilla JSON** - Para usar con Claude
- **Pasar a revisión** - Habilitado cuando todas las semanas están completas

### 4.2 Flujo de Carga por Semana

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Descargás la plantilla JSON (o copiás el contexto)      │
│                         ↓                                   │
│  2. Vas a Claude: "Completá semana 1, tema: X"              │
│                         ↓                                   │
│  3. Claude devuelve semana_1.json                           │
│                         ↓                                   │
│  4. Subís el JSON al Studio                                 │
│                         ↓                                   │
│  5. Validador verifica:                                     │
│     ├── ✅ OK → Preview habilitado, semana completa         │
│     └── ❌ Error → Mensaje claro de qué falta               │
│                         ↓                                   │
│  6. Preview exactamente como lo ve el estudiante            │
│                         ↓                                   │
│  7. ¿Ajustes? → Editás y re-subís                           │
│                         ↓                                   │
│  8. Siguiente semana → Repetir                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Vista de Revisión Final (Estado: EN_REVISIÓN)

Cuando todas las semanas están completas:

**Sección 1: Lista de semanas completas**

- Todas las semanas con ✅ y acceso a preview individual

**Sección 2: Preview completo**

- Botón para recorrer el curso completo como estudiante

**Sección 3: Configuración de publicación**

| Campo             | Tipo     | Descripción                                            |
| ----------------- | -------- | ------------------------------------------------------ |
| Landing del mundo | checkbox | Aparece en landing de Ciencias/Matemática/Programación |
| Landing home      | checkbox | Aparece en home como destacado                         |
| Catálogo interno  | checkbox | Visible para estudiantes inscriptos                    |
| Notificar upgrade | checkbox | Notifica a tiers inferiores                            |
| Fecha de venta    | date     | Cuándo se puede comprar                                |
| Fecha disponible  | date     | Cuándo se puede cursar                                 |

**Acciones:**

- **Volver a editar** - Regresa a EN_PROGRESO
- **Publicar curso** - Cambia estado a PUBLICADO

### 4.4 Post-Publicación (Estado: PUBLICADO)

Una vez publicado:

1. **Visibilidad:** El curso aparece según la configuración
2. **Notificaciones:** Si `notificar_upgrade = true`, se envían notificaciones a padres con tiers inferiores
3. **Edición:** Si se necesita editar, se crea una versión DRAFT sin afectar el curso publicado

---

## RESUMEN DEL FLUJO COMPLETO

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    DRAFT    │ →  │ EN_PROGRESO │ →  │ EN_REVISIÓN │ →  │  PUBLICADO  │
│             │    │             │    │             │    │             │
│ Wizard 6    │    │ Cargar      │    │ Preview     │    │ Visible     │
│ pasos       │    │ semanas     │    │ completo +  │    │ según       │
│             │    │ con JSONs   │    │ config      │    │ config      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 5. SCHEMA DE PLANTILLA (JSON MADRE)

Este es el JSON que se genera cuando el usuario completa el wizard y clickea "GENERAR PLANTILLA".

### 5.1 Estructura Completa

```typescript
interface PlantillaCurso {
  // Identificación
  id: string; // UUID generado automáticamente
  version: string; // "1.0.0"
  estado: EstadoCurso;

  // Metadata del curso
  metadata: {
    nombre: string;
    descripcion: string;

    // Clasificación
    categoria: 'experiencia' | 'curricular';
    mundo: 'matematica' | 'programacion' | 'ciencias';
    casa: 'QUANTUM' | 'VERTEX' | 'PULSAR';
    tier_minimo: 'ARCADE' | 'ARCADE+' | 'PRO';

    // Tipo específico
    tipo_experiencia?:
      | 'narrativo'
      | 'expedicion'
      | 'laboratorio'
      | 'simulacion'
      | 'proyecto'
      | 'desafio';
    materia?: 'matematica_escolar' | 'fisica' | 'quimica' | 'programacion';

    // Estética
    estetica: {
      base: string; // Heredada del mundo (automático)
      variante?: string; // "Harry Potter", "Minecraft", etc.
      paleta: string[]; // Colores principales (automático según mundo)
    };

    // Tags y búsqueda
    conceptos: string[]; // ["pH", "mezclas", "reacciones"]
    tags: string[]; // Tags adicionales para filtros
  };

  // Configuración de duración
  duracion: {
    semanas: number;
    actividades_por_semana: number;
    total_actividades: number; // Calculado automáticamente
  };

  // Configuración de publicación (se completa en EN_REVISIÓN)
  publicacion: {
    visibilidad: {
      landing_mundo: boolean;
      landing_home: boolean;
      catalogo_interno: boolean;
      notificar_upgrade: boolean;
    };
    fecha_venta: string | null; // ISO date
    fecha_disponible: string | null; // ISO date
  };

  // Semanas (vacías al generar, se llenan después)
  semanas: SemanaPlantilla[];

  // Timestamps
  creado_en: string; // ISO datetime
  actualizado_en: string; // ISO datetime
}

type EstadoCurso = 'DRAFT' | 'EN_PROGRESO' | 'EN_REVISION' | 'PUBLICADO';

interface SemanaPlantilla {
  numero: number;
  nombre: string | null; // Se define al cargar contenido
  descripcion: string | null;
  actividades: ActividadPlantilla[];
  estado: 'vacia' | 'completa';
}

interface ActividadPlantilla {
  numero: number;
  contenido: null | ActividadContenido; // null = vacía, objeto = completa
}

// ============================================
// INTERFACES DE CONTENIDO COMPLETO
// ============================================

/**
 * Semana con contenido completo (después de cargar el JSON)
 */
interface Semana {
  numero: number;
  nombre: string;
  descripcion: string;

  objetivosAprendizaje: string[];

  actividades: Actividad[];

  recursos: Recurso[];

  resumenGamificacion: {
    xpTotalSemana: number;
    xpBonusPosible: number;
    badgesPosibles: string[];
  };
}

/**
 * Actividad completa con bloques
 */
interface Actividad {
  numero: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;

  objetivos: string[];
  prerrequisitos: Prerrequisito[] | null;

  bloques: Bloque[];

  gamificacion: {
    xpCompletar: number;
    xpBonusSinErrores: number;
    badge: string | null;
  };

  notasDocente: string | null;
}

/**
 * Prerrequisito para desbloquear actividad
 */
interface Prerrequisito {
  tipo: 'actividad' | 'semana';
  referencia: string; // "actividad_1" o "semana_2"
}

/**
 * Bloque de contenido dentro de una actividad
 */
interface Bloque {
  orden: number;
  componente: string; // PascalCase, debe existir en catálogo
  titulo: string;

  contenido: BloqueContenido; // Props específicas del componente

  minimoParaAprobar?: number; // 70-100, solo para bloques evaluativos
  repasoSiFalla?: Bloque; // Bloque alternativo si no aprueba

  desbloquea: number | null; // Siguiente bloque o null si es el último
}

/**
 * Contenido del bloque - varía según el componente
 */
type BloqueContenido =
  | InteractivePresentationContent
  | MultipleChoiceQuizContent
  | NarrationWithTrackingContent
  | SimulatorContent
  | SortingBinsContent
  | CheckpointContent
  | BossBattleContent
  | Record<string, unknown>; // Para otros componentes

interface InteractivePresentationContent {
  slides: Array<{
    titulo: string;
    texto: string;
    imagen?: string;
    audio?: string;
    interaccion?: {
      tipo: 'click' | 'drag' | 'hover';
      objetivo: string;
    };
  }>;
  tieneAudio: boolean;
  tieneInteraccion: boolean;
  avanceAutomatico: boolean;
}

interface MultipleChoiceQuizContent {
  preguntas: Array<{
    texto: string;
    imagen?: string;
    opciones: string[];
    respuestaCorrecta: number;
    feedbackCorrecto: string;
    feedbackIncorrecto: string;
  }>;
  mostrarFeedback: boolean;
  permitirReintentos: boolean;
}

interface NarrationWithTrackingContent {
  audio: string;
  texto: string;
  resaltarPalabras: boolean;
}

interface SimulatorContent {
  modo: 'libre' | 'guiado' | 'desafio';
  variables: Array<{
    nombre: string;
    min: number;
    max: number;
    valorInicial: number;
    paso: number;
  }>;
  objetivo?: string;
  pistasActivas: boolean;
  tiempoLimite?: number;
}

interface SortingBinsContent {
  categorias: string[];
  elementos: Array<{
    nombre: string;
    categoria: string;
  }>;
  mostrarFeedback: boolean;
}

interface CheckpointContent {
  mensaje: string;
  animacion: 'celebracionSimple' | 'celebracionEpica' | 'ninguna';
  mostrarResumen: boolean;
}

interface BossBattleContent {
  preguntas: Array<{
    texto: string;
    opciones: string[];
    respuestaCorrecta: number;
  }>;
  vidas: number;
  tiempoPorPregunta: number;
  dificultadProgresiva: boolean;
}

/**
 * Recurso (imagen, audio, video) usado en el curso
 */
interface Recurso {
  id: string;
  tipo: 'imagen' | 'audio' | 'video' | 'documento';
  nombre: string;
  archivo: string;
  tamanioBytes: number;
  usadoEn: string[];
}
```

### 5.2 Ejemplo: Plantilla Generada

Cuando el usuario completa el wizard para "La Química de Harry Potter":

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0.0",
  "estado": "DRAFT",

  "metadata": {
    "nombre": "La Química de Harry Potter",
    "descripcion": "Descubrí los secretos de las pociones mientras aprendés química de verdad.",

    "categoria": "experiencia",
    "mundo": "ciencias",
    "casa": "VERTEX",
    "tier_minimo": "ARCADE+",

    "tipo_experiencia": "narrativo",
    "materia": null,

    "estetica": {
      "base": "espacial",
      "variante": "Harry Potter",
      "paleta": ["#4C1D95", "#1E1B4B", "#7C3AED", "#A78BFA"]
    },

    "conceptos": ["pH", "mezclas", "reacciones", "estados de materia"],
    "tags": ["química", "fantasía", "Harry Potter", "pociones"]
  },

  "duracion": {
    "semanas": 8,
    "actividades_por_semana": 3,
    "total_actividades": 24
  },

  "publicacion": {
    "visibilidad": {
      "landing_mundo": false,
      "landing_home": false,
      "catalogo_interno": false,
      "notificar_upgrade": false
    },
    "fecha_venta": null,
    "fecha_disponible": null
  },

  "semanas": [
    {
      "numero": 1,
      "nombre": null,
      "descripcion": null,
      "estado": "vacia",
      "actividades": [
        { "numero": 1, "contenido": null },
        { "numero": 2, "contenido": null },
        { "numero": 3, "contenido": null }
      ]
    },
    {
      "numero": 2,
      "nombre": null,
      "descripcion": null,
      "estado": "vacia",
      "actividades": [
        { "numero": 1, "contenido": null },
        { "numero": 2, "contenido": null },
        { "numero": 3, "contenido": null }
      ]
    }
    // ... semanas 3-8 con la misma estructura
  ],

  "creado_en": "2025-11-29T18:30:00Z",
  "actualizado_en": "2025-11-29T18:30:00Z"
}
```

### 5.3 Valores Automáticos por Mundo

Cuando el usuario elige un Mundo, estos valores se asignan automáticamente:

| Mundo        | Base Estética | Paleta Default                                 |
| ------------ | ------------- | ---------------------------------------------- |
| Matemática   | `geometrica`  | `["#F97316", "#FBBF24", "#EF4444", "#FEF3C7"]` |
| Programación | `cyber`       | `["#06B6D4", "#22D3EE", "#10B981", "#0F172A"]` |
| Ciencias     | `espacial`    | `["#4C1D95", "#1E1B4B", "#7C3AED", "#A78BFA"]` |

### 5.4 Transiciones de Estado

```
DRAFT
  │
  │ (usuario completa wizard, genera plantilla)
  │
  ▼
EN_PROGRESO
  │
  │ (todas las semanas.estado === 'completa')
  │
  ▼
EN_REVISION
  │
  │ (usuario clickea "Publicar")
  │
  ▼
PUBLICADO
```

**Reglas de transición:**

| De          | A           | Condición                                        |
| ----------- | ----------- | ------------------------------------------------ |
| DRAFT       | EN_PROGRESO | Automático al generar plantilla                  |
| EN_PROGRESO | EN_REVISION | Todas las semanas completas                      |
| EN_REVISION | EN_PROGRESO | Usuario clickea "Volver a editar"                |
| EN_REVISION | PUBLICADO   | Usuario clickea "Publicar" + fechas configuradas |
| PUBLICADO   | DRAFT       | Usuario quiere editar → crea nueva versión       |

### 5.5 Validaciones del Schema

El Validation Engine verifica:

**Campos requeridos:**

- `metadata.nombre` - mínimo 3 caracteres
- `metadata.descripcion` - mínimo 10 caracteres
- `metadata.categoria` - debe ser valor válido
- `metadata.mundo` - debe ser valor válido
- `metadata.casa` - debe ser valor válido
- `metadata.tier_minimo` - debe ser valor válido
- `duracion.semanas` - mínimo 1
- `duracion.actividades_por_semana` - mínimo 1

**Coherencia:**

- Si `categoria === 'experiencia'` → `tipo_experiencia` requerido
- Si `categoria === 'curricular'` → `materia` requerido
- `semanas.length` debe coincidir con `duracion.semanas`
- Cada semana debe tener `duracion.actividades_por_semana` actividades

**Para publicar:**

- Todas las semanas deben tener `estado === 'completa'`
- `publicacion.fecha_venta` requerida
- `publicacion.fecha_disponible` requerida
- `fecha_disponible >= fecha_venta`

---

## 6. SCHEMA DE SEMANA

Este es el JSON que generamos juntos (vos + Claude) para cada semana del curso.

---

### 6.1 ¿Qué contiene una semana?

Cada semana tiene:

| Elemento        | Qué es                            | Ejemplo                                |
| --------------- | --------------------------------- | -------------------------------------- |
| **Info básica** | Número, nombre, descripción       | "Semana 1: Tu Primera Poción"          |
| **Objetivos**   | Qué va a aprender el estudiante   | "Entender qué es una mezcla"           |
| **Actividades** | Las 3-5 experiencias de la semana | Intro, Contenido, Práctica, Evaluación |
| **Recursos**    | Imágenes, audios que necesita     | "aula_pociones.png"                    |

Cada **actividad** tiene:

| Elemento             | Qué es                                   | Ejemplo                              |
| -------------------- | ---------------------------------------- | ------------------------------------ |
| **Info**             | Nombre, descripción, duración            | "Bienvenido a Pociones - 15 min"     |
| **Objetivos**        | Qué aprende en esta actividad específica | "Conocer las reglas del laboratorio" |
| **Prerrequisitos**   | Qué tiene que saber antes                | "Ninguno" o "Completar actividad 1"  |
| **Bloques**          | Los componentes en orden                 | Presentación → Quiz → Simulador      |
| **Bloque de repaso** | Qué ve si falla (vos lo definís)         | Explicación extra + reintentar       |
| **Gamificación**     | XP y badges que gana                     | 50 XP, Badge "Aprendiz"              |
| **Notas docente**    | Tips para el profe (solo tier PRO)       | "Enfatizar la seguridad"             |

---

### 6.2 Cómo funcionan los bloques

Los bloques se desbloquean en secuencia. El estudiante no puede saltear.

```
FLUJO NORMAL:
Bloque 1 ✅ → Bloque 2 ✅ → Bloque 3 ✅ → Bloque 4 ✅ → Actividad completa!

FLUJO CON REPASO (si falla con menos de 70%):
Bloque 1 ✅ → Bloque 2 ❌ (58%) → Repaso 2 → Bloque 2 ✅ (85%) → Bloque 3...
```

**Regla:** Necesita 70% para avanzar. Si no llega, ve el bloque de repaso que vos definiste y reintenta.

---

### 6.3 Ejemplo real: Semana 1 de "La Química de Harry Potter"

> **Nota sobre convención de nombres:** Todos los componentes usan **PascalCase** consistente con el catálogo (Sección 7) y el resto del proyecto Mateatletas.

```json
{
  "numero": 1,
  "nombre": "Tu Primera Poción",
  "descripcion": "Descubrí qué son las mezclas mientras preparás tu primera poción mágica.",

  "objetivosAprendizaje": [
    "Entender qué es una mezcla",
    "Diferenciar mezcla homogénea de heterogénea",
    "Conocer las reglas de seguridad del laboratorio"
  ],

  "actividades": [
    {
      "numero": 1,
      "nombre": "Bienvenido a Pociones",
      "descripcion": "Conocé el laboratorio y las reglas básicas.",
      "duracionMinutos": 15,

      "objetivos": [
        "Familiarizarse con el entorno del laboratorio",
        "Aprender las 3 reglas de seguridad"
      ],

      "prerrequisitos": null,

      "bloques": [
        {
          "orden": 1,
          "componente": "InteractivePresentation",
          "titulo": "¡Bienvenido al aula de Pociones!",
          "contenido": {
            "slides": [
              {
                "titulo": "El aula de Pociones",
                "texto": "Este será tu lugar de trabajo...",
                "imagen": "aula_pociones.png"
              },
              {
                "titulo": "Las 3 reglas de oro",
                "texto": "Antes de empezar, memorizá estas reglas...",
                "imagen": "reglas_seguridad.png"
              }
            ],
            "tieneAudio": true,
            "tieneInteraccion": true,
            "avanceAutomatico": false
          },
          "desbloquea": 2
        },
        {
          "orden": 2,
          "componente": "MultipleChoice",
          "titulo": "¿Aprendiste las reglas?",
          "contenido": {
            "preguntas": [
              {
                "texto": "¿Cuál es la primera regla del laboratorio?",
                "opciones": [
                  "Correr para terminar rápido",
                  "Nunca mezclar sin supervisión",
                  "Usar ingredientes al azar",
                  "Saltear los pasos"
                ],
                "respuestaCorrecta": 1,
                "feedbackCorrecto": "¡Exacto! La seguridad es lo primero.",
                "feedbackIncorrecto": "No exactamente. Recordá: nunca mezclar sin supervisión."
              }
            ],
            "mostrarFeedback": true,
            "permitirReintentos": false
          },
          "minimoParaAprobar": 70,
          "repasoSiFalla": {
            "orden": 0,
            "componente": "NarrationWithTracking",
            "titulo": "Repasemos las reglas",
            "contenido": {
              "audio": "repaso_reglas.mp3",
              "texto": "Las tres reglas de oro son: 1) Nunca mezclar sin supervisión...",
              "resaltarPalabras": true
            },
            "desbloquea": null
          },
          "desbloquea": 3
        },
        {
          "orden": 3,
          "componente": "Checkpoint",
          "titulo": "¡Listo para empezar!",
          "contenido": {
            "mensaje": "Ya conocés las reglas. ¡Vamos a hacer pociones!",
            "animacion": "celebracionSimple",
            "mostrarResumen": false
          },
          "desbloquea": null
        }
      ],

      "gamificacion": {
        "xpCompletar": 50,
        "xpBonusSinErrores": 20,
        "badge": null
      },

      "notasDocente": "Asegurarse de que entiendan la importancia de la seguridad antes de avanzar."
    },

    {
      "numero": 2,
      "nombre": "¿Qué es una mezcla?",
      "descripcion": "Aprendé la diferencia entre mezclas y sustancias puras.",
      "duracionMinutos": 25,

      "objetivos": ["Definir qué es una mezcla", "Identificar ejemplos cotidianos de mezclas"],

      "prerrequisitos": [{ "tipo": "actividad", "referencia": "actividad_1" }],

      "bloques": [
        {
          "orden": 1,
          "componente": "NarrationWithTracking",
          "titulo": "Las mezclas están en todos lados",
          "contenido": {
            "audio": "intro_mezclas.mp3",
            "texto": "Una mezcla es cuando juntamos dos o más sustancias...",
            "resaltarPalabras": true
          },
          "desbloquea": 2
        },
        {
          "orden": 2,
          "componente": "StateMatterSim",
          "titulo": "Laboratorio de mezclas",
          "contenido": {
            "modo": "libre",
            "variables": [
              { "nombre": "agua", "min": 0, "max": 100, "valorInicial": 50, "paso": 10 },
              { "nombre": "sal", "min": 0, "max": 50, "valorInicial": 0, "paso": 5 },
              { "nombre": "arena", "min": 0, "max": 50, "valorInicial": 0, "paso": 5 },
              { "nombre": "aceite", "min": 0, "max": 50, "valorInicial": 0, "paso": 5 }
            ],
            "objetivo": "Crear 2 mezclas diferentes",
            "pistasActivas": true
          },
          "desbloquea": 3
        },
        {
          "orden": 3,
          "componente": "SortingBins",
          "titulo": "Clasificá los ejemplos",
          "contenido": {
            "categorias": ["Mezcla", "Sustancia pura"],
            "elementos": [
              { "nombre": "Agua salada", "categoria": "Mezcla" },
              { "nombre": "Agua destilada", "categoria": "Sustancia pura" },
              { "nombre": "Ensalada", "categoria": "Mezcla" },
              { "nombre": "Oro puro", "categoria": "Sustancia pura" },
              { "nombre": "Aire", "categoria": "Mezcla" },
              { "nombre": "Oxígeno", "categoria": "Sustancia pura" },
              { "nombre": "Jugo de naranja", "categoria": "Mezcla" },
              { "nombre": "Hierro", "categoria": "Sustancia pura" }
            ],
            "mostrarFeedback": true
          },
          "minimoParaAprobar": 70,
          "repasoSiFalla": {
            "orden": 0,
            "componente": "InteractivePresentation",
            "titulo": "Revisemos los conceptos",
            "contenido": {
              "slides": [
                {
                  "titulo": "Mezcla vs Sustancia Pura",
                  "texto": "Una mezcla tiene varios componentes, una sustancia pura tiene uno solo...",
                  "imagen": "mezcla_vs_pura.png"
                }
              ],
              "tieneAudio": true,
              "tieneInteraccion": false,
              "avanceAutomatico": false
            },
            "desbloquea": null
          },
          "desbloquea": null
        }
      ],

      "gamificacion": {
        "xpCompletar": 75,
        "xpBonusSinErrores": 25,
        "badge": "AprendizMezclas"
      },

      "notasDocente": "El simulador es clave. Dejar que experimenten libremente antes de guiar."
    },

    {
      "numero": 3,
      "nombre": "Tu primera poción",
      "descripcion": "Aplicá lo que aprendiste creando una poción real.",
      "duracionMinutos": 30,

      "objetivos": [
        "Aplicar el concepto de mezcla",
        "Seguir instrucciones paso a paso",
        "Observar cambios en los materiales"
      ],

      "prerrequisitos": [{ "tipo": "actividad", "referencia": "actividad_2" }],

      "bloques": [
        {
          "orden": 1,
          "componente": "InteractivePresentation",
          "titulo": "La receta de hoy",
          "contenido": {
            "slides": [
              {
                "titulo": "Ingredientes",
                "texto": "Para nuestra poción necesitamos...",
                "imagen": "ingredientes_pocion.png"
              }
            ],
            "tieneAudio": true,
            "tieneInteraccion": true,
            "avanceAutomatico": false
          },
          "desbloquea": 2
        },
        {
          "orden": 2,
          "componente": "StateMatterSim",
          "titulo": "¡A mezclar!",
          "contenido": {
            "modo": "guiado",
            "variables": [
              { "nombre": "ingrediente1", "min": 0, "max": 100, "valorInicial": 0, "paso": 10 },
              { "nombre": "ingrediente2", "min": 0, "max": 100, "valorInicial": 0, "paso": 10 }
            ],
            "objetivo": "Seguir los pasos de la receta",
            "pistasActivas": true
          },
          "desbloquea": 3
        },
        {
          "orden": 3,
          "componente": "MultipleChoice",
          "titulo": "Reflexión final",
          "contenido": {
            "preguntas": [
              {
                "texto": "¿Qué tipo de mezcla creamos?",
                "opciones": ["Homogénea", "Heterogénea", "No es una mezcla", "Ninguna"],
                "respuestaCorrecta": 0,
                "feedbackCorrecto": "¡Correcto! Los componentes se mezclaron uniformemente.",
                "feedbackIncorrecto": "Pensá en si podés distinguir los componentes a simple vista."
              }
            ],
            "mostrarFeedback": true,
            "permitirReintentos": true
          },
          "minimoParaAprobar": 70,
          "repasoSiFalla": {
            "orden": 0,
            "componente": "StepAnimation",
            "titulo": "Veamos de nuevo el proceso",
            "contenido": {
              "pasos": ["Agregar agua", "Medir sal", "Mezclar", "Observar", "Concluir"],
              "pausaEntrePasos": true,
              "audioNarracion": true
            },
            "desbloquea": null
          },
          "desbloquea": 4
        },
        {
          "orden": 4,
          "componente": "ChallengeMode",
          "titulo": "Desafío del Aprendiz",
          "contenido": {
            "preguntas": [
              {
                "texto": "¿Cuál de estas es una mezcla?",
                "opciones": ["Sal", "Agua con azúcar", "Cobre", "Nitrógeno"],
                "respuestaCorrecta": 1
              }
            ],
            "vidas": 3,
            "tiempoPorPregunta": 30,
            "dificultadProgresiva": true
          },
          "desbloquea": null
        }
      ],

      "gamificacion": {
        "xpCompletar": 100,
        "xpBonusSinErrores": 50,
        "badge": "PrimeraPocion"
      },

      "notasDocente": "El ChallengeMode es opcional pero muy motivador. Celebrar a quienes lo completen."
    }
  ],

  "recursos": [
    {
      "id": "res_001",
      "tipo": "imagen",
      "nombre": "aula_pociones.png",
      "archivo": "/uploads/cursos/quimica-hp/imagenes/res_001_aula_pociones.png",
      "tamanioBytes": 245000,
      "usadoEn": ["actividad_1_bloque_1"]
    },
    {
      "id": "res_002",
      "tipo": "imagen",
      "nombre": "reglas_seguridad.png",
      "archivo": "/uploads/cursos/quimica-hp/imagenes/res_002_reglas_seguridad.png",
      "tamanioBytes": 180000,
      "usadoEn": ["actividad_1_bloque_1"]
    },
    {
      "id": "res_003",
      "tipo": "audio",
      "nombre": "repaso_reglas.mp3",
      "archivo": "/uploads/cursos/quimica-hp/audios/res_003_repaso_reglas.mp3",
      "tamanioBytes": 1500000,
      "usadoEn": ["actividad_1_bloque_2_repaso"]
    },
    {
      "id": "res_004",
      "tipo": "audio",
      "nombre": "intro_mezclas.mp3",
      "archivo": "/uploads/cursos/quimica-hp/audios/res_004_intro_mezclas.mp3",
      "tamanioBytes": 2000000,
      "usadoEn": ["actividad_2_bloque_1"]
    },
    {
      "id": "res_005",
      "tipo": "imagen",
      "nombre": "ingredientes_pocion.png",
      "archivo": "/uploads/cursos/quimica-hp/imagenes/res_005_ingredientes_pocion.png",
      "tamanioBytes": 220000,
      "usadoEn": ["actividad_3_bloque_1"]
    },
    {
      "id": "res_006",
      "tipo": "imagen",
      "nombre": "mezcla_vs_pura.png",
      "archivo": "/uploads/cursos/quimica-hp/imagenes/res_006_mezcla_vs_pura.png",
      "tamanioBytes": 195000,
      "usadoEn": ["actividad_2_bloque_3_repaso"]
    }
  ],

  "resumenGamificacion": {
    "xpTotalSemana": 225,
    "xpBonusPosible": 95,
    "badgesPosibles": ["AprendizMezclas", "PrimeraPocion"]
  }
}
```

---

### 6.4 Estructura resumida (para tener a mano)

```
Semana (camelCase en JSON)
├── numero
├── nombre
├── descripcion
├── objetivosAprendizaje[]
├── actividades[]
│   ├── numero
│   ├── nombre
│   ├── descripcion
│   ├── duracionMinutos
│   ├── objetivos[]
│   ├── prerrequisitos[] → { tipo, referencia }
│   ├── bloques[]
│   │   ├── orden
│   │   ├── componente (PascalCase, del catálogo)
│   │   ├── titulo
│   │   ├── contenido {}
│   │   ├── minimoParaAprobar (70-100, opcional)
│   │   ├── repasoSiFalla {} (opcional)
│   │   └── desbloquea (siguiente bloque o null)
│   ├── gamificacion
│   │   ├── xpCompletar
│   │   ├── xpBonusSinErrores
│   │   └── badge (PascalCase o null)
│   └── notasDocente
├── recursos[]
│   ├── id
│   ├── tipo
│   ├── nombre
│   ├── archivo
│   ├── tamanioBytes
│   └── usadoEn[]
└── resumenGamificacion
    ├── xpTotalSemana
    ├── xpBonusPosible
    └── badgesPosibles[]
```

---

## 7. CATÁLOGO DE COMPONENTES

Mateatletas Studio cuenta con **91 componentes** organizados en 8 categorías. Cada componente es interactivo, adaptado por edad, y diseñado para maximizar engagement.

### 7.1 Comparativa con la Competencia

**Síntesis (nuestro benchmark más cercano) tiene ~15 tipos de interacciones.**
**Nosotros tenemos 91 componentes únicos.**

| Aspecto             | Synthesis   | Mateatletas Studio              |
| ------------------- | ----------- | ------------------------------- |
| Componentes         | ~15 tipos   | **91 componentes**              |
| Simuladores         | Básicos     | **Universe Sandbox level**      |
| Adaptación por edad | Una versión | **3 versiones por componente**  |
| Personalización     | Limitada    | **Variantes temáticas**         |
| Editores de código  | No tiene    | **10 editores especializados**  |
| Componentes físicos | No tiene    | **10 de motricidad fina**       |
| Multiplayer         | Básico      | **8 componentes colaborativos** |

### 7.2 CATEGORÍA 1: INTERACTIVOS BÁSICOS (15 componentes)

Los fundamentales. Están en casi todas las actividades.

| #   | Componente       | Descripción                             | Ejemplo de uso                    |
| --- | ---------------- | --------------------------------------- | --------------------------------- |
| 1   | `DragDropZone`   | Arrastrar elementos a zonas objetivo    | Clasificar sólidos/líquidos/gases |
| 2   | `MatchingPairs`  | Conectar elementos relacionados         | Elemento → Símbolo químico        |
| 3   | `OrderSequence`  | Ordenar elementos en secuencia correcta | Pasos del método científico       |
| 4   | `MultipleChoice` | Selección única o múltiple              | Preguntas de comprensión          |
| 5   | `FillBlanks`     | Completar espacios en texto             | Ecuaciones químicas               |
| 6   | `Slider`         | Ajustar valor en rango                  | Temperatura de reacción           |
| 7   | `ToggleSwitch`   | On/Off para variables                   | Activar/desactivar catalizador    |
| 8   | `NumberInput`    | Input numérico con validación           | Calcular masa molar               |
| 9   | `TextInput`      | Input de texto libre                    | Nombrar compuestos                |
| 10  | `Hotspot`        | Identificar zonas en imagen             | Partes de una célula              |
| 11  | `Timeline`       | Ubicar eventos en línea temporal        | Historia de descubrimientos       |
| 12  | `SortingBins`    | Clasificar en múltiples categorías      | Tipos de reacciones químicas      |
| 13  | `ScaleBalance`   | Balanza interactiva                     | Equilibrar ecuaciones             |
| 14  | `PieChart`       | Gráfico circular interactivo            | Composición porcentual            |
| 15  | `BarGraph`       | Gráfico de barras manipulable           | Comparar propiedades              |

**Adaptación por Casa:**

| Componente    | QUANTUM (6-9)               | VERTEX (10-12)       | PULSAR (13-17)             |
| ------------- | --------------------------- | -------------------- | -------------------------- |
| `DragDrop`    | Zonas grandes, feedback     | Zonas precisas       | Sin ayudas visuales        |
| `FillBlanks`  | Banco de palabras visible   | Banco oculto, pistas | Sin banco, escritura libre |
| `NumberInput` | Solo enteros, rango visible | Decimales, sin rango | Notación científica        |

### 7.3 CATEGORÍA 2: MOTRICIDAD FINA (10 componentes)

Únicos de Mateatletas. Enseñan habilidades físicas a través de gestos táctiles.

| #   | Componente        | Gesto Táctil          | Habilidad que desarrolla | Ejemplo de uso                |
| --- | ----------------- | --------------------- | ------------------------ | ----------------------------- |
| 16  | `PinchZoom`       | Pinch in/out          | Coordinación bimanual    | Zoom en célula                |
| 17  | `RotateGesture`   | Rotar con dos dedos   | Manipulación espacial    | Rotar molécula 3D             |
| 18  | `TracePath`       | Seguir trazo con dedo | Control motor fino       | Dibujar orbital electrónico   |
| 19  | `PressureControl` | Presión variable      | Modulación de fuerza     | Titular ácido gota a gota     |
| 20  | `SwipeSequence`   | Swipes direccionales  | Secuenciación motora     | Activar reacción en cadena    |
| 21  | `TapRhythm`       | Taps con timing       | Ritmo y coordinación     | Sincronizar con frecuencia    |
| 22  | `LongPress`       | Mantener presionado   | Inhibición motora        | Calentar sustancia            |
| 23  | `MultiTouch`      | Múltiples dedos       | Independencia digital    | Piano molecular               |
| 24  | `DrawShape`       | Dibujo libre          | Grafomotricidad          | Estructuras de Lewis          |
| 25  | `ScratchReveal`   | Rascar para revelar   | Barrido controlado       | Descubrir elemento misterioso |

**Por qué importa:**
Niños de 6-9 años están desarrollando motricidad fina. Estos componentes convierten ese desarrollo en parte del aprendizaje, no un obstáculo.

### 7.4 CATEGORÍA 3: SIMULADORES CIENTÍFICOS (25 componentes)

El corazón de la diferenciación. Nivel Universe Sandbox.

#### 7.4.1 Química (8 simuladores)

| #   | Componente          | Física Simulada                    | Ejemplo de actividad                |
| --- | ------------------- | ---------------------------------- | ----------------------------------- |
| 26  | `MoleculeBuilder3D` | Geometría molecular, ángulos       | Construir H2O, ver ángulo 104.5°    |
| 27  | `ReactionChamber`   | Cinética, equilibrio, Le Chatelier | Variar presión y ver desplazamiento |
| 28  | `pHSimulator`       | Escala logarítmica, indicadores    | Titular y ver cambio de color       |
| 29  | `ElectronOrbitals`  | Modelo cuántico simplificado       | Llenar orbitales, ver formas        |
| 30  | `PeriodicExplorer`  | Tendencias periódicas              | Explorar y predecir propiedades     |
| 31  | `StateMatterSim`    | Transiciones de fase, energía      | Calentar hielo → agua → vapor       |
| 32  | `ElectrochemCell`   | Redox, voltaje, electrólisis       | Armar pila y medir voltaje          |
| 33  | `GasLawsSim`        | PVT, ley ideal, real               | Comprimir gas y ver cambios         |

#### 7.4.2 Física (9 simuladores)

| #   | Componente          | Física Simulada                | Ejemplo de actividad             |
| --- | ------------------- | ------------------------------ | -------------------------------- |
| 34  | `GravitySandbox`    | Gravitación universal, órbitas | Crear sistema solar, ver órbitas |
| 35  | `WaveSimulator`     | Ondas mecánicas y EM           | Visualizar interferencia         |
| 36  | `CircuitBuilder`    | Ley de Ohm, Kirchhoff          | Armar circuito, medir corriente  |
| 37  | `ProjectileMotion`  | Cinemática 2D, tiro parabólico | Lanzar proyectil, ajustar ángulo |
| 38  | `PendulumLab`       | Movimiento armónico simple     | Variar longitud, medir período   |
| 39  | `OpticsTable`       | Reflexión, refracción, lentes  | Armar telescopio virtual         |
| 40  | `ThermodynamicsSim` | Calor, trabajo, ciclos         | Simular motor térmico            |
| 41  | `FluidSimulator`    | Presión, flotación, Bernoulli  | Diseñar ala de avión             |
| 42  | `MagnetismLab`      | Campos, inducción, Faraday     | Generar corriente con imán       |

#### 7.4.3 Biología (5 simuladores)

| #   | Componente     | Simulación                       | Ejemplo de actividad           |
| --- | -------------- | -------------------------------- | ------------------------------ |
| 43  | `CellExplorer` | Estructura celular 3D, orgánulos | Recorrido por célula eucariota |
| 44  | `GeneticsLab`  | Herencia mendeliana, Punnett     | Predecir fenotipos             |
| 45  | `EcosystemSim` | Poblaciones, cadenas tróficas    | Simular extinción de especie   |
| 46  | `BodySystems`  | Anatomía interactiva             | Seguir oxígeno por el cuerpo   |
| 47  | `EvolutionSim` | Selección natural, adaptación    | Simular evolución en ambiente  |

#### 7.4.4 Matemática (3 simuladores)

| #   | Componente        | Visualización                | Ejemplo de actividad           |
| --- | ----------------- | ---------------------------- | ------------------------------ |
| 48  | `FunctionGrapher` | Funciones 2D y 3D            | Graficar y transformar         |
| 49  | `GeometryCanvas`  | Construcciones euclidianas   | Demostrar teorema de Pitágoras |
| 50  | `StatisticsLab`   | Distribuciones, probabilidad | Simular lanzamientos de dados  |

### 7.5 CATEGORÍA 4: EDITORES DE CÓDIGO (10 componentes)

Para el mundo de Programación. Cada uno adaptado por Casa.

| #   | Componente         | Tipo                          | QUANTUM          | VERTEX        | PULSAR      |
| --- | ------------------ | ----------------------------- | ---------------- | ------------- | ----------- |
| 51  | `BlockEditor`      | Bloques tipo Scratch          | Bloques grandes  | Bloques+texto | N/A         |
| 52  | `PythonEditor`     | Editor Python con ejecución   | N/A              | Guiado        | Completo    |
| 53  | `LuaEditor`        | Para Roblox                   | N/A              | Guiado        | Completo    |
| 54  | `JavaScriptEditor` | Editor JS                     | N/A              | N/A           | Completo    |
| 55  | `HTMLCSSEditor`    | Editor web dual               | N/A              | Templates     | Libre       |
| 56  | `SQLPlayground`    | Queries sobre DB simulada     | N/A              | Guiado        | Completo    |
| 57  | `RegexTester`      | Expresiones regulares         | N/A              | N/A           | Completo    |
| 58  | `AlgorithmViz`     | Visualización de algoritmos   | Visual solo      | Paso a paso   | Implementar |
| 59  | `DataStructureViz` | Estructuras de datos animadas | Visual solo      | Manipular     | Implementar |
| 60  | `TerminalEmulator` | Terminal simulada             | Comandos básicos | Navegación    | Scripting   |

**Características de los editores:**

- Syntax highlighting
- Autocompletado inteligente
- Errores en tiempo real
- Ejecución sandboxed
- Tests automáticos

### 7.6 CATEGORÍA 5: CREATIVOS (10 componentes)

Expresión creativa con propósito educativo.

| #   | Componente            | Tipo                    | Ejemplo de uso              |
| --- | --------------------- | ----------------------- | --------------------------- |
| 61  | `PixelArtEditor`      | Editor pixel art        | Crear sprite de molécula    |
| 62  | `VectorDrawing`       | Dibujo vectorial        | Diagrama de fuerzas         |
| 63  | `3DModeler`           | Modelado 3D básico      | Crear modelo de cristal     |
| 64  | `StoryCreator`        | Narrativa con templates | Historia del descubrimiento |
| 65  | `PresentationBuilder` | Crear presentaciones    | Exposición de proyecto      |
| 66  | `MindMapEditor`       | Mapas mentales          | Organizar conceptos         |
| 67  | `InfoGraphicMaker`    | Crear infografías       | Ciclo del agua              |
| 68  | `ComicCreator`        | Crear cómics            | Explicar proceso químico    |
| 69  | `PodcastRecorder`     | Grabar y editar audio   | Explicar concepto           |
| 70  | `VideoAnnotator`      | Anotar sobre video      | Análisis de experimento     |

### 7.7 CATEGORÍA 6: MULTIMEDIA (9 componentes)

Contenido pasivo pero enriquecido, más componentes especializados para presentaciones y narración.

| #   | Componente                | Tipo                           | Características especiales                     |
| --- | ------------------------- | ------------------------------ | ---------------------------------------------- |
| 71  | `VideoPlayer`             | Video con interacciones        | Pausas para preguntas, branching               |
| 72  | `AudioPlayer`             | Audio con transcripción        | Velocidad variable, highlights                 |
| 73  | `ImageGallery`            | Galería con zoom y anotaciones | Comparación side-by-side                       |
| 74  | `DocumentViewer`          | PDFs y docs interactivos       | Highlights, notas                              |
| 75  | `3DModelViewer`           | Visor de modelos 3D            | Rotar, zoom, cortes                            |
| 92  | `InteractivePresentation` | Slides con interacción         | Audio opcional, avance controlado, branching   |
| 93  | `NarrationWithTracking`   | Audio narra + resalta texto    | Sincronización palabra por palabra             |
| 94  | `StepAnimation`           | Animación paso a paso          | Control manual, pausa entre pasos              |
| 95  | `Checkpoint`              | Mensaje de logro + animación   | Marca fin de sección, celebración configurable |

**Componentes nuevos agregados (92-95):**

| Componente                | QUANTUM (6-9)           | VERTEX (10-12)   | PULSAR (13-17)    |
| ------------------------- | ----------------------- | ---------------- | ----------------- |
| `InteractivePresentation` | Audio obligatorio       | Audio opcional   | Sin restricciones |
| `NarrationWithTracking`   | Velocidad lenta, visual | Velocidad normal | Sin restricciones |
| `StepAnimation`           | Pasos grandes, lentos   | Velocidad normal | Editable          |
| `Checkpoint`              | Celebración épica       | Celebración      | Mensaje simple    |

### 7.8 CATEGORÍA 7: EVALUACIÓN (8 componentes)

Para assessment formativo y sumativo.

| #   | Componente        | Tipo                              | Uso típico                |
| --- | ----------------- | --------------------------------- | ------------------------- |
| 76  | `Quiz`            | Cuestionario tradicional          | Evaluación de comprensión |
| 77  | `PracticeMode`    | Ejercicios con feedback inmediato | Práctica pre-examen       |
| 78  | `ChallengeMode`   | Ejercicios con tiempo/puntos      | Competencia gamificada    |
| 79  | `PeerReview`      | Evaluación entre pares            | Feedback de compañeros    |
| 80  | `Portfolio`       | Recopilación de trabajos          | Evidencia de aprendizaje  |
| 81  | `Rubric`          | Rúbricas de evaluación            | Autoevaluación            |
| 82  | `ProgressTracker` | Visualización de progreso         | Dashboard personal        |
| 83  | `BadgeDisplay`    | Mostrar logros                    | Gamificación              |

### 7.9 CATEGORÍA 8: MULTIPLAYER / COLABORATIVO (8 componentes)

Interacción en tiempo real entre estudiantes.

| #   | Componente         | Tipo                         | Ejemplo de uso                    |
| --- | ------------------ | ---------------------------- | --------------------------------- |
| 84  | `SharedWhiteboard` | Pizarra colaborativa         | Resolver problema en grupo        |
| 85  | `CollaborativeDoc` | Documento compartido         | Escribir informe juntos           |
| 86  | `TeamChallenge`    | Desafío por equipos          | Competencia entre casas           |
| 87  | `DebateArena`      | Debate estructurado          | Discusión científica              |
| 88  | `PollLive`         | Encuestas en tiempo real     | Predicciones antes de experimento |
| 89  | `BrainstormCloud`  | Nube de ideas colaborativa   | Generar hipótesis                 |
| 90  | `PeerTutoring`     | Sistema de ayuda entre pares | Estudiante avanzado ayuda         |
| 91  | `GroupProject`     | Gestión de proyecto grupal   | Proyecto de ciencias              |

### 7.10 Resumen por Categoría

| Categoría               | Cantidad | Uso principal                  |
| ----------------------- | -------- | ------------------------------ |
| Interactivos Básicos    | 15       | Fundamento de toda actividad   |
| Motricidad Fina         | 10       | Desarrollo motor + aprendizaje |
| Simuladores Científicos | 25       | Diferenciación principal       |
| Editores de Código      | 10       | Mundo Programación             |
| Creativos               | 10       | Expresión y proyectos          |
| Multimedia              | 9        | Contenido enriquecido          |
| Evaluación              | 8        | Assessment y gamificación      |
| Multiplayer             | 8        | Colaboración y competencia     |
| **TOTAL**               | **95**   |                                |

### 7.11 Implementación Técnica

Cada componente:

1. **Tiene props tipadas** - Schema de configuración en TypeScript
2. **Emite eventos** - Para tracking y validación
3. **Es responsive** - Funciona en tablet y desktop
4. **Es accesible** - WCAG 2.1 AA mínimo
5. **Tiene tests** - Unit + integration + visual regression

```typescript
// Ejemplo: Interface de un componente
interface DragDropZoneProps {
  id: string;
  items: DraggableItem[];
  zones: DropZone[];
  validation: 'immediate' | 'on_submit';
  feedback: {
    correct: string;
    incorrect: string;
    hint?: string;
  };
  adaptacion: {
    casa: 'QUANTUM' | 'VERTEX' | 'PULSAR';
    ayudas_visuales: boolean;
    tiempo_limite?: number;
  };
  eventos: {
    onDrop: (itemId: string, zoneId: string) => void;
    onComplete: (resultado: ResultadoActividad) => void;
  };
}
```

---

## 8. SISTEMA DE SIMULADORES

> TODO: Completar en sesión de diseño

---

## 9. REGLAS DE VALIDACIÓN

El sistema rechaza JSONs que no cumplan estas reglas. Así evitamos errores en producción.

---

### 9.1 Reglas de la Semana

| Regla                 | Qué valida                                                      | Error si falla                    |
| --------------------- | --------------------------------------------------------------- | --------------------------------- |
| Número válido         | `numero` debe coincidir con la semana que estás cargando        | "Semana 3 no coincide con slot 2" |
| Nombre requerido      | `nombre` no puede estar vacío                                   | "Falta nombre de la semana"       |
| Actividades completas | Debe tener la cantidad de actividades definidas en la plantilla | "Faltan 2 actividades"            |
| Objetivos presentes   | Al menos 1 objetivo de aprendizaje                              | "Falta definir objetivos"         |

---

### 9.2 Reglas de Actividad

| Regla                  | Qué valida                                 | Error si falla                        |
| ---------------------- | ------------------------------------------ | ------------------------------------- |
| Duración razonable     | Entre 5 y 60 minutos                       | "Duración fuera de rango"             |
| Al menos 2 bloques     | Mínimo intro + cierre                      | "Actividad muy corta"                 |
| Máximo 10 bloques      | No sobrecargar                             | "Actividad muy larga, dividir en dos" |
| Prerrequisitos válidos | Si referencia otra actividad, debe existir | "Prerrequisito no encontrado"         |
| XP definido            | Debe tener XP de completado                | "Falta definir XP"                    |

---

### 9.3 Reglas de Bloque

| Regla                     | Qué valida                                                             | Error si falla                               |
| ------------------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| Componente existe         | Debe ser uno de los 91 del catálogo                                    | "Componente 'xyz' no existe"                 |
| Componente válido p/Casa  | El componente debe estar habilitado para esa Casa                      | "Debugger Visual no disponible para QUANTUM" |
| Orden secuencial          | Los bloques van 1, 2, 3... sin saltos                                  | "Falta bloque 2"                             |
| Desbloqueo válido         | Si dice "desbloquea: 3", el bloque 3 debe existir                      | "Bloque 3 no existe"                         |
| Repaso definido si evalúa | Si el bloque tiene `minimo_para_aprobar`, debe tener `repaso_si_falla` | "Quiz sin repaso definido"                   |

---

### 9.4 Reglas de Evaluación

| Regla                 | Qué valida                                       | Error si falla                           |
| --------------------- | ------------------------------------------------ | ---------------------------------------- |
| Mínimo 70%            | El `minimo_para_aprobar` no puede ser menor a 70 | "Mínimo muy bajo"                        |
| Máximo 100%           | No puede ser mayor a 100                         | "Porcentaje inválido"                    |
| Preguntas suficientes | Mínimo 3 preguntas en un quiz                    | "Muy pocas preguntas"                    |
| Respuestas correctas  | Cada pregunta debe tener respuesta definida      | "Falta respuesta correcta en pregunta 2" |

---

### 9.5 Reglas de Gamificación

| Regla        | Qué valida                                         | Error si falla              |
| ------------ | -------------------------------------------------- | --------------------------- |
| XP positivo  | XP no puede ser 0 o negativo                       | "XP inválido"               |
| XP razonable | XP por actividad entre 25 y 200                    | "XP fuera de rango"         |
| Badge único  | No repetir badges en la misma semana               | "Badge duplicado"           |
| Badge existe | Si referencia un badge, debe existir en el sistema | "Badge 'xyz' no registrado" |

---

### 9.6 Reglas por Casa

El sistema ajusta automáticamente según la Casa:

| Casa               | Reglas especiales                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **QUANTUM (6-9)**  | Textos máximo 50 palabras por bloque. Audio obligatorio en explicaciones. Sin bloques de código complejo. |
| **VERTEX (10-12)** | Textos máximo 100 palabras por bloque. Audio opcional. Código básico permitido.                           |
| **PULSAR (13-17)** | Sin límite de texto. Todos los componentes disponibles.                                                   |

---

### 9.7 Reglas de Recursos

| Regla          | Qué valida                                        | Error si falla                                         |
| -------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Formato válido | Imagen: PNG, JPG, WEBP, SVG. Audio: MP3, WAV, OGG | "Formato .gif no permitido. Usar PNG, JPG o WEBP"      |
| Tamaño imagen  | Máximo 5 MB                                       | "Imagen excede 5MB. Comprimir antes de subir"          |
| Tamaño audio   | Máximo 20 MB                                      | "Audio excede 20MB. Comprimir o acortar"               |
| Tamaño video   | Máximo 100 MB                                     | "Video excede 100MB"                                   |
| Recurso existe | El archivo referenciado debe existir              | "Recurso 'aula_pociones.png' no encontrado"            |
| Recurso usado  | Todos los recursos subidos deben estar en uso     | ⚠️ Warning: "Recurso 'viejo.png' no está siendo usado" |

---

### 9.8 Comportamiento del Validador

El validador distingue entre **errores** (bloquean) y **warnings** (no bloquean):

**Errores (bloquean publicación):**

- Campo requerido faltante
- Componente no existe en catálogo
- Referencia a bloque/actividad que no existe
- Recurso referenciado no encontrado
- Porcentaje mínimo fuera de rango (< 70 o > 100)
- Quiz sin respuesta correcta definida

**Warnings (no bloquean, solo avisan):**

- Componente no recomendado para la Casa elegida
- Badge duplicado en la misma semana
- Actividad muy larga (> 45 min) o muy corta (< 5 min)
- Recurso subido pero no usado

**Info (sugerencias opcionales):**

- "Considerá agregar audio para QUANTUM (6-9 años)"
- "Esta semana no tiene badges, ¿querés agregar?"
- "El ChallengeMode funciona mejor al final de la semana"

---

### 9.9 Ejemplo de validación

Subís un JSON y el sistema responde:

**Si está todo bien:**

```
✅ Validación exitosa
   - Semana 1: "Tu Primera Poción"
   - 3 actividades validadas
   - 9 bloques validados
   - 6 recursos validados

   [Ver Preview]
```

**Si hay errores:**

```
❌ Validación fallida (3 errores, 1 warning)

Error 1: Actividad 2, Bloque 3
   → Quiz sin repaso definido
   → Solución: Agregar "repasoSiFalla" al bloque

Error 2: Actividad 3, Bloque 2
   → Componente "simulador_quimico" no existe
   → Solución: Usar "StateMatterSim" (del catálogo)

Error 3: Gamificación
   → Badge "maestro_pociones" no registrado
   → Solución: Usar badge existente o crear nuevo

⚠️ Warning: Recurso "prueba.png" subido pero no usado en ningún bloque

[Corregir y volver a subir]
```

**Warning de componente no recomendado:**

```
⚠️ Warning: DebuggerVisual no recomendado para QUANTUM (6-9 años)
   → Componente diseñado para PULSAR
   → Podés continuar si sabés lo que hacés

   [Continuar igual] [Cambiar componente]
```

---

## 10. SISTEMA DE RECURSOS

Los recursos (imágenes, audios, videos) se suben directamente al Studio y se referencian desde los bloques.

---

### 10.1 Flujo de Subida

```
1. Usuario crea/edita bloque que necesita imagen o audio
2. Click en "Subir archivo"
3. Selecciona archivo de su computadora
4. Sistema valida formato y tamaño
5. Se sube al servidor de Mateatletas
6. Se genera ID único (res_001, res_002, etc.)
7. El JSON referencia ese nombre de archivo
```

---

### 10.2 Formatos Permitidos

| Tipo      | Formatos Aceptados  | Tamaño Máximo |
| --------- | ------------------- | ------------- |
| Imagen    | PNG, JPG, WEBP, SVG | 5 MB          |
| Audio     | MP3, WAV, OGG       | 20 MB         |
| Video     | MP4, WEBM           | 100 MB        |
| Documento | PDF                 | 10 MB         |

---

### 10.3 Estructura de Almacenamiento

```
/uploads/
├── cursos/
│   └── {cursoId}/
│       ├── imagenes/
│       │   ├── res_001_aula_pociones.png
│       │   └── res_002_ingredientes.png
│       ├── audios/
│       │   └── res_003_intro_mezclas.mp3
│       └── videos/
│           └── res_004_experimento.mp4
```

**Nomenclatura:** `{id}_{nombre_original}.{extension}`

---

### 10.4 Referenciando Recursos en el JSON

En el JSON de la semana, los recursos se referencian por su nombre:

```json
{
  "contenido": {
    "slides": [
      {
        "titulo": "El aula de Pociones",
        "texto": "Bienvenidos...",
        "imagen": "aula_pociones.png",
        "audio": "intro_narrado.mp3"
      }
    ]
  }
}
```

Y se declaran en la sección `recursos` con su metadata completa:

```json
{
  "recursos": [
    {
      "id": "res_001",
      "tipo": "imagen",
      "nombre": "aula_pociones.png",
      "archivo": "/uploads/cursos/quimica-hp/imagenes/res_001_aula_pociones.png",
      "tamanioBytes": 245000,
      "usadoEn": ["actividad_1_bloque_1"]
    }
  ]
}
```

---

### 10.5 Validación de Recursos

El sistema valida:

1. **Al subir:** Formato y tamaño válidos
2. **Al guardar semana:** Todos los recursos referenciados existen
3. **Al publicar:** No hay recursos huérfanos (subidos pero no usados)

---

## 11. SISTEMA DE BADGES

Los badges son logros que los estudiantes obtienen al completar actividades o cumplir condiciones especiales.

---

### 11.1 Badges Predefinidos del Sistema

Estos badges están disponibles para usar en cualquier curso:

| Badge ID           | Nombre            | Condición típica                               |
| ------------------ | ----------------- | ---------------------------------------------- |
| `PrimeraActividad` | Primera Actividad | Completar primera actividad de cualquier curso |
| `SemanaCompleta`   | Semana Completa   | Completar todas las actividades de una semana  |
| `SinErrores`       | Perfección        | Completar actividad sin fallar ningún quiz     |
| `Explorador`       | Explorador        | Completar actividades de 3 mundos diferentes   |
| `Constancia3`      | Racha de 3        | 3 días consecutivos de actividad               |
| `Constancia7`      | Racha de 7        | 7 días consecutivos de actividad               |
| `Constancia30`     | Racha de 30       | 30 días consecutivos de actividad              |
| `PrimerSimulador`  | Científico Novato | Usar un simulador por primera vez              |
| `PrimerCodigo`     | Primer Código     | Ejecutar código por primera vez                |

---

### 11.2 Badges Custom (por Curso)

Podés crear badges específicos para tu curso:

```typescript
interface BadgeCustom {
  id: string; // PascalCase, único (ej: "AprendizMezclas")
  nombre: string; // Nombre para mostrar
  descripcion: string; // Qué hizo para ganarlo
  icono: string; // Nombre de recurso imagen (256x256)

  cursoId: string; // Específico de este curso
  enBiblioteca: boolean; // Si true, disponible para otros cursos
}
```

---

### 11.3 Flujo para Crear Badge Custom

```
1. Estás editando la gamificación de una actividad
2. Click en "Crear badge nuevo"
3. Completás:
   - ID: AprendizPociones (PascalCase)
   - Nombre: "Aprendiz de Pociones"
   - Descripción: "Completaste tu primera poción"
   - Icono: [subís imagen 256x256]
4. Elegís si guardarlo en biblioteca para reutilizar
5. El badge queda disponible para asignar
```

---

### 11.4 Usando Badges en el JSON

En la gamificación de cada actividad:

```json
{
  "gamificacion": {
    "xpCompletar": 75,
    "xpBonusSinErrores": 25,
    "badge": "AprendizMezclas"
  }
}
```

El badge debe existir (predefinido o custom creado previamente).

---

### 11.5 Validación de Badges

| Regla                        | Tipo    | Mensaje                                          |
| ---------------------------- | ------- | ------------------------------------------------ |
| Badge existe                 | Error   | "Badge 'xyz' no existe en el sistema"            |
| Badge no duplicado en semana | Warning | "Badge 'AprendizMezclas' ya se otorga en act. 1" |
| Icono válido (si es custom)  | Error   | "Badge 'xyz' no tiene icono asignado"            |

---

## 12. ADAPTACIÓN POR CASA

> TODO: Completar - Consolidar ejemplos dispersos en otras secciones

---

## 13. PREVIEW RENDERER

> TODO: Completar en sesión de diseño

---

## 12. BIBLIOTECA Y REUTILIZACIÓN

Todo lo que creás se guarda para reutilizar después.

---

### 12.1 ¿Qué se guarda?

| Elemento               | Dónde se guarda          | Para qué                                        |
| ---------------------- | ------------------------ | ----------------------------------------------- |
| **Cursos completos**   | Biblioteca → Cursos      | Usar como template para cursos similares        |
| **Semanas**            | Biblioteca → Semanas     | Reutilizar una semana en otro curso             |
| **Actividades**        | Biblioteca → Actividades | Reutilizar actividad específica                 |
| **Bloques**            | Biblioteca → Bloques     | Reutilizar un quiz, simulador configurado, etc. |
| **Simuladores custom** | Biblioteca → Simuladores | Simuladores que creamos nuevos                  |
| **Recursos**           | Biblioteca → Recursos    | Imágenes, audios, etc.                          |

---

### 12.2 Cómo funciona la búsqueda

Cada elemento tiene **tags** para encontrarlo fácil:

```
Curso: "La Química de Harry Potter"
Tags: [química, fantasía, VERTEX, mezclas, reacciones, narrativo]

Simulador: "Simulador de pH"
Tags: [química, pH, ácidos, bases, VERTEX, PULSAR, simulador]

Actividad: "Tu primera poción"
Tags: [química, mezclas, introducción, VERTEX, 30min]
```

**Buscás:**

- "simulador química" → Te aparecen todos los simuladores de química
- "QUANTUM matemática" → Todo lo que sirve para QUANTUM en matemática
- "quiz 5 preguntas" → Quizzes cortos

---

### 12.3 Flujo de reutilización

**Escenario: Querés crear "La Física de Star Wars" (similar a "La Química de Harry Potter")**

```
Paso 1: Vas a Biblioteca → Cursos
Paso 2: Buscás "Harry Potter" o "narrativo VERTEX"
Paso 3: Click en "Usar como base"
Paso 4: El wizard se pre-llena con esa configuración
Paso 5: Cambiás:
        - Nombre: "La Física de Star Wars"
        - Mundo: Ciencias (se mantiene)
        - Variante: "Star Wars" (en vez de Harry Potter)
        - Conceptos: [gravedad, fuerza, energía]
Paso 6: Generás nueva plantilla
Paso 7: Las semanas están vacías, pero la estructura está lista
```

---

**Escenario: Querés reutilizar un simulador que ya configuraste**

```
Paso 1: Estás creando la semana 3 de un curso nuevo
Paso 2: Necesitás un simulador de gravedad
Paso 3: En vez de configurarlo de cero, vas a Biblioteca → Bloques
Paso 4: Buscás "simulador gravedad"
Paso 5: Encontrás el que usaste en otro curso
Paso 6: Click en "Insertar"
Paso 7: El bloque se agrega con toda su configuración
Paso 8: Ajustás lo que necesites (o lo dejás igual)
```

---

### 12.4 Estructura de la Biblioteca (en la UI)

```
BIBLIOTECA
│
├── 📚 CURSOS
│   ├── La Química de Harry Potter (VERTEX, Ciencias)
│   ├── AstroExploradores (VERTEX, Ciencias)
│   └── Mi Primer Código (QUANTUM, Programación)
│
├── 📅 SEMANAS
│   ├── Introducción a mezclas (Química)
│   ├── Sistema Solar básico (Astronomía)
│   └── Primeros pasos con Scratch (Programación)
│
├── 🎯 ACTIVIDADES
│   ├── Quiz de seguridad laboratorio
│   ├── Simulación de órbitas planetarias
│   └── Tutorial de bloques Scratch
│
├── 🧩 BLOQUES
│   ├── Quiz 5 preguntas química básica
│   ├── Simulador pH configurado
│   └── Presentación reglas laboratorio
│
├── 🔬 SIMULADORES
│   ├── Oficiales (25)
│   └── Registrados (los que vamos creando)
│
└── 📁 RECURSOS
    ├── Imágenes
    ├── Audios
    └── Otros
```

---

### 12.5 Versionado

Cuando editás algo que ya está en uso:

```
Curso "La Química de Harry Potter"
├── v1.0 (publicada, la ven los estudiantes)
├── v1.1 (borrador, estás editando)
└── Historial de cambios
```

**Regla:** Los estudiantes siempre ven la versión publicada. Tus cambios no afectan hasta que publicás la nueva versión.

---

### 12.6 Compartir (futuro)

Eventualmente podrás:

- Exportar un curso como archivo
- Importar cursos de otros creadores
- Biblioteca compartida entre docentes (si tenés equipo)

Por ahora: todo es tuyo y privado.

---

## 13. TELEMETRÍA

> TODO: Completar en sesión de diseño

---

## 14. IMPLEMENTACIÓN

> TODO: Completar en sesión de diseño

---

## CHANGELOG

| Fecha      | Sección   | Cambios                              |
| ---------- | --------- | ------------------------------------ |
| 2024-11-29 | Documento | Creación inicial con estructura base |
