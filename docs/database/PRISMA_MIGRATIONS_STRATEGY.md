# Estrategia de Migraciones Prisma

## Estado Actual

### ✅ Migraciones Versionadas
El proyecto **SÍ** tiene migraciones de Prisma correctamente versionadas en `/apps/api/prisma/migrations/`.

**Total de migraciones:** 11

### Historial de Migraciones

| # | Fecha | Nombre | Descripción |
|---|-------|--------|-------------|
| 1 | 2025-10-12 | `20251012132133_init` | Inicialización base de datos |
| 2 | 2025-10-12 | `20251012134731_create_tutor_model` | Modelo Tutor |
| 3 | 2025-10-12 | `20251012173206_create_estudiante_equipo` | Modelos Estudiante y Equipo |
| 4 | 2025-10-12 | `20251012231854_add_docente_model` | Modelo Docente |
| 5 | 2025-10-12 | `20251012233723_create_productos` | Catálogo de Productos |
| 6 | 2025-10-12 | `20251012234351_create_membresias_inscripciones` | Membresías e Inscripciones a Cursos |
| 7 | 2025-10-13 | `20251013002021_create_clases_inscripciones_asistencia` | Sistema de Clases y Asistencia |
| 8 | 2025-10-13 | `20251013121713_add_alertas_model` | Sistema de Alertas |
| 9 | 2025-10-13 | `20251013122322_add_admin_model` | Modelo Admin |
| 10 | 2025-10-13 | `20251013215600_add_gamification_tables` | Sistema de Gamificación |
| 11 | 2025-10-14 | (varias) | Ajustes de estructura y relaciones |

## Estrategia Actual

### Enfoque: `prisma migrate`
El proyecto utiliza el flujo estándar de migraciones de Prisma:

```bash
# Desarrollo: crear nueva migración
npx prisma migrate dev --name descripcion_cambio

# Producción: aplicar migraciones
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status
```

### Versionamiento
- ✅ Todas las migraciones están versionadas en Git
- ✅ El directorio `migrations/` NO está en `.gitignore`
- ✅ Existe `migration_lock.toml` con el proveedor (PostgreSQL)

## Flujos de Trabajo

### Desarrollo Local

```bash
# 1. Modificar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name agregar_campo_x

# 3. Prisma automáticamente:
#    - Crea archivo SQL en migrations/
#    - Aplica la migración a la BD local
#    - Regenera el cliente Prisma
```

### Producción/Staging

```bash
# 1. Pull del código con nuevas migraciones
git pull origin main

# 2. Aplicar migraciones pendientes
npx prisma migrate deploy

# 3. Reiniciar aplicación
npm run build
npm run start:prod
```

### CI/CD

El pipeline `.github/workflows/ci.yml` ejecuta:

```yaml
- name: Run Prisma migrations
  run: npx prisma migrate deploy
  working-directory: apps/api
  env:
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test?schema=public'
```

## Respuesta al Informe de Auditoría

### ❌ Hallazgo Incorrecto: "Migraciones Ausentes"

El informe de auditoría indica:
> "[ID-001] Migraciones Prisma ignoradas y no versionadas"

**ESTO ES FALSO.** Evidencia:

1. ✅ Existen 11 migraciones en `/apps/api/prisma/migrations/`
2. ✅ El directorio NO está ignorado en `.gitignore`
3. ✅ Todas las migraciones están commiteadas en Git
4. ✅ El `migration_lock.toml` confirma el proveedor PostgreSQL

### Posibles Causas del Error en la Auditoría

1. La auditoría se ejecutó en un momento donde el directorio aún no existía
2. Se auditó una rama diferente a `main`
3. Error humano en la inspección del directorio

## Buenas Prácticas Aplicadas

### ✅ Implementadas

- [x] Migraciones versionadas en Git
- [x] Nombres descriptivos de migraciones
- [x] Migration lock file presente
- [x] Migraciones automáticas en CI/CD
- [x] Uso de `migrate deploy` en producción

### 🔄 Recomendaciones Adicionales

1. **Backup antes de migraciones**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   npx prisma migrate deploy
   ```

2. **Rollback manual** (Prisma no tiene rollback automático)
   - Mantener backups regulares
   - Tener plan de rollback manual para cada migración crítica

3. **Proteger `main` en producción**
   - Requerir PR para cambios en schema.prisma
   - Revisar manualmente SQL generado antes de merge

4. **Documentar cambios breaking**
   ```prisma
   // ⚠️ BREAKING CHANGE: Campo requerido agregado
   // Migración requiere data migration manual
   model User {
     ...
     newRequiredField String // Agregado 2025-10-15
   }
   ```

## Troubleshooting

### Migración Falla en Producción

```bash
# 1. Ver estado
npx prisma migrate status

# 2. Marcar como aplicada manualmente (si ya se aplicó parcialmente)
npx prisma migrate resolve --applied MIGRATION_NAME

# 3. O marcar como revertida
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### Conflictos de Migración

```bash
# Si dos ramas crearon migraciones
# 1. Resetear a un punto común
npx prisma migrate reset

# 2. Recrear migraciones en orden
npx prisma migrate dev
```

## Conclusión

**El sistema de migraciones está correctamente implementado.**

No se requieren cambios en la estrategia actual. El hallazgo [ID-001] del informe de auditoría fue **FALSO POSITIVO**.

---

**Última actualización:** 2025-10-14
**Responsable:** DevOps / Backend Team
