# Database Schema Synchronization - 2025-10-18

## Problem Summary

After creating a new PostgreSQL Docker container, the database schema was not fully synchronized with `schema.prisma`. This caused multiple runtime errors when testing CRUD operations in the admin panel.

## Root Cause

The `schema.prisma` file had evolved ahead of the migration files. Several fields and even entire tables were defined in the Prisma schema but were never migrated to the actual PostgreSQL database.

### Key Issues Identified:

1. **Missing Columns in Existing Tables**:
   - `tutores.roles` (JSONB)
   - `estudiantes.roles` (JSONB)
   - `admins.roles`, `admins.dni`, `admins.telefono`
   - `docentes.roles`, `docentes.estado`, `docentes.telefono`, `docentes.especialidades`, etc.
   - `clases.nombre`, `clases.descripcion`, `clases.sector_id`

2. **Missing Table Entirely**:
   - `lecciones` table was completely missing from the database
   - This would have caused runtime errors for any course/lesson functionality

## Solution Applied

### Step 1: Initial Synchronization (380-line SQL)

Used Prisma's built-in diff tool to generate a comprehensive SQL synchronization script:

```bash
npx prisma migrate diff \
  --from-url "postgresql://mateatletas:mateatletas123@localhost:5433/mateatletas" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > /tmp/complete_schema_sync.sql
```

This generated a 380-line SQL script that:
- Created missing ENUMs: `TipoContenido`, `tipo_notificacion`, `tipo_evento`, `estado_tarea`, `prioridad_tarea`
- Added columns to existing tables (roles, telefono, especialidades, etc.)
- Created missing tables: `modulos`, `lecciones`, `progreso_lecciones`, `notificaciones`, `eventos`, `tareas`, `recordatorios`, `notas`, `niveles_config`, `sectores`, `rutas_especialidad`, `docentes_rutas`
- Created all necessary indexes and foreign key constraints

Execution increased table count from 19 to 31 tables.

### Step 2: Fix Missing `lecciones` Table

The first script had errors creating the `lecciones` table. A second targeted fix was applied:

```sql
-- Create ENUM
CREATE TYPE "TipoContenido" AS ENUM ('Video', 'Texto', 'Quiz', 'Tarea', 'JuegoInteractivo', 'Lectura', 'Practica');

-- Create Table
CREATE TABLE "lecciones" (
    "id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_contenido" "TipoContenido" NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "puntos_por_completar" INTEGER NOT NULL DEFAULT 10,
    "logro_desbloqueable_id" TEXT,
    "duracion_estimada_minutos" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "recursos_adicionales" TEXT,
    "leccion_prerequisito_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lecciones_pkey" PRIMARY KEY ("id")
);

-- Create Indexes
CREATE INDEX "lecciones_modulo_id_orden_idx" ON "lecciones"("modulo_id", "orden");
CREATE INDEX "lecciones_modulo_id_idx" ON "lecciones"("modulo_id");
CREATE INDEX "lecciones_tipo_contenido_idx" ON "lecciones"("tipo_contenido");

-- Add Foreign Keys
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_modulo_id_fkey"
    FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_logro_desbloqueable_id_fkey"
    FOREIGN KEY ("logro_desbloqueable_id") REFERENCES "logros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_leccion_prerequisito_id_fkey"
    FOREIGN KEY ("leccion_prerequisito_id") REFERENCES "lecciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "progreso_lecciones" ADD CONSTRAINT "progreso_lecciones_leccion_id_fkey"
    FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Step 3: Final Verification

Verified complete synchronization:

```bash
npx prisma migrate diff \
  --from-url "postgresql://..." \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

**Result**: `-- This is an empty migration.`

This confirms **zero differences** between `schema.prisma` and the actual database.

## Final State

### Database Statistics:
- **30 models** in schema.prisma
- **30 tables** in PostgreSQL
- **0 differences** between schema and database
- All indexes created
- All foreign keys configured
- All ENUMs created

### Testing Results (All Passed ✅):

1. **LOGIN** - Admin authentication successful, JWT token in httpOnly cookie
2. **CREATE ESTUDIANTE** - Student created with auto-generated tutor
3. **CREATE DOCENTE** - Teacher created with especialidades, estado='activo', roles=['docente']
4. **CREATE CLASE** - Class created with nombre, descripcion, sector_id support
5. **GET Estudiantes** - Returns array of students
6. **GET Docentes** - Returns {data: [docentes]}
7. **GET Clases** - Returns {data: [clases]} with full relations

### Database Verification:
```sql
 tabla       | registros
-------------+-----------
 admins      |         1
 clases      |         2
 docentes    |         2
 estudiantes |         1
 lecciones   |         0
 tutores     |         1
```

## Prevention Measures

To prevent schema drift in the future:

1. **NEVER edit `schema.prisma` directly** without creating a migration
2. **Always create migrations** for schema changes:
   ```bash
   npx prisma migrate dev --name describe_change_here
   ```
3. **Run migrations on all environments** after pulling schema changes:
   ```bash
   npx prisma migrate deploy
   ```
4. **Verify schema sync regularly** using:
   ```bash
   npx prisma migrate diff \
     --from-url "postgresql://..." \
     --to-schema-datamodel prisma/schema.prisma
   ```

## Impact

- **Before**: Multiple database errors preventing admin panel usage
- **After**: All CRUD operations working correctly
- **Tables Created**: 11 new tables (19 → 30)
- **Columns Added**: ~30+ columns across multiple tables
- **ENUMs Created**: 5 new ENUM types
- **Downtime**: None (development environment)

## Files Modified

This synchronization was done via direct SQL execution. No code files were modified. The schema.prisma file already contained all the necessary definitions - they just weren't reflected in the database.

---

**Date**: 2025-10-18
**Environment**: Development (PostgreSQL in Docker)
**Prisma Version**: 6.17.1
**PostgreSQL Version**: 16
