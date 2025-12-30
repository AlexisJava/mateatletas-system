# Auditoría Portal Estudiante - Mateatletas Ecosystem

**Fecha:** 2024-12-29
**Branch:** feature/admin-dashboard-v2
**Estado:** 🔴 Portal No Implementado (5% Frontend / 80% Backend)

---

## Resumen Ejecutivo

| Componente              | Completitud | Estado         |
| ----------------------- | ----------- | -------------- |
| Backend - Endpoints     | 80%         | ✅ Funcional   |
| Backend - Autenticación | 90%         | ✅ Funcional   |
| Backend - Gamificación  | 85%         | ✅ Funcional   |
| Frontend - Login        | 100%        | ✅ Funcional   |
| Frontend - Portal       | 5%          | ❌ Placeholder |
| Frontend - API Client   | 100%        | ✅ Preparado   |

---

## 1. BACKEND - ENDPOINTS DISPONIBLES

### 1.1 Endpoints Públicos del Estudiante

| Ruta                                | Método | Descripción                     | Guard                                  |
| ----------------------------------- | ------ | ------------------------------- | -------------------------------------- |
| `/auth/estudiante/login`            | POST   | Login (username + password)     | PUBLIC, Throttle(5/min)                |
| `/estudiantes/mi-proxima-clase`     | GET    | Próxima clase del estudiante    | JwtAuthGuard, RolesGuard(ESTUDIANTE)   |
| `/estudiantes/mis-companeros`       | GET    | Compañeros de su ClaseGrupo     | JwtAuthGuard, RolesGuard(ESTUDIANTE)   |
| `/estudiantes/mis-sectores`         | GET    | Sectores donde está inscrito    | JwtAuthGuard, RolesGuard(ESTUDIANTE)   |
| `/estudiantes/:id`                  | GET    | Mi perfil (con ownership guard) | JwtAuthGuard, EstudianteOwnershipGuard |
| `/estudiantes/:id/detalle-completo` | GET    | Perfil + gamificación + stats   | JwtAuthGuard, EstudianteOwnershipGuard |
| `/estudiantes/:id/avatar`           | PATCH  | Actualizar avatar (gradient)    | JwtAuthGuard, EstudianteOwnershipGuard |
| `/asistencia`                       | POST   | Auto-registro de asistencia     | JwtAuthGuard, RolesGuard(ESTUDIANTE)   |

### 1.2 Endpoints de Gamificación

| Ruta                               | Método | Descripción                       |
| ---------------------------------- | ------ | --------------------------------- |
| `/gamificacion/puntos`             | POST   | Registrar puntos (evento interno) |
| `/gamificacion/logros`             | GET    | Obtener logros desbloqueados      |
| `/gamificacion/logros/:id`         | GET    | Detalle de logro específico       |
| `/gamificacion/recursos`           | GET    | XP total y nivel actual           |
| `/gamificacion/recursos/historial` | GET    | Historial de puntos               |
| `/gamificacion/recursos/ranking`   | GET    | Ranking de casa/global            |
| `/gamificacion/racha`              | GET    | Racha de actividad                |

### 1.3 Endpoints de Contenidos

| Ruta                                 | Método | Descripción                  |
| ------------------------------------ | ------ | ---------------------------- |
| `/contenido-estudiante`              | GET    | Listar contenidos publicados |
| `/contenido-estudiante/:id`          | GET    | Ver contenido completo       |
| `/contenido-estudiante/:id/progreso` | PATCH  | Actualizar progreso          |

---

## 2. BACKEND - MODELO DE DATOS

### Modelo Estudiante (Prisma)

```prisma
model Estudiante {
  id                        String    @id @default(cuid())
  username                  String    @unique    // Para autenticación
  nombre                    String
  apellido                  String
  nivelEscolar              String               // Primaria, Secundaria, Universidad
  edad                      Int                  // 3-99 años
  email                     String?   @unique   // Opcional
  password_hash             String?              // Para login propio

  // Avatar
  avatarUrl                 String?              // Ready Player Me GLB
  avatar_gradient           Int       @default(0)

  // Relaciones
  tutor_id                  String
  tutor                     Tutor     @relation(...)
  casaId                    String?
  casa                      Casa?

  // Gamificación V2
  nivel_actual              Int       @default(1)
  recursos                  RecursosEstudiante?
  logros_desbloqueados      LogroEstudiante[]
  racha                     RachaEstudiante?

  // Inscripciones
  inscripciones_clase_grupo InscripcionClaseGrupo[]
  asistencias               Asistencia[]

  // Contenido educativo
  progresosContenido        ProgresoContenido[]

  roles                     Json      @default("[\"estudiante\"]")
}
```

### Relaciones Clave

```
Estudiante ─────┬────► Tutor (gestión)
                ├────► Casa (QUANTUM, VERTEX, PULSAR)
                ├────► RecursosEstudiante (XP, nivel)
                ├────► LogroEstudiante[] (logros)
                ├────► RachaEstudiante (racha diaria)
                ├────► InscripcionClaseGrupo[] (clases)
                ├────► Asistencia[] (historial)
                └────► ProgresoContenido[] (sandbox)
```

---

## 3. BACKEND - AUTENTICACIÓN

### Flujo de Login

```
1. POST /auth/estudiante/login
   Body: { username, password }

2. Buscar estudiante por username (único)

3. Verificar password (bcrypt + timing protection)

4. Generar JWT access token
   Payload: { sub: estudiante.id, role: 'estudiante' }

5. Token en httpOnly cookie (seguro)

6. Respuesta:
   {
     access_token,
     user: {
       id, nombre, apellido, edad, nivelEscolar,
       xp_total, nivel_actual,
       casa: { id, nombre, colorPrimary },
       role: 'estudiante'
     }
   }
```

### Seguridad Implementada

- ✅ Rate limiting: 5 intentos/minuto
- ✅ Password con bcrypt (12 rounds)
- ✅ Timing attack protection
- ✅ Token en httpOnly cookie
- ✅ CSRF protection en endpoints sensibles
- ✅ Token blacklist (detección de robo)

---

## 4. FRONTEND - ESTADO ACTUAL

### 4.1 Login de Estudiante ✅ COMPLETO

**Archivo:** `apps/web/src/app/estudiante-login/page.tsx`

- Formulario username + password
- UI con animaciones (Framer Motion)
- Error handling
- Redirige a `/estudiante` tras login exitoso

### 4.2 Layout Protegido ✅ COMPLETO

**Archivo:** `apps/web/src/app/estudiante/layout.tsx`

- Auth guard: solo permite role='estudiante'
- Redirige a dashboard correspondiente si es otro rol
- Loading state mientras valida sesión

### 4.3 Portal ❌ PLACEHOLDER

**Archivo:** `apps/web/src/app/estudiante/page.tsx`

```tsx
// Estado actual: solo mensaje placeholder
'Portal Estudiante - Página Placeholder';
'El nuevo frontend se está construyendo';
```

### 4.4 API Client ✅ PREPARADO

**Archivo:** `apps/web/src/lib/api/estudiantes.api.ts`

Endpoints ya implementados en cliente:

- `getProximaClase()`
- `getMisCompaneros()`
- `getMisSectores()`
- `updateAnimacion()`

---

## 5. GAPS IDENTIFICADOS

### 🔴 Críticos (para MVP)

| Gap                  | Backend                | Frontend     | Notas               |
| -------------------- | ---------------------- | ------------ | ------------------- |
| Dashboard estudiante | ✅ Endpoints listos    | ❌ No existe | Página principal    |
| Mis clases           | ✅ `/mi-proxima-clase` | ❌ No existe | Listado de clases   |
| Mi progreso          | ✅ `/detalle-completo` | ❌ No existe | Stats y logros      |
| Cambio de contraseña | ⚠️ Existe pero confuso | ❌ No existe | Endpoint compartido |

### 🟡 Importantes

| Gap                   | Backend              | Frontend     |
| --------------------- | -------------------- | ------------ |
| Contenidos educativos | ✅ Endpoints listos  | ❌ No existe |
| Ranking/Compañeros    | ✅ `/mis-companeros` | ❌ No existe |
| Perfil editable       | ⚠️ Parcial           | ❌ No existe |
| Notificaciones        | ⚠️ No filtrado       | ❌ No existe |

### 🟢 Nice to Have

| Gap               | Estado          |
| ----------------- | --------------- |
| Chat/Mensajería   | ❌ Sin backend  |
| Calendario visual | ❌ Sin endpoint |
| Desafíos/Quests   | ❌ Sin modelo   |
| Certificados      | ❌ Sin modelo   |

---

## 6. PLAN DE IMPLEMENTACIÓN

### FASE 1: Dashboard Básico

```
/estudiante/dashboard
├── Bienvenida con nombre y avatar
├── Próxima clase (con countdown)
├── XP y nivel actual
├── Racha de actividad
└── Quick stats (asistencias, logros)
```

**Endpoints a usar:**

- `GET /estudiantes/:id/detalle-completo`
- `GET /estudiantes/mi-proxima-clase`
- `GET /gamificacion/racha`

### FASE 2: Mis Clases

```
/estudiante/clases
├── Lista de clases inscritas
├── Horarios y docente
├── Estado de cada clase
└── Acceso a videollamada
```

**Endpoints a usar:**

- `GET /estudiantes/mis-sectores`
- `GET /estudiantes/mi-proxima-clase`

### FASE 3: Mi Progreso

```
/estudiante/progreso
├── Logros desbloqueados (galería)
├── Historial de puntos
├── Ranking en mi casa
└── Estadísticas de asistencia
```

**Endpoints a usar:**

- `GET /gamificacion/logros`
- `GET /gamificacion/recursos/historial`
- `GET /gamificacion/recursos/ranking`

### FASE 4: Contenidos

```
/estudiante/contenidos
├── Contenidos publicados
├── Progreso por contenido
├── Visualizador (Sandbox player)
└── Marcar completado
```

**Endpoints a usar:**

- `GET /contenido-estudiante`
- `GET /contenido-estudiante/:id`
- `PATCH /contenido-estudiante/:id/progreso`

### FASE 5: Perfil

```
/estudiante/perfil
├── Ver mis datos
├── Cambiar avatar
├── Cambiar contraseña
└── Ver mi tutor (sin email)
```

---

## 7. ARQUITECTURA PROPUESTA

### Estructura de Carpetas

```
apps/web/src/app/estudiante/
├── layout.tsx              ✅ Existe
├── page.tsx                → dashboard/page.tsx
├── dashboard/
│   └── page.tsx            → Dashboard principal
├── clases/
│   └── page.tsx            → Mis clases
├── progreso/
│   └── page.tsx            → Mi progreso
├── contenidos/
│   ├── page.tsx            → Lista
│   └── [id]/page.tsx       → Visor
└── perfil/
    └── page.tsx            → Mi perfil
```

### Componentes Necesarios

```
components/estudiante/
├── DashboardCard.tsx       → Card reutilizable
├── ProximaClaseCard.tsx    → Próxima clase con countdown
├── XpProgress.tsx          → Barra de progreso XP
├── RachaIndicator.tsx      → Indicador de racha
├── LogroCard.tsx           → Card de logro
├── ClaseCard.tsx           → Card de clase
└── RankingList.tsx         → Lista de ranking
```

### State Management

```typescript
// stores/estudiante-portal.store.ts
interface EstudiantePortalState {
  // Perfil
  perfil: EstudianteDetalle | null;

  // Clases
  proximaClase: Clase | null;
  misClases: Clase[];

  // Gamificación
  logros: Logro[];
  ranking: RankingEntry[];
  racha: Racha | null;

  // Contenidos
  contenidos: Contenido[];
  progresos: Map<string, number>;

  // UI
  isLoading: boolean;
  error: string | null;
}
```

---

## 8. CHECKLIST PRE-DESARROLLO

### Backend (ya listo)

- [x] Endpoint de login estudiante
- [x] Endpoint detalle completo
- [x] Endpoint próxima clase
- [x] Endpoint mis compañeros
- [x] Endpoint mis sectores
- [x] Endpoints de gamificación
- [x] Endpoints de contenidos
- [x] Guards de ownership
- [x] Rate limiting

### Frontend (pendiente)

- [x] Login de estudiante
- [x] Layout protegido
- [x] API client preparado
- [x] Tipos TypeScript
- [ ] Dashboard
- [ ] Mis clases
- [ ] Mi progreso
- [ ] Contenidos
- [ ] Perfil
- [ ] Store de portal

---

## 9. ESTIMACIÓN DE ESFUERZO

| Fase        | Complejidad | Dependencias               |
| ----------- | ----------- | -------------------------- |
| Dashboard   | Media       | Ninguna                    |
| Mis Clases  | Baja        | Dashboard                  |
| Mi Progreso | Media       | Dashboard                  |
| Contenidos  | Alta        | Dashboard + Sandbox player |
| Perfil      | Baja        | Dashboard                  |

**Orden recomendado:** Dashboard → Clases → Progreso → Perfil → Contenidos

---

## 10. NOTAS TÉCNICAS

### Autenticación

El estudiante usa `username` (no email) para login. El username se genera automáticamente al crear el estudiante:

```
formato: nombre.apellido.xxxx
ejemplo: juan.perez.a3k9
```

### Ownership Guard

El `EstudianteOwnershipGuard` permite:

1. Estudiante accede a SU propio perfil
2. Tutor accede a SUS estudiantes
3. Admin/Docente accede a cualquiera

### Gamificación

Sistema de casas (QUANTUM, VERTEX, PULSAR) con:

- XP por acciones (asistencia, participación, logros)
- Niveles (1-∞)
- Logros con rareza (COMÚN, RARO, ÉPICO, LEGENDARIO)
- Ranking por casa y global
- Racha de actividad diaria

---

_Documento generado por auditoría de Claude Code_
_Última actualización: 2024-12-29_
