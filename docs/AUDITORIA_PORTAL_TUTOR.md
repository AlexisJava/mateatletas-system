# AUDITORÍA PORTAL TUTOR - MATEATLETAS ECOSYSTEM

**Fecha:** 31 de Octubre de 2025
**Auditor:** Claude Code
**Alcance:** Portal web para tutores/padres en Mateatletas Ecosystem

---

## 📋 RESUMEN EJECUTIVO

El portal tutor está **implementado y funcional** en la ruta `apps/web/src/app/(protected)/`, con endpoints backend completos en `/tutor`. El sistema tiene una arquitectura sólida pero requiere mejoras en UX y funcionalidades.

**Rating General:** ⭐⭐⭐⭐ (7/10)

### Estado Actual

- ✅ **Backend completo:** 4 endpoints funcionales
- ✅ **Autenticación segura:** JWT con roles (tutor)
- ✅ **Dashboard funcional:** Con 4 tabs principales
- ⚠️ **UX/UI:** Diseño básico, falta pulido visual
- ❌ **Funcionalidades faltantes:** Ver detalles más abajo

---

## 🏗️ ARQUITECTURA ACTUAL

### **1. FRONTEND (Next.js 15 + TypeScript)**

#### Estructura de rutas:

```
apps/web/src/app/(protected)/
├── dashboard/               ⭐ Principal
│   ├── page.tsx            (Entry point)
│   └── components/
│       ├── DashboardView.tsx       (Layout principal con tabs)
│       ├── MisHijosTab.tsx         (Lista de estudiantes + detalle)
│       ├── CalendarioTab.tsx       (Próximas clases)
│       ├── PagosTab.tsx            (Historial de pagos)
│       └── AyudaTab.tsx            (Soporte)
│
├── estudiantes/            ⭐ Gestión de hijos
│   ├── page.tsx           (Lista + CRUD)
│   └── [id]/
│       └── page.tsx       (Detalle individual)
│
├── clases/                 (Vista de clases)
├── planificaciones/        (Vista de planificaciones)
├── equipos/                (Equipos/grupos)
├── catalogo/               (Catálogo de cursos)
├── mis-clases/             (Clases del tutor)
├── membresia/              (Gestión de membresía)
│   ├── planes/
│   └── confirmacion/
│
└── layout.tsx              (Protected layout con auth check)
```

#### Componentes principales:

**DashboardView** (`dashboard/components/DashboardView.tsx`)

- Sistema de tabs: Inicio, Mis Hijos, Calendario, Pagos, Ayuda
- Header con user menu y logout
- Alertas críticas en tiempo real
- Diseño dark mode premium

**MisHijosTab** (`dashboard/components/MisHijosTab.tsx`)

- Lista lateral de todos los hijos
- Panel de detalle con:
  - Información personal
  - Métricas de asistencia
  - Próximas clases
  - Historial de progreso

**CalendarioTab** (`dashboard/components/CalendarioTab.tsx`)

- Próximas N clases de todos los hijos
- Vista temporal (HOY, MAÑANA, fecha)
- Botón para unirse a Google Meet

**PagosTab** (`dashboard/components/PagosTab.tsx`)

- Historial de inscripciones mensuales
- Filtros por periodo y estado
- Resumen financiero
- Estados: Pendiente, Pagado, Vencido

---

### **2. BACKEND (NestJS + Prisma)**

#### Módulo Tutor:

```
apps/api/src/tutor/
├── tutor.controller.ts      ⭐ 4 endpoints
├── tutor.service.ts          (Lógica de negocio)
├── tutor.module.ts           (Module definition)
└── types/
    └── tutor-dashboard.types.ts
```

#### Endpoints disponibles:

| Endpoint                   | Método | Descripción                                     | Estado |
| -------------------------- | ------ | ----------------------------------------------- | ------ |
| `/tutor/dashboard-resumen` | GET    | Resumen completo del dashboard                  | ✅     |
| `/tutor/mis-inscripciones` | GET    | Inscripciones mensuales + resumen financiero    | ✅     |
| `/tutor/proximas-clases`   | GET    | Próximas N clases de todos los hijos            | ✅     |
| `/tutor/alertas`           | GET    | Alertas activas (pagos, asistencia, clases hoy) | ✅     |

#### Características de seguridad:

- ✅ **JWT Auth Guard:** Requiere autenticación
- ✅ **Roles Guard:** Solo rol `tutor`
- ✅ **User ID from token:** TutorId extraído del JWT (no confiamos en cliente)
- ✅ **Swagger docs:** Documentación completa con OpenAPI

---

## 📊 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Dashboard Principal

- **Métricas generales:**
  - Total de hijos registrados
  - Clases del mes
  - Total pagado en el año
  - Asistencia promedio

- **Alertas en tiempo real:**
  - Pagos vencidos (prioridad alta)
  - Pagos por vencer (próximos 7 días)
  - Clases programadas para hoy
  - Asistencias bajas (<70%)

- **Clases de hoy:**
  - Lista de clases programadas
  - Estudiante, docente, horario
  - Link de Google Meet

- **Pagos pendientes:**
  - Lista de inscripciones pendientes
  - Fecha de vencimiento
  - Monto

### ✅ Gestión de Hijos

- **Lista de estudiantes:**
  - Vista con todos los hijos
  - Filtros por nivel escolar y equipo
  - Búsqueda

- **Detalle de estudiante:**
  - Información personal (nombre, apellido, fecha nacimiento, nivel)
  - Avatar/iniciales
  - Métricas de asistencia
  - Próximas clases
  - Progreso académico

- **CRUD de estudiantes:**
  - ⚠️ **Crear:** Implementado pero necesita mejoras
  - ⚠️ **Editar:** Implementado pero necesita mejoras
  - ⚠️ **Eliminar:** Con confirmación
  - ✅ **Ver detalle:** Completo

### ✅ Calendario

- Próximas clases de todos los hijos
- Ordenadas cronológicamente
- Labels temporales (HOY, MAÑANA, LUN 15/02)
- Info completa: estudiante, docente, ruta, horario
- Botón para unirse a Google Meet

### ✅ Pagos

- Historial de inscripciones mensuales
- Filtros por:
  - Periodo (YYYY-MM)
  - Estado (Pendiente, Pagado, Vencido)
- Resumen financiero:
  - Total pendiente
  - Total pagado
  - Cantidad de inscripciones
  - Estudiantes únicos

### ⚠️ Ayuda

- Sección básica implementada
- **Falta:** FAQs, tutoriales, contacto directo

---

## ❌ FUNCIONALIDADES FALTANTES

### 🔴 **ALTA PRIORIDAD**

#### 1. **Pagos en línea integrados**

**Estado:** ❌ No implementado
**Descripción:** El tutor no puede pagar desde el portal.
**Impacto:** Alto - La experiencia está incompleta sin esto.

**Tasks:**

- [ ] Integración con Mercado Pago (ya existe en backend para admin)
- [ ] Botón "Pagar ahora" en inscripciones pendientes
- [ ] Flujo completo:
  1. Seleccionar inscripción(es) pendiente(s)
  2. Generar preference de Mercado Pago
  3. Redirect a checkout
  4. Webhook para actualizar estado
  5. Confirmación en dashboard
- [ ] Historial de transacciones
- [ ] Descargar comprobantes (PDF)

**Endpoints necesarios:**

```typescript
POST /tutor/pagos/generar-preference
  Body: { inscripcionesIds: string[] }
  Response: { preference_id, init_point }

GET /tutor/pagos/historial
  Query: { periodo?, estado? }
  Response: { pagos: Pago[], resumen: ResumenPagos }

GET /tutor/pagos/:pagoId/comprobante
  Response: PDF binary
```

---

#### 2. **Notificaciones push/email**

**Estado:** ❌ No implementado
**Descripción:** No hay sistema de notificaciones.
**Impacto:** Alto - Los tutores no reciben alertas fuera del portal.

**Tasks:**

- [ ] Sistema de notificaciones en backend:
  - Eventos: pago vencido, clase hoy, baja asistencia
  - Canales: email (nodemailer), push (web push), WhatsApp (Twilio)
- [ ] Centro de notificaciones en dashboard:
  - Badge con count
  - Modal/sidebar con historial
  - Marcar como leída
- [ ] Configuración de preferencias:
  - ¿Qué notificaciones recibir?
  - ¿Por qué canal?
  - Horarios (no molestar)

**Endpoints necesarios:**

```typescript
GET /tutor/notificaciones
  Query: { limite?, leidas? }
  Response: { notificaciones: Notificacion[], total_no_leidas }

PATCH /tutor/notificaciones/:id/marcar-leida
  Response: { success: boolean }

GET /tutor/notificaciones/preferencias
  Response: PreferenciasNotificaciones

PUT /tutor/notificaciones/preferencias
  Body: PreferenciasNotificaciones
  Response: { success: boolean }
```

---

#### 3. **Perfil de tutor completo**

**Estado:** ⚠️ Implementación parcial
**Descripción:** Falta edición de perfil y gestión de cuenta.

**Tasks:**

- [ ] Ruta `/dashboard/perfil` o `/perfil`
- [ ] Vista de perfil con:
  - Información personal (nombre, email, teléfono, dirección)
  - Avatar/foto
  - Cambio de contraseña
  - Métodos de pago guardados (tarjetas)
  - Configuración de facturación
- [ ] Edición de datos:
  - Formulario con validación
  - Upload de avatar
  - Cambiar email (con verificación)

**Endpoints necesarios:**

```typescript
GET / tutor / perfil;
Response: PerfilTutor;

PUT / tutor / perfil;
Body: UpdatePerfilDto;
Response: PerfilTutor;

POST / tutor / perfil / avatar;
Body: FormData(file);
Response: {
  avatar_url;
}

PUT / tutor / perfil / password;
Body: {
  (password_actual, password_nueva);
}
Response: {
  success: boolean;
}
```

---

### 🟡 **MEDIA PRIORIDAD**

#### 4. **Comunicación con docentes**

**Estado:** ❌ No implementado
**Descripción:** No hay forma de contactar a los docentes.

**Tasks:**

- [ ] Sistema de mensajería interna:
  - Chat 1:1 con docentes
  - Lista de conversaciones
  - Notificaciones en tiempo real (WebSocket)
- [ ] Alternativa simple:
  - Mostrar email/teléfono del docente
  - Botón "Contactar docente" (mailto:)

---

#### 5. **Progreso académico detallado**

**Estado:** ⚠️ Muy básico
**Descripción:** Solo muestra métricas de asistencia.

**Tasks:**

- [ ] Ampliar detalle de estudiante con:
  - Calificaciones por asignatura
  - Gráficos de evolución temporal
  - Comentarios/observaciones de docentes
  - Actividades completadas
  - Logros/insignias

**Endpoints necesarios:**

```typescript
GET /estudiantes/:id/progreso-academico
  Query: { periodo? }
  Response: {
    calificaciones: Calificacion[],
    asistencia: AsistenciaStats,
    actividades: ActividadCompletada[],
    observaciones: Observacion[],
    logros: Logro[]
  }
```

---

#### 6. **Reportes descargables**

**Estado:** ❌ No implementado
**Descripción:** No se pueden descargar reportes.

**Tasks:**

- [ ] Botón "Descargar reporte" en cada sección:
  - Reporte de asistencia (PDF)
  - Reporte de pagos (PDF/Excel)
  - Reporte de progreso académico (PDF)
  - Certificados de asistencia
- [ ] Backend: Generar PDFs con librería (puppeteer, pdfkit)

---

### 🟢 **BAJA PRIORIDAD (Nice to have)**

#### 7. **Calendario integrado**

**Estado:** ⚠️ Solo lista
**Descripción:** No hay vista de calendario visual.

**Tasks:**

- [ ] Implementar calendario visual con librería (FullCalendar, react-big-calendar)
- [ ] Vistas: mes, semana, día
- [ ] Eventos: clases, evaluaciones, reuniones
- [ ] Click en evento → modal con detalle

---

#### 8. **Modo oscuro/claro**

**Estado:** ⚠️ Solo dark
**Descripción:** El dashboard solo está en modo oscuro.

**Tasks:**

- [ ] Toggle de modo claro/oscuro
- [ ] Guardar preferencia en localStorage
- [ ] Aplicar tema global con CSS variables

---

#### 9. **Onboarding interactivo**

**Estado:** ⚠️ Comentado
**Descripción:** Hay un `OnboardingView.tsx` pero está comentado.

**Tasks:**

- [ ] Reactivar OnboardingView para nuevos tutores
- [ ] Wizard de 3-4 pasos:
  1. Bienvenida
  2. Agregar primer hijo
  3. Ver calendario
  4. Configurar pagos
- [ ] Guardar progreso de onboarding en DB

---

#### 10. **Soporte multiidioma**

**Estado:** ❌ Solo español
**Descripción:** Todo el portal está en español.

**Tasks:**

- [ ] Implementar i18n (next-intl, react-i18next)
- [ ] Traducir a inglés (mínimo)
- [ ] Selector de idioma en header

---

## 🎨 MEJORAS DE UX/UI

### 🔴 **ALTA PRIORIDAD**

#### 1. **Diseño responsive mejorado**

**Problema:** El diseño funciona en mobile pero tiene problemas.
**Tasks:**

- [ ] Revisar todos los breakpoints (sm, md, lg, xl)
- [ ] Mejorar layout en tablets (768px-1024px)
- [ ] Sidebar responsive en mobile (hamburger menu)
- [ ] Cards más compactas en mobile

---

#### 2. **Estados de carga y errores**

**Problema:** Algunos componentes no manejan bien el loading/error.
**Tasks:**

- [ ] Skeletons para carga inicial (react-loading-skeleton)
- [ ] Mensajes de error amigables
- [ ] Retry buttons cuando falla una request
- [ ] Empty states con ilustraciones

---

#### 3. **Animaciones y transiciones**

**Problema:** Las transiciones son abruptas.
**Tasks:**

- [ ] Usar Framer Motion para transiciones suaves
- [ ] Animaciones de entrada/salida en modals
- [ ] Hover states con micro-interacciones
- [ ] Loading spinners con animación

---

### 🟡 **MEDIA PRIORIDAD**

#### 4. **Consistencia visual**

**Problema:** Diferentes estilos en diferentes páginas.
**Tasks:**

- [ ] Design system unificado:
  - Paleta de colores consistente
  - Tipografía estándar (Fredoka, Lilita)
  - Componentes reutilizables
  - Spacing/padding consistente
- [ ] Documentar design system en Storybook (opcional)

---

#### 5. **Accesibilidad (a11y)**

**Problema:** No está optimizado para lectores de pantalla.
**Tasks:**

- [ ] Agregar aria-labels
- [ ] Navegación con teclado (Tab, Enter, Esc)
- [ ] Contraste de colores WCAG AA
- [ ] Focus indicators visibles

---

## 🔧 MEJORAS TÉCNICAS

### 🔴 **ALTA PRIORIDAD**

#### 1. **Testing**

**Estado:** ⚠️ Sin tests
**Tasks:**

- [ ] Unit tests para componentes (Vitest + Testing Library)
- [ ] Integration tests para flujos críticos
- [ ] E2E tests para user journeys (Playwright)
- Coverage mínimo: 70%

---

#### 2. **Error handling robusto**

**Problema:** Algunos errores solo hacen `console.error`.
**Tasks:**

- [ ] Implementar error boundaries (React)
- [ ] Logger centralizado (Sentry, LogRocket)
- [ ] Toast notifications para errores de usuario
- [ ] Retry logic para requests fallidos

---

### 🟡 **MEDIA PRIORIDAD**

#### 3. **Performance optimization**

**Tasks:**

- [ ] Code splitting por rutas (Next.js dynamic import)
- [ ] Lazy loading de imágenes
- [ ] Cache de requests con React Query
- [ ] Optimizar bundle size (analyze with next/bundle-analyzer)

---

#### 4. **Documentación**

**Tasks:**

- [ ] README con setup instructions
- [ ] Storybook para componentes
- [ ] JSDoc comments en funciones complejas
- [ ] Diagramas de arquitectura (Mermaid)

---

## 📦 COMPARACIÓN CON OTROS PORTALES

### ✅ **Portal Admin (Mateatletas OS)**

- **Estado:** ⭐⭐⭐⭐⭐ (9/10) - Completísimo
- **Features:** Dashboard avanzado, gráficos, gestión completa
- **UX/UI:** Diseño profesional con Chart.js, sidebar colapsable

**Recomendación:** Reutilizar componentes del portal admin en tutor.

### ✅ **Portal Docente**

- **Estado:** ⭐⭐⭐⭐ (8/10) - Muy completo
- **Features:** Calendario, grupos, planificaciones, observaciones
- **UX/UI:** Diseño limpio y funcional

**Recomendación:** Adaptar la vista de calendario del docente para tutor.

### ⚠️ **Portal Estudiante (Brawl Stars Gimnasio)**

- **Estado:** ⭐⭐⭐⭐⭐ (10/10) - Innovador y completo
- **Features:** Gamificación, overlay stack navigation, animaciones épicas
- **UX/UI:** Diseño next-gen con Framer Motion, inspirado en videojuegos

**Recomendación:** El portal tutor debería tener un nivel de pulido similar.

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### **FASE 1: Mejoras Críticas (2-3 semanas)**

```
✅ Prioridad 1: Pagos en línea
  └─ Integración Mercado Pago
  └─ Botones "Pagar ahora"
  └─ Historial de transacciones
  └─ Comprobantes PDF

✅ Prioridad 2: Notificaciones
  └─ Sistema de notificaciones backend
  └─ Centro de notificaciones en UI
  └─ Emails automáticos (pago vencido, clase hoy)

✅ Prioridad 3: Perfil completo
  └─ Edición de perfil
  └─ Upload de avatar
  └─ Cambio de contraseña
  └─ Métodos de pago
```

### **FASE 2: UX/UI Polish (1-2 semanas)**

```
✅ Responsive mejorado
✅ Estados de carga (skeletons)
✅ Animaciones con Framer Motion
✅ Consistencia visual
```

### **FASE 3: Features Adicionales (2-3 semanas)**

```
✅ Comunicación con docentes (chat simple)
✅ Progreso académico detallado
✅ Reportes descargables
✅ Calendario visual
```

### **FASE 4: Testing y Documentación (1 semana)**

```
✅ Unit tests
✅ E2E tests
✅ Documentación
✅ Performance optimization
```

---

## 📈 MÉTRICAS DE ÉXITO

### KPIs a medir después de las mejoras:

1. **Adopción:**
   - % de tutores que usan el portal al menos 1x por semana
   - Target: >80%

2. **Pagos:**
   - % de pagos realizados online vs offline
   - Target: >60%

3. **Satisfacción:**
   - NPS (Net Promoter Score)
   - Target: >50

4. **Engagement:**
   - Tiempo promedio en portal por sesión
   - Target: >5 minutos

5. **Performance:**
   - Tiempo de carga inicial
   - Target: <2 segundos

---

## 🔗 RECURSOS Y REFERENCIAS

### Documentación útil:

- Next.js 15: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
- React Query: https://tanstack.com/query/latest
- Mercado Pago SDK: https://www.mercadopago.com.ar/developers/es/docs

### Librerías recomendadas:

```json
{
  "payments": "mercadopago",
  "notifications": "react-toastify",
  "charts": "chart.js + react-chartjs-2",
  "calendar": "react-big-calendar",
  "forms": "react-hook-form + zod",
  "pdf": "puppeteer",
  "email": "nodemailer",
  "sms/whatsapp": "twilio"
}
```

---

## 🏁 CONCLUSIÓN

El portal tutor tiene **una base sólida** con backend completo y frontend funcional, pero necesita **pulido y features adicionales** para estar al nivel del portal admin y estudiante.

### **Próximos pasos inmediatos:**

1. ✅ **Implementar pagos en línea** (crítico para UX)
2. ✅ **Sistema de notificaciones** (engagement)
3. ✅ **Mejorar diseño responsive** (accesibilidad)
4. ✅ **Testing básico** (calidad)

Con estas mejoras, el portal tutor pasará de **7/10 a 9/10** en 6-8 semanas.

---

**Generado por:** Claude Code
**Fecha:** 31 de Octubre de 2025
**Versión:** 1.0
