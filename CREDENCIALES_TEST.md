# 🔐 Credenciales de Prueba - Mateatletas Ecosystem

**Última actualización:** 14 de Octubre de 2025

Todos los usuarios de prueba han sido creados en la base de datos mediante el seed de Prisma.

---

## 📋 Credenciales por Rol

### 1. 👑 Admin (Administrador)

**Email:** `admin@mateatletas.com`
**Password:** `Admin123!`
**Dashboard:** [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

**Permisos:**
- Gestión completa de usuarios (todos los roles)
- CRUD de productos del catálogo
- Gestión de clases y rutas curriculares
- Creación/edición de módulos y lecciones (LMS)
- Visualización de reportes y estadísticas
- Acceso a panel administrativo completo

---

### 2. 👨‍🏫 Docente (Profesor)

**Email:** `docente@test.com`
**Password:** `Test123!`
**Dashboard:** [http://localhost:3000/docente/dashboard](http://localhost:3000/docente/dashboard)

**Datos del perfil:**
- Nombre: María González
- Título: Profesora de Matemáticas
- Bio: Profesora especializada en álgebra y geometría con más de 5 años de experiencia

**Permisos:**
- Ver calendario de clases asignadas
- Tomar asistencia de estudiantes
- Registrar observaciones por estudiante
- Ver reportes de desempeño
- Gestionar sus clases programadas

---

### 3. 👨‍👩‍👧 Tutor (Padre/Madre)

**Email:** `tutor@test.com`
**Password:** `Test123!`
**Dashboard:** [http://localhost:3000/login](http://localhost:3000/login) (redirige a portal tutor)

**Datos del perfil:**
- Nombre: Carlos Rodríguez
- Teléfono: +52 55 1234 5678

**Permisos:**
- Ver dashboard de estudiantes a su cargo
- Gestionar inscripciones a cursos
- Ver catálogo de productos
- Realizar pagos (MercadoPago en modo mock)
- Reservar clases para sus estudiantes
- Ver progreso académico de estudiantes

---

### 4. 🎓 Estudiante

**Email:** `estudiante1@test.com`
**Password:** `estudiante123`
**Dashboard:** [http://localhost:3000/estudiante/dashboard](http://localhost:3000/estudiante/dashboard)

**Datos adicionales:**
- 5 estudiantes de prueba en total: `estudiante1@test.com` a `estudiante5@test.com`
- Todos tienen la misma contraseña: `estudiante123`
- El estudiante1 está pre-inscrito al curso "Fundamentos de Álgebra"

**Permisos:**
- Dashboard gamificado con animaciones
- Ver progreso de cursos inscritos
- Completar lecciones y ganar puntos
- Desbloquear logros (achievements)
- Ver rankings de equipo y global
- Acceder al LMS (Learning Management System)

---

## 🎮 Portal Estudiante - Features Especiales

El estudiante1 tiene acceso completo al **LMS** con:

### Curso Pre-inscrito: "Fundamentos de Álgebra"

**3 Módulos:**
1. Variables y Expresiones Algebraicas (3 lecciones, 40 pts)
2. Ecuaciones Lineales (4 lecciones, 65 pts)
3. Sistemas de Ecuaciones (3 lecciones, 60 pts)

**Total:** 10 lecciones, ~145 puntos, ~2.5 horas de contenido

**7 Tipos de Contenido:**
- 📹 Video (YouTube embeds)
- 📄 Texto (Markdown)
- ❓ Quiz (con explicaciones)
- ✏️ Práctica (ejercicios paso a paso)
- 📝 Tarea (problemas del mundo real)
- 🎮 Juego Interactivo (placeholder)
- 📚 Lectura (placeholder)

**Ed-Tech Best Practices Implementadas:**
- ✅ Chunking (Producto → Módulo → Lección)
- ✅ Microlearning (5-30 min por lección)
- ✅ Progressive Disclosure (lecciones con prerequisitos)
- ✅ Multi-modal Learning (7 tipos de contenido)
- ✅ Immediate Feedback (puntos al completar)
- ✅ Learning Analytics (tracking de progreso)
- ✅ Gamification (puntos + logros desbloqueables)

---

## 🔄 Cómo Probar los Diferentes Roles

### ⚠️ IMPORTANTE: Seleccionar el Tipo de Usuario Correcto

El formulario de login tiene un **toggle en la parte superior** para seleccionar el tipo de usuario:

- **"Tutor/Padre"** → Endpoint `/api/auth/login` → Para Admin, Docente y Tutor
- **"Estudiante"** → Endpoint `/api/auth/estudiante/login` → Solo para Estudiantes

**Si intentas hacer login como estudiante sin cambiar el toggle, obtendrás error 401.**

### Método 1: Logout y Login Manual
1. Ir a [http://localhost:3000/login](http://localhost:3000/login)
2. Si ya estás logueado, hacer click en "Cerrar Sesión"
3. **🔴 PASO CRÍTICO:** Seleccionar el tipo de usuario correcto:
   - Para **Admin/Docente/Tutor**: Dejar seleccionado "Tutor/Padre" (default)
   - Para **Estudiante**: **CAMBIAR a "Estudiante"** usando el toggle superior
4. Ingresar las credenciales del rol que deseas probar
5. Serás redirigido automáticamente al dashboard correcto

### Método 2: URLs Directas (para testing rápido)
Puedes acceder directamente a los dashboards:

- **Admin:** `http://localhost:3000/admin/dashboard`
- **Docente:** `http://localhost:3000/docente/dashboard`
- **Estudiante:** `http://localhost:3000/estudiante/dashboard`
- **Tutor:** `http://localhost:3000/` (home portal tutor)

⚠️ **Nota:** Si el sistema detecta que no tienes el rol correcto, te redirigirá al login.

---

## 🧪 Testing del LMS (SLICE #16)

### Como Admin:
1. Login como `admin@mateatletas.com`
2. Ir a **Admin > Cursos** (`/admin/cursos`)
3. Seleccionar el curso "Curso Intensivo: Álgebra Básica"
4. Ver los 3 módulos creados
5. Click en cualquier módulo para ver/editar lecciones
6. Crear nuevas lecciones con diferentes tipos de contenido

### Como Estudiante:
1. Login como `estudiante1@test.com`
2. Ir a **Mis Cursos** (`/estudiante/cursos`)
3. Click en "Fundamentos de Álgebra"
4. Seleccionar un módulo
5. Click en una lección para abrirla
6. Completar la lección (botón "Completar Lección")
7. Ver modal de éxito con puntos ganados ✨
8. Verificar que la lección se marca como completada
9. Progreso se actualiza automáticamente

---

## 🗄️ Verificación en Base de Datos

### Con Prisma Studio:
```bash
cd apps/api
npx prisma studio
```

Acceder a [http://localhost:5555](http://localhost:5555) y verificar las tablas:
- `Admin` → 1 registro
- `Docente` → 1 registro
- `Tutor` → 1 registro
- `Estudiante` → 5 registros
- `Modulo` → 3 registros
- `Leccion` → 10 registros
- `InscripcionCurso` → 1 registro (estudiante1 inscrito en Álgebra)

---

## 🔧 Regenerar Usuarios de Prueba

Si necesitas recrear los usuarios:

```bash
cd apps/api
npx prisma db seed
```

Esto ejecutará el seed completo que incluye:
- ✅ Admin
- ✅ Docente
- ✅ Tutor
- ✅ 5 Estudiantes
- ✅ 4 Equipos
- ✅ 6 Rutas curriculares
- ✅ 5 Productos del catálogo
- ✅ 8 Logros
- ✅ 8 Acciones puntuables
- ✅ Curso completo de Álgebra (3 módulos, 10 lecciones)

---

## 📝 Notas Importantes

### Contraseñas
- **Admin:** `Admin123!` (mayúscula inicial, símbolo)
- **Docente/Tutor:** `Test123!` (mayúscula inicial, símbolo)
- **Estudiantes:** `estudiante123` (todo minúscula, sin símbolos)

### Roles en JWT
El sistema usa JWT para autenticación. El payload incluye:
```json
{
  "id": "cuid_del_usuario",
  "email": "email@test.com",
  "role": "admin" | "docente" | "tutor" | "estudiante",
  "nombre": "Nombre",
  "apellido": "Apellido"
}
```

### Seguridad
⚠️ **IMPORTANTE:** Estas credenciales son SOLO para desarrollo/testing.

Antes de producción:
1. Cambiar todas las contraseñas
2. Rotar JWT_SECRET en `.env`
3. Implementar autenticación de 2 factores
4. Configurar rate limiting en endpoints de login
5. Usar HTTPS con certificado SSL válido

---

## 🎯 Casos de Uso para Testing

### UC1: Flujo Completo Admin
1. Login → Admin Dashboard
2. Crear producto nuevo (curso)
3. Crear módulo en el curso
4. Crear 3 lecciones en el módulo
5. Publicar módulo
6. Verificar que estudiante puede verlo

### UC2: Flujo Completo Estudiante
1. Login → Estudiante Dashboard
2. Ver badges/logros desbloqueados
3. Navegar a "Mis Cursos"
4. Seleccionar "Fundamentos de Álgebra"
5. Completar lección 1.1 (video)
6. Ver modal de éxito + puntos ganados
7. Completar lección 1.2 (requiere haber completado 1.1)
8. Ver progreso actualizado en dashboard del curso

### UC3: Flujo Docente
1. Login → Docente Dashboard
2. Ver calendario de clases
3. Tomar asistencia de una clase
4. Agregar observaciones a estudiantes
5. Ver reportes con gráficos

### UC4: Flujo Tutor
1. Login → Tutor Dashboard
2. Ver resumen de estudiantes a cargo
3. Navegar a catálogo
4. Iniciar pago de suscripción (modo mock)
5. Reservar clase para estudiante

---

## 🚀 Quick Access URLs

### Desarrollo Local
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Prisma Studio:** http://localhost:5555

### Login Directo
- http://localhost:3000/login

### Dashboards
- http://localhost:3000/admin/dashboard
- http://localhost:3000/docente/dashboard
- http://localhost:3000/estudiante/dashboard
- http://localhost:3000/ (tutor)

### LMS (Estudiante)
- http://localhost:3000/estudiante/cursos (lista de cursos)
- http://localhost:3000/estudiante/cursos/seed-curso-algebra-basica (curso de álgebra)

### LMS (Admin)
- http://localhost:3000/admin/cursos (gestión de cursos)

---

**Última actualización:** 14 de Octubre de 2025
**Versión del proyecto:** 1.0.0
**SLICE #16:** Backend + Frontend LMS completo ✅

