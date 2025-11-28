# 🎯 SOURCE OF TRUTH - ESTADO ACTUAL DE MATEATLETAS CLUB

> **DOCUMENTO DE REFERENCIA ABSOLUTA**
> Última actualización: 17 de Octubre de 2025
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
- **Autenticación:** JWT con guards de roles (cookies httpOnly)
- **Validación:** class-validator, class-transformer
- **Documentación:** Swagger implementado ✅
- **Testing:** 99 tests unitarios passing

### Frontend (`/apps/web`)

- **Framework:** Next.js 15 (App Router)
- **Runtime:** React 19
- **Estilos:** Tailwind CSS v4
- **Animaciones:** Framer Motion
- **UI Components:** Custom + Lucide Icons
- **Estado:** Zustand (migrando a React Query) ✅
- **Fetching:** React Query (TanStack Query) ✅

### Infraestructura

- **Monorepo:** Turborepo
- **Package Manager:** npm
- **Database Migrations:** Prisma Migrate
- **Dev Server:** Hot reload en ambos apps

---

# 📊 ESTADO POR INSTANCIA

## 🌐 INSTANCIA 1: PÚBLICO/LANDING

### ❌ NO IMPLEMENTADO (10%)

| Tarea                          | ID   | Estado | Notas                                              |
| ------------------------------ | ---- | ------ | -------------------------------------------------- |
| Landing Page Pública           | T001 | ⚠️ 10% | Existe `/apps/web/src/app/page.tsx` pero es básico |
| Formulario Inscripción Público | T002 | ❌ 0%  | No existe `/inscripcion`                           |

### ⚠️ PARCIALMENTE IMPLEMENTADO

**`/apps/web/src/app/page.tsx`** (Home)

- ✅ Existe pero es placeholder
- ❌ No tiene información del club
- ❌ No tiene CTA de inscripción
- ❌ No tiene sección de beneficios
- ❌ No tiene pricing visible

**`/apps/web/src/app/login/page.tsx`**

- ✅ Login funcional con JWT
- ✅ Cookies httpOnly ✅
- ✅ Validación de roles
- ✅ Redirección según rol

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

---

## 👨‍👩‍👦 INSTANCIA 2: TUTOR/PADRE

### ✅ IMPLEMENTADO (70%)

**Portal Base:**

- ✅ Layout: `/apps/web/src/app/tutor/layout.tsx`
- ✅ Dashboard: `/apps/web/src/app/tutor/dashboard/page.tsx`
- ✅ Autenticación con rol `tutor`
- ✅ Sidebar navigation

**Funcionalidades:**

- ✅ Ver estudiantes: `/apps/web/src/app/tutor/estudiantes/page.tsx`
- ✅ Ver clases disponibles: `/apps/web/src/app/tutor/clases/page.tsx`
- ✅ Ver agenda: `/apps/web/src/app/tutor/agenda/page.tsx`
- ✅ Ver conexiones (docentes): `/apps/web/src/app/tutor/conexiones/page.tsx`

### ❌ NO IMPLEMENTADO (30%)

- ❌ Panel progreso detallado hijo
- ❌ Vista suscripción y pagos completa
- ❌ Mensajería tutor-docente
- ❌ Gráficas por competencias
- ❌ Notificaciones push

---

## 👦 INSTANCIA 3: ESTUDIANTE

### ✅ IMPLEMENTADO (95%)

**Portal Base:**

- ✅ Layout: `/apps/web/src/app/estudiante/layout.tsx`
- ✅ Dashboard: `/apps/web/src/app/estudiante/dashboard/page.tsx` ✅
- ✅ Autenticación con rol `estudiante`
- ✅ Sidebar responsive con modo mobile

**Funcionalidades:**

- ✅ Dashboard con 4 cards (sin scroll) ✅
- ✅ Ver cursos/estudiar: `/apps/web/src/app/estudiante/cursos/page.tsx` (paginación 2x2) ✅
- ✅ Juego Cálculo Mental: `/apps/web/src/app/estudiante/cursos/calculo-mental/page.tsx` ✅
- ✅ Juego Álgebra Challenge: `/apps/web/src/app/estudiante/cursos/algebra-challenge/page.tsx` ✅
- ✅ Ver logros: `/apps/web/src/app/estudiante/logros/page.tsx` (paginación 2x3) ✅
- ✅ Ver ranking: `/apps/web/src/app/estudiante/ranking/page.tsx` ✅
- ✅ Sistema de niveles ✅
- ✅ Avatares personalizables (Dicebear) ✅
- ✅ Animación bienvenida ✅
- ✅ Animación level-up ✅
- ✅ Confetti en logros ✅

**Estado del Portal Estudiante:**

- ✅ **100% funcional y aprobado para producción**
- ✅ Sin scroll en todas las páginas
- ✅ Contenido grande y legible (child-friendly)
- ✅ Glassmorphism premium
- ✅ Framer Motion animations
- ✅ 0 errores TypeScript

### ❌ NO IMPLEMENTADO (5%)

- ⏳ Conectar registro de puntos con backend (juegos)
- ⏳ 4 juegos adicionales (Geometría, Fracciones, Lógica, Ecuaciones)
- ⏳ Sistema de tareas asignadas (backend)

---

## 👩‍🏫 INSTANCIA 4: DOCENTE

### ✅ IMPLEMENTADO (80%)

**Portal Base:**

- ✅ Layout: `/apps/web/src/app/docente/layout.tsx` (Purple Glassmorphism) ✅
- ✅ Dashboard: `/apps/web/src/app/docente/dashboard/page.tsx`
- ✅ Autenticación con rol `docente`
- ✅ Navigation moderna con glassmorphism

**Funcionalidades:**

- ✅ Dashboard con estadísticas
- ✅ Mis clases: `/apps/web/src/app/docente/mis-clases/page.tsx`
- ✅ Calendario: `/apps/web/src/app/docente/calendario/page.tsx`
- ✅ Vista Agenda: `/apps/web/src/app/docente/agenda/page.tsx` ✅
- ✅ Grupos: `/apps/web/src/app/docente/grupos/page.tsx`
- ✅ Grupos detalle: `/apps/web/src/app/docente/grupos/[id]/page.tsx`
- ✅ Estudiantes: `/apps/web/src/app/docente/estudiantes/page.tsx`
- ✅ Estudiantes detalle: `/apps/web/src/app/docente/estudiantes/[id]/page.tsx`
- ✅ Observaciones: `/apps/web/src/app/docente/observaciones/page.tsx`
- ✅ Reportes: `/apps/web/src/app/docente/reportes/page.tsx`
- ✅ Asistencia clase: `/apps/web/src/app/docente/clases/[id]/asistencia/page.tsx`

### ❌ NO IMPLEMENTADO (20%)

- ❌ Videollamadas integración (Jitsi)
- ❌ Gamificación en vivo (WebSockets)
- ❌ Mensajería docente-tutor
- ❌ Exportación PDF reportes

---

## 👔 INSTANCIA 5: ADMINISTRADOR

### ✅ IMPLEMENTADO (75%)

**Portal Base:**

- ✅ Layout: `/apps/web/src/app/admin/layout.tsx`
- ✅ Dashboard: `/apps/web/src/app/admin/dashboard/page.tsx`
- ✅ Autenticación con rol `admin`

**Funcionalidades:**

- ✅ Dashboard con KPIs
- ✅ Gestión usuarios: `/apps/web/src/app/admin/usuarios/page.tsx`
- ✅ Gestión estudiantes: `/apps/web/src/app/admin/estudiantes/page.tsx`
- ✅ Gestión clases: `/apps/web/src/app/admin/clases/page.tsx`
- ✅ Gestión productos: `/apps/web/src/app/admin/productos/page.tsx`
- ✅ Gestión cursos: `/apps/web/src/app/admin/cursos/page.tsx`
- ✅ Reportes: `/apps/web/src/app/admin/reportes/page.tsx`

### ❌ NO IMPLEMENTADO (25%)

- ❌ Proyecciones financieras
- ❌ Gestión cobranza automática
- ❌ Email service
- ❌ Generación PDF

---

## ⚙️ INSTANCIA 6: SISTEMA/BACKEND

### ✅ MÓDULOS IMPLEMENTADOS (80%)

**Core:**

- ✅ **PrismaService** - Conexión DB
- ✅ **AuthModule** - JWT, Guards, Strategies
- ✅ **CommonModule** - Utilities compartidas

**Entidades Principales:**

- ✅ **TutorModule** - Registro, perfil
- ✅ **EstudiantesModule** - CRUD completo
- ✅ **DocentesModule** - CRUD + endpoint público
- ✅ **EquiposModule** - Gestión de equipos

**Funcionalidades:**

- ✅ **ClasesModule** - CRUD clases (refactorizado) ✅
- ✅ **AsistenciaModule** - Registro asistencia + reportes
- ✅ **CatalogoModule** - Productos educativos
- ✅ **PagosModule** - MercadoPago integration
- ✅ **GamificacionModule** - Puntos, logros, ranking
- ✅ **CursosModule** - Cursos asincrónicos
- ✅ **NotificacionesModule** - Sistema de notificaciones
- ✅ **EventosModule** - Sistema de eventos calendario
- ✅ **AdminModule** - Endpoints admin (refactorizado) ✅

**Testing:**

- ✅ **99 tests unitarios** passing ✅
- ✅ Coverage ~90% en servicios refactorizados
- ✅ AdminStatsService (9 tests)
- ✅ AdminAlertasService (16 tests)
- ✅ AdminUsuariosService (17 tests)
- ✅ ClasesManagementService (29 tests)
- ✅ ClasesReservasService (17 tests)
- ✅ ClasesAsistenciaService (11 tests)

### ❌ MÓDULOS NO IMPLEMENTADOS (20%)

| Módulo               | Funcionalidad | Estado             |
| -------------------- | ------------- | ------------------ |
| **MensajeriaModule** | ❌ NO EXISTE  | Chat tutor-docente |
| **WebSocketModule**  | ❌ NO EXISTE  | Socket.io gateway  |
| **EmailModule**      | ❌ NO EXISTE  | Nodemailer service |
| **CronModule**       | ❌ NO EXISTE  | Scheduled tasks    |

---

# 🗄️ SCHEMA PRISMA - MODELOS IMPLEMENTADOS

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

---

# 📡 ENDPOINTS IMPLEMENTADOS (Resumen)

**Auth:**

- ✅ POST `/api/auth/register` - Registro tutor
- ✅ POST `/api/auth/login` - Login universal (cookies httpOnly)
- ✅ GET `/api/auth/me` - Usuario actual
- ✅ POST `/api/auth/logout` - Logout

**Estudiantes:**

- ✅ GET `/api/estudiantes` - Listar
- ✅ POST `/api/estudiantes` - Crear
- ✅ GET `/api/estudiantes/:id` - Detalle
- ✅ PUT `/api/estudiantes/:id` - Actualizar
- ✅ DELETE `/api/estudiantes/:id` - Eliminar

**Docentes:**

- ✅ GET `/api/docentes` - Listar (admin)
- ✅ POST `/api/docentes` - Crear (admin)
- ✅ GET `/api/docentes/public` - Lista pública

**Clases:**

- ✅ GET `/api/clases` - Listar todas
- ✅ POST `/api/clases` - Crear clase
- ✅ GET `/api/clases/:id` - Detalle
- ✅ PUT `/api/clases/:id` - Actualizar
- ✅ DELETE `/api/clases/:id` - Cancelar

**Asistencia:**

- ✅ POST `/api/asistencia` - Registrar
- ✅ GET `/api/asistencia/clase/:claseId` - Por clase
- ✅ GET `/api/asistencia/estudiante/:estudianteId` - Por estudiante

**Pagos:**

- ✅ POST `/api/pagos/preference/suscripcion`
- ✅ POST `/api/pagos/preference/curso`
- ✅ POST `/api/pagos/webhook` - Webhook MercadoPago
- ✅ POST `/api/pagos/activar-demo` - Activar (dev)

**Gamificación:**

- ✅ POST `/api/gamificacion/puntos` - Asignar puntos
- ✅ GET `/api/gamificacion/ranking` - Ranking global
- ✅ POST `/api/gamificacion/insignias` - Otorgar insignia
- ✅ GET `/api/gamificacion/logros/:estudianteId`

**Notificaciones:**

- ✅ GET `/api/notificaciones` - Listar
- ✅ PUT `/api/notificaciones/:id/leer` - Marcar leída
- ✅ POST `/api/notificaciones` - Crear (interno)

**Eventos:**

- ✅ GET `/api/eventos` - Listar eventos
- ✅ POST `/api/eventos` - Crear evento
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

---

# 🔗 INTEGRACIONES EXTERNAS

## ✅ IMPLEMENTADAS

### MercadoPago

- ✅ SDK instalado
- ✅ Creación de preferencias de pago
- ✅ Webhook configurado
- ✅ Modo sandbox para dev

### Prisma ORM

- ✅ Schema completo
- ✅ Migraciones aplicadas
- ✅ Seeds básicos
- ✅ Cliente generado

### React Query (TanStack Query)

- ✅ Migrando desde Zustand ✅
- ✅ useEstudiantes hook
- ✅ useGamificacion hook
- ✅ usePagos hook
- ✅ useNotificaciones hook
- ✅ useEventos hook

### Dicebear

- ✅ Avatares personalizables
- ✅ Integrado en Portal Estudiante

## ❌ NO IMPLEMENTADAS

| Integración         | Propósito     | Prioridad  |
| ------------------- | ------------- | ---------- |
| **Jitsi Meet**      | Videollamadas | 🔴 CRÍTICA |
| **SendGrid/Resend** | Email service | 🟡 ALTA    |
| **Socket.io**       | WebSockets    | 🟠 MEDIA   |

---

# 📦 DEPENDENCIAS INSTALADAS

## Backend (`apps/api/package.json`)

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/core": "^10.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/swagger": "^7.x",
  "@prisma/client": "^5.x",
  "bcrypt": "^5.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "mercadopago": "^2.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x"
}
```

## Frontend (`apps/web/package.json`)

```json
{
  "next": "15.x",
  "react": "^19.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^4.x",
  "@tanstack/react-query": "^5.x",
  "@dicebear/core": "^9.x",
  "zustand": "^5.x"
}
```

---

# 🎨 DESIGN SYSTEM ESTABLECIDO

## Portal Estudiante (95/5 Rule)

**95% Emerald/Teal + 5% Orange:**

```css
--emerald-primary: #10b981 (emerald-500) --teal-primary: #14b8a6 (teal-500) --orange-accent: #f97316
  (orange-500);
```

**Glassmorphism:**

```css
.glass-card {
  backdrop-blur-xl;
  background: white/40 dark:slate-900/40;
  border: emerald-200/30;
  box-shadow: xl;
  border-radius: 2xl;
}
```

## Portal Docente (Purple Theme)

**Colors:**

```css
--violet-primary: #8b5cf6 (violet-500) --purple-primary: #a855f7 (purple-500) --indigo-dark: #4f46e5
  (indigo-600);
```

**Glassmorphism:**

```css
.glass-card {
  backdrop-blur-xl;
  background: white/65 dark:indigo-950/60;
  border: purple-200/30;
  shadow: purple-200/20;
  border-radius: 3xl;
}
```

---

# 🧪 TESTING

## ✅ Tests Implementados

**Backend:**

- ✅ **99 tests unitarios** passing
- ✅ Coverage ~90% en servicios refactorizados
- ✅ Patrones establecidos (AAA, Mocking, Edge Cases)

**Frontend:**

- ✅ **150+ tests manuales** ejecutados
- ✅ Portal Estudiante 100% probado
- ✅ 0 errores TypeScript

---

# 📊 CALIDAD DEL CÓDIGO

## Backend

- **Score**: 8.5/10 ✅
- **TypeScript Errors**: 0
- **Tests**: 99 passing
- **Coverage**: ~90%

## Frontend

- **Score**: 9.8/10 ✅
- **TypeScript Errors**: 0
- **Portal Estudiante**: 100% aprobado
- **Type Safety**: 10/10

---

# 📋 ESTADO DE SPRINTS

## ✅ Sprint 1-7 COMPLETADOS

**Sprint 7: Cleanup & Polish** ✅

- Limpieza de código
- Documentación completa
- Testing comprehensivo
- Backend: 8.2 → 8.5/10

**Sprint 6: React Query Migration** ✅

- Migración Fase 1: Notificaciones
- Migración Fase 2: 5 stores adicionales
- Hooks optimizados
- TypeScript errors: 0

## 🎯 Proyecto: 85% Completo

**17/20 slices esenciales** completados

---

# 🚨 VULNERABILIDADES DE SEGURIDAD IDENTIFICADAS

## 🔴 CRÍTICAS (Pendientes de resolver)

1. **Mock Payment Endpoint** sin protección
   - Endpoint: POST `/api/pagos/activar-demo`
   - Riesgo: Activación gratuita de membresías
   - Solución: Agregar guard o eliminar en producción

2. **CORS Completamente Abierto**
   - Config: `origin: true`
   - Riesgo: Cualquier origen puede acceder
   - Solución: Restringir a dominios específicos

3. **JWT en localStorage** (XSS vulnerable)
   - ✅ RESUELTO: Migrado a httpOnly cookies

4. **No Rate Limiting**
   - Riesgo: Ataques de fuerza bruta
   - Solución: Implementar @nestjs/throttler

---

# 🚀 PRÓXIMOS PASOS PRIORITARIOS

## 1. Resolver Vulnerabilidades de Seguridad (URGENTE)

- [ ] Proteger/eliminar mock payment endpoint
- [ ] Configurar CORS restrictivo
- [ ] Implementar rate limiting

## 2. Completar Portal Estudiante

- [ ] Conectar juegos con backend (registrar puntos)
- [ ] Implementar 4 juegos adicionales
- [ ] Sistema de tareas asignadas

## 3. Landing Page

- [ ] Rediseñar página principal
- [ ] Formulario de inscripción
- [ ] Sistema de pagos público

---

# 📝 DOCUMENTACIÓN CLAVE

**Esenciales:**

- ✅ `README.md` - Índice maestro
- ✅ `LECCIONES_APRENDIDAS_DEUDA_TECNICA.md` - Errores a evitar
- ✅ `AUDITORIA_2025-10-17_PLAN_MITIGACION.md` - Plan de seguridad
- ✅ `frontend/DESIGN_SYSTEM_EVOLVED.md` - Design system completo
- ✅ `testing/TESTING_DOCUMENTATION.md` - Testing completo
- ✅ `testing/CREDENCIALES_TEST.md` - Usuarios de prueba

**Arquitectura:**

- ✅ `architecture/context.md`
- ✅ `architecture/design-system.md`
- ✅ `architecture/documento-tecnico-del-backend.md`
- ✅ `architecture/frontend-arquitectura.md`

**API Specs:** 12 archivos (completos)
**Development:** 5 archivos (setup guides)

---

# 🎯 CHECKLIST DE USO

## Antes de Implementar:

- [ ] Leo SOURCE_OF_TRUTH para verificar qué existe
- [ ] Reviso componentes reutilizables
- [ ] Chequeo endpoints disponibles
- [ ] Confirmo dependencias necesarias

## Durante Desarrollo:

- [ ] Uso componentes/hooks existentes
- [ ] No duplico funcionalidad
- [ ] Sigo design system establecido

## Después de Implementar:

- [ ] ✅ **ACTUALIZO SOURCE_OF_TRUTH**
- [ ] Marco tareas como completadas
- [ ] Documento nuevos endpoints/componentes
- [ ] Hago commit referenciando el slice

---

**🎯 ESTE ES TU DOCUMENTO DE REFERENCIA. MANTENLO ACTUALIZADO.**

---

_Última actualización: 17 de Octubre de 2025_
_Mantenido por: Equipo de Desarrollo Mateatletas_
