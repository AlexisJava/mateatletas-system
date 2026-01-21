# Auditoría de Métricas Financieras - Dashboard Admin

**Fecha**: 2026-01-20
**Objetivo**: Entender de dónde saca cada métrica financiera y diagnosticar por qué MRR = $0

---

## Resumen Ejecutivo

| Métrica           | Valor Actual | Esperado   | Estado      | Causa Raíz                           |
| ----------------- | ------------ | ---------- | ----------- | ------------------------------------ |
| **MRR**           | $0           | > $0       | ❌ FALLA    | No hay pagos con estado "Pagado"     |
| **ARR**           | $0           | MRR × 12   | ❌ FALLA    | Depende de MRR (= 0 × 12)            |
| **Tasa Cobro**    | 0%           | > 0%       | ❌ FALLA    | 0 pagados / total facturado = 0%     |
| **Por Cobrar**    | $255K        | (correcto) | ✅ FUNCIONA | Inscripciones con estado "Pendiente" |
| **Suscripciones** | 3            | (correcto) | ✅ FUNCIONA | Cuenta inscripciones activas         |

---

## 1. Arquitectura de Métricas Financieras

### Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (FinanzasTab.tsx)                    │
│                                                                      │
│  MRR = stats.ingresosMes                                            │
│  ARR = MRR × 12                                                     │
│  Tasa Cobro = stats.tasaCobro                                       │
│  Por Cobrar = stats.ingresosPendientes                              │
│                                                                      │
│  ↓ Llama a getCombinedDashboardStats()                              │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    API CLIENT (admin.api.ts)                         │
│                                                                      │
│  getCombinedDashboardStats() combina:                               │
│    - GET /admin/dashboard                                            │
│    - GET /admin/estadisticas  ← ingresosMes viene de aquí           │
│    - GET /casas/estadisticas                                         │
│    - GET /admin/analytics/retencion                                  │
│                                                                      │
│  Calcula tasaCobro localmente:                                       │
│    totalFacturado = ingresosTotal + pagosPendientes                  │
│    tasaCobro = (ingresosTotal / totalFacturado) × 100               │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  BACKEND (AdminStatsService)                         │
│                                                                      │
│  getSystemStats() → líneas 88-169                                   │
│                                                                      │
│  Calcula ingresosTotal y pagosPendientes desde:                     │
│    SELECT estado_pago, SUM(monto)                                   │
│    FROM facturacion_unificada                                       │
│    WHERE periodo = '2026-01'                                        │
│    GROUP BY estado_pago                                             │
│                                                                      │
│  Mapeo:                                                              │
│    - estado_pago = 'Pagado' → ingresosTotal                         │
│    - estado_pago = 'Pendiente'/'Vencido' → pagosPendientes          │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│              VISTA PostgreSQL (facturacion_unificada)                │
│                                                                      │
│  SSOT que une dos fuentes:                                          │
│                                                                      │
│  FUENTE 1: pagos_suscripcion (MercadoPago)                          │
│    - mp_status = 'approved' → estado_pago = 'Pagado'                │
│    - mp_status = 'pending' → estado_pago = 'Pendiente'              │
│                                                                      │
│  FUENTE 2: inscripciones_mensuales (Pagos Manuales)                 │
│    - estado_pago directo del registro                               │
│                                                                      │
│  UNION ALL de ambas fuentes                                         │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         TABLAS BASE                                  │
│                                                                      │
│  1. pagos_suscripcion                                               │
│     - Requiere: suscripciones_familiares activas                    │
│     - Estado actual: ⚠️ SIN DATOS en seed                           │
│                                                                      │
│  2. inscripciones_mensuales                                         │
│     - Estado actual: ✅ 3 registros creados por seed                │
│     - TODOS con estado_pago = 'Pendiente'                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Análisis por Métrica

### 2.1 MRR (Monthly Recurring Revenue)

**Ubicación Frontend**: [FinanzasTab.tsx:38](apps/web/src/components/admin/views/dashboard/components/tabs/FinanzasTab.tsx#L38)

```typescript
const mrr = stats.ingresosMes;
```

**Fuente Backend**: [admin-stats.service.ts:142-148](apps/api/src/admin/services/admin-stats.service.ts#L142-L148)

```typescript
for (const row of facturacionAgregada) {
  const monto = parseFloat(row.total) || 0;
  if (row.estado_pago === 'Pagado') {
    ingresosTotal += monto; // ← MRR viene de aquí
  }
}
```

**Query SQL Ejecutada**:

```sql
SELECT estado_pago, SUM(monto)::text as total
FROM facturacion_unificada
WHERE periodo = '2026-01'
GROUP BY estado_pago
```

**Por qué es $0**:

- La vista `facturacion_unificada` no tiene registros con `estado_pago = 'Pagado'`
- El seed crea inscripciones con `estado_pago: EstadoPago.Pendiente`
- No hay `pagos_suscripcion` con `mp_status = 'approved'`

### 2.2 ARR (Annual Recurring Revenue)

**Ubicación Frontend**: [FinanzasTab.tsx:39](apps/web/src/components/admin/views/dashboard/components/tabs/FinanzasTab.tsx#L39)

```typescript
const arr = mrr * 12;
```

**Cálculo**: `$0 × 12 = $0`

**Causa**: Depende 100% de MRR, si MRR = 0, ARR = 0.

### 2.3 Tasa de Cobro

**Ubicación Frontend**: [admin.api.ts:1069-1072](apps/web/src/lib/api/admin.api.ts#L1069-L1072)

```typescript
const totalFacturado = estadisticas.ingresosTotal + estadisticas.pagosPendientes;
const tasaCobro =
  totalFacturado > 0 ? Math.round((estadisticas.ingresosTotal / totalFacturado) * 1000) / 10 : 0;
```

**Cálculo Actual**:

```
totalFacturado = $0 + $255,000 = $255,000
tasaCobro = ($0 / $255,000) × 100 = 0%
```

**Nota**: El cálculo es correcto, pero `ingresosTotal = 0` porque no hay pagos "Pagado".

### 2.4 Por Cobrar (Pendientes)

**Ubicación Frontend**: [FinanzasTab.tsx:131](apps/web/src/components/admin/views/dashboard/components/tabs/FinanzasTab.tsx#L131)

```typescript
{
  formatCompactCurrency(stats.ingresosPendientes);
}
```

**Fuente Backend**: [admin-stats.service.ts:149-154](apps/api/src/admin/services/admin-stats.service.ts#L149-L154)

```typescript
} else if (row.estado_pago === 'Pendiente' || row.estado_pago === 'Vencido') {
  pagosPendientes += monto;
}
```

**Estado**: ✅ Funciona correctamente

- El seed crea 3 inscripciones con `estado_pago: Pendiente`
- La suma de las 3 = ~$255,000 ARS

### 2.5 Suscripciones Activas

**Ubicación**: [admin-stats.service.ts:115-117](apps/api/src/admin/services/admin-stats.service.ts#L115-L117)

```typescript
this.prisma.inscripcionUnificada.count({
  where: { estado: 'ACTIVA' },
});
```

**Estado**: ✅ Funciona correctamente

- Cuenta desde vista `inscripciones_unificadas`
- Hay 3 inscripciones activas del seed

---

## 3. Diagnóstico: Por Qué MRR = $0

### Causa Raíz

El seed (`clean-seed.ts`) crea inscripciones mensuales con estado `Pendiente`:

**Ubicación**: [clean-seed.ts:869](apps/api/prisma/seeds/clean-seed.ts#L869)

```typescript
await prisma.inscripcionMensual.create({
  data: {
    // ...
    estado_pago: EstadoPago.Pendiente, // ← TODOS PENDIENTES
    // ...
  },
});
```

### Para Que MRR > 0 Se Necesita

**Opción A**: Cambiar estado de inscripciones existentes a "Pagado"

```typescript
estado_pago: EstadoPago.Pagado,
fecha_pago: new Date(),
metodo_pago: 'Efectivo',
```

**Opción B**: Crear pagos de suscripción (MercadoPago)

```typescript
await prisma.pagoSuscripcion.create({
  data: {
    suscripcion_id: suscripcionFamiliar.id,
    monto: 85000,
    mp_status: 'approved', // ← approved = Pagado
    mp_payment_id: 'test-123',
    periodo_inicio: new Date(),
    periodo_fin: nextMonth,
  },
});
```

---

## 4. Verificación SQL

Para verificar el estado actual de la vista:

```sql
-- Ver todos los registros de facturación
SELECT fuente, estado_pago, COUNT(*), SUM(monto)
FROM facturacion_unificada
WHERE periodo = '2026-01'
GROUP BY fuente, estado_pago;

-- Resultado esperado (situación actual):
-- fuente | estado_pago | count | sum
-- -------+-------------+-------+--------
-- MANUAL | Pendiente   |     3 | 255000
```

---

## 5. Recomendación: Fix para Seed

Para que el dashboard muestre métricas realistas, el seed debe crear algunos pagos "Pagado":

### Cambio Sugerido

Modificar [clean-seed.ts:869](apps/api/prisma/seeds/clean-seed.ts#L869) para crear 1 pago pendiente y 2 pagados:

```typescript
// Alternar estados: primer hijo pagado, segundo pendiente, tercero pagado
const estadosPago = [EstadoPago.Pagado, EstadoPago.Pendiente, EstadoPago.Pagado];

await prisma.inscripcionMensual.create({
  data: {
    // ...
    estado_pago: estadosPago[i % 3],
    fecha_pago: estadosPago[i % 3] === EstadoPago.Pagado ? new Date() : null,
    metodo_pago: estadosPago[i % 3] === EstadoPago.Pagado ? 'Efectivo' : null,
    // ...
  },
});
```

### Resultado Esperado Post-Fix

| Métrica    | Valor Anterior | Valor Nuevo |
| ---------- | -------------- | ----------- |
| MRR        | $0             | ~$170,000   |
| ARR        | $0             | ~$2,040,000 |
| Tasa Cobro | 0%             | ~66%        |
| Por Cobrar | $255,000       | ~$85,000    |

---

## 6. Archivos Clave

| Archivo                                                                                                            | Responsabilidad                  |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| [FinanzasTab.tsx](apps/web/src/components/admin/views/dashboard/components/tabs/FinanzasTab.tsx)                   | UI de métricas financieras       |
| [admin.api.ts](apps/web/src/lib/api/admin.api.ts)                                                                  | Cliente API, combina endpoints   |
| [admin-stats.service.ts](apps/api/src/admin/services/admin-stats.service.ts)                                       | Cálculos backend de estadísticas |
| [facturacion_unificada](apps/api/prisma/migrations/20260120210000_create_facturacion_unificada_view/migration.sql) | Vista SSOT de pagos              |
| [clean-seed.ts](apps/api/prisma/seeds/clean-seed.ts)                                                               | Seed de datos de prueba          |

---

## 7. Conclusión

El sistema de métricas financieras está **correctamente implementado**. El MRR = $0 es un problema de **datos de prueba**, no de código:

1. ✅ La arquitectura es sólida (vista unificada SSOT)
2. ✅ Los cálculos son correctos
3. ❌ El seed solo crea pagos "Pendiente", no "Pagado"
4. ❌ No hay `pagos_suscripcion` (MercadoPago) en el seed

**Acción requerida**: Modificar el seed para crear algunos pagos con estado "Pagado".
