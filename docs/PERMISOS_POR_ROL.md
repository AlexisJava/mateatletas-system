# Matriz de Permisos por Rol - Mateatletas

**Última actualización:** Octubre 13, 2025
**Versión:** 1.0

---

## Roles del Sistema

El sistema tiene 3 roles principales:

1. **Admin** - Administrador con control total del sistema
2. **Docente** - Profesores que imparten clases
3. **Tutor** - Padres/tutores que gestionan estudiantes

---

## Matriz de Permisos

### 🔐 Autenticación (Sin autenticación requerida)

| Endpoint | Descripción | Público |
|----------|-------------|---------|
| POST `/api/auth/register` | Registro de tutor | ✅ |
| POST `/api/auth/login` | Login | ✅ |
| POST `/api/docentes-public` | Registro de docente | ✅ |
| GET `/api/docentes-public` | Listar docentes públicos | ✅ |

---

### 👨‍👩‍👧‍👦 Estudiantes

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| POST `/api/estudiantes` | ❌ | ❌ | ✅ | Crear estudiante (propio) |
| GET `/api/estudiantes` | ❌ | ❌ | ✅ | Listar estudiantes propios |
| GET `/api/estudiantes/:id` | ❌ | ❌ | ✅ | Ver detalle de estudiante propio |
| PATCH `/api/estudiantes/:id` | ❌ | ❌ | ✅ | Actualizar estudiante propio |
| DELETE `/api/estudiantes/:id` | ❌ | ❌ | ✅ | Eliminar estudiante propio |

> **Nota:** Los tutores solo pueden gestionar sus propios estudiantes. El backend valida la propiedad.

---

### 🏆 Equipos

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| POST `/api/equipos` | ❌ | ❌ | ✅ | Crear equipo |
| GET `/api/equipos` | ❌ | ❌ | ✅ | Listar equipos propios |
| GET `/api/equipos/:id` | ❌ | ❌ | ✅ | Ver detalle de equipo |
| PATCH `/api/equipos/:id` | ❌ | ❌ | ✅ | Actualizar equipo propio |
| DELETE `/api/equipos/:id` | ❌ | ❌ | ✅ | Eliminar equipo propio |
| GET `/api/equipos/:id/ranking` | ❌ | ❌ | ✅ | Ver ranking del equipo |

> **Nota:** Los tutores solo gestionan sus propios equipos.

---

### 👨‍🏫 Docentes

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| GET `/api/docentes` | ✅ | ❌ | ❌ | Listar todos los docentes |
| GET `/api/docentes/:id` | ✅ | ❌ | ❌ | Ver docente específico |
| GET `/api/docentes/perfil` | ❌ | ✅ | ❌ | Ver perfil propio |
| PATCH `/api/docentes/perfil` | ❌ | ✅ | ❌ | Actualizar perfil propio |
| PATCH `/api/docentes/:id` | ✅ | ❌ | ❌ | Actualizar docente (admin) |
| DELETE `/api/docentes/:id` | ✅ | ❌ | ❌ | Eliminar docente |
| PATCH `/api/docentes/:id/estado` | ✅ | ❌ | ❌ | Cambiar estado (activo/inactivo) |

---

### 📦 Catálogo de Productos

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| GET `/api/productos` | ✅ | ✅ | ✅ | Listar productos públicos |
| GET `/api/productos/:id` | ✅ | ✅ | ✅ | Ver detalle de producto |
| POST `/api/productos` | ✅ | ❌ | ❌ | Crear producto |
| PATCH `/api/productos/:id` | ✅ | ❌ | ❌ | Actualizar producto |
| DELETE `/api/productos/:id` | ✅ | ❌ | ❌ | Eliminar producto |

---

### 💳 Pagos (MercadoPago)

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| POST `/api/pagos/suscripcion` | ❌ | ❌ | ✅ | Crear preferencia de suscripción |
| POST `/api/pagos/curso` | ❌ | ❌ | ✅ | Crear preferencia de curso |
| GET `/api/pagos/membresia` | ❌ | ❌ | ✅ | Ver membresía activa |
| POST `/api/pagos/webhook` | - | - | - | Webhook de MercadoPago (público) |
| POST `/api/pagos/mock/activar-membresia/:id` | - | - | - | Mock para desarrollo (público) |

> **Nota:** Los webhooks son endpoints públicos para integración con MercadoPago.

---

### 📚 Clases y Reservas

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| **Gestión de Clases** |
| POST `/api/clases` | ✅ | ❌ | ❌ | Programar clase |
| GET `/api/clases/admin/todas` | ✅ | ❌ | ❌ | Listar todas las clases (admin) |
| PATCH `/api/clases/:id/cancelar` | ✅ | ✅* | ❌ | Cancelar clase |
| **Para Tutores** |
| GET `/api/clases` | ❌ | ❌ | ✅ | Listar clases disponibles |
| POST `/api/clases/:id/reservar` | ❌ | ❌ | ✅ | Reservar cupo en clase |
| DELETE `/api/clases/reservas/:id` | ❌ | ❌ | ✅ | Cancelar reserva propia |
| **Para Docentes** |
| GET `/api/clases/docente/mis-clases` | ❌ | ✅ | ❌ | Ver clases asignadas |
| POST `/api/clases/:id/asistencia` | ❌ | ✅ | ❌ | Registrar asistencia |
| **Común** |
| GET `/api/clases/:id` | ✅ | ✅ | ✅ | Ver detalle de clase |
| GET `/api/clases/metadata/rutas-curriculares` | ✅ | ✅ | ✅ | Listar rutas curriculares |

> **Nota:** *Los docentes solo pueden cancelar sus propias clases.

---

### ✅ Sistema de Asistencia

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| POST `/api/asistencia/clases/:claseId/estudiantes/:estudianteId` | ❌ | ✅ | ❌ | Marcar asistencia |
| GET `/api/asistencia/clases/:claseId` | ✅ | ✅ | ❌ | Ver lista de asistencia |
| GET `/api/asistencia/clases/:claseId/estadisticas` | ✅ | ✅ | ❌ | Ver estadísticas de clase |
| GET `/api/asistencia/estudiantes/:estudianteId` | ✅ | ✅ | ✅ | Ver historial del estudiante |
| GET `/api/asistencia/docente/resumen` | ❌ | ✅ | ❌ | Resumen del docente |

---

### 🛡️ Panel de Administración

| Endpoint | Admin | Docente | Tutor | Descripción |
|----------|-------|---------|-------|-------------|
| **Dashboard** |
| GET `/api/admin/estadisticas` | ✅ | ❌ | ❌ | Estadísticas del sistema |
| GET `/api/admin/dashboard` | ✅ | ❌ | ❌ | Dashboard completo |
| **Usuarios** |
| GET `/api/admin/usuarios` | ✅ | ❌ | ❌ | Listar todos los usuarios |
| DELETE `/api/admin/usuarios/:id` | ✅ | ❌ | ❌ | Eliminar usuario |
| POST `/api/admin/usuarios/:id/role` | ✅ | ❌ | ❌ | Cambiar rol de usuario |
| **Reportes** |
| GET `/api/admin/clases/programadas` | ✅ | ✅ | ❌ | Clases programadas |
| GET `/api/admin/docentes/:id/clases` | ✅ | ✅ | ❌ | Clases de un docente |

---

## Resumen de Permisos por Rol

### 👑 Admin (Administrador)
**Control total del sistema:**
- ✅ Gestión completa de docentes
- ✅ Gestión completa de productos
- ✅ Programación de clases (único rol que puede)
- ✅ Ver todas las clases y asistencias
- ✅ Dashboard con métricas del sistema
- ✅ Gestión de usuarios (ver, eliminar, cambiar roles)
- ✅ Cancelar cualquier clase
- ❌ No gestiona estudiantes ni equipos (eso es de tutores)

### 👨‍🏫 Docente (Profesor)
**Impartir clases y registrar asistencia:**
- ✅ Ver y actualizar su perfil
- ✅ Ver sus clases asignadas
- ✅ Registrar asistencia de estudiantes
- ✅ Ver lista de asistencia y estadísticas
- ✅ Cancelar sus propias clases
- ✅ Ver catálogo de productos (consulta)
- ❌ No puede crear clases (las asigna el admin)
- ❌ No gestiona estudiantes ni equipos
- ❌ No accede al panel de administración

### 👨‍👩‍👧 Tutor (Padre/Representante)
**Gestión de estudiantes y reservas:**
- ✅ Gestión completa de sus estudiantes (CRUD)
- ✅ Crear y gestionar equipos para gamificación
- ✅ Ver catálogo de productos
- ✅ Comprar suscripciones y cursos (MercadoPago)
- ✅ Ver clases disponibles
- ✅ Reservar clases para sus estudiantes
- ✅ Cancelar sus propias reservas
- ✅ Ver historial de asistencia de sus estudiantes
- ❌ No puede crear clases
- ❌ No puede registrar asistencia
- ❌ No accede a funciones de administración

---

## Validaciones de Seguridad

### A nivel de Backend:
1. **Guards JWT:** Todos los endpoints (excepto públicos) requieren token válido
2. **Guards de Roles:** Cada endpoint valida roles permitidos
3. **Validación de Propiedad:**
   - Tutores solo acceden a sus estudiantes/equipos
   - Docentes solo cancelan sus clases
   - Admin tiene acceso total

### Endpoints Públicos (Sin autenticación):
- POST `/api/auth/register` - Registro de tutor
- POST `/api/auth/login` - Login
- POST `/api/docentes-public` - Registro público de docente
- GET `/api/docentes-public` - Lista pública de docentes
- POST `/api/pagos/webhook` - Webhook de MercadoPago
- POST `/api/pagos/mock/activar-membresia/:id` - Mock para desarrollo

---

## Cambios Recientes

### Octubre 13, 2025
- ✅ **Corrección crítica:** Removido `Role.Tutor` del endpoint `POST /api/clases`
- ✅ **Corrección crítica:** Removido `Role.Docente` del endpoint `POST /api/clases`
- ✅ Solo `Role.Admin` puede crear clases ahora
- ✅ Test de integración actualizado para usar admin al crear clases
- ✅ Documentación completa de permisos creada

### Justificación:
El admin es quien programa las clases y asigna docentes. Ni tutores ni docentes deben poder crear clases por su cuenta. Esto permite al admin tener control del horario y disponibilidad del sistema.

---

## Testing

Para verificar los permisos:

```bash
# Test completo de integración (todos los roles)
./tests/scripts/test-integration-full.sh

# Tests específicos por módulo
./tests/scripts/test-docentes.sh      # Slice #4
./tests/scripts/test-clases.sh        # Slice #7
./tests/scripts/test-asistencia.sh    # Slice #8
./tests/scripts/test-admin.sh         # Slice #9
```

---

**Documentación creada por:** Claude Code
**Proyecto:** Mateatletas Ecosystem
**Estado:** ✅ Producción
