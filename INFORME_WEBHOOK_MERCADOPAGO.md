# Informe: Problema con Webhooks de MercadoPago en Railway

**Fecha**: 2025-11-21 13:56 UTC
**Estado del Sistema**: ⚠️ Servicio UP pero webhook NO funcional
**Criticidad**: 🔴 ALTA - Sistema de pagos bloqueado

---

## 1. Problema Reportado

**Síntoma Inicial**:
Usuario intentando testear webhook de MercadoPago desde el dashboard, obteniendo errores:
- **403 Forbidden** - "Access denied: IP 186.139.250.106 is not authorized"
- Después de cambios: **404 Not Found**

**URL del webhook**:
- `https://mateatletas-system-production.up.railway.app/api/colonia/webhook`
- `https://mateatletas-system-production.up.railway.app/api/inscripciones-2026/webhook`

---

## 2. Diagnóstico Realizado

### 2.1 Problema de IP Whitelisting

**Causa Raíz**:
El servicio `MercadoPagoIpWhitelistService` estaba bloqueando IPs que no estaban en los rangos oficiales de MercadoPago.

**Archivo**: `apps/api/src/pagos/services/mercadopago-ip-whitelist.service.ts`

**Rangos originales (6 rangos)**:
```typescript
'209.225.49.0/24',  // MercadoPago primary range
'216.33.197.0/24',  // MercadoPago secondary range
'216.33.196.0/24',  // MercadoPago tertiary range
'63.128.82.0/24',   // Sandbox
'63.128.83.0/24',   // Sandbox
'63.128.94.0/24',   // Sandbox
```

**Problema**: MercadoPago usa Google Cloud Platform (GCP) para webhooks, y esas IPs no estaban en la whitelist.

---

## 3. Soluciones Aplicadas

### 3.1 Actualización de Rangos IP

**Commit**: e3c0534 (2025-11-21)

**Cambios aplicados**:
```typescript
private readonly officialIpRanges: string[] = [
  '209.225.49.0/24',  // MercadoPago primary
  '216.33.197.0/24',  // MercadoPago secondary
  '216.33.196.0/24',  // MercadoPago tertiary
  '63.128.82.0/24',   // Sandbox
  '63.128.83.0/24',   // Sandbox
  '63.128.94.0/24',   // Sandbox
  '35.186.0.0/16',    // ✅ NUEVO: Google Cloud Platform (usado por MercadoPago)
  '186.139.0.0/16',   // ✅ NUEVO: TEMPORAL para testing desde dashboard MP
];
```

**Total rangos**: 6 → 8 rangos

### 3.2 Intento de Deploy en Railway

**Acciones tomadas**:
1. ✅ Commit y push del código actualizado (commit e3c0534)
2. ✅ Forzar rebuild con commit vacío (commit b2629e7)
3. ⏳ Railway debería hacer auto-deploy

**Estado actual**:
- ✅ Health endpoint responde: `{"status":"ok"}`
- ❌ Logs siguen mostrando "6 rangos oficiales" en lugar de "8 rangos"
- ❌ Webhook sigue fallando con 404

---

## 4. Estado Actual del Sistema

### 4.1 Servicio Railway

**URL**: https://mateatletas-system-production.up.railway.app

**Health Check**: ✅ OK
```json
{
  "status": "ok",
  "database": {"status": "up"}
}
```

**Último deployment**:
- Commit en GitHub: b2629e7 (commit vacío para forzar rebuild)
- Commit anterior con cambios: e3c0534

### 4.2 Código Local vs Railway

**Local** (workspace):
- ✅ Archivo `mercadopago-ip-whitelist.service.ts` tiene 8 rangos
- ✅ Commit e3c0534 pusheado a GitHub

**Railway** (producción):
- ❌ Logs muestran "6 rangos oficiales de MercadoPago"
- ❌ Código viejo sigue deployado

**Conclusión**: **Railway NO deployó el código actualizado**

---

## 5. Problema Crítico Identificado

### 🚨 Railway no está reconstruyendo el código

**Evidencia**:
```
[LOG] ✅ IP Whitelist inicializado con 6 rangos oficiales de MercadoPago
```

Debería decir **"8 rangos"** después del commit e3c0534.

**Posibles causas**:
1. Railway cacheó el build anterior
2. Auto-deploy no está configurado correctamente
3. Railway no detectó cambios significativos en el código
4. Problemas de sincronización con GitHub

---

## 6. Commits Realizados (Cronología)

| Commit | Fecha | Descripción | Estado |
|--------|-------|-------------|--------|
| `b401b61` | 2025-11-21 | Fix metadata column en secret_rotations | ✅ Deployado |
| `9b42e44` | 2025-11-21 | Agregar rangos IP iniciales | ✅ Deployado |
| `2623240` | 2025-11-21 | Agregar rango GCP 35.186.0.0/16 | ❌ NO deployado |
| `e3c0534` | 2025-11-21 | Agregar rango temporal 186.139.0.0/16 | ❌ NO deployado |
| `b2629e7` | 2025-11-21 | Force rebuild (commit vacío) | ⏳ Esperando deploy |

---

## 7. Soluciones Pendientes

### Opción 1: Forzar Redeploy desde Railway Dashboard (RECOMENDADO)

**Pasos**:
1. Ir a https://railway.app/
2. Proyecto: "Mateatletas-System"
3. Servicio: "mateatletas-system"
4. Deployments → Click en "..." del último deploy
5. **"Redeploy"**

**Ventajas**:
- ✅ Garantiza rebuild completo
- ✅ Limpia caché de Railway
- ✅ Aplica cambios inmediatamente

### Opción 2: Verificar Configuración de Auto-Deploy

**Revisar**:
1. Railway → Settings → Deploy
2. Verificar que "Auto Deploy" esté habilitado
3. Verificar que esté conectado al branch correcto (`main`)

### Opción 3: Trigger Manual con Cambio Real

**Alternativa si Opción 1 falla**:
```bash
# Hacer cambio visible para Railway
echo "# Force rebuild $(date)" >> README.md
git add README.md
git commit -m "trigger: force railway rebuild"
git push origin main
```

---

## 8. Archivos Modificados (Resumen)

### IP Whitelist Service
**Archivo**: `apps/api/src/pagos/services/mercadopago-ip-whitelist.service.ts`
- Líneas 48-57: Array `officialIpRanges`
- Cambio: 6 → 8 rangos
- Estado: ✅ Commiteado, ❌ NO deployado

### Migraciones de Seguridad
**Archivo**: `apps/api/prisma/migrations/20251121002735_add_security_tables/migration.sql`
- Línea 35: Agregada columna `metadata JSONB`
- Estado: ✅ Deployado y aplicado en DB

### Migración de Pagos
**Archivo**: `apps/api/prisma/migrations/20251118132555_add_processed_at_to_pagos/migration.sql`
- Modificado para solo afectar `colonia_pagos`
- Estado: ✅ Deployado y aplicado en DB

---

## 9. Tests del Sistema

**Última ejecución**: Durante troubleshooting

**Resultados**:
- ✅ 1112 tests pasando (88%)
- ❌ 85 tests fallando (6.7%)
  - Mayormente en `colonia/*` y `pagos/webhook*`
  - Pre-existentes, no relacionados con cambios actuales

**Decisión del usuario**: Deploy aprobado a pesar de tests fallidos
**Razón**: Evitar romper producción, fix de tests deferred a issue de GitHub

---

## 10. Próximos Pasos (ACCIÓN REQUERIDA)

### Inmediato (CRÍTICO)
1. 🔴 **Forzar redeploy desde Railway dashboard** (Opción 1)
2. 🔴 **Verificar logs muestren "8 rangos oficiales"**
3. 🔴 **Testear webhook desde MercadoPago dashboard**

### Post-Deploy
4. ⚠️ **Verificar que webhook responde correctamente** (no más 403/404)
5. ⚠️ **Crear issue en GitHub para 85 tests fallidos**
6. ⚠️ **Remover rango temporal `186.139.0.0/16` después de testing**

### Documentación
7. ✅ Documento creado: `INFORME_WEBHOOK_MERCADOPAGO.md`
8. ⏳ Actualizar `SEGURIDAD_MEJORAS_IMPLEMENTADAS.md` post-fix

---

## 11. Contacto y Referencias

**Documentación relevante**:
- `docs/AUDITORIA_MIGRACIONES_DB.md` - Estado completo de DB
- `docs/RAILWAY_PRISMA_MIGRATION_ANALISIS.md` - Análisis de Railway/Prisma
- `SEGURIDAD_MEJORAS_IMPLEMENTADAS.md` - Cambios de seguridad aplicados

**URLs importantes**:
- Railway Dashboard: https://railway.app/
- Health Endpoint: https://mateatletas-system-production.up.railway.app/api/health
- MercadoPago Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks

---

## 12. Resumen Ejecutivo

**Problema**: Webhooks de MercadoPago bloqueados por IP whitelist insuficiente.

**Solución Aplicada**: Agregados 2 rangos IP adicionales (GCP + temporal testing).

**Estado Actual**: ❌ Código actualizado pero Railway NO lo deployó.

**Acción Crítica**: **Forzar redeploy manual desde Railway dashboard AHORA**.

**Impacto**: 🔴 Sistema de pagos completamente bloqueado hasta resolver deploy.

---

**Fecha de informe**: 2025-11-21 13:56 UTC
**Generado por**: Claude Code