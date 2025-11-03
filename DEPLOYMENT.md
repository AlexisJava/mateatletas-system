# 🚀 Guía de Deployment a Railway

Esta guía documenta el proceso de deployment de la API de Mateatletas a Railway, incluyendo los archivos críticos de configuración y troubleshooting de problemas comunes.

---

## ⚠️ ARCHIVOS CRÍTICOS (No modificar sin extremo cuidado)

### Archivos de Configuración de Build

Los siguientes archivos controlan cómo se compila y ejecuta la aplicación. **Cualquier cambio a estos archivos puede romper el deployment.**

#### 1. [apps/api/nest-cli.json](apps/api/nest-cli.json)
Controla cómo NestJS compila la aplicación.

```json
{
  "sourceRoot": "src",
  "entryFile": "main"
}
```

- **sourceRoot**: DEBE ser `"src"` para que el build genere `dist/src/main.js`
- **entryFile**: DEBE ser `"main"` (sin extensión)

#### 2. [apps/api/tsconfig.json](apps/api/tsconfig.json)
Configuración de TypeScript para la compilación.

- Define cómo se transpila TypeScript a JavaScript
- Afecta la estructura del directorio `dist/`

#### 3. [Dockerfile](Dockerfile)
Define cómo se construye la imagen Docker en Railway.

**Línea crítica:**
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
```

Esta línea **DEBE** apuntar a `dist/src/main.js` (NO a `dist/main.js`).

#### 4. [apps/api/package.json](apps/api/package.json) - Scripts
Los siguientes scripts son críticos:

```json
{
  "start": "node dist/src/main.js",
  "start:prod": "node dist/src/main.js",
  "build": "nest build"
}
```

---

## 🔒 REGLA DE ORO

**Antes de modificar cualquiera de los archivos críticos:**

```bash
npm run verify:deploy
```

Este comando ejecuta todas las verificaciones necesarias para asegurar que el deploy funcionará correctamente.

---

## 🗄️ Migraciones de Prisma

### Regla Fundamental

**Las migraciones DEBEN tener timestamps en orden cronológico.**

❌ **Incorrecto:**
```
20250118_add_debe_cambiar_password  (enero 2025)
20251012132133_init                 (octubre 2025)
```

✅ **Correcto:**
```
20251012132133_init                 (octubre 2025)
20251013121713_add_alertas_model    (octubre 2025)
20251118_add_debe_cambiar_password  (noviembre 2025)
```

### Verificar Migraciones

```bash
npm run verify:migrations
```

Este comando verifica:
- Orden cronológico correcto
- No hay timestamps duplicados
- No hay saltos temporales sospechosos (ej: año 2025 a 2024)

### Crear Nueva Migración

```bash
cd apps/api
npx prisma migrate dev --name descripcion_de_la_migracion
```

Esto automáticamente generará un timestamp correcto.

---

## ✅ Checklist Pre-Deploy

Antes de hacer push a main (que dispara el deploy automático):

```bash
# 1. Verificar todas las configuraciones críticas
npm run verify:deploy

# 2. Si todo pasa, hacer push seguro
npm run deploy:safe
```

El comando `deploy:safe` ejecuta `verify:deploy` y solo hace push si todas las verificaciones pasan.

**Alternativamente, el pre-commit hook automático:**

Cuando hagas `git commit`, el sistema ejecutará automáticamente:
1. `verify:deploy` - Validación de configuraciones críticas
2. Lint de TypeScript en archivos modificados

Si algo falla, **el commit será bloqueado** y verás exactamente qué está mal.

---

## 🔧 Comandos Útiles

### Verificación

```bash
# Verificar todo antes de deploy
npm run verify:deploy

# Verificar solo migraciones
npm run verify:migrations

# Verificar que el build genera main.js en la ubicación correcta
npm run verify:build
```

### Railway

```bash
# Ver logs en tiempo real
npm run railway:logs

# Conectar a la base de datos PostgreSQL
npm run railway:connect

# Ver información del servicio
railway status

# Redeploy manual
railway up
```

### Build Local

```bash
# Build completo
npm run build

# Build solo de la API
npm run build:api

# Verificar que main.js existe
ls -la apps/api/dist/src/main.js
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '/app/dist/main.js'"

**Causa:** El CMD del Dockerfile no coincide con la ubicación real de `main.js`.

**Síntomas:**
- La aplicación falla al iniciar en Railway
- Los logs muestran `Cannot find module '/app/dist/main.js'`

**Solución:**

1. Verificar que [Dockerfile](Dockerfile) tenga:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
```

2. Verificar que el build local genere el archivo en la ubicación correcta:
```bash
npm run verify:build
```

3. Si el problema persiste, revisar [nest-cli.json](apps/api/nest-cli.json):
```json
{
  "sourceRoot": "src"
}
```

---

### Error: "P3009 - Migration failed to apply cleanly"

**Causa:** Las migraciones están fuera de orden o hay una migración corrupta.

**Síntomas:**
- El deploy falla durante `prisma migrate deploy`
- Los logs muestran errores P3009

**Solución:**

1. Verificar orden de migraciones localmente:
```bash
npm run verify:migrations
```

2. Si hay problemas de orden, renombrar la migración problemática:
```bash
# Si tienes una migración con timestamp incorrecto
mv apps/api/prisma/migrations/20250118_nombre apps/api/prisma/migrations/20251118_nombre
```

3. En Railway, limpiar la tabla `_prisma_migrations`:
```bash
npm run railway:connect

# Dentro de psql:
DELETE FROM _prisma_migrations WHERE migration_name = 'nombre_de_migracion_problematica';
```

4. Redeploy:
```bash
railway up
```

---

### Build usa código viejo / Cache de Railway

**Causa:** Railway está usando una build cacheada corrupta.

**Síntomas:**
- Los cambios no se reflejan en el deploy
- El comportamiento no coincide con el código actual

**Solución:**

1. Agregar variable de entorno en Railway Dashboard:
```
NO_CACHE=1
```

2. Hacer redeploy:
```bash
git commit --allow-empty -m "Force rebuild"
git push origin main
```

3. Alternativamente, en Railway Dashboard:
   - Ir a Settings → Restart
   - Hacer un "Hard Restart"

---

### Error: "ENOENT: no such file or directory, open 'dist/src/main.js'"

**Causa:** El build no se ejecutó correctamente o nest-cli.json tiene configuración incorrecta.

**Síntomas:**
- Error al intentar ejecutar `npm start`
- El directorio `dist/src/` no existe

**Solución:**

1. Ejecutar build completo:
```bash
npm run build:api
```

2. Verificar que [nest-cli.json](apps/api/nest-cli.json) tenga:
```json
{
  "sourceRoot": "src"
}
```

3. Verificar estructura del build:
```bash
tree apps/api/dist/
# Debería mostrar:
# dist/
#   └── src/
#       └── main.js
```

---

### Errores de Migraciones en Producción

**Causa:** La base de datos de producción está en un estado inconsistente.

**Síntomas:**
- Migraciones fallan solo en Railway, pero funcionan localmente
- Error: "Table already exists"

**Solución:**

1. Conectar a la BD de Railway:
```bash
npm run railway:connect
```

2. Ver estado de migraciones:
```sql
SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 10;
```

3. Si hay una migración fallida, marcarla como completada o eliminarla:
```sql
-- Ver migración problemática
SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;

-- Eliminar migración fallida
DELETE FROM _prisma_migrations WHERE migration_name = 'nombre_de_migracion';
```

4. Redeploy para aplicar migraciones de nuevo:
```bash
railway up
```

---

### Variables de Entorno Faltantes

**Causa:** Las variables de entorno necesarias no están configuradas en Railway.

**Variables requeridas:**
- `DATABASE_URL` - Automática de Railway Postgres
- `JWT_SECRET` - Secreto para tokens JWT (mínimo 32 caracteres)
- `FRONTEND_URL` - URL del frontend (para CORS)
- `MERCADOPAGO_ACCESS_TOKEN` - Token de MercadoPago
- `NODE_ENV=production`

**Verificar variables:**
```bash
railway variables
```

**Agregar variable faltante:**
```bash
railway variables set JWT_SECRET="tu-secreto-super-largo-minimo-32-chars"
```

---

## 📊 Estructura del Proyecto

### Arquitectura de Build

```
Mateatletas-Ecosystem/
├── apps/
│   └── api/
│       ├── src/              ← Código fuente TypeScript
│       │   └── main.ts       ← Entry point
│       ├── dist/             ← Generado por build
│       │   └── src/          ← ⚠️ CRÍTICO: main.js está aquí
│       │       └── main.js   ← ⚠️ ESTE es el archivo que se ejecuta
│       ├── nest-cli.json     ← ⚠️ Define sourceRoot: "src"
│       ├── tsconfig.json     ← ⚠️ Configuración TypeScript
│       └── package.json      ← ⚠️ Scripts de start
├── Dockerfile                ← ⚠️ CMD debe apuntar a dist/src/main.js
└── package.json              ← Scripts de workspace
```

### Flujo de Deploy

```
1. Push a main
   ↓
2. Railway detecta cambios
   ↓
3. Ejecuta: npm ci (instala dependencias)
   ↓
4. Ejecuta: npm run build --workspace=apps/api
   ↓
5. Build de Dockerfile (copia dist/ al contenedor)
   ↓
6. Ejecuta CMD: npx prisma migrate deploy && node dist/src/main.js
   ↓
7. Aplicación en producción
```

---

## 🔐 Sistema de Protección Pre-Commit

El proyecto tiene un sistema automático de protección que previene commits que puedan romper el deploy.

### Cómo Funciona

Cuando ejecutas `git commit`, automáticamente se verifica:

1. **Configuraciones críticas:**
   - main.js existe en la ubicación correcta
   - Dockerfile CMD apunta al archivo correcto
   - Scripts de package.json son consistentes
   - nest-cli.json tiene la configuración correcta

2. **Migraciones:**
   - Timestamps en orden cronológico
   - No hay duplicados
   - No hay archivos temporales

3. **Calidad de código:**
   - Lint de TypeScript en archivos modificados
   - Type checking

### Si el Commit es Bloqueado

```bash
⛔ COMMIT BLOQUEADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La verificación de deploy falló.
Corrige los errores antes de hacer commit.

Para más información: DEPLOYMENT.md
```

**Qué hacer:**
1. Leer el mensaje de error específico
2. Corregir el problema indicado
3. Intentar el commit de nuevo

**Bypass (NO RECOMENDADO):**
```bash
git commit --no-verify -m "mensaje"
```

Solo usa `--no-verify` si estás 100% seguro de lo que haces.

---

## 📞 Referencias y Recursos

### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Railway Documentation](https://docs.railway.app/)

### Archivos de Configuración

- [Dockerfile](Dockerfile) - Configuración de imagen Docker
- [nest-cli.json](apps/api/nest-cli.json) - Configuración de build NestJS
- [package.json (root)](package.json) - Scripts de workspace
- [package.json (api)](apps/api/package.json) - Scripts de la API

### Scripts Útiles

- [verify-deploy.sh](scripts/verify-deploy.sh) - Verificación pre-deploy
- [verify-migrations.sh](scripts/verify-migrations.sh) - Verificación de migraciones
- [.husky/pre-commit](.husky/pre-commit) - Git hook de protección

---

## 🆘 Contacto y Soporte

Si después de revisar esta documentación y el troubleshooting sigues teniendo problemas:

1. **Ver logs de Railway:**
   ```bash
   npm run railway:logs
   ```

2. **Verificar estado del servicio:**
   ```bash
   railway status
   ```

3. **Revisar variables de entorno:**
   ```bash
   railway variables
   ```

4. **Consultar estructura del build:**
   ```bash
   railway run bash
   ls -la dist/src/
   ```

---

## ✅ Checklist de Health Check

Usa este checklist para verificar que todo está configurado correctamente:

- [ ] `npm run verify:deploy` pasa sin errores
- [ ] `npm run verify:migrations` pasa sin errores
- [ ] `npm run verify:build` genera `apps/api/dist/src/main.js`
- [ ] Dockerfile CMD apunta a `dist/src/main.js`
- [ ] `apps/api/package.json` tiene `"start": "node dist/src/main.js"`
- [ ] [nest-cli.json](apps/api/nest-cli.json) tiene `"sourceRoot": "src"`
- [ ] Todas las variables de entorno están configuradas en Railway
- [ ] El pre-commit hook está activo (`.husky/pre-commit` existe)
- [ ] Las migraciones están en orden cronológico
- [ ] No hay archivos temporales en `prisma/migrations/`

---

**Última actualización:** Noviembre 2025
**Mantenido por:** Equipo Mateatletas
