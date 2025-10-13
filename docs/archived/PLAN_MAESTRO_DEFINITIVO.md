# 🎯 PLAN MAESTRO DEFINITIVO - MATEATLETAS
## Con TODOS los Actores del Sistema

---

## 🎭 LOS 4 ACTORES DEL SISTEMA

### 1. **TUTOR (Padre/Madre)** ✅ IMPLEMENTADO
- **Qué hace:** Gestiona a sus hijos/estudiantes
- **Ya tiene:**
  - Login/Registro
  - Dashboard básico
  - CRUD de estudiantes
  - CRUD de equipos
  - Ver puntos de sus hijos

### 2. **DOCENTE (Profesor)** ❌ FALTA IMPLEMENTAR
- **Qué hace:** Imparte clases en vivo y otorga puntos/feedback
- **Necesita:**
  - Login independiente (rol "docente")
  - Ver su agenda de clases
  - Pasar lista de asistencia
  - Otorgar puntos por acciones específicas ("Razonamiento destacado", "Intento valiente")
  - Dejar observaciones personalizadas por estudiante
  - Otorgar "Gemas" (badges especiales)

### 3. **ESTUDIANTE** ❌ PARCIALMENTE IMPLEMENTADO
- **Qué hace:** Consume contenido y acumula puntos
- **Ya tiene:**
  - Perfil en BD con puntos y nivel
  - Asignación a equipos
- **Falta:**
  - Dashboard propio (ver sus actividades, equipo, logros)
  - Ver feedback de docentes
  - Completar actividades

### 4. **ADMINISTRADOR (Copiloto)** ❌ PENDIENTE PARA FASE 3
- **Qué hace:** Monitorea todo el sistema
- **Necesita:**
  - Panel "Copiloto" con alertas
  - Ver observaciones negativas de docentes
  - Sugerencias de IA para intervenciones

---

## 🔥 ARQUITECTURA COMPLETA DEL SISTEMA

### **FLUJO REAL DE MATEATLETAS:**

```
1. TUTOR inscribe a sus hijos (estudiantes) en el sistema
2. TUTOR elige equipo para cada hijo
3. ESTUDIANTE asiste a clase en vivo (Jitsi/Zoom)
4. DOCENTE imparte la clase
5. DOCENTE pasa lista y marca asistencia
6. DOCENTE deja feedback personalizado ("Mostró razonamiento lateral brillante")
7. DOCENTE otorga puntos por acciones pedagógicas (+5 Razonamiento, +3 Intento valiente)
8. DOCENTE puede otorgar "Gemas" (badges) especiales
9. ESTUDIANTE ve en su dashboard: puntos ganados, feedback del docente, su nivel
10. TUTOR ve en su dashboard: progreso de sus hijos, feedback de docentes
11. ADMINISTRADOR ve alertas si docente dejó observación negativa
```

---

## 📊 ESTADO ACTUAL REAL

### ✅ LO QUE TENEMOS:
1. **Sistema de Autenticación** (solo para Tutores)
2. **Gestión de Estudiantes** (CRUD por parte del Tutor)
3. **Gestión de Equipos** (CRUD por parte del Tutor)
4. **Modelo de Estudiante** con puntos_totales y nivel_actual
5. **Modelo de Equipo** con puntos_totales

### ❌ LO QUE FALTA (CRÍTICO):

#### **A. ROL DE DOCENTE - COMPLETAMENTE AUSENTE**
- No hay modelo `Docente` en Prisma
- No hay autenticación para docentes
- No hay panel del docente
- No hay sistema de clases en vivo
- No hay sistema de asistencia
- No hay sistema de otorgamiento de puntos por docentes
- No hay sistema de feedback/observaciones
- No hay "Gemas" (badges otorgados por docente)

#### **B. SISTEMA DE CLASES - AUSENTE**
- No hay modelo `Clase` en Prisma
- No hay modelo `RutaCurricular` (Álgebra, Geometría, etc.)
- No hay modelo `Inscripcion` (relación Estudiante-Clase)
- No hay agenda de clases
- No hay integración con Jitsi/Zoom

#### **C. SISTEMA DE GAMIFICACIÓN REAL - INCOMPLETO**
- Tenemos puntos, pero no hay forma de otorgarlos (falta docente)
- No hay "AccionesPuntuables" configurables ("Razonamiento +5", "Intento +3")
- No hay historial de puntos otorgados
- No hay "Gemas" (badges especiales)

---

## 🗺️ ROADMAP CORREGIDO Y COMPLETO

### **FASE 1: SISTEMA DE CLASES Y DOCENTES** (CRÍTICO)
*Tiempo: 8-10 horas*

#### **1.1 Modelos de Base de Datos**
**Prisma Schema:**

```prisma
// ==========================================
// DOCENTES
// ==========================================
model Docente {
  id                String   @id @default(cuid())
  email             String   @unique
  password_hash     String
  nombre            String
  apellido          String
  especialidades    String[] // ["Álgebra", "Geometría"]
  foto_url          String?

  clases            Clase[]
  puntos_otorgados  PuntoOtorgado[]
  gemas_otorgadas   GemaOtorgada[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("docentes")
}

// ==========================================
// RUTAS CURRICULARES (Temas)
// ==========================================
model RutaCurricular {
  id                String   @id @default(cuid())
  nombre            String   @unique // "Álgebra Nivel 1", "Geometría Básica"
  descripcion       String
  edad_minima       Int
  edad_maxima       Int
  color             String   // Para UI
  icono_url         String?

  clases            Clase[]

  @@map("rutas_curriculares")
}

// ==========================================
// CLASES (Sesiones en Vivo)
// ==========================================
model Clase {
  id                String           @id @default(cuid())
  titulo            String
  descripcion       String?
  temario           String?          // Qué se verá en esta sesión

  // Relaciones
  ruta_curricular_id String
  ruta_curricular    RutaCurricular  @relation(fields: [ruta_curricular_id], references: [id])

  docente_id        String
  docente           Docente         @relation(fields: [docente_id], references: [id])

  // Scheduling
  fecha_hora_inicio DateTime
  duracion_minutos  Int
  estado            String          @default("programada") // "programada", "en_curso", "finalizada", "cancelada"

  // Videollamada
  enlace_jitsi      String?
  codigo_sala       String?

  // Capacidad
  cupo_maximo       Int             @default(10)
  cupo_ocupado      Int             @default(0)

  inscripciones     Inscripcion[]

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@map("clases")
}

// ==========================================
// INSCRIPCIONES (Estudiante → Clase)
// ==========================================
model Inscripcion {
  id                    String    @id @default(cuid())

  estudiante_id         String
  estudiante            Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)

  clase_id              String
  clase                 Clase     @relation(fields: [clase_id], references: [id], onDelete: Cascade)

  // Asistencia (actualizado post-clase por docente)
  estado_asistencia     String?   // null antes de clase, "asistio", "ausente" después
  observaciones_docente String?   // Feedback personalizado

  fecha_inscripcion     DateTime  @default(now())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@unique([estudiante_id, clase_id])
  @@map("inscripciones")
}

// ==========================================
// ACCIONES PUNTUABLES (Configuración)
// ==========================================
model AccionPuntuable {
  id                String  @id @default(cuid())
  nombre            String  @unique // "Razonamiento Destacado", "Intento Valiente"
  descripcion       String
  puntos_otorgados  Int     // +5, +3, etc.
  categoria         String  // "Habilidad", "Actitud", "Esfuerzo"
  icono_url         String?
  color             String?

  activo            Boolean @default(true)

  @@map("acciones_puntuables")
}

// ==========================================
// PUNTOS OTORGADOS (Historial)
// ==========================================
model PuntoOtorgado {
  id                    String          @id @default(cuid())

  estudiante_id         String
  estudiante            Estudiante      @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)

  docente_id            String
  docente               Docente         @relation(fields: [docente_id], references: [id])

  accion_puntuable_id   String
  accion_puntuable      AccionPuntuable @relation(fields: [accion_puntuable_id], references: [id])

  puntos                Int
  comentario            String?         // Opcional: "Resolvió el problema de forma creativa"

  // Contexto (opcional)
  clase_id              String?
  clase                 Clase?          @relation(fields: [clase_id], references: [id])

  fecha_otorgado        DateTime        @default(now())

  @@map("puntos_otorgados")
}

// ==========================================
// GEMAS (Badges Otorgados por Docente)
// ==========================================
model Gema {
  id                String  @id @default(cuid())
  nombre            String  @unique // "Gema de la Lógica Creativa"
  descripcion       String
  puntos_xp         Int     // +50 XP
  icono_url         String
  rareza            String  // "comun", "raro", "epico", "legendario"

  otorgamientos     GemaOtorgada[]

  @@map("gemas")
}

model GemaOtorgada {
  id                String     @id @default(cuid())

  estudiante_id     String
  estudiante        Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)

  gema_id           String
  gema              Gema       @relation(fields: [gema_id], references: [id])

  docente_id        String
  docente           Docente    @relation(fields: [docente_id], references: [id])

  motivo            String     // Por qué se otorgó
  fecha_otorgado    DateTime   @default(now())

  @@map("gemas_otorgadas")
}

// ==========================================
// ACTUALIZAR MODELO ESTUDIANTE
// ==========================================
model Estudiante {
  // ... campos existentes ...

  inscripciones     Inscripcion[]
  puntos_otorgados  PuntoOtorgado[]
  gemas_otorgadas   GemaOtorgada[]

  // ... resto igual ...
}
```

#### **1.2 Backend - Módulos NestJS**

**Módulos a crear:**
1. **DocentesModule**
   - Auth para docentes (login separado)
   - CRUD de docentes
   - GET `/api/docentes/me/clases` - Agenda del docente

2. **ClasesModule**
   - CRUD de clases
   - GET `/api/clases` - Listar clases disponibles
   - POST `/api/clases/:id/inscribir` - Inscribir estudiante
   - GET `/api/clases/:id/asistencia` - Lista para pasar lista

3. **InscripcionesModule**
   - PATCH `/api/inscripciones/:id/feedback` - Registrar asistencia + observaciones

4. **GamificacionModule**
   - GET `/api/acciones-puntuables` - Listar acciones disponibles
   - POST `/api/puntos-otorgados` - Otorgar puntos
   - POST `/api/gemas-otorgadas` - Otorgar gema
   - GET `/api/estudiantes/:id/historial-puntos` - Ver historial

#### **1.3 Frontend - Interfaces**

**Panel del Docente (`/docente/*`):**
1. `/docente/dashboard` - Resumen y próximas clases
2. `/docente/clases` - Agenda completa
3. `/docente/clases/:id/asistencia` - Pasar lista
4. `/docente/clases/:id/feedback` - Dejar observaciones y otorgar puntos

**Componentes nuevos:**
- `ClaseCard` - Tarjeta de clase
- `AsistenciaList` - Lista de estudiantes para pasar lista
- `FeedbackForm` - Formulario de observaciones
- `PuntosOtorgadorModal` - Selector de acciones puntuables
- `GemasSelectorModal` - Selector de gemas

**Dashboard del Tutor - ACTUALIZAR:**
- Agregar sección "Clases Próximas de mis Hijos"
- Agregar feed "Feedback Reciente de Docentes"
- Ver historial de puntos otorgados

**Dashboard del Estudiante - CREAR:**
- Ver clases a las que está inscrito
- Ver feedback de docentes
- Ver puntos ganados y gemas desbloqueadas

---

### **FASE 2: ACTIVIDADES Y ASIGNACIONES**
*Tiempo: 4-6 horas*

**NOTA:** Las actividades ahora tienen DOS fuentes:
1. **Actividades de contenido** (videos, juegos) - Asignadas por Tutor
2. **Puntos de clase** - Otorgados por Docente en vivo

#### **2.1 Sistema de Actividades** (como lo teníamos planeado)
- Modelo `Actividad`
- CRUD completo
- Página `/actividades` para tutores

#### **2.2 Sistema de Asignaciones**
- Modelo `AsignacionActividad`
- El TUTOR asigna actividades a sus hijos
- El ESTUDIANTE las completa en su dashboard
- Al completar, gana puntos automáticamente

---

### **FASE 3: NIVELES Y VISUALIZACIONES**
*Tiempo: 3-4 horas*

#### **3.1 Sistema de Niveles**
- Modelo `Nivel` con 100 niveles
- Lógica de cálculo automático
- Componentes de UI (badges, barras de progreso)

#### **3.2 Dashboards Mejorados**
- Dashboard Tutor con gráficos (recharts)
- Dashboard Estudiante completo
- Dashboard Docente con estadísticas de sus clases

---

### **FASE 4: GAMIFICACIÓN AVANZADA (OPCIONAL)**
*Tiempo: 2-3 horas*

- Sistema de rachas
- Logros automáticos (no solo gemas de docente)
- Rankings de equipos
- Eventos especiales

---

### **FASE 5: TESTING Y PULIDO**
*Tiempo: 4-5 horas*

- Tests E2E de todos los flujos
- Aplicar Manual de Marca correctamente
- Onboarding
- Performance

---

## 🎯 ORDEN DE IMPLEMENTACIÓN CORRECTO

### **SEMANA 1 (Fundacional):**
**Día 1-2:** Modelos de Docentes + Clases + Inscripciones (Backend)
**Día 3:** Auth de Docentes + Endpoints básicos
**Día 4-5:** Panel del Docente (Frontend completo)

### **SEMANA 2 (Gamificación Real):**
**Día 6:** Sistema de Puntos Otorgados + Gemas
**Día 7:** Dashboard del Estudiante
**Día 8:** Actividades + Asignaciones (contenido asíncrono)

### **SEMANA 3 (Completitud):**
**Día 9:** Niveles + Visualizaciones
**Día 10:** Testing + Pulido

---

## 🚨 SIGUIENTE PASO INMEDIATO

**COMENZAR CON: Modelos de Docentes, Clases e Inscripciones**

¿Por qué?
- Es la base de TODO el sistema
- Sin docentes, no hay forma de otorgar puntos
- Sin clases, no hay contexto pedagógico
- Es el flujo PRINCIPAL de Mateatletas

**¿Arrancamos con los modelos de Prisma para Docentes y Clases?** 🎯
