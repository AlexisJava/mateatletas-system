# Context.md - Mateatletas Platform

## Vision General del Proyecto

Mateatletas es una plataforma educativa en linea tipo "Club House" o "gimnasio mental" que revoluciona el aprendizaje de STEAM mediante flexibilidad total de horarios. La plataforma fusiona educacion con gamificacion estilo videojuegos, creando una experiencia inmersiva para ninos y adolescentes (6-17 anos).

### Propuesta de Valor Central

- **Flexibilidad Total:** Los estudiantes acceden a clases en vivo cuando les conviene, sin horarios rigidos
- **Gamificacion Profunda:** Sistema de puntos, niveles, equipos y logros que motiva el aprendizaje continuo
- **Comunidad Activa:** Eventos grupales, competencias y colaboracion entre estudiantes
- **Tutor IA 24/7:** Asistente inteligente para practicar y resolver dudas en cualquier momento

---

## Stack Tecnologico

### Arquitectura: Monorepo

- **Herramienta:** Nx, Turborepo o PNPM Workspaces
- **Estructura:** `/apps/web` (Next.js) + `/apps/api` (NestJS) + `/libs` (codigo compartido)

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript (modo estricto)
- **Estilos:** Tailwind CSS
- **Estado Global:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios con interceptores
- **Forms:** React Hook Form
- **Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright o Cypress
- **Component Docs:** Storybook (opcional pero recomendado)

### Backend

- **Framework:** NestJS
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Autenticacion:** Supabase Auth + JWT
- **Validacion:** class-validator + class-transformer
- **Testing:** Jest + Supertest
- **Documentacion API:** Swagger/OpenAPI

### Infraestructura y Servicios

- **Base de Datos:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Pagos:** Mercado Pago (para LATAM)
- **Video Conferencias:** Jitsi Meet
- **IA:** OpenAI/Gemini para el Tutor IA
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (frontend) + servicio cloud para backend

---

## Modelo de Datos - Entidades Principales

### Usuarios

- **tutores:** Padres/responsables que gestionan suscripciones y estudiantes
- **estudiantes:** Ninos/adolescentes que participan en clases y cursos
- **docentes:** Profesores que imparten clases
- **administradores:** Staff con roles de gestion (SuperAdmin, SoporteNivel1)

### Comercial

- **productos:** Catalogo unificado (Suscripciones, Cursos, Recursos)
  - `modelo_cobro`: 'PagoUnico' | 'Recurrente'
  - `modelo_servicio`: 'CursoFijo' | 'AccesoFlexible'
- **membresias:** Suscripciones activas de tutores al Club House
- **inscripciones_cursos:** Compras de cursos de pago unico

### Academico

- **rutas_curriculares:** Categorias tematicas (Logica, Robotica, Programacion)
- **clases:** Sesiones en vivo con docente asignado
- **inscripciones:** Reservas de estudiantes a clases especificas
- **modulos:** Estructura interna de cursos
- **lecciones:** Contenido individual (Video, Texto, Tarea, Quiz, JuegoInteractivo)

### Gamificacion

- **equipos:** Grupos competitivos de estudiantes
- **acciones_puntuables:** Reglas de puntos (ej. "Razonamiento destacado" +5pts)
- **logros:** Insignias desbloqueables con requisitos especificos
- **puntos_obtenidos:** Registro transaccional de puntos ganados
- **logros_obtenidos:** Registro de insignias desbloqueadas

### Gestion

- **descuentos:** Codigos promocionales y reglas de descuento
- **notificaciones:** Registro de comunicaciones automaticas
- **alertas_estudiante:** Sistema proactivo de deteccion de problemas

---

## Sistema de Diseno - Identidad Visual

### Filosofia: "Crash Bandicoot Style"

La interfaz sigue los principios de "Energia Tactil" y "Tecno-Jungla", inspirada en la estetica de videojuegos de PlayStation 1 (Crash Bandicoot 1996).

### Principios Fundamentales

1. **Colores vibrantes y saturados** - Paleta limitada pero impactante
2. **Formas chunky e irregulares** - Elementos con diferentes anchos/altos para dinamismo
3. **Sombras duras sin blur** - Profundidad mediante sombras solidas tipo PS1
4. **Animaciones bouncy** - Movimientos exagerados y juguetones
5. **Legibilidad primero** - Sin sombras en texto, fuente clara
6. **Sin rotaciones** - Elementos con tamanos irregulares en lugar de inclinaciones

### Paleta de Colores

#### Primarios

- **Naranja:** `#FF8C00` (Acciones principales, CTAs)
- **Azul:** `#1E90FF` (Fondos de paneles, informacion)
- **Amarillo:** `#FFD700` (Progreso, XP, monedas)

#### Secundarios

- **Verde:** `#00CC44` (Exito, completado)
- **Rojo:** `#FF3333` (Errores, alertas)
- **Morado:** `#9933FF` (Elementos especiales, premium)

#### Neutros

- **Negro:** `#000000` (Texto principal, bordes, sombras)
- **Blanco:** `#FFFFFF` (Fondos, texto en oscuro)
- **Grises:** `#F5F5F5` a `#666666` (jerarquia de texto)

### Tipografia

- **Titulos y UI:** Lilita One (siempre con contorno negro grueso)
- **Cuerpo de texto:** Geist Sans (legibilidad maxima)

### Componentes Base

#### Sistema de Sombras (Chunky Style)

```css
/* Shadow SM */
box-shadow: 3px 3px 0px rgba(0, 0, 0, 1);

/* Shadow MD */
box-shadow: 5px 5px 0px rgba(0, 0, 0, 1);

/* Shadow LG */
box-shadow: 8px 8px 0px rgba(0, 0, 0, 1);

/* Shadow con Glow (hover) */
box-shadow:
  5px 5px 0px rgba(0, 0, 0, 1),
  0 0 20px rgba(255, 140, 0, 0.6);
```

#### Botones "Interruptor de Energia"

- **Estados:** Normal → Hover (elevacion) → Active (hundimiento)
- **Variantes:** Primario (Naranja), Secundario (Azul), Success (Verde), Danger (Rojo)
- **Caracteristicas:** Borde negro 4px, sombra chunky, transiciones rapidas (200ms)

#### Contenedores Unificados

- **Estructura:** Fondo color + borde negro grueso (4-6px) + sombra dura
- **Border Radius:** Asimetrico para dinamismo (rounded-tl-2xl rounded-tr-xl, etc.)
- **Uso universal:** Todas las tarjetas, paneles, modales

#### Barra de Energia (Progreso/XP)

- **Contenedor:** Gris oscuro con borde negro
- **Relleno:** Gradiente amarillo vibrante (3 tonos)
- **Efectos:** Brillo viajero + burbujas luminosas flotantes
- **Glow exterior:** rgba(255, 215, 0, 0.6)

---

## Arquitectura del Software

### Principios de Clean Architecture

1. **Separacion de Intereses:** Cada capa tiene una unica responsabilidad
2. **Alta Cohesion, Bajo Acoplamiento:** Codigo relacionado junto, modulos independientes
3. **Logica de Negocio como Rey:** Independiente del framework y BD

### Estructura Backend (NestJS)

```
/apps/api/src/
├── core/                  # Modulos transversales
│   ├── config/           # Variables de entorno
│   ├── database/         # Prisma service
│   ├── security/         # Guards, strategies JWT
│   └── common/           # Filtros, interceptors
│
├── modules/              # Corazon de la aplicacion (por dominio)
│   ├── auth/            # Registro, login, sesion
│   ├── usuarios/        # Tutores, Estudiantes, Docentes
│   ├── catalogo/        # Productos (Cursos, Suscripciones)
│   ├── academico/       # Clases, Inscripciones, Asistencia
│   ├── gamificacion/    # Puntos, Logros, Equipos, Niveles
│   ├── pagos/           # Mercado Pago, Membresias
│   └── admin/           # Panel Copiloto, Alertas
│
├── main.ts              # Punto de entrada
└── app.module.ts        # Modulo raiz
```

### Anatomia de un Modulo (Ejemplo: academico/inscripciones)

```
inscripciones/
├── inscripciones.module.ts        # Define el modulo
├── inscripciones.controller.ts    # Capa API (rutas HTTP)
├── inscripciones.service.ts       # Logica de negocio
├── dtos/
│   ├── crear-inscripcion.dto.ts  # Validacion de entrada
│   └── registrar-feedback.dto.ts
└── entities/
    └── inscripcion.entity.ts      # Definicion de dominio
```

### Flujo de una Peticion (POST /api/inscripciones)

1. **Controller:** Recibe peticion, valida DTO, extrae usuario del token JWT
2. **Service:** Ejecuta logica de negocio
   - Verifica que estudiante pertenece al tutor
   - Valida membresia activa
   - Comprueba cupo disponible
   - Crea inscripcion en transaccion
   - Actualiza contador de cupos
3. **Prisma:** Ejecuta queries SQL de forma segura y tipada
4. **Controller:** Devuelve respuesta con codigo HTTP apropiado

### Estructura Frontend (Next.js)

```
/apps/web/src/
├── app/                   # Rutas y paginas (App Router)
│   ├── (auth)/           # Grupo: login, registro
│   ├── (app)/            # Grupo: dashboards protegidos
│   ├── layout.tsx        # Layout raiz
│   └── globals.css       # Estilos globales + tokens Tailwind
│
├── components/           # UI reutilizable
│   ├── ui/              # Atomos (Button, Card, Input)
│   ├── features/        # Moleculas/Organismos (CompetitionPortalCard)
│   └── layout/          # Estructura (Header, Sidebar)
│
├── lib/                 # Configuraciones transversales
│   └── axios.ts         # Cliente HTTP centralizado
│
├── hooks/               # Custom Hooks
│   └── useAuth.ts       # Hook de sesion
│
├── store/               # Estado global (Zustand)
│   └── auth.store.ts    # Store de autenticacion
│
├── types/               # Definiciones TypeScript
│   └── api/             # Tipos que espejan la API
│
└── constants/           # Constantes de la app
```

### Seguridad End-to-End

#### Backend (NestJS)

- **JwtAuthGuard:** Valida token en cada peticion protegida
- **RolesGuard:** Verifica permisos basados en roles
- **Decorador @Roles:** Define roles permitidos por endpoint
- **RLS (Row Level Security):** Politicas en PostgreSQL para acceso a datos

#### Frontend (Next.js)

- **Zustand Store:** Persiste token JWT y perfil de usuario
- **Axios Interceptor (Request):** Adjunta token automaticamente
- **Axios Interceptor (Response):** Maneja errores 401 (redirige a login)
- **Protected Layout:** Verifica autenticacion antes de renderizar rutas

---

## API v1.0 - Endpoints Principales

### Autenticacion (/auth)

- `POST /auth/v1/signup` - Registro de tutor (Supabase Auth)
- `POST /auth/v1/token?grant_type=password` - Login (Supabase Auth)
- `GET /api/perfiles/me` - Obtener perfil propio

### Catalogo (/api/productos)

- `GET /api/productos` - Listar productos (filtros: modelo_cobro, modelo_servicio)
- `POST /api/membresias` - Iniciar compra de suscripcion
- `POST /api/inscripciones-curso` - Comprar curso e inscribir estudiante

### Operacion Academica (/api/clases, /api/inscripciones)

- `GET /api/clases` - Calendario de clases (params: fecha_desde, fecha_hasta)
- `POST /api/inscripciones` - Inscribir estudiante a clase (solo Club House)
- `GET /api/clases/{id}/asistencia` - Lista de asistencia (docentes)
- `PATCH /api/inscripciones/{id}` - Registrar feedback y asistencia

### Gamificacion

- `POST /api/puntos-otorgados` - Otorgar puntos a estudiante
- `POST /api/lecciones/{id}/completar` - Marcar leccion como completada (automatizacion)

### Panel Copiloto (/api/alertas)

- `GET /api/alertas` - Listar alertas de estudiantes (admin)
- `PATCH /api/alertas/{id}` - Gestionar alerta (cambiar estado, asignar)

### Webhooks

- `POST /api/webhooks/mercado-pago` - Receptor de notificaciones de pago

### Formato de Respuesta de Error (Unificado)

```json
{
  "statusCode": 403,
  "message": "Tu membresia no se encuentra activa para realizar inscripciones.",
  "error": "Forbidden",
  "timestamp": "2025-10-11T04:05:12.345Z",
  "path": "/api/inscripciones"
}
```

---

## Estrategia de Testing (Piramide de Pruebas)

### Nivel 1: Pruebas Unitarias (Base - Muchas y Rapidas)

**Backend (Jest):**

- Servicios aislados con mocks de Prisma
- Validacion de logica de negocio pura
- Ejemplo: `InscripcionesService.crearInscripcion()` maneja correctamente casos de exito/error

**Frontend (Vitest + React Testing Library):**

- Componentes UI con diferentes props
- Hooks personalizados
- Ejemplo: Button muestra texto correcto y aplica estilos de variante

### Nivel 2: Pruebas de Integracion (Medio - Algunas)

**Backend (Jest + Supertest):**

- Flujo completo: Controlador → Servicio → Base de Datos
- Base de datos de prueba separada
- Ejemplo: POST /api/inscripciones crea registro en BD y actualiza cupos

**Frontend (Vitest + MSW):**

- Componentes complejos con data fetching
- Hooks que llaman a la API
- Ejemplo: CompetitionPortalCard renderiza correctamente con/sin clase proxima

### Nivel 3: Pruebas E2E (Cima - Pocas pero Criticas)

**Playwright/Cypress:**

- Flujos de usuario completos en navegador real
- Backend + Frontend + Base de Datos
- Ejemplos:
  - Login → Dashboard → Reservar clase → Verificar en BD
  - Registro → Comprar membresia → Inscribir estudiante → Ver progreso

### Cobertura Objetivo

- Backend core: >80%
- Frontend logica: >70%
- E2E: Al menos 1 flujo por funcionalidad critica

### Integracion Continua

- Tests unitarios + linters en cada push
- Tests de integracion en cada PR
- Tests E2E antes de merge a main
- Reportes de cobertura automaticos

---

## Fases de Desarrollo

### Fase 0: Setup del Entorno (COMPLETAR PRIMERO)

**Objetivo:** Monorepo funcional con estructura base

**Artefactos:**

- Monorepo configurado (Nx/Turborepo/PNPM)
- Apps Next.js y NestJS levantando "Hello World"
- TypeScript unificado (tsconfig base + especificos)
- ESLint + Prettier configurados
- Prisma inicializado con schema vacio
- PostgreSQL accesible
- CI/CD basico (GitHub Actions)

**Criterio de cierre:** `npm run start:api` y `npm run dev:web` funcionan sin errores

### Fase 1: Componentes UI Atomicos

**Objetivo:** Biblioteca de componentes reutilizables segun el Sistema de Diseno

**Artefactos:**

- Componentes en `/components/ui/`: Button, Card, Input, Modal, ProgressBar, Badge
- Tailwind configurado con tokens de diseno (colores, sombras chunky)
- Storybook con documentacion viva de componentes
- Hooks reutilizables: useAuth, useForm
- Pruebas unitarias basicas de componentes

**Criterio de cierre:** Design system implementado, componentes probados, reutilizacion verificada

### Fase 2: Modulos Funcionales (Auth, Clases, Usuarios, Pagos, Gamificacion)

**Objetivo:** Estructura modular completa con logica basica

**Artefactos Backend:**

- Modulos NestJS: auth, usuarios, catalogo, academico, gamificacion, pagos, admin
- Schema Prisma completo con todas las entidades
- Migraciones aplicadas a PostgreSQL
- Servicios con logica de negocio basica
- Endpoints iniciales (pueden devolver datos dummy)
- Guards de seguridad (JWT, Roles)

**Artefactos Frontend:**

- Paginas principales: login, registro, dashboards
- Navegacion entre vistas (con datos simulados)
- Stores globales (auth, etc.)
- Integracion de componentes UI en paginas

**Criterio de cierre:** Modularidad lograda, funcionalidad basica comprobada, navegacion funcional

### Fase 3: Integracion de API y Validaciones

**Objetivo:** Conectar frontend y backend completamente

**Artefactos:**

- Frontend consume endpoints reales del backend
- Validaciones robustas (class-validator en backend, React Hook Form en frontend)
- Contratos de tipos unificados (DTOs compartidos o generados)
- API completa segun especificacion
- Manejo de estados y sincronizacion (React Query, Zustand)
- Seguridad end-to-end implementada
- Gestion de errores y edge cases
- Documentacion API (Swagger)

**Criterio de cierre:** Flujos funcionales end-to-end, consistencia de datos garantizada, validaciones OK

### Fase 4: Testing Intensivo

**Objetivo:** Suite completa de pruebas

**Artefactos:**

- Pruebas unitarias exhaustivas (backend + frontend)
- Pruebas de integracion (backend con BD de prueba)
- Pruebas E2E (Playwright/Cypress)
- Informe de cobertura (>80% en core)
- CI ejecuta toda la suite automaticamente
- Bugs identificados y corregidos

**Criterio de cierre:** Suite de tests al 100%, cobertura adecuada, resiliencia demostrada

### Fase 5: Refactor, Documentacion Viva y Optimizacion

**Objetivo:** Pulir calidad antes de lanzamiento

**Artefactos:**

- Refactor de codigo critico (eliminar duplicacion, mejorar legibilidad)
- Organizacion impecable del repositorio
- Optimizaciones de rendimiento (indices DB, code splitting, lazy loading)
- Preparacion para produccion (Docker, variables de entorno, seguridad)
- Documentacion tecnica completa (ADRs, mapeo feature→commit→test)
- Manual de despliegue y operaciones
- Developer Guide actualizado

**Criterio de cierre:** Codigo limpio, documentacion sincronizada, rendimiento aceptable, checklist de lanzamiento completo

---

## Principios de Desarrollo

### 1. Contratos de Tipos Compartidos

- **Unica fuente de verdad:** DTOs en backend
- **Sincronizacion automatica:** Tipos TypeScript generados o compartidos
- **Validacion en compilacion:** Errores de tipo detectados antes de runtime
- **Ejemplo:** Si backend espera `clase_id: number`, frontend no puede compilar si envia string

### 2. Reutilizacion Progresiva

- **Construir una vez, usar en todas partes**
- **Componentes UI primero:** Atomos antes que organismos
- **Hooks y servicios centralizados:** No duplicar logica
- **Ejemplo:** `useAuth()` hook unico para toda la app, `Button` componente universal

### 3. Documentacion Viva

- **Registro de decisiones tecnicas** (ADRs)
- **Mapeo feature → commit → test** (trazabilidad total)
- **Contratos sincronizados:** Swagger generado del codigo
- **Auto-documentacion:** TypeScript + JSDoc + Storybook

### 4. Testing Continuo

- **Piramide de pruebas:** Muchas unitarias, algunas integracion, pocas E2E
- **Feedback rapido:** Tests unitarios en cada cambio
- **CI/CD:** Tests automaticos en cada push/PR
- **TDD cuando aplique:** Tests antes de implementar logica compleja

### 5. Seguridad por Diseno

- **JWT en todas las rutas protegidas**
- **RLS en PostgreSQL** (Row Level Security)
- **Validacion doble:** Backend (fuente de verdad) + Frontend (UX)
- **HTTPS, CORS, rate limiting** en produccion

---

## Flujos de Usuario Criticos

### 1. Registro e Inicio de Sesion (Tutor)

1. Tutor accede a pagina de registro
2. Completa formulario (nombre, email, password, DNI)
3. Backend crea usuario en Supabase Auth + perfil en tabla `tutores`
4. Frontend recibe JWT y guarda en Zustand store
5. Redireccion a dashboard del tutor

### 2. Compra de Membresia (Suscripcion Mensual)

1. Tutor navega a pagina de productos
2. Selecciona "Club Mateatletas - Acceso Total"
3. Click en "Suscribirse"
4. Backend crea registro en `membresias` (estado: Pendiente)
5. Backend genera preferencia de pago en Mercado Pago
6. Frontend redirige a checkout de Mercado Pago
7. Usuario completa pago
8. Webhook de Mercado Pago notifica al backend
9. Backend actualiza membresia (estado: Activa)
10. Tutor recibe email de confirmacion

### 3. Inscripcion a Clase en Vivo (Club House)

1. Tutor con membresia activa accede a calendario de clases
2. Filtra clases por ruta curricular (ej. Logica)
3. Selecciona clase "Escape Room Matematico - Miercoles 18hs"
4. Elige estudiante (su hijo) para inscribir
5. Backend valida:
   - Membresia activa
   - Estudiante pertenece al tutor
   - Cupo disponible en la clase
6. Backend crea inscripcion + actualiza contador de cupos
7. Frontend muestra confirmacion
8. Estudiante ve la clase en su dashboard

### 4. Asistencia y Feedback del Docente

1. Docente finaliza clase y accede a "Mis Clases"
2. Selecciona clase recien terminada
3. Ve lista de estudiantes inscritos
4. Para cada estudiante:
   - Marca asistencia (Asistio/Ausente)
   - Escribe observacion (ej. "Mostro gran perseverancia")
   - Otorga puntos (selecciona accion puntuable: "Superacion Personal +5")
5. Backend registra todo en BD
6. Sistema automatico:
   - Actualiza puntos totales del estudiante
   - Recalcula nivel si aplica
   - Genera alerta si observacion contiene palabras clave negativas
7. Tutor recibe notificacion de feedback

### 5. Leccion Autocompleta con Gamificacion

1. Estudiante accede a su dashboard
2. Navega a curso activo "Colonia de Robotica"
3. Ve "Mapa del Circuito" con lecciones
4. Selecciona "Leccion 3: Motores y Sensores"
5. Completa leccion (ve video + resuelve quiz)
6. Click en "Marcar como Completada"
7. Backend automaticamente:
   - Lee `puntos_por_completar` de la leccion (ej. 10pts)
   - Crea registro en `puntos_obtenidos`
   - Si `logro_desbloqueable_id` existe, desbloquea insignia
   - Actualiza progreso en curso
8. Frontend muestra modal de celebracion con puntos y logro ganados

---

## Palabras Clave para Busqueda de Contexto

### Tecnologias Core

- Next.js, NestJS, Prisma, PostgreSQL, Supabase, TypeScript
- Tailwind CSS, Zustand, TanStack Query, Axios
- Jest, Vitest, Playwright, Storybook

### Patrones y Arquitectura

- Monorepo, Clean Architecture, Modular Design
- DTOs, Guards, Interceptors, Middleware
- React Query, Custom Hooks, Atomic Design

### Dominios de Negocio

- Autenticacion, Usuarios, Tutores, Estudiantes, Docentes
- Productos, Membresias, Inscripciones, Clases
- Gamificacion, Puntos, Logros, Equipos, Niveles
- Pagos, Mercado Pago, Webhooks

### Sistema de Diseno

- Crash Bandicoot Style, Energia Tactil, Tecno-Jungla
- Chunky shadows, Border radius asimetrico, Animaciones bouncy
- Lilita One, Geist Sans, Interruptor de Energia
- Barra de Energia, Contenedor Unificado

### Testing y Calidad

- Piramide de pruebas, Unit tests, Integration tests, E2E
- Jest, Supertest, React Testing Library
- CI/CD, GitHub Actions, Coverage reports

---

## Comandos Utiles (Para Referencia)

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Levantar backend
npm run start:api

# Levantar frontend
npm run dev:web

# Levantar ambos en paralelo
npm run dev
```

### Prisma

```bash
# Generar cliente Prisma
npx prisma generate

# Crear migracion
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones en produccion
npx prisma migrate deploy

# Abrir Prisma Studio (UI para BD)
npx prisma studio
```

### Testing

```bash
# Tests unitarios backend
npm run test:api

# Tests unitarios frontend
npm run test:web

# Tests E2E
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Build y Deploy

```bash
# Build frontend
npm run build:web

# Build backend
npm run build:api

# Build ambos
npm run build
```

---

## Recursos Adicionales

### Documentacion Tecnica

- **Backend:** `documento-tecnico-del-backend.md`
- **Frontend:** `frontend-arquitectura.md`
- **Sistema de Diseno:** `design-system.md`
- **API:** `arquitectura-de-software.md` (seccion API v1.0)
- **Fases:** `manual-construccion-diseno-fases.md`

### Puntos de Entrada para AI Agents

- **Setup inicial:** Comenzar por Fase 0
- **UI/UX:** Revisar `design-system.md` y `brand-manual.tsx`
- **Backend:** Seguir estructura modular en `documento-tecnico-del-backend.md`
- **Frontend:** Aplicar patrones de `frontend-arquitectura.md`
- **Testing:** Implementar estrategia de `guia-de-construccion.md`

### Contacto y Soporte

- **Ubicacion:** Neuquen, Neuquen, AR
- **Zona horaria:** GMT-3 (Argentina)
- **Stack owner:** Proyecto Mateatletas

---

## Notas Importantes para AI Agents

1. **NUNCA modifiques el schema.prisma sin crear una migracion**
2. **SIEMPRE usa los componentes UI existentes antes de crear nuevos**
3. **VALIDA tipos TypeScript en compilacion, no en runtime**
4. **ESCRIBE tests para logica de negocio critica**
5. **DOCUMENTA decisiones tecnicas importantes en ADRs**
6. **SIGUE la convencion de nombres:** kebab-case para archivos, PascalCase para componentes
7. **RESPETA la estructura modular:** No mezcles dominios
8. **USA Tailwind:** No escribas CSS custom sin justificacion
9. **MANTÉN sincronizados:** DTOs backend ↔ Tipos frontend
10. **PRIORIZA seguridad:** JWT, RLS, validaciones dobles

---

---

## Estado Actual del Proyecto (Diciembre 2025)

### Métricas

- 64 modelos en Prisma
- 120+ índices de BD
- 334 tests pasando
- 144 endpoints protegidos con ParseUUIDPipe

### Completado

- ✅ FASE 0: Seguridad P0
- ✅ Índices de performance
- ✅ Corrección N+1 queries (4 optimizadas)
- ✅ Limpieza código legacy (Rutas Curriculares, Planificaciones)
- ✅ Limpieza ESLint (60 → 6 errores de config)
- ✅ Rename equipos → casas en frontend

### En Progreso

- 🔄 FASE 1: Infraestructura para escalar

### Pendiente

- ⏳ FASE 2: Migración ciudad-mateatletas
- ⏳ Sistema de Mundos y LMS
- ⏳ Migración Sectores → Mundos

### Modelo de Negocio 2026

- **Casas**: QUANTUM (6-9), VERTEX (10-12), PULSAR (13-17)
- **Mundos**: Matemática, Programación, Ciencias
- **Tiers**: ARCADE ($30k), ARCADE+ ($60k), PRO ($75k)
- **Target**: 5000 async + 200 sync para fin de 2026

**Version:** 1.0.0  
**Ultima actualizacion:** 2025-01-13  
**Mantenedor:** Equipo Mateatletas  
**Estado:** En desarrollo activo
