# Frontend Development Roadmap - Mateatletas

## 📊 Estado Actual

### ✅ Infraestructura Base Implementada

- **Framework**: Next.js 15.5.4 con App Router
- **Styling**: TailwindCSS 4 (latest)
- **State Management**: Zustand 5.0.8
- **HTTP Client**: Axios 1.12.2
- **Icons**: Lucide React 0.545.0
- **Testing**: Playwright configurado

### ✅ Páginas Existentes

**Públicas:**
- `/` - Landing page
- `/login` - Login de tutores
- `/register` - Registro de tutores
- `/showcase` - Showcase de características

**Protegidas (con layout):**
- `/dashboard` - Dashboard principal (implementado)
- `/estudiantes` - Lista de estudiantes (implementado)
- `/estudiantes/[id]` - Detalle de estudiante (implementado)
- `/equipos` - Vista de equipos (implementado)

### ✅ Stores Implementados (Zustand)

- `auth.store.ts` - Autenticación y usuario actual
- `estudiantes.store.ts` - Gestión de estudiantes
- `equipos.store.ts` - Gestión de equipos

### ✅ API Clients

- `auth.api.ts` - Endpoints de autenticación
- `estudiantes.api.ts` - CRUD de estudiantes
- `equipos.api.ts` - Gestión de equipos

---

## 🎯 Plan de Desarrollo Frontend

### Fase 1: Completar Flujo de Tutor (4-5 días)

**Objetivo**: Permitir a los tutores gestionar completamente sus estudiantes y acceder al catálogo.

#### Módulo 1.1: Catálogo de Productos (1 día)
- [ ] Página `/catalogo` - Vista grid de productos
- [ ] Filtros por tipo (Suscripción, Curso, Recurso)
- [ ] Modal de detalle de producto
- [ ] Store `catalogo.store.ts`
- [ ] API client `catalogo.api.ts`

#### Módulo 1.2: Proceso de Pago (1-2 días)
- [ ] Página `/membresia/planes` - Planes de suscripción
- [ ] Página `/cursos/[id]/inscribir` - Inscripción a curso
- [ ] Integración con MercadoPago (frontend)
- [ ] Página de confirmación post-pago
- [ ] Store `pagos.store.ts`
- [ ] API client `pagos.api.ts`

#### Módulo 1.3: Clases y Reservas (2 días)
- [ ] Página `/clases` - Calendario de clases disponibles
- [ ] Filtros por ruta curricular
- [ ] Modal de reserva de clase
- [ ] Página `/mis-clases` - Clases reservadas del tutor
- [ ] Cancelación de reservas
- [ ] Store `clases.store.ts`
- [ ] API client `clases.api.ts`

---

### Fase 2: Panel Docente (3-4 días)

**Objetivo**: Permitir a los docentes gestionar sus clases y registrar asistencia.

#### Módulo 2.1: Dashboard Docente (1 día)
- [ ] Layout específico para docentes `/docente/layout.tsx`
- [ ] Dashboard `/docente/dashboard` - Resumen de clases
- [ ] Vista de próximas clases
- [ ] Estadísticas básicas

#### Módulo 2.2: Gestión de Clases (1 día)
- [ ] Página `/docente/mis-clases` - Lista de clases del docente
- [ ] Creación de nueva clase (solo admin)
- [ ] Detalle de clase con lista de inscritos
- [ ] Cancelación de clase

#### Módulo 2.3: Registro de Asistencia (1-2 días)
- [ ] Página `/docente/clases/[id]/asistencia`
- [ ] Interface para marcar presente/ausente/justificado
- [ ] Asignación de puntos por asistencia
- [ ] Observaciones por estudiante
- [ ] Vista de historial de asistencia
- [ ] Store `asistencia.store.ts`
- [ ] API client `asistencia.api.ts`

---

### Fase 3: Panel Administrativo (4-5 días)

**Objetivo**: Dashboard completo para administradores con todas las funcionalidades de gestión.

#### Módulo 3.1: Dashboard Admin (1 día)
- [ ] Layout `/admin/layout.tsx`
- [ ] Dashboard `/admin/dashboard` - Métricas globales
- [ ] Integración con Admin Copilot (estadísticas)
- [ ] Alertas y notificaciones
- [ ] Store `admin.store.ts`

#### Módulo 3.2: Gestión de Usuarios (1 día)
- [ ] CRUD de tutores `/admin/tutores`
- [ ] CRUD de docentes `/admin/docentes`
- [ ] CRUD de estudiantes (vista admin)
- [ ] Asignación de roles

#### Módulo 3.3: Gestión de Contenido (2 días)
- [ ] CRUD de productos `/admin/productos`
- [ ] CRUD de rutas curriculares `/admin/rutas`
- [ ] CRUD de clases `/admin/clases`
- [ ] Vista de equipos con estadísticas

#### Módulo 3.4: Reportes y Analytics (1 día)
- [ ] Dashboard de asistencia general
- [ ] Reportes de pagos
- [ ] Estadísticas de uso
- [ ] Exportación de datos (CSV/PDF)

---

### Fase 4: Gamificación y Estudiante (2-3 días)

**Objetivo**: Vista para estudiantes con progreso y gamificación.

#### Módulo 4.1: Portal Estudiante (1 día)
- [ ] Layout `/estudiante/layout.tsx`
- [ ] Dashboard estudiante - Progreso personal
- [ ] Vista de equipo y ranking
- [ ] Próximas clases del estudiante

#### Módulo 4.2: Logros y Puntos (1-2 días)
- [ ] Página `/estudiante/logros` - Badges y logros
- [ ] Sistema de puntos visualizado
- [ ] Historial de asistencias
- [ ] Progreso por ruta curricular

---

### Fase 5: Mejoras UX y Optimización (2-3 días)

#### Módulo 5.1: Componentes Avanzados (1 día)
- [ ] Implementar librería de componentes UI completa
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error boundaries
- [ ] Skeleton loaders

#### Módulo 5.2: PWA y Offline (1 día)
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Offline fallback
- [ ] Push notifications

#### Módulo 5.3: Testing E2E (1 día)
- [ ] Tests Playwright para flujos críticos
- [ ] Test: Login → Dashboard → Crear Estudiante
- [ ] Test: Reservar clase
- [ ] Test: Proceso de pago
- [ ] Test: Registro de asistencia (docente)

---

## 🏗️ Arquitectura Frontend

### Stack Tecnológico Actual

```
Next.js 15 (App Router)
├── TailwindCSS 4 (Styling)
├── Zustand (State Management)
├── Axios (HTTP Client)
├── Lucide React (Icons)
├── React 19 (UI Library)
└── Playwright (E2E Testing)
```

### Estructura de Directorios Propuesta

```
apps/web/src/
├── app/
│   ├── (public)/              # Rutas públicas
│   │   ├── page.tsx           # Landing
│   │   ├── login/
│   │   ├── register/
│   │   └── showcase/
│   ├── (protected)/           # Rutas protegidas (Tutor)
│   │   ├── dashboard/
│   │   ├── estudiantes/
│   │   ├── equipos/
│   │   ├── catalogo/
│   │   ├── clases/
│   │   ├── mis-clases/
│   │   └── membresia/
│   ├── docente/               # Panel Docente
│   │   ├── dashboard/
│   │   ├── mis-clases/
│   │   └── asistencia/
│   ├── admin/                 # Panel Admin
│   │   ├── dashboard/
│   │   ├── tutores/
│   │   ├── docentes/
│   │   ├── productos/
│   │   ├── rutas/
│   │   └── reportes/
│   └── estudiante/            # Portal Estudiante
│       ├── dashboard/
│       ├── equipo/
│       └── logros/
├── components/
│   ├── ui/                    # Componentes base (Button, Card, etc)
│   ├── layout/                # Headers, Navbars, Sidebars
│   ├── forms/                 # Form components
│   └── features/              # Componentes específicos por feature
├── lib/
│   ├── api/                   # API clients
│   │   ├── auth.api.ts
│   │   ├── estudiantes.api.ts
│   │   ├── catalogo.api.ts
│   │   ├── pagos.api.ts
│   │   ├── clases.api.ts
│   │   ├── asistencia.api.ts
│   │   └── admin.api.ts
│   ├── hooks/                 # Custom hooks
│   ├── utils/                 # Utilities
│   └── axios.ts               # Axios config
├── store/                     # Zustand stores
│   ├── auth.store.ts          ✅
│   ├── estudiantes.store.ts   ✅
│   ├── equipos.store.ts       ✅
│   ├── catalogo.store.ts
│   ├── pagos.store.ts
│   ├── clases.store.ts
│   ├── asistencia.store.ts
│   └── admin.store.ts
└── types/                     # TypeScript types
    ├── auth.types.ts
    ├── estudiante.types.ts
    ├── clase.types.ts
    └── ...
```

---

## 📅 Timeline Estimado

| Fase | Duración | Acumulado |
|------|----------|-----------|
| **Fase 1**: Flujo Tutor | 4-5 días | 5 días |
| **Fase 2**: Panel Docente | 3-4 días | 9 días |
| **Fase 3**: Panel Admin | 4-5 días | 14 días |
| **Fase 4**: Gamificación | 2-3 días | 17 días |
| **Fase 5**: UX/Testing | 2-3 días | 20 días |

**Total estimado: 3-4 semanas de desarrollo**

---

## 🎨 Sistema de Diseño

### Colores Principales

```css
/* Brand Colors */
--primary: #ff6b35;      /* Naranja principal */
--secondary: #f7b801;    /* Amarillo */
--accent: #00d9ff;       /* Cyan */
--dark: #2a1a5e;         /* Morado oscuro */

/* Rutas Curriculares */
--logica: #8B5CF6;       /* Morado */
--algebra: #3B82F6;      /* Azul */
--geometria: #10B981;    /* Verde */
--aritmetica: #F59E0B;   /* Naranja */
--estadistica: #EF4444;  /* Rojo */
--calculo: #6366F1;      /* Índigo */

/* Estados */
--success: #10B981;      /* Verde */
--warning: #F59E0B;      /* Amarillo */
--error: #EF4444;        /* Rojo */
--info: #3B82F6;         /* Azul */
```

### Componentes UI Base a Crear

- [ ] Button (variants: primary, secondary, outline, ghost)
- [ ] Card (con title, description, footer)
- [ ] Input (text, email, password, number, date)
- [ ] Select/Dropdown
- [ ] Modal/Dialog
- [ ] Toast/Notification
- [ ] Badge/Chip
- [ ] Avatar
- [ ] Tabs
- [ ] Accordion
- [ ] Table
- [ ] Pagination
- [ ] Skeleton
- [ ] Spinner/Loader
- [ ] Progress Bar
- [ ] Calendar Picker
- [ ] DateTimePicker

---

## 🔐 Roles y Permisos

### Rol: Tutor (Default)
- ✅ Ver dashboard personal
- ✅ CRUD de sus estudiantes
- ✅ Ver catálogo de productos
- ✅ Comprar suscripciones/cursos
- ✅ Reservar clases para sus estudiantes
- ✅ Ver equipos de sus estudiantes

### Rol: Docente
- ✅ Dashboard docente
- ✅ Ver sus clases programadas
- ✅ Registrar asistencia
- ✅ Ver lista de estudiantes inscritos
- ✅ Cancelar clases (propias)

### Rol: Admin
- ✅ Acceso completo a todos los módulos
- ✅ Dashboard con métricas globales
- ✅ CRUD de todos los usuarios
- ✅ CRUD de productos y rutas
- ✅ Gestión de clases
- ✅ Reportes y analytics
- ✅ Configuración del sistema

### Rol: Estudiante (Vista simplificada)
- ✅ Ver su dashboard personal
- ✅ Ver su progreso y logros
- ✅ Ver su equipo y ranking
- ✅ Ver historial de asistencias

---

## 🚀 Recomendaciones de Implementación

### Orden Sugerido de Desarrollo

1. **Empezar por Fase 1** (Flujo Tutor): Es el core del producto
2. **Fase 2** (Docentes): Permite operación completa del sistema
3. **Fase 3** (Admin): Herramientas de gestión
4. **Fase 4** (Gamificación): Engagement de estudiantes
5. **Fase 5** (Polish): UX y calidad

### Buenas Prácticas

- ✅ **Componentización**: Crear componentes reutilizables desde el inicio
- ✅ **TypeScript estricto**: Definir tipos para toda la data del backend
- ✅ **Loading states**: Siempre mostrar feedback visual en operaciones async
- ✅ **Error handling**: Manejo consistente de errores con toast notifications
- ✅ **Responsive design**: Mobile-first approach
- ✅ **Accessibility**: ARIA labels, keyboard navigation
- ✅ **Performance**: Code splitting, lazy loading, image optimization
- ✅ **SEO**: Metadata apropiado en páginas públicas

---

## 📦 Dependencias Adicionales a Considerar

### UI Libraries (Opcional)
- **Radix UI**: Componentes accesibles sin estilo
- **shadcn/ui**: Componentes con TailwindCSS
- **Headless UI**: Componentes accesibles de Tailwind Labs

### Utilidades
- **date-fns** o **dayjs**: Manejo de fechas
- **react-hook-form**: Formularios complejos
- **zod**: Validación de esquemas
- **react-query/tanstack-query**: Cache y sincronización de datos
- **framer-motion**: Animaciones avanzadas

### Notificaciones
- **sonner**: Toast notifications modernas
- **react-hot-toast**: Alternativa ligera

### Tablas
- **tanstack-table**: Tablas avanzadas con sorting/filtering

---

## 🎯 Métricas de Éxito

### Técnicas
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 200KB (initial)
- [ ] Test coverage > 70%

### UX
- [ ] Flujo completo de registro → pago → reserva funcional
- [ ] Mobile responsive en todas las páginas
- [ ] Feedback visual en todas las acciones
- [ ] Cero errores de consola en producción

---

## 📚 Documentación a Crear

Durante el desarrollo, crear:
- [ ] Guía de componentes (Storybook o documentación)
- [ ] Manual de usuario (capturas + pasos)
- [ ] Guía de deployment
- [ ] Changelog con versiones

---

**Última actualización**: 13 de octubre de 2025
**Estado**: Roadmap inicial - Listo para comenzar Fase 1
