# 🗄️ Prisma Database Management

Guía completa para gestionar migraciones y seeds de la base de datos.

---

## 📚 Scripts Disponibles

### Migrations

```bash
# Crear una nueva migration (desarrollo)
npm run db:migrate:dev --name=add_user_column

# Aplicar migrations pendientes (producción)
npm run db:migrate

# Ver status de migrations
npx prisma migrate status

# Resetear BD completa (⚠️ PELIGROSO - solo desarrollo)
npm run db:reset
```

### Seeds

```bash
# Seed en DESARROLLO (datos de prueba completos)
npm run db:seed

# Seed en PRODUCCIÓN (solo datos esenciales)
npm run db:seed:prod

# Seed manual con NODE_ENV custom
NODE_ENV=staging npx prisma db seed
```

### Utilidades

```bash
# Abrir Prisma Studio (GUI para la BD)
npm run db:studio

# Generar Prisma Client
npx prisma generate

# Validar schema.prisma
npx prisma validate

# Format schema.prisma
npx prisma format
```

---

## 🌱 Seeding Strategies

### Modo DEVELOPMENT (por defecto)

Crea datos de prueba completos:
- ✅ Admin de prueba (`admin@mateatletas.com`)
- ✅ Docente de prueba (`docente@test.com`)
- ✅ Tutor de prueba (`tutor@test.com`)
- ✅ Equipos de ejemplo
- ✅ 6 Rutas Curriculares
- ✅ 5 Productos del catálogo
- ✅ Configuración de gamificación
- ✅ Curso de ejemplo con lecciones
- ✅ Inscripción de prueba

**Uso:**
```bash
npm run db:seed
# o
NODE_ENV=development npx prisma db seed
```

### Modo PRODUCTION

Crea solo datos esenciales:
- ✅ Admin (desde variables de entorno)
- ✅ 6 Rutas Curriculares (necesarias para el sistema)
- ✅ Productos del catálogo (pueden ser reales)
- ✅ Configuración de gamificación
- ✅ Logros del sistema
- ❌ NO crea usuarios de prueba
- ❌ NO crea datos ficticios

**Uso:**
```bash
npm run db:seed:prod
# o
NODE_ENV=production npx prisma db seed
```

---

## 🔐 Variables de Entorno para Seeds

### Admin en Producción

Configura estas variables en `.env` antes de hacer seed en producción:

```bash
# Admin (REQUERIDO para producción)
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=TuPassword123!
ADMIN_NOMBRE=Administrador
ADMIN_APELLIDO=Sistema
```

Si no se configuran, se usarán valores por defecto:
- Email: `admin@mateatletas.com`
- Password: `Admin123!`

---

## 🚀 Workflow: Desarrollo

### 1. Crear una nueva feature con cambios en el schema

```bash
# 1. Modificar prisma/schema.prisma
nano prisma/schema.prisma

# 2. Crear migration
npm run db:migrate:dev --name=add_user_profile_fields

# 3. La migration se aplica automáticamente en desarrollo
# 4. Se regenera Prisma Client automáticamente
```

### 2. Actualizar seeds después de cambios

```bash
# Editar prisma/seed.ts
nano prisma/seed.ts

# Aplicar seeds actualizados
npm run db:seed
```

### 3. Resetear BD en desarrollo (fresh start)

```bash
# ⚠️ CUIDADO: Borra todos los datos
npm run db:reset

# Esto hará:
# 1. Borrar todas las tablas
# 2. Aplicar todas las migrations desde cero
# 3. Ejecutar seeds automáticamente
```

---

## 🏭 Workflow: Producción

### 1. Deployment con migrations

```bash
# En el servidor de producción:

# 1. Pull latest code
git pull origin main

# 2. Aplicar migrations pendientes
npm run db:migrate

# 3. (Opcional) Seed de datos esenciales (solo primera vez)
npm run db:seed:prod

# 4. Reiniciar aplicación
pm2 restart api
```

### 2. Rollback de migration (si falla)

⚠️ Prisma NO tiene rollback automático. Debes:

```bash
# Opción 1: Crear migration de reversión manual
npm run db:migrate:dev --name=revert_last_change

# Opción 2: Restaurar desde backup
psql -U user -d database < backup.sql
```

**IMPORTANTE**: Siempre haz backup antes de migrar en producción.

---

## 📝 Convenciones de Nombres de Migrations

```bash
# ✅ GOOD
npm run db:migrate:dev --name=add_user_avatar_field
npm run db:migrate:dev --name=create_notifications_table
npm run db:migrate:dev --name=add_index_to_clase_fecha

# ❌ BAD
npm run db:migrate:dev --name=migration1
npm run db:migrate:dev --name=test
npm run db:migrate:dev --name=fix
```

Usa nombres descriptivos en snake_case.

---

## 🧪 Testing con Base de Datos

### Setup para tests

```bash
# 1. Crear BD de test separada
createdb mateatletas_test

# 2. Configurar .env.test
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/mateatletas_test" > .env.test

# 3. Aplicar migrations en BD de test
NODE_ENV=test npm run db:migrate

# 4. Seed de test
NODE_ENV=test npm run db:seed
```

### Limpiar BD de test entre tests

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.$transaction([
    prisma.clase.deleteMany(),
    prisma.estudiante.deleteMany(),
    prisma.docente.deleteMany(),
    // ...resto de tablas
  ]);
}
```

---

## 🔍 Debugging Migrations

### Ver SQL generado por migration

```bash
# Ver el SQL de la última migration
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql
```

### Ver estado actual

```bash
npx prisma migrate status

# Output ejemplo:
# Database schema is up to date!
#
# 3 migrations applied:
#   20250101000000_init
#   20250102000000_add_user_fields
#   20250103000000_create_notifications
```

### Forzar reset de shadow database (si hay problemas)

```bash
npx prisma migrate reset --skip-seed
```

---

## 📊 Schema Organization

El `schema.prisma` está organizado por módulos:

```prisma
// ========================================
// CORE: Usuarios y Autenticación
// ========================================
model Admin { ... }
model Docente { ... }
model Tutor { ... }

// ========================================
// ESTUDIANTES Y EQUIPOS
// ========================================
model Estudiante { ... }
model Equipo { ... }

// ========================================
// CLASES Y ASISTENCIA
// ========================================
model Clase { ... }
model InscripcionClase { ... }
model Asistencia { ... }

// ... etc
```

Mantén esta organización al agregar nuevos modelos.

---

## ⚠️ IMPORTANTE: Producción

### ✅ DO:
- Siempre haz **backup** antes de migrar en producción
- Prueba migrations en **staging** primero
- Usa `npm run db:migrate` (NO `db:migrate:dev` en producción)
- Revisa el SQL de la migration antes de aplicarla
- Ten un plan de rollback

### ❌ DON'T:
- NO uses `db:reset` en producción (borra todo)
- NO modifiques migrations ya aplicadas en producción
- NO apliques migrations sin revisar el SQL primero
- NO asumas que seeds de desarrollo son seguros en producción

---

## 📞 Soporte

Para problemas con migrations o seeds:
1. Revisa logs: `cat prisma/migrations/.../migration.sql`
2. Valida schema: `npx prisma validate`
3. Consulta Prisma docs: https://www.prisma.io/docs/

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
