# 🎯 SOURCE OF TRUTH - ESTADO ACTUAL DE MATEATLETAS CLUB

> **DOCUMENTO DE REFERENCIA ABSOLUTA**
> Última actualización: 15 de Octubre de 2025
> Este documento mapea QUÉ está implementado vs QUÉ falta construir

---

## 📌 PROPÓSITO DE ESTE DOCUMENTO

Este es el **documento de verdad absoluta** del proyecto. Antes de implementar cualquier slice nuevo:

1. ✅ **CONSULTAR AQUÍ** para saber qué ya existe
2. ✅ **ACTUALIZAR AQUÍ** después de implementar features
3. ✅ **REFERENCIAR AQUÍ** en PRs y decisiones técnicas

**🚨 REGLA DE ORO:** Si no está documentado aquí, no existe en producción.

---

# 🏗️ ARQUITECTURA ACTUAL

## Stack Tecnológico Confirmado

### Backend (`/apps/api`)
- **Framework:** NestJS 10.x
- **Base de datos:** PostgreSQL con Prisma ORM
- **Autenticación:** JWT con guards de roles
- **Validación:** class-validator, class-transformer
- **Documentación:** Swagger (próximamente)

### Frontend (`/apps/web`)
- **Framework:** Next.js 14+ (App Router)
- **Estilos:** Tailwind CSS v4
- **Animaciones:** Framer Motion
- **UI Components:** Custom + Lucide Icons
- **Estado:** React hooks (sin Redux)
- **Fetching:** fetch nativo

### Infraestructura
- **Monorepo:** Turborepo
- **Package Manager:** npm
- **Database Migrations:** Prisma Migrate
- **Dev Server:** Hot reload en ambos apps

---

# 📊 ESTADO POR INSTANCIA

## 🌐 INSTANCIA 1: PÚBLICO/LANDING

### ❌ NO IMPLEMENTADO (0%)

| Tarea | ID | Estado | Notas |
|-------|-----|--------|-------|
| Landing Page Pública | T001 | ❌ 0% | Existe `/apps/web/src/app/page.tsx` pero es básico |
| Formulario Inscripción Público | T002 | ❌ 0% | No existe `/inscripcion` |

### ⚠️ PARCIALMENTE IMPLEMENTADO

**`/apps/web/src/app/page.tsx`** (Home)
- ✅ Existe pero es placeholder
- ❌ No tiene información del club
- ❌ No tiene CTA de inscripción
- ❌ No tiene sección de beneficios
- ❌ No tiene pricing visible

**`/apps/web/src/app/register/page.tsx`**
- ✅ Existe formulario de registro
- ⚠️ Es para tutores, NO para inscripción pública de estudiantes
- ❌ No muestra cupos disponibles
- ❌ No redirige a pago

### 🎯 ACCIONES NECESARIAS PARA SLICE 1

1. **Rediseñar completamente `/` (landing)**
   - Hero section con video/imagen
   - Sección "¿Qué es Mateatletas?"
   - Beneficios STEAM
   - Planes y precios
   - Testimonios
   - FAQ
   - Footer con contacto

2. **Crear `/inscripcion` multi-step**
   - Paso 1: Datos estudiante
   - Paso 2: Datos tutor
   - Paso 3: Selección de grupo (con cupos)
   - Paso 4: Pago
   - Paso 5: Confirmación

3. **Mejorar `/register`**
   - Agregar campo teléfono
   - Mejor UX
   - Validación mejorada

---

## 👨‍👩‍👦 INSTANCIA 2: TUTOR/PADRE

### ✅ IMPLEMENTADO (60%)

**Portal Base:**
- ✅ Layout: `/apps/web/src/app/(protected)/layout.tsx`
- ✅ Dashboard: `/apps/web/src/app/(protected)/dashboard/page.tsx`
- ✅ Autenticación con rol `tutor`
- ✅ Sidebar navigation

**Funcionalidades:**
- ✅ Ver estudiantes: `/apps/web/src/app/(protected)/estudiantes/page.tsx`
- ✅ Ver detalle estudiante: `/apps/web/src/app/(protected)/estudiantes/[id]/page.tsx`
- ✅ Ver clases disponibles: `/apps/web/src/app/(protected)/clases/page.tsx`
- ✅ Ver mis clases reservadas: `/apps/web/src/app/(protected)/mis-clases/page.tsx`
- ✅ Catálogo de productos: `/apps/web/src/app/(protected)/catalogo/page.tsx`
- ✅ Planes de membresía: `/apps/web/src/app/(protected)/membresia/planes/page.tsx`
- ✅ Confirmación pago: `/apps/web/src/app/(protected)/membresia/confirmacion/page.tsx`
- ✅ Ver equipos: `/apps/web/src/app/(protected)/equipos/page.tsx`

### ❌ NO IMPLEMENTADO (40%)

| Tarea | ID | Estado | Ruta Necesaria |
|-------|-----|--------|----------------|
| Widget bienvenida personalizado | T003 | ❌ 0% | Agregar en dashboard existente |
| Panel progreso detallado hijo | T004 | ⚠️ 20% | Mejorar `/estudiantes/[id]` |
| Vista suscripción y pagos | T005 | ⚠️ 30% | Crear `/membresia` o `/suscripcion` |
| Comentarios docente visibles | T006 | ❌ 0% | Agregar en `/estudiantes/[id]` |
| Mensajería tutor-docente | T007 | ❌ 0% | Crear `/mensajes` |
| Gráficas por competencias | T008 | ❌ 0% | Agregar en `/estudiantes/[id]` |
| Recompensas familiares | T009 | ❌ 0% | Crear `/recompensas` |
| Compartir logros | T010 | ❌ 0% | Modal en estudiantes |
| Notificaciones push | T011 | ❌ 0% | PWA config + Firebase |
| Vista parental en vivo | T012 | ❌ 0% | Crear `/clase/[id]/observar` |
| Resumen auto post-clase | T013 | ❌ 0% | Backend + notificación |
| Tracking tiempo práctica | T014 | ❌ 0% | Backend + widget |
| Visualización insignias | T015 | ⚠️ 30% | Mejorar vista actual |

### ⚠️ COMPONENTES EXISTENTES QUE USAR

**`DashboardView.tsx`** - `/apps/web/src/app/(protected)/dashboard/components/DashboardView.tsx`
```typescript
// Ya tiene:
- Bienvenida básica
- Cards de resumen
- Animaciones con Framer Motion

// Falta agregar:
- Última actividad del hijo
- Resumen de progreso
- CTA personalizado
```

**`EstudianteCard.tsx`** - `/apps/web/src/components/estudiantes/EstudianteCard.tsx`
```typescript
// Ya tiene:
- Foto, nombre, edad
- Nivel escolar
- Equipo (si tiene)
- Puntos y nivel gamificación

// Falta agregar:
- Insignias visibles
- Última clase asistida
- Próxima clase programada
```

### 🎯 ACCIONES NECESARIAS PARA SLICE 4

1. **Mejorar Dashboard (`/dashboard`)**
   - Widget de bienvenida con última actividad
   - CTA dinámico según estado
   - Notificaciones pendientes

2. **Ampliar Detalle Estudiante (`/estudiantes/[id]`)**
   - Tabs: Info, Progreso, Observaciones, Historial
   - Gráficas de competencias (Recharts)
   - Timeline de observaciones docente
   - Galería de insignias

3. **Crear Vista Suscripción (`/membresia` o `/suscripcion`)**
   - Estado actual (activa/vencida)
   - Próxima renovación
   - Método de pago
   - Historial de pagos
   - Botón cancelar

---

## 👦 INSTANCIA 3: ESTUDIANTE

### ✅ IMPLEMENTADO (40%)

**Portal Base:**
- ✅ Layout: `/apps/web/src/app/estudiante/layout.tsx`
- ✅ Dashboard: `/apps/web/src/app/estudiante/dashboard/page.tsx`
- ⚠️ Dashboard prototipo: `/apps/web/src/app/estudiante/dashboard-proto/page.tsx` (???)
- ✅ Autenticación con rol `estudiante`

**Funcionalidades:**
- ✅ Ver cursos: `/apps/web/src/app/estudiante/cursos/page.tsx`
- ✅ Ver curso específico: `/apps/web/src/app/estudiante/cursos/[cursoId]/page.tsx`
- ✅ Ver lección: `/apps/web/src/app/estudiante/cursos/[cursoId]/lecciones/[leccionId]/page.tsx`
- ✅ Ver logros: `/apps/web/src/app/estudiante/logros/page.tsx`
- ✅ Ver ranking: `/apps/web/src/app/estudiante/ranking/page.tsx`

### ❌ NO IMPLEMENTADO (60%)

| Tarea | ID | Estado | Ruta Necesaria |
|-------|-----|--------|----------------|
| Portal estudiante completo | T016 | ⚠️ 40% | Mejorar dashboard existente |
| Sistema avatares | T017 | ❌ 0% | Integrar Dicebear o galería |
| Tablero actividades cards | T018 | ⚠️ 20% | Rediseñar dashboard |
| Animación bienvenida | T019 | ❌ 0% | Agregar al login |
| Evaluación diagnóstica | T020 | ❌ 0% | Crear `/evaluacion` |
| Algoritmo adaptativo | T021 | ❌ 0% | Backend + lógica |
| Análisis auto resultados | T022 | ❌ 0% | Backend pipeline |
| Widget próxima clase | T023 | ❌ 0% | Agregar en dashboard |
| Botón entrar clase | T024 | ❌ 0% | Agregar en dashboard |
| Videollamada auto-join | T025 | ❌ 0% | Integrar Jitsi |
| Tablero desafíos vivo | T026 | ❌ 0% | WebSockets + UI |
| Animaciones celebración | T027 | ❌ 0% | Confetti + Lottie |
| Barra puntos vivo | T028 | ❌ 0% | WebSocket + widget |
| Leaderboard tiempo real | T029 | ❌ 0% | WebSocket + tabla |
| Modal resumen post-clase | T030 | ❌ 0% | Modal automático |
| Métricas por sesión | T031 | ❌ 0% | Backend tracking |
| Buzón mensajes | T032 | ❌ 0% | Crear `/mensajes` |
| Niveles con nombres | T033 | ❌ 0% | Backend config + UI |
| Animación level-up | T034 | ✅ 100% | **YA EXISTE** |

### ✅ COMPONENTE EXISTENTE DE VALOR

**`LevelUpAnimation.tsx`** - `/apps/web/src/components/effects/LevelUpAnimation.tsx`
```typescript
// ✅ YA IMPLEMENTADO
- Animación fullscreen al subir nivel
- Confetti effect
- Mensaje personalizado
- Se puede reutilizar
```

**`AchievementToast.tsx`** - `/apps/web/src/components/effects/AchievementToast.tsx`
```typescript
// ✅ YA IMPLEMENTADO
- Toast de logro desbloqueado
- Animación de entrada/salida
- Se puede reutilizar
```

### 🎯 ACCIONES NECESARIAS PARA SLICE 2

1. **Rediseñar Dashboard Principal**
   - 3 cards principales:
     - Evaluación de Rendimiento
     - Clase de Hoy (con countdown)
     - Mis Logros
   - Avatar en header
   - Nivel y XP bar
   - Animación de bienvenida

2. **Implementar Sistema de Avatares**
   - Integrar Dicebear API
   - Selector de avatar en perfil
   - Mostrar en dashboard y durante clases

3. **Crear Niveles con Nombres**
   - Backend: Tabla de configuración de niveles
   - Frontend: Mostrar nombre del nivel
   - Threshold de puntos por nivel

---

## 👩‍🏫 INSTANCIA 4: DOCENTE

### ✅ IMPLEMENTADO (70%)

**Portal Base:**
- ✅ Layout: `/apps/web/src/app/docente/layout.tsx` (**REDISEÑADO CON PURPLE GLASSMORPHISM**)
- ✅ Dashboard: `/apps/web/src/app/docente/dashboard/page.tsx`
- ✅ Autenticación con rol `docente`
- ✅ Navigation moderna con glassmorphism

**Funcionalidades:**
- ✅ Dashboard con estadísticas: `/apps/web/src/app/docente/dashboard/page.tsx`
- ✅ Mis clases: `/apps/web/src/app/docente/mis-clases/page.tsx`
- ✅ Calendario: `/apps/web/src/app/docente/calendario/page.tsx`
- ✅ Observaciones: `/apps/web/src/app/docente/observaciones/page.tsx`
- ✅ Reportes: `/apps/web/src/app/docente/reportes/page.tsx`
- ✅ **Planificador AI**: `/apps/web/src/app/docente/planificador/page.tsx` (**RECIÉN IMPLEMENTADO**)
- ✅ Asistencia clase: `/apps/web/src/app/docente/clases/[id]/asistencia/page.tsx`
- ⚠️ Perfil: `/apps/web/src/app/docente/perfil/page.tsx` (existe pero básico)

### ❌ NO IMPLEMENTADO (30%)

| Tarea | ID | Estado | Ruta Necesaria |
|-------|-----|--------|----------------|
| Panel detallado grupo | T035 | ⚠️ 30% | Crear `/docente/grupo/[id]` |
| Enriquecer notificaciones | T036 | ❌ 0% | Backend service |
| Dashboard estadísticas completo | T037 | ⚠️ 50% | Mejorar `/reportes` |
| Vista resultados diagnósticos | T038 | ❌ 0% | Crear tabla en `/reportes` |
| Gráficos fortalezas/debilidades | T039 | ❌ 0% | Recharts en perfil estudiante |
| Perfil detallado estudiante | T040 | ❌ 0% | Crear `/docente/estudiante/[id]` |
| Videollamadas + tracking | T041 | ❌ 0% | Integrar Jitsi |
| Gamificación en vivo | T042 | ❌ 0% | WebSockets + control panel |
| Contador grupal equipos | T043 | ❌ 0% | Backend + UI |
| Asignación rápida insignias | T044 | ❌ 0% | Modal rápido |
| Animaciones en vivo | T045 | ❌ 0% | Sincronización |
| Modal cierre clase + IA | T046 | ❌ 0% | Prompt automático |
| Dashboard resultados diag | T047 | ❌ 0% | Tabla consolidada |
| Juegos educativos gestión | T048 | ❌ 0% | Crear `/docente/actividades` |

### ✅ COMPONENTES IMPLEMENTADOS RECIENTEMENTE

**`/docente/planificador`** - **RECIÉN CREADO** 🎉
```typescript
// ✅ Funcionalidad completa:
- Tabs: Generar Nuevo / Historial
- 4 tipos de recursos (Plan, Ejercicios, Evaluación, Guía)
- Generación simulada con IA
- Historial con localStorage
- Search y filtros
- Asignación a estudiantes/clases (demo)
- Sistema de guardado
- Glassmorphism purple theme
```

**`/docente/observaciones`** - **REDISEÑADO**
```typescript
// ✅ Con glassmorphism:
- Filtros por estudiante/tipo/fecha
- Lista de observaciones
- Modal para crear/editar
- Diseño purple theme
```

**`/docente/mis-clases`** - **REDISEÑADO**
```typescript
// ✅ Con glassmorphism:
- Lista de clases del docente
- Información de cada clase
- Ruta curricular con color
- Botones de acción
```

### 🎯 ACCIONES NECESARIAS PARA SLICE 5

1. **Crear Panel Detallado de Grupo** (`/docente/grupo/[id]`)
   - Lista de estudiantes inscritos
   - Progreso individual
   - Evaluaciones pendientes
   - Logros por estudiante
   - Botón "Iniciar clase"

2. **Completar Dashboard de Reportes**
   - Métricas reales (no mock)
   - Nuevos alumnos del mes
   - % mejora promedio grupo
   - Insignias entregadas
   - Asistencia promedio

3. **Crear Perfil 360° de Estudiante** (`/docente/estudiante/[id]`)
   - Info básica
   - Gráficos de competencias
   - Historial observaciones
   - Asistencia histórica
   - Insignias y nivel

---

## 👔 INSTANCIA 5: ADMINISTRADOR

### ✅ IMPLEMENTADO (60%)

**Portal Base:**
- ✅ Layout: `/apps/web/src/app/admin/layout.tsx`
- ✅ Dashboard: `/apps/web/src/app/admin/dashboard/page.tsx`
- ✅ Autenticación con rol `admin`

**Funcionalidades:**
- ✅ Dashboard con KPIs: `/apps/web/src/app/admin/dashboard/page.tsx`
- ✅ Gestión usuarios: `/apps/web/src/app/admin/usuarios/page.tsx`
- ✅ Gestión estudiantes: `/apps/web/src/app/admin/estudiantes/page.tsx`
- ✅ Gestión clases: `/apps/web/src/app/admin/clases/page.tsx`
- ✅ Gestión productos: `/apps/web/src/app/admin/productos/page.tsx`
- ✅ Gestión cursos: `/apps/web/src/app/admin/cursos/page.tsx`
- ✅ Ver módulos curso: `/apps/web/src/app/admin/cursos/[cursoId]/modulos/[moduloId]/page.tsx`
- ✅ Reportes: `/apps/web/src/app/admin/reportes/page.tsx`
- ⚠️ Pagos: `/apps/web/src/app/admin/pagos/page.tsx` (**EXISTE PERO NO FUNCIONA**)

### ❌ NO IMPLEMENTADO (40%)

| Tarea | ID | Estado | Ruta Necesaria |
|-------|-----|--------|----------------|
| Dashboard global KPIs | T049 | ⚠️ 50% | Mejorar `/admin/dashboard` |
| Tracking aciertos | T050 | ❌ 0% | Backend analytics |
| Índices ICD/ICE | T051 | ❌ 0% | Backend cálculo |
| Gráficas temporales | T052 | ⚠️ 30% | Mejorar dashboard |
| Generación PDF | T053 | ❌ 0% | Puppeteer/jsPDF |
| Email service | T054 | ❌ 0% | Nodemailer config |
| Proyecciones financieras | T055 | ❌ 0% | ML forecasting |
| Retención histórica | T056 | ❌ 0% | Backend cálculo |
| Gestión cobranza | T057 | ❌ 0% | Cron + dunning |
| Métricas morosidad | T058 | ❌ 0% | Backend + cards |

### 🎯 ACCIONES NECESARIAS PARA SLICE 9

1. **Mejorar Dashboard Overview**
   - KPIs reales (no mock)
   - Total estudiantes activos
   - Total docentes
   - Total grupos/clases
   - Ingresos del mes
   - Tasa de retención
   - Gráficos temporales

2. **Implementar Analytics Financiero**
   - Proyecciones mes siguiente
   - Cálculo de retención
   - Métricas de morosidad
   - Gráficas de crecimiento

3. **Sistema de Reportes**
   - Generación PDF
   - Email service
   - Reportes automáticos

---

## ⚙️ INSTANCIA 6: SISTEMA/BACKEND

### ✅ MÓDULOS IMPLEMENTADOS (65%)

**Core:**
- ✅ **PrismaService** - Conexión DB
- ✅ **AuthModule** - JWT, Guards, Strategies
- ✅ **CommonModule** - Utilities compartidas

**Entidades Principales:**
- ✅ **TutorModule** - Registro, perfil (vía auth)
- ✅ **EstudiantesModule** - CRUD completo
- ✅ **DocentesModule** - CRUD + endpoint público
- ✅ **EquiposModule** - Gestión de equipos

**Funcionalidades:**
- ✅ **ClasesModule** - CRUD clases en vivo
- ✅ **AsistenciaModule** - Registro asistencia + reportes docente
- ✅ **CatalogoModule (ProductosModule)** - Productos educativos
- ✅ **PagosModule** - MercadoPago integration + webhooks
- ✅ **GamificacionModule** - Puntos, logros, insignias, ranking
- ✅ **CursosModule** - Cursos asincrónicos + módulos + lecciones
- ✅ **NotificacionesModule** - Sistema de notificaciones
- ✅ **EventosModule** - Sistema de eventos calendario
- ✅ **AdminModule** - Endpoints admin (usuarios, stats, alertas)

### ❌ MÓDULOS NO IMPLEMENTADOS (35%)

| Módulo | Funcionalidad | Estado |
|--------|---------------|--------|
| **ObservacionesModule** | ❌ NO EXISTE | Backend falta |
| **MensajeriaModule** | ❌ NO EXISTE | Chat tutor-docente |
| **EvaluacionesModule** | ❌ NO EXISTE | Test diagnósticos |
| **SesionesClaseModule** | ❌ NO EXISTE | Métricas en vivo |
| **RecompensasModule** | ❌ NO EXISTE | Logros familiares |
| **EmailModule** | ❌ NO EXISTE | Nodemailer service |
| **WebSocketModule** | ❌ NO EXISTE | Socket.io gateway |
| **CronModule** | ❌ NO EXISTE | Scheduled tasks |
| **BackupsModule** | ❌ NO EXISTE | DB backups |
| **AIModule** | ❌ NO EXISTE | ML/IA services |

### 🗄️ SCHEMA PRISMA - MODELOS IMPLEMENTADOS

**✅ Modelos Existentes:**
```prisma
- Tutor
- Estudiante
- Equipo
- Docente
- User (admin)
- Producto (TipoProducto enum)
- Membresia (EstadoMembresia enum)
- InscripcionCurso
- Pago (EstadoPago enum)
- RutaCurricular
- Clase
- InscripcionClase
- Asistencia
- Alerta
- TipoLogro
- PuntoObtenido
- LogroDesbloqueado
- Curso
- Modulo
- Leccion
- ProgresoLeccion
- Notificacion (TipoNotificacion enum)
- Evento (TipoEvento enum)
```

### ❌ MODELOS FALTANTES

```prisma
// Para Observaciones
model Observacion {
  id String @id @default(cuid())
  estudiante_id String
  docente_id String
  tipo String // "conductual", "academica", "general"
  contenido String
  para_ia Boolean @default(false)
  fecha DateTime @default(now())
}

// Para Mensajería
model Mensaje {
  id String @id @default(cuid())
  de_id String
  para_id String
  contenido String
  leido Boolean @default(false)
  fecha DateTime @default(now())
}

// Para Evaluaciones
model Evaluacion {
  id String @id @default(cuid())
  estudiante_id String
  fecha DateTime @default(now())
  respuestas Json
  perfil_aprendizaje Json
  completada Boolean @default(false)
}

// Para Métricas de Sesión
model SesionClase {
  id String @id @default(cuid())
  clase_id String
  estudiante_id String
  tiempo_activo Int // en segundos
  respuestas_correctas Int
  respuestas_incorrectas Int
  puntos_ganados Int
  fecha DateTime @default(now())
}

// Para Recompensas Familiares
model RecompensaFamiliar {
  id String @id @default(cuid())
  nombre String
  tutor_id String
  estudiante_id String
  fecha_obtenida DateTime @default(now())
}

// Para Niveles Personalizados
model ConfiguracionNivel {
  nivel Int @id
  nombre String
  puntos_minimos Int
  puntos_maximos Int
}
```

### 📡 ENDPOINTS IMPLEMENTADOS (Resumen)

**Auth:**
- ✅ POST `/api/auth/register` - Registro tutor
- ✅ POST `/api/auth/login` - Login universal
- ✅ GET `/api/auth/me` - Usuario actual

**Estudiantes:**
- ✅ GET `/api/estudiantes` - Listar
- ✅ POST `/api/estudiantes` - Crear
- ✅ GET `/api/estudiantes/:id` - Detalle
- ✅ PUT `/api/estudiantes/:id` - Actualizar
- ✅ DELETE `/api/estudiantes/:id` - Eliminar
- ✅ GET `/api/estudiantes/tutor/:tutorId` - Por tutor

**Docentes:**
- ✅ GET `/api/docentes` - Listar (admin)
- ✅ POST `/api/docentes` - Crear (admin)
- ✅ GET `/api/docentes/public` - Lista pública
- ✅ GET `/api/docentes/:id` - Detalle

**Clases:**
- ✅ GET `/api/clases` - Listar todas
- ✅ POST `/api/clases` - Crear clase
- ✅ GET `/api/clases/:id` - Detalle
- ✅ GET `/api/clases/docente/:docenteId` - Por docente
- ✅ PUT `/api/clases/:id` - Actualizar
- ✅ DELETE `/api/clases/:id` - Cancelar

**Asistencia:**
- ✅ POST `/api/asistencia` - Registrar
- ✅ GET `/api/asistencia/clase/:claseId` - Por clase
- ✅ GET `/api/asistencia/estudiante/:estudianteId` - Por estudiante
- ✅ GET `/api/asistencia/docente/reportes` - Reportes docente

**Pagos:**
- ✅ POST `/api/pagos/preference/suscripcion` - Crear preferencia suscripción
- ✅ POST `/api/pagos/preference/curso` - Crear preferencia curso
- ✅ POST `/api/pagos/webhook` - Webhook MercadoPago
- ✅ POST `/api/pagos/activar-demo` - Activar membership (dev)

**Gamificación:**
- ✅ POST `/api/gamificacion/puntos` - Asignar puntos
- ✅ GET `/api/gamificacion/ranking` - Ranking global
- ✅ GET `/api/gamificacion/ranking/clase/:claseId` - Ranking por clase
- ✅ POST `/api/gamificacion/insignias` - Otorgar insignia
- ✅ GET `/api/gamificacion/logros/:estudianteId` - Logros estudiante

**Notificaciones:**
- ✅ GET `/api/notificaciones` - Listar notificaciones
- ✅ GET `/api/notificaciones/docente/:docenteId` - Por docente
- ✅ PUT `/api/notificaciones/:id/leer` - Marcar como leída
- ✅ POST `/api/notificaciones` - Crear notificación (interno)

**Eventos:**
- ✅ GET `/api/eventos` - Listar eventos
- ✅ POST `/api/eventos` - Crear evento
- ✅ GET `/api/eventos/docente/:docenteId` - Por docente
- ✅ PUT `/api/eventos/:id` - Actualizar
- ✅ DELETE `/api/eventos/:id` - Eliminar

**Catálogo:**
- ✅ GET `/api/productos` - Listar productos
- ✅ GET `/api/productos/:id` - Detalle producto

**Admin:**
- ✅ GET `/api/admin/usuarios` - Listar usuarios
- ✅ POST `/api/admin/usuarios` - Crear usuario
- ✅ GET `/api/admin/stats` - Estadísticas globales
- ✅ GET `/api/admin/alertas` - Alertas activas

**Equipos:**
- ✅ GET `/api/equipos` - Listar equipos
- ✅ GET `/api/equipos/:id` - Detalle equipo

**Cursos:**
- ✅ GET `/api/cursos` - Listar cursos
- ✅ POST `/api/cursos` - Crear curso
- ✅ GET `/api/cursos/:id` - Detalle curso
- ✅ POST `/api/cursos/:cursoId/modulos` - Crear módulo
- ✅ POST `/api/cursos/:cursoId/modulos/:moduloId/lecciones` - Crear lección

### ❌ ENDPOINTS FALTANTES

```typescript
// Observaciones
POST   /api/observaciones
GET    /api/observaciones/estudiante/:id
GET    /api/observaciones/docente/:id
PUT    /api/observaciones/:id
DELETE /api/observaciones/:id

// Mensajería
POST   /api/mensajes
GET    /api/mensajes/conversacion/:userId1/:userId2
PUT    /api/mensajes/:id/leer
DELETE /api/mensajes/:id

// Evaluaciones
POST   /api/evaluaciones
GET    /api/evaluaciones/estudiante/:id
POST   /api/evaluaciones/:id/responder
POST   /api/evaluaciones/:id/completar

// Sesiones de Clase
POST   /api/sesiones-clase
GET    /api/sesiones-clase/clase/:claseId
GET    /api/sesiones-clase/estudiante/:estudianteId

// WebSockets
WS     /socket.io (gateway completo)
```

### 🎯 ACCIONES NECESARIAS (Backend)

**Para SLICE 3 (Clases en Vivo):**
1. Integrar Jitsi Meet
2. Webhook de videollamada → asistencia automática
3. Endpoints de control de sala

**Para SLICE 6 (Evaluación):**
1. Crear EvaluacionesModule
2. Algoritmo adaptativo de dificultad
3. Pipeline de análisis automático

**Para SLICE 8 (Mensajería):**
1. Crear MensajeriaModule
2. Endpoints CRUD mensajes
3. Sistema de notificaciones en tiempo real

**Para SLICE 10 (WebSockets):**
1. Instalar Socket.io
2. Crear WebSocketGateway
3. Rooms por clase
4. Eventos: puntos, logros, conexiones

**Para SLICE 11 (Automatización):**
1. Instalar @nestjs/schedule
2. Cron jobs configurados
3. Email service (Nodemailer)
4. Backups automáticos

---

# 🔗 INTEGRACIONES EXTERNAS

## ✅ IMPLEMENTADAS

### MercadoPago
- ✅ SDK instalado
- ✅ Creación de preferencias de pago
- ✅ Webhook configurado
- ✅ Modo sandbox para dev
- ⚠️ Falta: activación automática completa

### Prisma ORM
- ✅ Schema completo
- ✅ Migraciones aplicadas
- ✅ Seeds básicos
- ✅ Cliente generado

## ❌ NO IMPLEMENTADAS

| Integración | Propósito | Prioridad |
|-------------|-----------|-----------|
| **Jitsi Meet** | Videollamadas | 🔴 CRÍTICA |
| **Firebase Cloud Messaging** | Push notifications | 🟠 MEDIA |
| **SendGrid/Resend** | Email service | 🟡 ALTA |
| **Dicebear API** | Avatares | 🟡 ALTA |
| **Socket.io** | WebSockets | 🟠 MEDIA |
| **Recharts** | Gráficos | 🟡 ALTA |
| **OpenAI/Claude API** | IA real | 🟢 BAJA |
| **Sentry** | Error tracking | 🟠 MEDIA |

---

# 📦 DEPENDENCIAS INSTALADAS

## Backend (`apps/api/package.json`)

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/core": "^10.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/platform-express": "^10.x",
  "@prisma/client": "^5.x",
  "bcrypt": "^5.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "mercadopago": "^2.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x",
  "passport-local": "^1.x"
}
```

### ❌ Faltantes para Slices:
```bash
npm install @nestjs/schedule      # SLICE 11 - Cron jobs
npm install socket.io             # SLICE 10 - WebSockets
npm install @nestjs/websockets    # SLICE 10
npm install @nestjs/platform-socket.io # SLICE 10
npm install nodemailer            # SLICE 11 - Emails
npm install puppeteer             # SLICE 9 - PDF generation
```

## Frontend (`apps/web/package.json`)

```json
{
  "next": "14.x",
  "react": "^18.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^4.x"
}
```

### ❌ Faltantes para Slices:
```bash
npm install recharts              # SLICE 6, 9 - Gráficos
npm install react-confetti        # SLICE 7 - Celebraciones
npm install html2canvas           # SLICE 7 - Compartir logros
npm install socket.io-client      # SLICE 10 - WebSockets
npm install firebase              # SLICE 11 - Push notifications
npm install @dicebear/core        # SLICE 2 - Avatares
npm install @dicebear/collection  # SLICE 2
```

---

# 🎨 DESIGN SYSTEM ESTABLECIDO

## Colores (Purple Glassmorphism Theme)

**Light Mode:**
```css
--docente-bg-gradient-start: #f0f4ff;    /* indigo-50 */
--docente-bg-gradient-mid: #f5f3ff;      /* purple-50 */
--docente-bg-gradient-end: #fdf4ff;      /* pink-50 */
--docente-accent: #8b5cf6;               /* violet-500 */
--docente-glass-bg: rgba(255,255,255,0.65);
--docente-glass-border: rgba(139,92,246,0.15);
```

**Dark Mode:**
```css
--docente-bg-gradient-start: #0f0a1f;    /* custom dark */
--docente-bg-gradient-mid: #1e1b4b;      /* indigo-950 */
--docente-bg-gradient-end: #312e81;      /* indigo-900 */
--docente-accent: #a78bfa;               /* violet-400 */
--docente-glass-bg: rgba(30,27,75,0.6);
```

## Componentes Glassmorphism

```css
.glass-card {
  backdrop-blur-xl;
  background: white/40 dark:slate-900/40;
  border: white/30 dark:slate-700/30;
  box-shadow: xl;
  border-radius: 2xl;
}

.glass-card-strong {
  backdrop-blur-xl;
  background: white/60 dark:slate-900/60;
  border: white/40 dark:slate-700/40;
  box-shadow: xl;
  border-radius: 2xl;
}
```

## Botones

**Primary:**
```css
bg-gradient-to-r from-violet-500 to-purple-600
text-white
shadow-lg shadow-purple-500/40
hover:shadow-xl hover:shadow-purple-500/50
```

**Secondary:**
```css
glass-card
hover:bg-purple-100/60 dark:hover:bg-purple-900/40
text-indigo-900 dark:text-white
```

## Inputs

```css
bg-white/40 dark:bg-indigo-900/40
border border-purple-200/50 dark:border-purple-700/50
rounded-lg
focus:ring-2 focus:ring-purple-500
```

---

# 🧪 TESTING

## ✅ Tests Implementados

**Backend:**
- ✅ Test scripts manuales en `/tests/scripts/`
- ✅ 19/19 tests pasando (notificaciones + eventos)
- ✅ Scripts de integración full

**Frontend:**
- ⚠️ NO hay tests unitarios
- ⚠️ NO hay tests E2E con Playwright

## ❌ Tests Faltantes

```bash
# Backend (Jest)
- Unit tests por módulo
- Integration tests completos
- E2E tests con Supertest

# Frontend (Playwright)
- E2E flows completos
- Visual regression tests
- Accessibility tests
```

---

# 📋 CHECKLIST DE USO DE ESTE DOCUMENTO

## Antes de Implementar un Slice:

- [ ] Leo la sección correspondiente en SOURCE_OF_TRUTH.md
- [ ] Verifico qué ya existe y qué falta
- [ ] Reviso componentes reutilizables
- [ ] Chequeo endpoints disponibles
- [ ] Confirmo dependencias necesarias

## Durante Desarrollo:

- [ ] Referencio IDs de tareas (T001, T002, etc.)
- [ ] Uso componentes existentes cuando sea posible
- [ ] No duplico funcionalidad que ya existe
- [ ] Consulto design system establecido

## Después de Implementar:

- [ ] **ACTUALIZO SOURCE_OF_TRUTH.md** con lo completado
- [ ] Marco tareas como ✅ en arquitectura
- [ ] Documento nuevos endpoints creados
- [ ] Agrego nuevos componentes reutilizables
- [ ] Hago commit con referencia al slice

---

# 🚀 PRÓXIMOS PASOS INMEDIATOS

## Para empezar SLICE 1 (Fundación Pública):

1. **Rediseñar Landing** (`/apps/web/src/app/page.tsx`)
   - Hero section
   - Sección beneficios
   - Pricing
   - CTA a inscripción

2. **Crear Inscripción Multi-Step** (`/apps/web/src/app/inscripcion/page.tsx`)
   - Form con validación
   - Integrar con `/api/estudiantes` y `/api/pagos`
   - Mostrar cupos disponibles

3. **Backend: Mejorar Webhook**
   - Activación automática post-pago completa
   - Email de confirmación

## Para empezar SLICE 2 (Portal Estudiante):

1. **Rediseñar Dashboard Estudiante**
   - 3 cards principales
   - Avatar selector
   - Sistema de niveles

2. **Backend: Crear ConfiguracionNivel**
   - Tabla en Prisma
   - Seed con niveles creativos
   - Endpoint GET `/api/niveles`

---

**🎯 ESTE ES TU DOCUMENTO DE REFERENCIA. MANTENLO ACTUALIZADO.**

---

*Última actualización: 15 de Octubre de 2025*
*Mantenido por: Equipo de Desarrollo Mateatletas*
