# Plan de Implementación: Mes de Matemática Aplicada

**Fecha:** 27 de Octubre de 2025
**Rama:** `planificacion`
**Documento Base:** `planificacion_mes_matematica_aplicada-2.pdf`

---

## 📚 Contexto

Se planifica la implementación del "Mes de Matemática Aplicada", un programa educativo de 4 semanas donde los estudiantes (6-12 años) aprenden matemáticas aplicadas a contextos científicos mediante narrativas inmersivas.

### Características del Programa:

- **Duración:** 4 semanas (1 mes)
- **Formato:** 1 clase sincrónica de 90 min + 4 actividades asincrónicas (~20 min c/u)
- **Público:** 3 grupos etarios (6-7, 8-9, 10-12 años)
- **Metodología:** Aprendizaje inmersivo con narrativas (los estudiantes son PERSONAJES en aventuras)

### 4 Semanas Temáticas:

1. **Semana 1: Matemáticas y Química** - "El Laboratorio de Mezclas Mágicas"
   - Conceptos: Proporciones, fracciones, balanceo de ecuaciones
   - Actividades: Simulador de laboratorio, concentraciones, reacciones químicas

2. **Semana 2: Matemáticas y Astronomía** - "Exploradores del Sistema Solar"
   - Conceptos: Números grandes, notación científica, escalas, velocidad-distancia-tiempo
   - Actividades: Simulador de viaje espacial, cálculo de trayectorias, diseño de misiones

3. **Semana 3: Matemáticas y Física** - "El Parque de Diversiones"
   - Conceptos: Velocidad, energía cinética/potencial, áreas, optimización
   - Actividades: Diseño de montañas rusas, cálculo de capacidades, gestión del parque

4. **Semana 4: Matemáticas e Informática** - "La Academia de Programadores Junior"
   - Conceptos: Algoritmos, lógica, pensamiento computacional, coordenadas
   - Actividades: Programación visual (Scratch/Blockly), laberintos, creación de videojuegos

---

## 🏗️ Arquitectura del Sistema

### 3 Portales Integrados:

#### 1️⃣ **Portal Admin** (`/admin/planificaciones`)

- Crear/editar "Mes de Matemática Aplicada"
- Configurar narrativas por semana
- Asignar componentes React a cada actividad
- Definir props de simuladores
- Establecer objetivos y métricas

#### 2️⃣ **Portal Docente** (`/docente/planificaciones`)

- Ver planificaciones disponibles (creadas por admin)
- Asignar planificación a SUS grupos
- Dashboard de progreso de estudiantes
- Controles de clase sincrónica
- Desbloquear actividades manualmente
- Ver reportes individuales

#### 3️⃣ **Portal Estudiante** (`/estudiante/planificaciones`)

- Ver planificaciones asignadas
- Acceder a actividades (narrativas + simuladores)
- Hacer quizzes, simuladores, proyectos
- Ver su progreso y puntos
- Participar en clases sincrónicas

---

## ✅ Estado Actual del Sistema

### Backend (NestJS + Prisma)

**Modelos existentes:**

```prisma
model PlanificacionMensual {
  id                    String
  grupo_id              String
  mes                   Int
  anio                  Int
  titulo                String
  descripcion           String
  tematica_principal    String
  objetivos_aprendizaje String[]
  estado                EstadoPlanificacion
  // Relaciones
  actividades           ActividadSemanal[]
  asignaciones          AsignacionDocente[]
}

model ActividadSemanal {
  id                      String
  planificacion_id        String
  semana_numero           Int
  titulo                  String
  descripcion             String
  componente_nombre       String  // "SimuladorQuimica"
  componente_props        Json    // { nivel: 1, reactivos: [...] }
  nivel_dificultad        NivelDificultad
  tiempo_estimado_minutos Int
}

model ProgresoEstudianteActividad {
  id               String
  estudiante_id    String
  actividad_id     String
  asignacion_id    String
  iniciado         Boolean
  completado       Boolean
  puntos_obtenidos Int
  tiempo_total_minutos Int
  intentos         Int
}

model PlanificacionSimple {
  // Sistema de planificaciones autodetectadas (alternativo)
  codigo          String @unique
  titulo          String
  grupo_codigo    String
  mes             Int?
  anio            Int
  semanas_total   Int
  archivo_path    String
}
```

**Endpoints existentes:**

- ✅ `GET /api/planificaciones` - Listar planificaciones
- ✅ `GET /api/planificaciones/:id` - Detalle de planificación
- ✅ `GET /api/docentes/me/dashboard` - Dashboard docente
- ✅ `POST /api/estudiantes/:id/progreso` - Guardar progreso (genérico)

### Frontend (Next.js 15 + Turbopack)

**Portales existentes:**

**Portal Estudiante** (`apps/web/src/app/estudiante/`):

- ✅ Layout con sidebar + navegación
- ✅ Dashboard (`/dashboard`)
- ✅ Cursos con lecciones (`/cursos/[cursoId]`)
- ✅ Logros (`/logros`)
- ✅ Ranking (`/ranking`)
- ✅ **Planificaciones** (`/planificaciones`) - Lista de planificaciones disponibles
- ✅ Ruta dinámica: `/planificaciones/[codigo]` - Detalle de planificación

**Portal Docente** (`apps/web/src/app/docente/`):

- ✅ Dashboard con estadísticas
- ✅ Página de observaciones (recién completada con datos reales)
- ✅ Grupos (`/grupos/[id]`)
- ✅ Calendario (`/calendario`)
- ❌ Planificaciones (NO EXISTE AÚN)

**Portal Admin** (`apps/web/src/app/admin/`):

- ✅ Gestión de estudiantes, docentes, grupos
- ✅ Credenciales
- ✅ Reportes
- ✅ Planificaciones (`/planificaciones`) - Existe la página

---

## 🚀 Plan de Implementación MVP

### **Estrategia: MVP Incremental**

Implementar UNA semana temática completa (Química) funcionando en los 3 portales antes de escalar.

---

## 📋 FASE MVP: SEMANA 1 - QUÍMICA

**Duración estimada:** 4-6 semanas
**Objetivo:** Sistema funcional de Semana 1 con narrativa + 3 actividades básicas

### **1. BACKEND** (1-2 semanas)

#### Modificaciones al Schema:

```prisma
// Agregar campos a PlanificacionMensual
model PlanificacionMensual {
  // ... campos existentes ...

  // NUEVO: Campos de narrativa
  narrativa_rol      String?  // "Químico", "Astronauta", etc.
  narrativa_mision   String?  // "Salvar la ciudad"
  narrativa_contexto String?  // "Laboratorio secreto"
  narrativa_intro    String?  // Texto largo de introducción
}
```

#### Endpoints Nuevos:

```typescript
// Estudiante - Progreso de planificaciones
POST /api/estudiantes/me/planificaciones/:codigo/progreso
  Body: {
    actividadId: string,
    progreso: {
      completado: boolean,
      puntosObtenidos: number,
      respuestas: JSON,
      tiempoMinutos: number
    }
  }

GET /api/estudiantes/me/planificaciones/:codigo
  Response: {
    planificacion: PlanificacionMensual,
    actividades: ActividadSemanal[],
    progreso: ProgresoEstudiantePlanificacion,
    actividadesProgreso: ProgresoEstudianteActividad[]
  }

// Docente - Gestión de planificaciones
GET /api/docentes/me/planificaciones
  Response: {
    disponibles: PlanificacionMensual[],
    asignadas: PlanificacionMensual[]
  }

POST /api/docentes/me/planificaciones/:id/asignar
  Body: {
    grupoIds: string[]
  }

GET /api/docentes/me/planificaciones/:codigo/progreso
  Response: {
    estudiantes: [{
      id: string,
      nombre: string,
      actividades: [{
        actividadId: string,
        completado: boolean,
        puntos: number
      }]
    }]
  }
```

#### Servicios a Crear:

- `apps/api/src/planificaciones/planificaciones-narrativas.service.ts`
- `apps/api/src/planificaciones/progreso.service.ts`

---

### **2. PORTAL ADMIN** (1 semana)

#### Página: `/admin/planificaciones/crear`

**Funcionalidades:**

- Formulario para crear planificación mensual
- Configurar narrativa (rol, misión, contexto, intro)
- Agregar actividades por semana
- Asignar componente React a cada actividad
- Configurar props del componente (JSON editor)

**Componentes a Crear:**

```
apps/web/src/app/admin/planificaciones/
├── crear/
│   └── page.tsx                    // Formulario principal
├── components/
│   ├── FormularioNarrativa.tsx     // Inputs de narrativa
│   ├── FormularioActividad.tsx     // Inputs por actividad
│   └── SelectorComponente.tsx      // Dropdown de componentes disponibles
```

**UI Básica:**

```
┌─────────────────────────────────────────────┐
│ Crear Planificación Mensual                │
├─────────────────────────────────────────────┤
│ Título: [Mes de Matemática Aplicada      ] │
│ Mes: [Noviembre] Año: [2024]               │
│ Grupo: [B1 ▼]                               │
│                                             │
│ NARRATIVA                                   │
│ Rol: [Químico                            ] │
│ Misión: [Salvar la ciudad               ] │
│ Contexto: [Laboratorio secreto          ] │
│ Intro: [Eres un químico aprendiz...     ] │
│                                             │
│ SEMANA 1: El Laboratorio                   │
│ ├─ Actividad 1: Quiz de Proporciones      │
│ │  Componente: [QuizInteractivo ▼]        │
│ │  Props: { nivel: 1, preguntas: 10 }     │
│ │  [Editar Props]                          │
│ │                                           │
│ ├─ Actividad 2: Ejercicios Progresivos    │
│ └─ Actividad 3: Proyecto Final            │
│                                             │
│ [+ Agregar Semana]                          │
│                                             │
│ [Guardar como Borrador] [Publicar]         │
└─────────────────────────────────────────────┘
```

---

### **3. PORTAL DOCENTE** (1-2 semanas)

#### Página 1: `/docente/planificaciones`

**Funcionalidades:**

- Listar planificaciones disponibles (creadas por admin)
- Botón "Asignar a mis grupos"
- Ver planificaciones ya asignadas
- Dashboard básico de progreso

**Componentes a Crear:**

```
apps/web/src/app/docente/planificaciones/
├── page.tsx                           // Lista de planificaciones
├── [codigo]/
│   └── progreso/
│       └── page.tsx                   // Dashboard de progreso
└── components/
    ├── PlanificacionCard.tsx          // Card de planificación
    ├── AsignarModal.tsx               // Modal para seleccionar grupos
    └── TablaProgresoEstudiantes.tsx   // Tabla con progreso
```

**UI:**

```
┌─────────────────────────────────────────────┐
│ Planificaciones                             │
├─────────────────────────────────────────────┤
│ DISPONIBLES PARA ASIGNAR                    │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 📚 Mes de Matemática Aplicada      │    │
│ │ Noviembre 2024 - Grupo B1          │    │
│ │ 4 semanas • 16 actividades          │    │
│ │                                     │    │
│ │ Narrativa: Química, Astronomía...   │    │
│ │ [Asignar a mis grupos]              │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ MIS PLANIFICACIONES ACTIVAS                 │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 🧪 Semana 1: Química               │    │
│ │ Grupo B1 - 15 estudiantes          │    │
│ │ Progreso: ████████░░ 78%            │    │
│ │ [Ver progreso detallado]            │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### Página 2: `/docente/planificaciones/[codigo]/progreso`

**Reutilizar componentes de `/docente/observaciones`:**

- Tabla con estudiantes en filas
- Actividades en columnas
- Check/X según completitud
- Métricas: % completitud, tiempo promedio, estudiantes atrasados

---

### **4. PORTAL ESTUDIANTE** (2-3 semanas) - MÁS CRÍTICO

#### Página 1: `/estudiante/planificaciones` (ya existe)

**Modificaciones:**

- Conectar con endpoint real: `GET /api/estudiantes/me/planificaciones`
- Mostrar narrativa en cada card de planificación
- Indicador visual de progreso por semana

#### Página 2: `/estudiante/planificaciones/[codigo]` (CREAR)

**Esta es LA PÁGINA CLAVE del MVP.**

**Estructura:**

```tsx
<div className="planificacion-container">
  {/* Header con narrativa */}
  <NarrativaHeader
    rol="Químico"
    mision="Salvar la ciudad"
    intro="Eres un químico aprendiz en un laboratorio secreto..."
  />

  {/* Semanas progresivas */}
  <SemanasProgresivas>
    <SemanaCard
      numero={1}
      titulo="El Laboratorio de Mezclas Mágicas"
      desbloqueada={true}
      actividades={[
        { tipo: 'quiz', titulo: 'Quiz de Proporciones', completada: false, bloqueada: false },
        { tipo: 'ejercicios', titulo: 'Olimpiada Química', completada: false, bloqueada: true },
        { tipo: 'proyecto', titulo: 'Diseña tu Experimento', completada: false, bloqueada: true },
      ]}
    />

    <SemanaCard numero={2} desbloqueada={false} />
    <SemanaCard numero={3} desbloqueada={false} />
    <SemanaCard numero={4} desbloqueada={false} />
  </SemanasProgresivas>

  {/* Progreso del estudiante */}
  <ProgresoGeneral
    semanaActual={1}
    puntosTotal={250}
    actividadesCompletadas={3}
    actividadesTotal={16}
  />
</div>
```

**Componentes a Crear:**

```
apps/web/src/app/estudiante/planificaciones/
├── [codigo]/
│   └── page.tsx                      // Página principal de planificación
└── components/
    ├── NarrativaHeader.tsx           // Header con rol, misión, contexto
    ├── SemanasProgresivas.tsx        // Contenedor de semanas
    ├── SemanaCard.tsx                // Card de cada semana
    ├── ActividadButton.tsx           // Botón para abrir actividad
    └── ProgresoGeneral.tsx           // Barra de progreso + stats
```

#### Página 3: `/estudiante/planificaciones/[codigo]/actividad/[actividadId]` (CREAR)

**Esta página renderiza dinámicamente el componente de la actividad.**

```tsx
export default function ActividadPage({ params }) {
  const { actividad, progreso } = useActividad(params.actividadId);

  // Renderizar componente dinámico según actividad.componente_nombre
  const ComponenteActividad = getComponente(actividad.componente_nombre);

  return (
    <div>
      <ActividadHeader
        titulo={actividad.titulo}
        descripcion={actividad.descripcion}
        puntosMaximos={actividad.puntos_maximos}
      />

      <ComponenteActividad
        {...actividad.componente_props}
        onCompletar={handleCompletar}
        progresoGuardado={progreso}
      />
    </div>
  );
}
```

---

### **5. COMPONENTES DE ACTIVIDADES** (2-3 semanas)

Estos componentes se renderizan dinámicamente dentro de la página de actividad.

#### Componente 1: **QuizInteractivo.tsx** (2-3 días)

**Props:**

```typescript
interface QuizInteractivoProps {
  nivel: number;
  preguntas: {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number;
    explicacion: string;
  }[];
  onCompletar: (datos: { puntaje: number; respuestas: any[] }) => void;
}
```

**Funcionalidades:**

- Preguntas con opciones múltiples (radio buttons)
- Feedback inmediato al responder (✅ correcto / ❌ incorrecto + explicación)
- Barra de progreso (pregunta 3/10)
- Al finalizar: resumen con puntaje
- Botón "Guardar progreso" → llama `onCompletar()`

**UI:**

```
┌─────────────────────────────────────────────┐
│ Quiz: Proporciones Químicas                 │
│ Pregunta 3 de 10            ████████░░ 80%  │
├─────────────────────────────────────────────┤
│ Si mezclas 2 partes de hidrógeno con 1      │
│ parte de oxígeno, ¿cuántas partes de agua   │
│ obtienes?                                    │
│                                              │
│ ○ 1 parte                                    │
│ ● 3 partes                                   │
│ ○ 2 partes                                   │
│ ○ 4 partes                                   │
│                                              │
│ [Siguiente pregunta]                         │
└─────────────────────────────────────────────┘
```

**Ubicación:**
`apps/web/src/components/actividades/QuizInteractivo.tsx`

---

#### Componente 2: **EjerciciosProgresivos.tsx** (3-4 días)

**Props:**

```typescript
interface EjerciciosProgresivosProps {
  nivel: number;
  ejercicios: {
    enunciado: string;
    respuestaCorrecta: number;
    tolerancia?: number; // Para respuestas aproximadas
    pista1: string;
    pista2: string;
    pista3: string;
  }[];
  onCompletar: (datos: { correctas: number; intentos: number }) => void;
}
```

**Funcionalidades:**

- Lista de 15-20 ejercicios que van subiendo dificultad
- Input numérico + botón "Verificar"
- Sistema de intentos (máximo 3 por ejercicio)
- Pistas progresivas si falla (después de 1er, 2do, 3er intento)
- Al completar todos: resumen + puntaje

**UI:**

```
┌─────────────────────────────────────────────┐
│ Olimpiada Química                           │
│ Ejercicio 5 de 15         Correctas: 4/4    │
├─────────────────────────────────────────────┤
│ Un laboratorio tiene 500ml de solución      │
│ concentrada. Necesitas diluirla al 20%.     │
│ ¿Cuántos ml de agua debes agregar?          │
│                                              │
│ Respuesta: [________] ml                    │
│                                              │
│ [Verificar]  [Necesito una pista]           │
│                                              │
│ Intentos: ●●○                                │
└─────────────────────────────────────────────┘
```

**Ubicación:**
`apps/web/src/components/actividades/EjerciciosProgresivos.tsx`

---

#### Componente 3: **ProyectoFinal.tsx** (2-3 días)

**Props:**

```typescript
interface ProyectoFinalProps {
  titulo: string;
  descripcion: string;
  campos: {
    label: string;
    tipo: 'text' | 'number' | 'textarea' | 'select';
    requerido: boolean;
    opciones?: string[]; // Para selects
  }[];
  onCompletar: (datos: { respuestas: Record<string, any> }) => void;
}
```

**Funcionalidades:**

- Formulario donde el estudiante "diseña" su proyecto
- Inputs variados: texto, números, áreas de texto, selects
- Validación básica (campos requeridos)
- Botón "Enviar proyecto"
- Confirmación antes de enviar

**UI:**

```
┌─────────────────────────────────────────────┐
│ Proyecto Final: Diseña tu Experimento       │
├─────────────────────────────────────────────┤
│ Nombre del experimento:                     │
│ [________________________________]          │
│                                              │
│ Reactivo 1:                                  │
│ [Hidrógeno  ▼] Cantidad: [____] ml         │
│                                              │
│ Reactivo 2:                                  │
│ [Oxígeno    ▼] Cantidad: [____] ml         │
│                                              │
│ ¿Qué resultado esperas obtener?             │
│ [________________________________]          │
│ [________________________________]          │
│                                              │
│ Explica tus cálculos:                        │
│ [________________________________]          │
│ [________________________________]          │
│                                              │
│ [Enviar Proyecto]                            │
└─────────────────────────────────────────────┘
```

**Ubicación:**
`apps/web/src/components/actividades/ProyectoFinal.tsx`

---

#### Componente 4 (OPCIONAL): **SimuladorQuimicaBasico.tsx** (5-7 días)

**Props:**

```typescript
interface SimuladorQuimicaProps {
  nivel: number;
  reactivos: {
    id: string;
    nombre: string;
    color: string;
    cantidadMax: number;
  }[];
  recetas: {
    reactivo1: string;
    cantidad1: number;
    reactivo2: string;
    cantidad2: number;
    resultado: string;
    colorResultado: string;
  }[];
  onCompletar: (datos: { mezclaExitosa: boolean }) => void;
}
```

**Funcionalidades:**

- Canvas/SVG con tubos de ensayo
- Sliders para ajustar cantidad de cada reactivo
- Botón "Mezclar"
- Animación de mezcla (colores que se combinan)
- Validación: verifica si las proporciones son correctas
- Feedback visual si la mezcla es exitosa o fallida

**UI:**

```
┌─────────────────────────────────────────────┐
│ Laboratorio Virtual                         │
├─────────────────────────────────────────────┤
│                                              │
│    [TUBO 1]    [TUBO 2]    [RESULTADO]     │
│       🧪          🧪           🧪          │
│     Azul        Rojo         ???           │
│                                              │
│ Hidrógeno:    ◀──────●────▶  250 ml        │
│ Oxígeno:      ◀─────●─────▶  125 ml        │
│                                              │
│ [Mezclar]                                    │
│                                              │
│ Resultado: [Esperando mezcla...]            │
└─────────────────────────────────────────────┘
```

**Ubicación:**
`apps/web/src/components/actividades/SimuladorQuimicaBasico.tsx`

**Librerías sugeridas:**

- `react-konva` o `react-canvas` para el canvas
- `framer-motion` para animaciones
- SVG custom para los tubos de ensayo

---

## 📊 Timeline del MVP

| Tarea                                 | Duración | Responsable | Bloqueantes           |
| ------------------------------------- | -------- | ----------- | --------------------- |
| **Backend: Schema + Endpoints**       | 5-7 días | Backend     | -                     |
| **Admin: Crear planificación**        | 5-7 días | Fullstack   | Backend listo         |
| **Docente: Lista + Asignar**          | 3-4 días | Frontend    | Backend listo         |
| **Docente: Dashboard progreso**       | 4-5 días | Frontend    | Backend + Componentes |
| **Estudiante: Lista planificaciones** | 1-2 días | Frontend    | Backend listo         |
| **Estudiante: Página planificación**  | 3-4 días | Frontend    | Backend listo         |
| **Actividad: QuizInteractivo**        | 2-3 días | Frontend    | Página planificación  |
| **Actividad: EjerciciosProgresivos**  | 3-4 días | Frontend    | Página planificación  |
| **Actividad: ProyectoFinal**          | 2-3 días | Frontend    | Página planificación  |
| **Actividad: Simulador (opcional)**   | 5-7 días | Frontend    | Página planificación  |
| **Testing E2E**                       | 3-5 días | QA          | Todo lo anterior      |
| **Deploy + Ajustes**                  | 2-3 días | DevOps      | Testing aprobado      |

**Total: 4-6 semanas** para MVP completo de Semana 1

---

## ✅ Resultado del MVP

Al finalizar el MVP tendremos:

**Portal Admin:**

- ✅ Crear "Mes de Matemática Aplicada - Semana 1: Química"
- ✅ Configurar narrativa (rol, misión, contexto)
- ✅ Asignar 3 actividades con sus componentes

**Portal Docente:**

- ✅ Ver planificación disponible
- ✅ Asignar a grupo B1
- ✅ Ver progreso de 15 estudiantes en tiempo real
- ✅ Identificar quién completó qué actividad

**Portal Estudiante:**

- ✅ Ver planificación asignada con narrativa inmersiva
- ✅ Hacer Quiz interactivo (10 preguntas)
- ✅ Resolver Ejercicios progresivos (15 problemas)
- ✅ Completar Proyecto final (formulario)
- ✅ (Opcional) Usar Simulador de química básico
- ✅ Sistema guarda progreso automáticamente
- ✅ Ver puntos ganados y actividades completadas

---

## 🔄 Estrategia de Despliegue Seguro

### 1. Feature Flags

```typescript
// .env
FEATURE_PLANIFICACIONES_NARRATIVAS = true;
FEATURE_ACTIVIDADES_INTERACTIVAS = false;
FEATURE_SIMULADORES = false;
FEATURE_CLASES_SINCRONICAS = false;
```

### 2. Testing Incremental

- **Fase 1:** Desplegar a grupo piloto (1 docente + 5 estudiantes)
- **Fase 2:** Si funciona bien → habilitar para 3 grupos más
- **Fase 3:** Si todo OK → desplegar a todos
- **Rollback:** Si hay problemas → desactivar feature flag

### 3. Branches por Fase

```
main (producción estable)
  └── planificacion (desarrollo activo)
      ├── feat/backend-planificaciones-narrativas
      ├── feat/admin-crear-planificacion
      ├── feat/docente-asignar-planificacion
      ├── feat/estudiante-actividades
      └── feat/componentes-actividades
```

### 4. Métricas de Éxito

**MVP aprobado si:**

- ✅ Admin puede crear 1 planificación completa en <10 minutos
- ✅ Docente puede asignarla a su grupo sin errores
- ✅ 80%+ de estudiantes completan al menos 1 actividad
- ✅ Sistema guarda progreso sin pérdida de datos
- ✅ Dashboard docente carga en <2 segundos
- ✅ 0 crashes críticos en 1 semana de uso

---

## 🎯 Próximos Pasos (Post-MVP)

### Fase 2: Replicar Patrón para Semanas 2-4 (6-9 semanas)

Una vez que funcione la Semana 1, **replicar** para:

**Semana 2: Astronomía** (2-3 semanas)

- Simulador de viaje espacial
- Quiz sobre sistema solar
- Ejercicios de escalas y distancias
- Proyecto: Diseñar misión a Marte

**Semana 3: Física** (2-3 semanas)

- Simulador de montañas rusas
- Quiz sobre energía y movimiento
- Ejercicios de velocidad/aceleración
- Proyecto: Diseñar parque de diversiones

**Semana 4: Informática** (2-3 semanas)

- Simulador de programación visual (Blockly)
- Quiz de algoritmos
- Ejercicios de lógica
- Proyecto: Crear videojuego simple

**Cada semana adicional: 2-3 semanas** (porque ya tienes el patrón base)

---

### Fase 3: Funcionalidades Avanzadas (4-6 semanas)

**Dashboard Docente Avanzado:**

- Métricas en tiempo real con WebSockets
- Exportar reportes a PDF/Excel
- Notificaciones automáticas a tutores
- Sistema de alertas (estudiante atrasado, muchos fallos)

**Clases Sincrónicas:**

- Integración con Google Meet
- Quizzes en tiempo real (tipo Kahoot)
- Simulador compartido (docente controla)
- Sistema de respuestas en vivo

**Gamificación:**

- Sistema de puntos y logros
- Rankings semanales del grupo
- Badges/medallas por completar semanas
- Actividades "bonus" desbloqueables
- Modo speedrun (completar lo más rápido posible)

---

## 📁 Estructura de Archivos del MVP

```
apps/
├── api/
│   └── src/
│       ├── planificaciones/
│       │   ├── planificaciones.controller.ts (modificar)
│       │   ├── planificaciones-narrativas.service.ts (NUEVO)
│       │   ├── progreso.service.ts (NUEVO)
│       │   └── dto/
│       │       ├── crear-planificacion-narrativa.dto.ts (NUEVO)
│       │       └── guardar-progreso-actividad.dto.ts (NUEVO)
│       └── prisma/
│           └── schema.prisma (modificar: agregar campos narrativa)
│
└── web/
    └── src/
        ├── app/
        │   ├── admin/
        │   │   └── planificaciones/
        │   │       ├── crear/
        │   │       │   └── page.tsx (NUEVO)
        │   │       └── components/
        │   │           ├── FormularioNarrativa.tsx (NUEVO)
        │   │           ├── FormularioActividad.tsx (NUEVO)
        │   │           └── SelectorComponente.tsx (NUEVO)
        │   │
        │   ├── docente/
        │   │   └── planificaciones/
        │   │       ├── page.tsx (NUEVO)
        │   │       ├── [codigo]/
        │   │       │   └── progreso/
        │   │       │       └── page.tsx (NUEVO)
        │   │       └── components/
        │   │           ├── PlanificacionCard.tsx (NUEVO)
        │   │           ├── AsignarModal.tsx (NUEVO)
        │   │           └── TablaProgresoEstudiantes.tsx (NUEVO)
        │   │
        │   └── estudiante/
        │       └── planificaciones/
        │           ├── page.tsx (modificar)
        │           ├── [codigo]/
        │           │   ├── page.tsx (NUEVO)
        │           │   └── actividad/
        │           │       └── [actividadId]/
        │           │           └── page.tsx (NUEVO)
        │           └── components/
        │               ├── NarrativaHeader.tsx (NUEVO)
        │               ├── SemanasProgresivas.tsx (NUEVO)
        │               ├── SemanaCard.tsx (NUEVO)
        │               ├── ActividadButton.tsx (NUEVO)
        │               └── ProgresoGeneral.tsx (NUEVO)
        │
        ├── components/
        │   └── actividades/
        │       ├── QuizInteractivo.tsx (NUEVO)
        │       ├── EjerciciosProgresivos.tsx (NUEVO)
        │       ├── ProyectoFinal.tsx (NUEVO)
        │       └── SimuladorQuimicaBasico.tsx (NUEVO - opcional)
        │
        └── lib/
            └── api/
                └── planificaciones.api.ts (modificar: agregar endpoints)
```

---

## 🎓 Tecnologías y Librerías

### Backend

- **NestJS** - Framework
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **class-validator** - Validación de DTOs

### Frontend

- **Next.js 15** - Framework React con App Router
- **Turbopack** - Bundler
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Zustand** - State management
- **Axios** - HTTP client

### Actividades (opcional)

- **react-konva** o **react-canvas** - Canvas para simuladores
- **react-blockly** - Programación visual (Semana 4)
- **recharts** o **chart.js** - Gráficos (si se necesitan)

---

## 📝 Notas Importantes

### Decisiones de Diseño

1. **¿Por qué empezar con solo 3 actividades básicas?**
   - Menor riesgo de bugs
   - Más rápido de implementar
   - Permite validar el patrón antes de escalar
   - El simulador es opcional (se puede agregar después)

2. **¿Por qué usar componentes dinámicos?**
   - Flexibilidad: admin puede asignar cualquier componente a cualquier actividad
   - Escalabilidad: agregar nuevos tipos de actividades sin cambiar código base
   - Reutilización: mismo componente para diferentes planificaciones

3. **¿Por qué JSON para `componente_props`?**
   - Máxima flexibilidad
   - Cada componente puede recibir props personalizadas
   - Admin puede configurar niveles de dificultad, preguntas, etc.

### Limitaciones del MVP

- ❌ No incluye clases sincrónicas (se agrega en Fase 3)
- ❌ No incluye WebSockets para tiempo real (polling cada 10s por ahora)
- ❌ No incluye sistema de notificaciones push
- ❌ No incluye exportación de reportes (PDF/Excel)
- ❌ Simuladores son básicos (versiones avanzadas en Fase 2-3)

### Riesgos Identificados

1. **Performance con muchos estudiantes**
   - Mitigación: Paginación, índices en BD, cache de progreso

2. **Complejidad de simuladores**
   - Mitigación: Hacer simuladores opcionales, empezar con versiones básicas

3. **Guardado de progreso**
   - Mitigación: Autosave cada 30 segundos, localStorage como backup

4. **Experiencia mobile**
   - Mitigación: Diseño responsive desde el inicio, probar en tablets

---

## 📞 Contacto y Seguimiento

**Rama actual:** `planificacion`
**Próxima sesión:** Implementar Backend (schema + endpoints)
**Estado:** Documentación completada, listo para comenzar desarrollo

---

**Última actualización:** 27 de Octubre de 2025
