# Auditoría Completa del Portal de Estudiantes

**Fecha:** 2025-12-08
**Estado:** Documentación completa
**Versión:** 1.0

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Modelo de Datos: Estudiante](#modelo-de-datos-estudiante)
3. [Sistema de Autenticación](#sistema-de-autenticación)
4. [Contrato API - Endpoints Disponibles](#contrato-api---endpoints-disponibles)
5. [Arquitectura Frontend](#arquitectura-frontend)
6. [Plan de Eliminación Ready Player Me](#plan-de-eliminación-ready-player-me)
7. [Próximos Pasos](#próximos-pasos)

---

## Resumen Ejecutivo

### Estado General

| Área            | Estado                          | Detalles                             |
| --------------- | ------------------------------- | ------------------------------------ |
| Backend API     | 90% funcional                   | Falta progress tracking de lecciones |
| Frontend Portal | Funcional pero sobre-engineered | HubView.tsx con 1,828 líneas         |
| Tests           | 97% passing                     | 1,824 passing, 56 failing            |
| ESLint          | 128 errores                     | Principalmente vars sin usar         |
| Ready Player Me | Pendiente eliminación           | 12 archivos a borrar                 |

### Métricas del Código

- **Total líneas frontend estudiante:** 15,822
- **Total archivos:** 73
- **Stores Zustand:** 13 (1 no usado)
- **Hooks React Query:** 8+
- **Componentes UI:** 50+

### Veredicto

**OPCIÓN B - Complicado pero simplificable**

- El código funciona y está tipado
- Hay sobre-ingeniería en algunos lugares (HubView.tsx)
- Se puede simplificar en 15-20 horas de trabajo
- No requiere reescritura completa

---

## Modelo de Datos: Estudiante

### Schema Prisma

```prisma
model Estudiante {
  id                    String    @id @default(uuid())
  username              String    @unique
  email                 String?   @unique
  password_hash         String
  nombre                String
  apellido              String?
  fecha_nacimiento      DateTime?
  grado                 Int?
  colegio               String?
  ciudad                String?
  pais                  String    @default("Argentina")
  avatar_url            String?   // URL del avatar 2D (foto de perfil)

  // Gamificación
  puntos_totales        Int       @default(0)
  nivel_actual          Int       @default(1)
  xp_actual             Int       @default(0)
  xp_siguiente_nivel    Int       @default(100)
  monedas               Int       @default(0)
  gemas                 Int       @default(0)

  // Ready Player Me (A DEPRECAR)
  avatarUrl             String?   // URL del avatar 3D de RPM
  animacion_idle_url    String?   // URL de animación idle
  avatar_gradient       String?   // Gradiente de fondo

  // Relaciones
  casaId                String?
  casa                  Casa?     @relation(fields: [casaId], references: [id])
  tutor_id              String?
  tutor                 Tutor?    @relation(fields: [tutor_id], references: [id])

  // Timestamps
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  ultimo_login          DateTime?

  // Relaciones principales
  clases                ClaseEstudiante[]
  logros                LogroEstudiante[]
  progreso_lecciones    ProgresoLeccion[]
  progreso_actividades  ProgresoEstudianteActividad[]
  transacciones         TransaccionRecurso[]
  compras               CompraEstudiante[]
  rachas                RachaEstudiante[]
  puntos_casa           PuntosCasa[]
}
```

### Campos a Deprecar (Ready Player Me)

| Campo                | Tipo    | Uso Actual        | Acción   |
| -------------------- | ------- | ----------------- | -------- |
| `avatarUrl`          | String? | URL avatar 3D RPM | Eliminar |
| `animacion_idle_url` | String? | Animación idle    | Eliminar |
| `avatar_gradient`    | String? | Gradiente fondo   | Eliminar |

---

## Sistema de Autenticación

### Flujo de Login

```
1. POST /auth/estudiante/login
   - Body: { username, password }
   - Response: { access_token, user: EstudianteDto }
   - Cookie: jwt (httpOnly, secure, sameSite: strict)

2. Todas las requests posteriores:
   - Header: Authorization: Bearer <token>
   - O cookie jwt automática

3. Logout:
   - POST /auth/logout
   - Token agregado a blacklist en Redis
```

### Seguridad Implementada

- JWT con expiración configurable (default: 7 días)
- Cookies httpOnly para prevenir XSS
- Rate limiting: 10 intentos/15 min por IP
- Blacklist de tokens en Redis
- Passwords hasheados con bcrypt (salt rounds: 12)

---

## Contrato API - Endpoints Disponibles

### 1. Autenticación

#### POST /auth/estudiante/login

- **Rol requerido:** Ninguno (público)
- **Body:**

```typescript
{
  username: string; // Requerido
  password: string; // Requerido
}
```

- **Response 200:**

```typescript
{
  access_token: string;
  user: {
    id: string;
    username: string;
    nombre: string;
    apellido?: string;
    email?: string;
    nivel_actual: number;
    puntos_totales: number;
    avatar_url?: string;
  }
}
```

- **Errores:** 401 (credenciales inválidas), 429 (rate limit)

#### GET /auth/profile

- **Rol requerido:** `estudiante`
- **Response 200:** Mismo formato que login user
- **Errores:** 401 (no autenticado)

#### POST /auth/logout

- **Rol requerido:** `estudiante`
- **Response 200:** `{ message: "Logout exitoso" }`

#### POST /auth/change-password

- **Rol requerido:** `estudiante`
- **Body:**

```typescript
{
  currentPassword: string;
  newPassword: string; // Min 8 caracteres
}
```

- **Response 200:** `{ message: "Contraseña actualizada" }`
- **Errores:** 400 (contraseña actual incorrecta)

---

### 2. Perfil del Estudiante

#### GET /estudiantes/mi-avatar

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
{
  hasAvatar: boolean;
  avatarUrl?: string;
  animacion_idle_url?: string;
}
```

- **Estado:** A DEPRECAR con eliminación de RPM

#### GET /estudiantes/mi-proxima-clase

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
{
  id: string;
  nombre: string;
  fecha: string;        // ISO date
  hora_inicio: string;  // "HH:mm"
  hora_fin: string;
  docente: {
    nombre: string;
    apellido: string;
  };
  zoom_link?: string;
}
```

- **Response 404:** No hay clases programadas

#### GET /estudiantes/mis-companeros

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
Array<{
  id: string;
  nombre: string;
  apellido?: string;
  avatar_url?: string;
  nivel_actual: number;
  puntos_totales: number;
}>;
```

#### GET /estudiantes/mis-sectores

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
Array<{
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  emoji: string;
  orden: number;
}>;
```

#### PATCH /estudiantes/avatar _(A ELIMINAR)_

- **Estado:** Será eliminado con RPM

#### PATCH /estudiantes/animacion _(A ELIMINAR)_

- **Estado:** Será eliminado con RPM

---

### 3. Gamificación - Recursos

#### GET /gamificacion/recursos/:estudianteId

- **Rol requerido:** `estudiante` (solo propio ID)
- **Response 200:**

```typescript
{
  xp_actual: number;
  xp_siguiente_nivel: number;
  nivel_actual: number;
  monedas: number;
  gemas: number;
  puntos_totales: number;
  racha: {
    dias_consecutivos: number;
    mejor_racha: number;
    ultima_actividad: string; // ISO date
    activo_hoy: boolean;
  }
}
```

#### GET /gamificacion/recursos/:estudianteId/historial

- **Rol requerido:** `estudiante`
- **Query params:** `?limit=50&offset=0&tipo=XP|MONEDAS|GEMAS`
- **Response 200:**

```typescript
Array<{
  id: string;
  tipo: 'XP' | 'MONEDAS' | 'GEMAS';
  cantidad: number; // Positivo o negativo
  motivo: string;
  fecha: string; // ISO date
  balance_anterior: number;
  balance_nuevo: number;
}>;
```

#### POST /gamificacion/recursos/:estudianteId/racha

- **Rol requerido:** `estudiante`
- **Descripción:** Registra actividad del día (actualiza racha)
- **Response 200:**

```typescript
{
  dias_consecutivos: number;
  mejor_racha: number;
  bonus_aplicado: boolean;
  bonus_xp?: number;        // Si aplica bonus por racha
}
```

- **Nota:** Idempotente - múltiples calls mismo día no duplican

#### GET /gamificacion/recursos/:estudianteId/racha

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
{
  dias_consecutivos: number;
  mejor_racha: number;
  ultima_actividad: string;
  activo_hoy: boolean;
  proxima_recompensa: {
    dias_restantes: number;
    recompensa: string;
  }
}
```

---

### 4. Gamificación - Logros

#### GET /gamificacion/logros

- **Rol requerido:** `estudiante`
- **Descripción:** Lista todos los logros disponibles en el sistema
- **Response 200:**

```typescript
Array<{
  id: string;
  codigo: string; // Ej: "PRIMERA_VICTORIA"
  nombre: string;
  descripcion: string;
  icono: string; // Emoji o URL
  categoria: 'EJERCICIOS' | 'RACHA' | 'SOCIAL' | 'ESPECIAL';
  puntos_recompensa: number;
  monedas_recompensa: number;
  requisito_cantidad?: number;
  requisito_tipo?: string;
  orden: number;
}>;
```

#### GET /gamificacion/logros/estudiante/:estudianteId

- **Rol requerido:** `estudiante`
- **Descripción:** Logros del estudiante con estado
- **Response 200:**

```typescript
Array<{
  id: string;
  logro: Logro; // Objeto logro completo
  desbloqueado: boolean;
  fecha_desbloqueo?: string;
  progreso_actual?: number;
  progreso_objetivo?: number;
}>;
```

#### GET /gamificacion/logros/estudiante/:estudianteId/recientes

- **Rol requerido:** `estudiante`
- **Query params:** `?limite=5`
- **Response 200:** Array de logros desbloqueados ordenados por fecha

#### POST /gamificacion/logros/verificar/:estudianteId

- **Rol requerido:** `estudiante`
- **Descripción:** Verifica y desbloquea logros pendientes
- **Response 200:**

```typescript
{
  logros_nuevos: Array<{
    logro: Logro;
    fecha_desbloqueo: string;
  }>;
  total_desbloqueados: number;
}
```

---

### 5. Tienda

#### GET /gamificacion/tienda/items

- **Rol requerido:** `estudiante`
- **Query params:** `?categoria=CURSO|ITEM|AVATAR&activo=true`
- **Response 200:**

```typescript
Array<{
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url?: string;
  categoria: 'CURSO' | 'ITEM' | 'AVATAR';
  precio_monedas: number;
  precio_gemas?: number;
  stock?: number; // null = ilimitado
  disponible: boolean;
  requisito_nivel?: number;
}>;
```

#### POST /gamificacion/tienda/comprar

- **Rol requerido:** `estudiante`
- **Body:**

```typescript
{
  item_id: string;
  cantidad?: number;       // Default: 1
  usar_gemas?: boolean;    // Default: false (usar monedas)
}
```

- **Response 200:**

```typescript
{
  compra: {
    id: string;
    item: ItemTienda;
    cantidad: number;
    precio_total: number;
    moneda_usada: 'MONEDAS' | 'GEMAS';
    fecha: string;
  }
  balance_actual: {
    monedas: number;
    gemas: number;
  }
}
```

- **Errores:**
  - 400 (saldo insuficiente)
  - 400 (nivel insuficiente)
  - 400 (sin stock)
  - 404 (item no existe)

#### GET /gamificacion/tienda/mis-compras

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
Array<{
  id: string;
  item: ItemTienda;
  cantidad: number;
  precio_pagado: number;
  moneda_usada: string;
  fecha: string;
  estado: 'COMPLETADA' | 'PENDIENTE' | 'CANJEADA';
}>;
```

---

### 6. Sistema de Casas

#### GET /casas

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
Array<{
  id: string;
  nombre: string; // "Dragones", "Fénix", etc.
  descripcion: string;
  color: string; // Hex color
  escudo_url: string;
  puntos_totales: number;
  posicion_ranking: number;
  miembros_count: number;
}>;
```

#### GET /casas/:id

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
{
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  escudo_url: string;
  puntos_totales: number;
  posicion_ranking: number;
  miembros: Array<{
    id: string;
    nombre: string;
    apellido?: string;
    avatar_url?: string;
    puntos_aportados: number;
  }>;
  historial_puntos: Array<{
    fecha: string;
    puntos: number;
    motivo: string;
  }>;
}
```

#### GET /casas/mi-casa

- **Rol requerido:** `estudiante`
- **Response 200:** Mismo formato que GET /casas/:id
- **Response 404:** Estudiante sin casa asignada

#### GET /casas/ranking

- **Rol requerido:** `estudiante`
- **Response 200:**

```typescript
Array<{
  posicion: number;
  casa: {
    id: string;
    nombre: string;
    color: string;
    escudo_url: string;
  };
  puntos_totales: number;
  diferencia_anterior?: number; // vs posición anterior
}>;
```

---

### Resumen de Endpoints

| Categoría     | Cantidad | Estado                |
| ------------- | -------- | --------------------- |
| Autenticación | 4        | ✅ 100% funcional     |
| Perfil        | 6        | ⚠️ 2 a eliminar (RPM) |
| Recursos      | 4        | ✅ 100% funcional     |
| Logros        | 4        | ✅ 100% funcional     |
| Tienda        | 3        | ✅ 100% funcional     |
| Casas         | 4        | ✅ 100% funcional     |
| **TOTAL**     | **25**   | **90% funcional**     |

### Endpoints Faltantes (Gap Analysis)

| Endpoint Necesario                     | Prioridad | Notas                       |
| -------------------------------------- | --------- | --------------------------- |
| GET /estudiantes/mi-progreso-lecciones | Alta      | Modelo existe, endpoint no  |
| GET /estudiantes/mi-calendario         | Media     | Para ver clases programadas |
| PATCH /estudiantes/perfil              | Media     | Editar datos básicos        |
| GET /estudiantes/mis-actividades       | Media     | Historial de actividades    |

---

## Arquitectura Frontend

### Estructura de Carpetas

```
apps/web/src/app/estudiante/
├── gimnasio/                    # Hub principal (1,828 líneas)
│   ├── page.tsx                 # Entry point
│   ├── views/
│   │   ├── HubView.tsx          # Vista principal (REFACTORIZAR)
│   │   ├── AnimacionesView.tsx  # Selector animaciones (ELIMINAR)
│   │   └── ...
│   ├── components/
│   │   ├── OverlayStack.tsx     # Sistema de navegación
│   │   ├── SectorButton.tsx     # Botones de sectores
│   │   └── ...
│   └── types/
│       └── overlay.types.ts     # Tipos del overlay system
├── gamificacion/
│   ├── page.tsx                 # Dashboard gamificación
│   └── logros/
│       └── page.tsx             # Lista de logros
├── crear-avatar/                # Creación avatar RPM (ELIMINAR)
│   └── page.tsx
├── perfil/
│   └── page.tsx
└── layout.tsx
```

### Stores Zustand

| Store              | Archivo                           | Usado | Notas                       |
| ------------------ | --------------------------------- | ----- | --------------------------- |
| auth.store         | `store/auth.store.ts`             | ✅    | Login, logout, user         |
| estudiante.store   | `store/estudiante.store.ts`       | ✅    | Datos estudiante            |
| overlay.store      | `gimnasio/store/overlay.store.ts` | ✅    | Stack de overlays           |
| ejercicios.store   | `store/ejercicios.store.ts`       | ✅    | Estado ejercicios           |
| gamificacion.store | `store/gamificacion.store.ts`     | ❌    | Reemplazado por React Query |

### Hooks React Query

```typescript
// hooks/useRecursos.ts
useRecursos(estudianteId); // XP, monedas, nivel
useHistorialRecursos(estudianteId); // Transacciones
useRacha(estudianteId); // Racha actual
useRegistrarActividad(estudianteId); // Mutation racha

// hooks/useLogros.ts
useLogros(estudianteId); // Todos los logros
useLogrosRecientes(estudianteId, n); // Últimos N logros
useVerificarLogros(estudianteId); // Mutation verificar

// hooks/useTienda.ts
useItemsTienda(); // Items disponibles
useMisCompras(estudianteId); // Historial compras
useComprar(estudianteId); // Mutation comprar
```

### Sistema de Navegación Overlay

```typescript
// Tipos de overlay disponibles
type OverlayConfig =
  | { type: 'mi-grupo' }
  | { type: 'mis-logros' }
  | { type: 'entrenamientos' }
  | { type: 'planificacion'; codigo?: string; tema?: PlanificacionTema }
  | { type: 'tareas-asignadas' }
  | {
      type: 'planificaciones-sector';
      sectorNombre: string;
      sectorColor: string;
      sectorEmoji: string;
    }
  | { type: 'actividad'; semanaId?: string }
  | { type: 'laboratorio-ecosistema'; semanaId?: string }
  | { type: 'ejecutar-actividad'; actividadId?: string; semanaId?: string }
  | { type: 'mis-cursos' }
  | { type: 'mi-progreso' }
  | { type: 'tienda' }
  | { type: 'notificaciones' }
  | { type: 'ajustes' }
  | { type: 'ranking' }
  | { type: 'animaciones' }; // A ELIMINAR

// Uso
const { push, pop, clear } = useOverlayStack();
push({ type: 'tienda' });
push({ type: 'planificacion', codigo: 'ASTRO-001' });
```

---

## Plan de Eliminación Ready Player Me

### Archivos a ELIMINAR (12 archivos)

```bash
# Componentes 3D
apps/web/src/components/3d/AnimatedAvatar3D.tsx      # 266 líneas
apps/web/src/components/3d/CompactAvatar3D.tsx       # 76 líneas
apps/web/src/components/3d/AvatarPreviewCard.tsx     # 120 líneas
apps/web/src/components/3d/FloatingAvatar.tsx        # 89 líneas

# Páginas
apps/web/src/app/estudiante/crear-avatar/page.tsx    # 373 líneas
apps/web/src/app/estudiante/gimnasio/views/AnimacionesView.tsx  # 371 líneas

# Hooks
apps/web/src/hooks/useStudentAnimations.ts           # 150 líneas
apps/web/src/hooks/useAvatarLoader.ts                # 85 líneas

# Configuración
apps/web/src/lib/ready-player-me.config.ts           # 60 líneas

# Assets
apps/web/public/animations/*.glb                     # Varios archivos
apps/web/public/avatars/*.glb                        # Avatares default
```

### Archivos a MODIFICAR (18 archivos)

| Archivo                                | Cambio                                       |
| -------------------------------------- | -------------------------------------------- |
| `gimnasio/views/HubView.tsx`           | Remover AnimatedAvatar3D, usar StudentAvatar |
| `gimnasio/types/overlay.types.ts`      | Remover type 'animaciones'                   |
| `gimnasio/components/OverlayStack.tsx` | Remover case animaciones                     |
| `gimnasio/store/overlay.store.ts`      | Limpiar refs a animaciones                   |
| `components/layout/StudentHeader.tsx`  | Usar StudentAvatar                           |
| `components/ui/StudentCard.tsx`        | Usar StudentAvatar                           |
| `app/estudiante/layout.tsx`            | Remover redirect a crear-avatar              |
| `app/estudiante/perfil/page.tsx`       | Usar StudentAvatar                           |
| `hooks/useEstudiante.ts`               | Remover refs a avatarUrl 3D                  |
| `store/estudiante.store.ts`            | Remover campos 3D                            |
| `types/estudiante.ts`                  | Remover campos 3D                            |

### Endpoints a ELIMINAR (3 endpoints)

```typescript
// apps/api/src/estudiantes/estudiantes.controller.ts
PATCH / estudiantes / avatar; // Guardar URL avatar 3D
PATCH / estudiantes / animacion; // Guardar animación idle
GET / estudiantes / animaciones; // Listar animaciones disponibles
```

### Dependencias npm a DESINSTALAR (7 paquetes)

```bash
npm uninstall @readyplayerme/react-avatar-creator
npm uninstall @react-three/fiber
npm uninstall @react-three/drei
npm uninstall three
npm uninstall three-stdlib
npm uninstall @react-spring/three
npm uninstall postprocessing
```

### Campos de BD a Deprecar

```sql
-- No eliminar inmediatamente, marcar como deprecated
-- apps/api/prisma/schema.prisma
-- En modelo Estudiante:
avatarUrl           String?   @deprecated
animacion_idle_url  String?   @deprecated
avatar_gradient     String?   @deprecated
```

### Nuevo Flujo Sin RPM

```
ANTES:
Login → /crear-avatar (si no tiene) → /gimnasio

DESPUÉS:
Login → /gimnasio (directo, avatar 2D con iniciales)
```

### Componente de Reemplazo

```typescript
// apps/web/src/components/ui/StudentAvatar.tsx (YA EXISTE)
export function StudentAvatar({
  nombre,
  apellido,
  avatar_url, // Foto de perfil 2D (opcional)
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) {
  // Si hay avatar_url (foto), mostrarla
  // Si no, mostrar círculo con gradiente + iniciales
  // Color del gradiente basado en hash del nombre
}
```

### Tiempo Estimado

| Tarea                       | Horas          |
| --------------------------- | -------------- |
| Eliminar archivos           | 0.5            |
| Modificar HubView.tsx       | 2              |
| Modificar otros 17 archivos | 3              |
| Eliminar endpoints API      | 1              |
| Desinstalar dependencias    | 0.5            |
| Testing y fixes             | 2              |
| **TOTAL**                   | **9-10 horas** |

---

## Próximos Pasos

### Prioridad Alta

1. **Ejecutar eliminación de Ready Player Me**
   - Seguir plan detallado arriba
   - Tiempo: 9-10 horas
   - Impacto: Reduce 7 dependencias, simplifica código

2. **Refactorizar HubView.tsx**
   - Dividir en 4-5 componentes
   - De 1,828 líneas a ~400-600 por componente
   - Tiempo: 4-6 horas

### Prioridad Media

3. **Implementar endpoints faltantes**
   - GET /estudiantes/mi-progreso-lecciones
   - GET /estudiantes/mi-calendario
   - Tiempo: 4-6 horas

4. **Limpiar código legacy**
   - Eliminar gamificacion.store.ts (no usado)
   - Eliminar archivos .bak y .old.tsx
   - Tiempo: 1 hora

### Prioridad Baja

5. **Mejorar tests**
   - Arreglar 56 tests failing
   - Agregar coverage al frontend
   - Tiempo: 8-10 horas

---

## Apéndice: Archivos Clave

### Backend

| Archivo                                              | Descripción              |
| ---------------------------------------------------- | ------------------------ |
| `apps/api/prisma/schema.prisma`                      | Modelo de datos completo |
| `apps/api/src/auth/auth.controller.ts`               | Endpoints autenticación  |
| `apps/api/src/estudiantes/estudiantes.controller.ts` | Endpoints estudiante     |
| `apps/api/src/gamificacion/controllers/*.ts`         | Endpoints gamificación   |
| `apps/api/src/casas/casas.controller.ts`             | Endpoints casas          |

### Frontend

| Archivo                                                  | Descripción         |
| -------------------------------------------------------- | ------------------- |
| `apps/web/src/app/estudiante/gimnasio/views/HubView.tsx` | Hub principal       |
| `apps/web/src/components/ui/StudentAvatar.tsx`           | Avatar 2D           |
| `apps/web/src/hooks/useRecursos.ts`                      | Hook recursos       |
| `apps/web/src/hooks/useLogros.ts`                        | Hook logros         |
| `apps/web/src/store/auth.store.ts`                       | Store autenticación |

---

_Documento generado: 2025-12-08_
_Próxima revisión recomendada: Después de eliminar Ready Player Me_
