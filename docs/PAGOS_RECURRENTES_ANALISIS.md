# ANÁLISIS EXHAUSTIVO - SISTEMA DE PAGOS RECURRENTES MATEATLETAS

> **Fecha**: 2025-12-18
> **Versión**: 1.0
> **Estado**: COMPLETO

---

## TABLA DE CONTENIDOS

1. [Fase 0: Relevamiento del Estado Actual](#fase-0-relevamiento-del-estado-actual)
2. [Fase 1: Matriz de Escenarios de Usuario](#fase-1-matriz-de-escenarios-de-usuario)
3. [Fase 2: Vectores de Seguridad](#fase-2-vectores-de-seguridad)
4. [Fase 3: Puntos de Fallo y Recuperación](#fase-3-puntos-de-fallo-y-recuperación)
5. [Fase 4: Comparación Técnica PreApproval vs Customer+Card](#fase-4-comparación-técnica-preapproval-vs-customercard)
6. [Fase 5: Modelo de Datos Propuesto](#fase-5-modelo-de-datos-propuesto)
7. [Fase 6: Decisiones de Negocio Requeridas](#fase-6-decisiones-de-negocio-requeridas)
8. [Fase 7: Conclusiones y Recomendaciones](#fase-7-conclusiones-y-recomendaciones)

---

## FASE 0: RELEVAMIENTO DEL ESTADO ACTUAL

### 0.1 Modelo de Datos Prisma

#### Membresía (Suscripción de Tutor)

```prisma
model Membresia {
  id                     String          @id @default(cuid())
  tutor_id               String
  producto_id            String
  estado                 EstadoMembresia @default(Pendiente)
  fecha_inicio           DateTime?
  fecha_proximo_pago     DateTime?
  preferencia_id         String?
  mercadopago_payment_id String?
  createdAt              DateTime        @default(now())
  updatedAt              DateTime        @updatedAt

  @@index([tutor_id, estado])
  @@index([preferencia_id])
  @@map("membresias")
}

enum EstadoMembresia {
  Pendiente
  Activa
  Atrasada
  Cancelada
}
```

**Análisis**:

- ✅ Tiene `mercadopago_payment_id` para auditoría
- ✅ Índices apropiados
- ❌ **NO tiene campos para suscripción recurrente** (preapproval_id, card_token, customer_id)
- ❌ NO tiene historial de pagos vinculado
- ❌ NO tiene campo para razón de cancelación

#### InscripcionCurso (Pago Único)

```prisma
model InscripcionCurso {
  id                String                 @id @default(cuid())
  estudiante_id     String
  producto_id       String
  estado            EstadoInscripcionCurso @default(PreInscrito)
  fecha_inscripcion DateTime               @default(now())
  preferencia_id    String?
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt

  @@unique([estudiante_id, producto_id])
  @@index([estudiante_id, estado])
  @@index([preferencia_id])
}

enum EstadoInscripcionCurso {
  PreInscrito
  Activo
  Finalizado
}
```

#### Producto (Catálogo)

```prisma
model Producto {
  id                String    @id @default(cuid())
  nombre            String
  descripcion       String?
  precio            Decimal   @db.Decimal(10, 2)
  tipo              TipoProducto
  activo            Boolean   @default(true)
  duracion_meses    Int?      @default(1)
  // ...
}

enum TipoProducto {
  Suscripcion
  Curso
  RecursoDigital
}
```

#### Tabla de Idempotencia (WebhookProcessed)

```prisma
model WebhookProcessed {
  id                 String   @id @default(cuid())
  payment_id         String   @unique
  webhook_type       String
  status             String
  external_reference String
  processed_at       DateTime @default(now())
}
```

### 0.2 Servicios de Pago Existentes

| Servicio                        | Ubicación                                            | Responsabilidad                                     |
| ------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `MercadoPagoService`            | `pagos/mercadopago.service.ts`                       | Integración con SDK de MercadoPago, Circuit Breaker |
| `PagosTutorService`             | `pagos/presentation/services/pagos-tutor.service.ts` | Orquestación de flujos de tutor                     |
| `PaymentWebhookService`         | `pagos/services/payment-webhook.service.ts`          | Procesamiento de webhooks                           |
| `WebhookIdempotencyService`     | `pagos/services/webhook-idempotency.service.ts`      | Prevención de doble procesamiento                   |
| `PaymentAmountValidatorService` | `pagos/services/payment-amount-validator.service.ts` | Validación de montos (anti-fraude)                  |
| `PaymentAlertService`           | `pagos/services/payment-alert.service.ts`            | Sistema de alertas (chargebacks, fraude)            |
| `PaymentExpirationService`      | `pagos/services/payment-expiration.service.ts`       | Cron para expirar pendientes                        |
| `MercadoPagoIpWhitelistService` | `pagos/services/mercadopago-ip-whitelist.service.ts` | Validación IP de webhooks                           |

### 0.3 Flujo Actual de Pagos (Checkout Pro)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│ MercadoPago │────▶│   Webhook   │
│ (Tutor)     │     │  API        │     │   API       │     │  Callback   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │ POST /pagos/      │ createPreference  │                   │
       │ suscripcion       │─────────────────▶│                   │
       │                   │                   │                   │
       │◀──────────────────│◀─ init_point ─────│                   │
       │   init_point      │                   │                   │
       │                   │                   │                   │
       │ Redirect ────────────────────────────▶│ Checkout UI       │
       │                   │                   │                   │
       │                   │                   │ User pays         │
       │                   │                   │────────────────────▶
       │                   │                   │                   │
       │                   │ POST /pagos/webhook│◀──────────────────│
       │                   │◀──────────────────│                   │
       │                   │ Update Membresia  │                   │
       │                   │                   │                   │
```

### 0.4 Seguridad Actual Implementada

| Mecanismo             | Estado                  | Archivo                                |
| --------------------- | ----------------------- | -------------------------------------- |
| HMAC SHA256 Signature | ✅ Implementado         | `mercadopago-webhook.guard.ts:327-437` |
| IP Whitelisting       | ✅ Implementado         | `mercadopago-ip-whitelist.service.ts`  |
| Idempotencia          | ✅ Implementado         | `webhook-idempotency.service.ts`       |
| Validación de Montos  | ✅ Implementado         | `payment-amount-validator.service.ts`  |
| Timestamp Anti-Replay | ✅ Implementado (5 min) | `mercadopago-webhook.guard.ts:445-453` |
| live_mode Validation  | ✅ Implementado         | `mercadopago-webhook.guard.ts:296-317` |
| Alertas Chargeback    | ✅ Implementado         | `payment-alert.service.ts`             |
| Circuit Breaker       | ✅ Implementado         | `mercadopago.service.ts:37-57`         |

### 0.5 Cron Jobs Existentes

| Job                        | Schedule       | Función                                  |
| -------------------------- | -------------- | ---------------------------------------- |
| `PaymentExpirationService` | 3:00 AM diario | Expira inscripciones pendientes >30 días |
| `SecretRotationService`    | 9:00 AM diario | Verifica expiración de secrets           |

---

## FASE 1: MATRIZ DE ESCENARIOS DE USUARIO

### 1.1 Flujos Happy Path

#### 1.1.1 Onboarding Nuevo Suscriptor

| Paso | Actor | Acción                   | Sistema               | Resultado Esperado                |
| ---- | ----- | ------------------------ | --------------------- | --------------------------------- |
| 1    | Tutor | Selecciona plan mensual  | Frontend              | Muestra precio y detalles         |
| 2    | Tutor | Click "Suscribirse"      | Frontend → API        | `POST /pagos/suscripcion`         |
| 3    | API   | Crea Membresia pendiente | PrismaService         | Membresia creada estado=Pendiente |
| 4    | API   | Crea Preferencia MP      | MercadoPagoService    | Retorna `init_point`              |
| 5    | Tutor | Redirect a MercadoPago   | Frontend              | Checkout Pro renderizado          |
| 6    | Tutor | Completa pago            | MercadoPago           | Pago procesado                    |
| 7    | MP    | Envía webhook            | API                   | `POST /pagos/webhook`             |
| 8    | API   | Procesa webhook          | PaymentWebhookService | Valida firma, idempotencia, monto |
| 9    | API   | Actualiza Membresia      | PrismaService         | estado=Activa, fecha_inicio=NOW   |
| 10   | Tutor | Redirect success         | Frontend              | Ver dashboard con acceso          |

#### 1.1.2 Renovación Mensual (ACTUAL: NO AUTOMÁTICA)

**Estado Actual**: El sistema **NO tiene pagos recurrentes automáticos**.

| Paso | Actor   | Acción                     | Sistema          | Resultado Esperado            |
| ---- | ------- | -------------------------- | ---------------- | ----------------------------- |
| 1    | Sistema | Detecta fecha_proximo_pago | Cron (NO EXISTE) | -                             |
| 2    | -       | -                          | -                | **NO HAY FLUJO IMPLEMENTADO** |

**Gap Identificado**: Se requiere implementar suscripciones recurrentes.

#### 1.1.3 Upgrade de Plan

**Estado Actual**: NO IMPLEMENTADO

#### 1.1.4 Downgrade de Plan

**Estado Actual**: NO IMPLEMENTADO

#### 1.1.5 Cancelación Voluntaria

**Estado Actual**: PARCIALMENTE IMPLEMENTADO (solo admin puede cambiar estado)

### 1.2 Flujos de Error

#### 1.2.1 Tarjeta Rechazada

| Escenario            | Comportamiento Actual | Webhook Status | Acción del Sistema            |
| -------------------- | --------------------- | -------------- | ----------------------------- |
| Fondos insuficientes | Redirect a /error     | `rejected`     | Membresia permanece Pendiente |
| Tarjeta vencida      | Redirect a /error     | `rejected`     | Membresia permanece Pendiente |
| Límite excedido      | Redirect a /error     | `rejected`     | Membresia permanece Pendiente |
| Tarjeta bloqueada    | Redirect a /error     | `rejected`     | Membresia permanece Pendiente |

**Gap**: No hay sistema de reintentos ni notificación al usuario.

#### 1.2.2 Webhook Fallido

| Escenario         | Comportamiento Actual                          |
| ----------------- | ---------------------------------------------- |
| API down          | MercadoPago reintenta x3 (exponential backoff) |
| Firma inválida    | 401 Unauthorized, no procesa                   |
| IP no autorizada  | 403 Forbidden, alerta de seguridad             |
| Monto no coincide | No procesa, emite evento fraude                |

#### 1.2.3 Contracargos (Chargebacks)

| Escenario           | Comportamiento Actual                           |
| ------------------- | ----------------------------------------------- |
| Chargeback recibido | `PaymentAlertService.alertChargebackReceived()` |
|                     | Estado mapea a REEMBOLSADO                      |
|                     | Log en AuditLog                                 |
|                     | Evento emitido para handlers externos           |

**Gap**: No hay acción automática sobre la membresía (debería suspenderse).

---

## FASE 2: VECTORES DE SEGURIDAD

### 2.1 Análisis de Superficie de Ataque

| Vector                | Riesgo  | Mitigación Actual                | Estado         |
| --------------------- | ------- | -------------------------------- | -------------- |
| Webhook Spoofing      | CRÍTICO | HMAC SHA256 + IP Whitelist       | ✅ MITIGADO    |
| Replay Attack         | ALTO    | Idempotencia + Timestamp 5min    | ✅ MITIGADO    |
| Manipulación de Monto | CRÍTICO | Amount Validation (1% tolerance) | ✅ MITIGADO    |
| Sandbox en Producción | ALTO    | `live_mode` validation           | ✅ MITIGADO    |
| Tarjetas Robadas      | MEDIO   | Responsabilidad de MercadoPago   | ⚠️ PARCIAL     |
| Múltiples Cuentas     | BAJO    | No implementado                  | ❌ NO MITIGADO |
| Card Testing          | MEDIO   | Rate limiting en MP              | ⚠️ PARCIAL     |

### 2.2 Detalle de Mitigaciones Implementadas

#### 2.2.1 Validación de Firma HMAC

```typescript
// mercadopago-webhook.guard.ts:327-437
private validateSignature(
  signatureHeader: string | undefined,
  body: MercadoPagoWebhookBody,
  rawBody?: string,
): SignatureValidationResult {
  // Parsea: "ts=1234567890,v1=abcdef..."
  // Calcula: HMAC-SHA256(timestamp + '.' + rawBody, secret)
  // Compara: crypto.timingSafeEqual()
}
```

**Fortalezas**:

- Usa `rawBody` para evitar problemas de serialización JSON
- Comparación timing-safe previene timing attacks
- Logging detallado para debugging

#### 2.2.2 IP Whitelisting

```typescript
// mercadopago-ip-whitelist.service.ts:48-58
private readonly officialIpRanges: string[] = [
  '209.225.49.0/24',   // MercadoPago primary
  '216.33.197.0/24',   // MercadoPago secondary
  '216.33.196.0/24',   // MercadoPago tertiary
  '35.186.0.0/16',     // GCP (usado por MP webhooks)
  '35.245.0.0/16',     // GCP us-central1
];
```

**Riesgos**:

- ⚠️ Rango `186.139.0.0/16` marcado como "TEMPORAL" debería removerse
- Los rangos de GCP son muy amplios

#### 2.2.3 Validación de Montos

```typescript
// payment-amount-validator.service.ts:52
private readonly TOLERANCE_PERCENTAGE = 0.01; // 1%
```

**Lógica**:

1. Obtener precio esperado de DB (con cache Redis 2min)
2. Comparar con `transaction_amount` del webhook
3. Si diferencia > 1%, rechazar y emitir alerta de fraude

### 2.3 Gaps de Seguridad Identificados

| Gap                            | Severidad | Descripción                              | Recomendación                                       |
| ------------------------------ | --------- | ---------------------------------------- | --------------------------------------------------- |
| Sin rate limiting propio       | MEDIO     | Dependemos 100% de MercadoPago           | Implementar throttling en webhook                   |
| Chargeback sin acción          | ALTO      | Membresía no se suspende automáticamente | Agregar handler que suspenda acceso                 |
| IP range GCP muy amplio        | BAJO      | Potencial spoofing desde GCP             | Monitorear y ajustar según necesidad                |
| Sin auditoría de cancelaciones | MEDIO     | No hay log de quién/cuándo canceló       | Agregar campo `cancelado_por`, `motivo_cancelacion` |

---

## FASE 3: PUNTOS DE FALLO Y RECUPERACIÓN

### 3.1 Matriz de Fallos

| Componente        | Tipo de Fallo       | Impacto                | Detección                  | Recuperación                    |
| ----------------- | ------------------- | ---------------------- | -------------------------- | ------------------------------- |
| MercadoPago API   | Timeout             | No se crea preferencia | Circuit Breaker (3 fallos) | Retry automático después de 60s |
| Redis             | Down                | Cache miss             | Try-catch con fallback     | Fallback a DB directo           |
| PostgreSQL        | Down                | Sistema inoperativo    | Health check               | Reboot, failover                |
| Webhook Endpoint  | 5xx                 | MP reintenta           | Logs, alerting             | Auto-recuperación               |
| Webhook Duplicado | Doble procesamiento | N/A (prevenido)        | Log warning                | Idempotencia funciona           |

### 3.2 Circuit Breaker Configuration

```typescript
// mercadopago.service.ts:37-57
this.preferenceCircuitBreaker = new CircuitBreaker({
  name: 'MercadoPago-CreatePreference',
  failureThreshold: 3, // 3 fallos consecutivos → abre circuito
  resetTimeout: 60000, // 60 segundos antes de reintentar
  fallback: () => {
    throw new Error('MercadoPago API is temporarily unavailable...');
  },
});
```

### 3.3 Estrategias de Recuperación

#### Membresía Stuck en Pendiente

```sql
-- Query para detectar membresías abandonadas
SELECT * FROM membresias
WHERE estado = 'Pendiente'
AND createdAt < NOW() - INTERVAL '30 days';
```

**Actual**: `PaymentExpirationService` las expira a las 3AM.

#### Webhook Perdido

**Actual**: MercadoPago reintenta 3 veces con backoff exponencial.

**Recomendación**: Implementar polling manual para pagos pendientes >1 hora.

---

## FASE 4: COMPARACIÓN TÉCNICA PREAPPROVAL VS CUSTOMER+CARD

### 4.1 Opción A: MercadoPago PreApproval (Suscripciones Nativas)

#### Descripción

MercadoPago gestiona completamente el ciclo de vida de la suscripción, incluyendo cobros automáticos y reintentos.

#### Ventajas

| Aspecto               | Beneficio                               |
| --------------------- | --------------------------------------- |
| Simplicidad           | MP maneja todo el ciclo de vida         |
| Cumplimiento PCI      | Zero liability (nunca tocamos tarjetas) |
| Reintentos            | MP hace reintentos automáticos          |
| Dunning               | MP envía emails de pago fallido         |
| Actualización tarjeta | Link automático para actualizar         |

#### Desventajas

| Aspecto            | Problema                                                |
| ------------------ | ------------------------------------------------------- |
| Control limitado   | No podemos forzar cobro en fecha específica             |
| Prorratas          | Cálculo de upgrades/downgrades es complejo              |
| Webhooks complejos | Múltiples eventos (created, pending, paused, cancelled) |
| Testing            | Sandbox no simula bien todos los escenarios             |

#### Endpoints Requeridos

```typescript
// Crear suscripción
POST https://api.mercadopago.com/preapproval

// Cancelar suscripción
PUT https://api.mercadopago.com/preapproval/{id}

// Webhook events: subscription_preapproval
```

#### Modelo de Datos Requerido

```prisma
model Suscripcion {
  id                    String   @id @default(cuid())
  tutor_id              String
  producto_id           String

  // MercadoPago PreApproval
  preapproval_id        String   @unique
  preapproval_plan_id   String?
  status                SuscripcionStatus

  // Fechas
  fecha_inicio          DateTime
  fecha_proximo_cobro   DateTime?
  fecha_cancelacion     DateTime?

  // Auditoría
  motivo_cancelacion    String?
  cancelado_por         String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum SuscripcionStatus {
  PENDING
  AUTHORIZED
  PAUSED
  CANCELLED
}
```

### 4.2 Opción B: Customer + Card Token (Cobros Manuales)

#### Descripción

Guardamos el `customer_id` y `card_token` de MercadoPago para hacer cobros programados nosotros.

#### Ventajas

| Aspecto       | Beneficio                             |
| ------------- | ------------------------------------- |
| Control total | Cobramos cuando queremos              |
| Flexibilidad  | Prorratas, descuentos, pausas fáciles |
| Testing       | Más fácil de simular                  |
| Integración   | Consistente con flujo actual          |

#### Desventajas

| Aspecto       | Problema                                    |
| ------------- | ------------------------------------------- |
| PCI-DSS       | Más responsabilidad (aunque tokens, no PAN) |
| Reintentos    | Debemos implementar lógica de reintentos    |
| Dunning       | Debemos implementar notificaciones          |
| Mantenimiento | Más código para mantener                    |
| Card update   | Usuario debe re-ingresar tarjeta si expira  |

#### Endpoints Requeridos

```typescript
// Crear customer
POST https://api.mercadopago.com/v1/customers

// Guardar tarjeta
POST https://api.mercadopago.com/v1/customers/{id}/cards

// Cobrar
POST https://api.mercadopago.com/v1/payments
{
  "token": "card_token",
  "customer_id": "customer_id",
  ...
}
```

#### Modelo de Datos Requerido

```prisma
model MercadoPagoCustomer {
  id                String   @id @default(cuid())
  tutor_id          String   @unique
  mp_customer_id    String   @unique
  email             String
  createdAt         DateTime @default(now())
}

model MercadoPagoCard {
  id                String   @id @default(cuid())
  customer_id       String
  mp_card_id        String   @unique
  last_four_digits  String
  expiration_month  Int
  expiration_year   Int
  issuer_name       String
  is_default        Boolean  @default(false)
  createdAt         DateTime @default(now())

  customer          MercadoPagoCustomer @relation(...)
}

model SuscripcionMensual {
  id                String   @id @default(cuid())
  tutor_id          String
  producto_id       String
  card_id           String?

  estado            EstadoSuscripcion
  fecha_proximo_cobro DateTime
  intentos_fallidos Int      @default(0)

  pagos             PagoSuscripcion[]
}

model PagoSuscripcion {
  id                String   @id @default(cuid())
  suscripcion_id    String
  mp_payment_id     String   @unique
  monto             Decimal
  estado            EstadoPago
  fecha_intento     DateTime
  error_message     String?
}
```

### 4.3 Comparación Lado a Lado

| Criterio                           | PreApproval | Customer+Card | Recomendación |
| ---------------------------------- | ----------- | ------------- | ------------- |
| **Complejidad inicial**            | Baja        | Media         | PreApproval   |
| **Complejidad mantenimiento**      | Baja        | Alta          | PreApproval   |
| **Control de fechas**              | Bajo        | Alto          | Customer+Card |
| **Prorratas**                      | Difícil     | Fácil         | Customer+Card |
| **PCI Compliance**                 | Cero        | Bajo          | PreApproval   |
| **Testing**                        | Difícil     | Fácil         | Customer+Card |
| **Dunning emails**                 | Incluido    | Manual        | PreApproval   |
| **Reintentos**                     | Automático  | Manual        | PreApproval   |
| **Consistencia con código actual** | Nuevo       | Similar       | Customer+Card |

### 4.4 Recomendación

**Para Mateatletas recomiendo: PreApproval (Opción A)**

**Razones**:

1. **Menor riesgo de fraude**: Zero PCI liability
2. **Menos código para mantener**: MP maneja reintentos y dunning
3. **Mejor UX**: Usuario puede actualizar tarjeta desde portal MP
4. **Escalabilidad**: Sin preocupación por cron jobs de cobro

**Con la condición de**:

- Implementar handlers robustos para todos los webhooks de PreApproval
- Agregar sistema de fallback si MP falla
- Mantener logs detallados para soporte

---

## FASE 5: MODELO DE DATOS PROPUESTO

### 5.1 Esquema Completo para PreApproval

```prisma
// ============================================
// MODELO DE SUSCRIPCIONES RECURRENTES v2.0
// ============================================

/// Plan de suscripción disponible
model PlanSuscripcion {
  id                    String   @id @default(cuid())
  nombre                String   // "Plan Mensual", "Plan Anual"
  descripcion           String?
  precio                Decimal  @db.Decimal(10, 2)
  moneda                String   @default("ARS")
  intervalo             Intervalo
  intervalo_cantidad    Int      @default(1) // 1 mes, 12 meses, etc.
  periodo_prueba_dias   Int?     @default(0)
  activo                Boolean  @default(true)

  // MercadoPago PreApproval Plan
  mp_plan_id            String?  @unique

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  suscripciones         Suscripcion[]

  @@map("planes_suscripcion")
}

enum Intervalo {
  DIARIO
  SEMANAL
  MENSUAL
  ANUAL
}

/// Suscripción activa de un tutor
model Suscripcion {
  id                    String   @id @default(cuid())
  tutor_id              String
  plan_id               String

  // MercadoPago PreApproval
  mp_preapproval_id     String   @unique
  mp_init_point         String?  // URL para completar suscripción

  // Estados
  estado                EstadoSuscripcion @default(PENDING)
  estado_anterior       EstadoSuscripcion?

  // Fechas
  fecha_inicio          DateTime?
  fecha_proximo_cobro   DateTime?
  fecha_fin             DateTime?
  fecha_cancelacion     DateTime?
  fecha_pausa           DateTime?

  // Auditoría
  motivo_cancelacion    String?
  cancelado_por         String?  // user_id o 'system' o 'mercadopago'

  // Historial
  intentos_cobro_mes    Int      @default(0)
  total_cobrado         Decimal  @default(0) @db.Decimal(10, 2)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relaciones
  tutor                 Tutor    @relation(fields: [tutor_id], references: [id])
  plan                  PlanSuscripcion @relation(fields: [plan_id], references: [id])
  pagos                 PagoSuscripcion[]
  historial_estados     HistorialEstadoSuscripcion[]

  @@index([tutor_id])
  @@index([estado])
  @@index([mp_preapproval_id])
  @@map("suscripciones")
}

enum EstadoSuscripcion {
  PENDING       // Esperando primer pago
  AUTHORIZED    // Activa, cobros funcionando
  PAUSED        // Pausada temporalmente
  CANCELLED     // Cancelada definitivamente
}

/// Registro de cada pago de suscripción
model PagoSuscripcion {
  id                    String   @id @default(cuid())
  suscripcion_id        String

  // MercadoPago Payment
  mp_payment_id         String   @unique
  mp_status             String   // approved, rejected, pending, etc.
  mp_status_detail      String?

  // Montos
  monto                 Decimal  @db.Decimal(10, 2)
  moneda                String   @default("ARS")

  // Período
  periodo_inicio        DateTime
  periodo_fin           DateTime

  // Fechas
  fecha_cobro           DateTime?
  fecha_intento         DateTime @default(now())

  // Error tracking
  error_code            String?
  error_message         String?
  intento_numero        Int      @default(1)

  createdAt             DateTime @default(now())

  suscripcion           Suscripcion @relation(fields: [suscripcion_id], references: [id])

  @@index([suscripcion_id])
  @@index([mp_payment_id])
  @@map("pagos_suscripcion")
}

/// Historial de cambios de estado de suscripción (auditoría)
model HistorialEstadoSuscripcion {
  id                    String   @id @default(cuid())
  suscripcion_id        String

  estado_anterior       EstadoSuscripcion?
  estado_nuevo          EstadoSuscripcion

  motivo                String?
  realizado_por         String?  // user_id, 'system', 'mercadopago'
  ip_address            String?

  metadata              Json?
  timestamp             DateTime @default(now())

  suscripcion           Suscripcion @relation(fields: [suscripcion_id], references: [id])

  @@index([suscripcion_id])
  @@map("historial_estado_suscripcion")
}

/// Tabla de idempotencia para webhooks de suscripción
model WebhookSuscripcionProcessed {
  id                    String   @id @default(cuid())
  event_id              String   @unique  // ID del evento de MP
  event_type            String   // subscription_preapproval, payment, etc.
  preapproval_id        String?
  payment_id            String?
  status                String
  processed_at          DateTime @default(now())

  @@index([preapproval_id])
  @@map("webhooks_suscripcion_processed")
}
```

### 5.2 Migración desde Modelo Actual

```sql
-- Paso 1: Crear nuevas tablas
-- (Prisma migrate generará esto)

-- Paso 2: Migrar membresías activas a suscripciones
INSERT INTO suscripciones (
  id,
  tutor_id,
  plan_id,
  mp_preapproval_id,
  estado,
  fecha_inicio,
  fecha_proximo_cobro,
  createdAt
)
SELECT
  m.id,
  m.tutor_id,
  (SELECT id FROM planes_suscripcion WHERE nombre = 'Plan Mensual' LIMIT 1),
  CONCAT('legacy-', m.id),  -- Placeholder hasta migrar a PreApproval real
  CASE
    WHEN m.estado = 'Activa' THEN 'AUTHORIZED'
    WHEN m.estado = 'Pendiente' THEN 'PENDING'
    WHEN m.estado = 'Cancelada' THEN 'CANCELLED'
    ELSE 'PENDING'
  END,
  m.fecha_inicio,
  m.fecha_proximo_pago,
  m.createdAt
FROM membresias m
WHERE m.estado != 'Cancelada';

-- Paso 3: Marcar tabla legacy como deprecated
ALTER TABLE membresias ADD COLUMN migrated BOOLEAN DEFAULT false;
UPDATE membresias SET migrated = true WHERE id IN (SELECT id FROM suscripciones);
```

---

## FASE 6: DECISIONES DE NEGOCIO REQUERIDAS

### 6.1 Matriz de Decisiones

| #   | Decisión                                   | Opciones                | Impacto Técnico   | Requiere Respuesta |
| --- | ------------------------------------------ | ----------------------- | ----------------- | ------------------ |
| 1   | ¿Período de gracia en mora?                | 0 / 3 / 7 días          | Config en sistema | ✅                 |
| 2   | ¿Reintentos de cobro?                      | 0 / 3 / 5 intentos      | Lógica de retry   | ✅                 |
| 3   | ¿Notificar antes de cobro?                 | Sí / No + días antes    | Emails/push       | ✅                 |
| 4   | ¿Permitir pausa de suscripción?            | Sí / No + máximo meses  | Estado PAUSED     | ✅                 |
| 5   | ¿Prorratas en cambio de plan?              | Sí / No                 | Cálculo complejo  | ✅                 |
| 6   | ¿Cobro por adelantado o vencido?           | Adelantado / Vencido    | Fechas de cobro   | ✅                 |
| 7   | ¿Qué pasa con estudiantes si tutor moroso? | Bloquear / Aviso / Nada | Lógica de acceso  | ✅                 |

### 6.2 Preguntas Pendientes para el Negocio

1. **¿Cuántos días de gracia antes de suspender acceso?**
   - Recomendación: 3 días laborables

2. **¿Enviar email X días antes del cobro?**
   - Recomendación: 3 días antes

3. **¿Permitir pausar suscripción? ¿Por cuánto tiempo máximo?**
   - Recomendación: Sí, máximo 2 meses

4. **¿Qué mensaje mostrar al estudiante si el tutor está moroso?**
   - Recomendación: "Tu acceso está temporalmente suspendido. Contacta a tu tutor."

5. **¿Se aplica prorrateo al cambiar de plan mensual a anual?**
   - Recomendación: Sí, crédito proporcional

---

## FASE 7: CONCLUSIONES Y RECOMENDACIONES

### 7.1 Resumen del Estado Actual

| Aspecto                   | Estado       | Nota                                                  |
| ------------------------- | ------------ | ----------------------------------------------------- |
| Pagos únicos              | ✅ FUNCIONAL | Checkout Pro bien implementado                        |
| Seguridad webhooks        | ✅ EXCELENTE | HMAC + IP + Idempotencia + Amount validation          |
| Suscripciones recurrentes | ❌ NO EXISTE | Requiere implementación completa                      |
| Manejo de errores         | ⚠️ PARCIAL   | Falta retry, notificaciones                           |
| Auditoría                 | ⚠️ PARCIAL   | Existe AuditLog pero falta historial de suscripciones |
| Testing                   | ✅ BUENO     | 1984 tests pasando                                    |

### 7.2 Riesgos Críticos

1. **Sin pagos recurrentes**: Cada mes el tutor debe pagar manualmente
2. **Chargeback sin acción**: Membresía no se suspende automáticamente
3. **Sin notificaciones de pago**: Usuario no sabe si falló el cobro
4. **Sin sistema de reintentos**: Un fallo = pérdida del cobro

### 7.3 Plan de Implementación Recomendado

#### Fase 1: Fundamentos (1-2 semanas)

1. Crear modelo de datos `Suscripcion`, `PagoSuscripcion`, `PlanSuscripcion`
2. Implementar `MercadoPagoPreApprovalService`
3. Agregar webhooks para `subscription_preapproval`

#### Fase 2: Flujos Core (2-3 semanas)

1. Endpoint `POST /suscripciones/crear`
2. Endpoint `POST /suscripciones/{id}/cancelar`
3. Endpoint `POST /suscripciones/{id}/pausar`
4. Handler de webhooks de suscripción

#### Fase 3: Notificaciones (1 semana)

1. Email de cobro exitoso
2. Email de cobro fallido
3. Email de suscripción próxima a vencer
4. Email de suscripción cancelada

#### Fase 4: Dashboard Admin (1 semana)

1. Vista de suscripciones activas
2. Métricas de MRR (Monthly Recurring Revenue)
3. Lista de suscripciones morosas
4. Acciones manuales (pausar, cancelar, reactivar)

### 7.4 Métricas de Éxito

| Métrica                         | Objetivo     | Cómo Medir                            |
| ------------------------------- | ------------ | ------------------------------------- |
| Tasa de conversión              | >80%         | Suscripciones completadas / iniciadas |
| Tasa de retención               | >90% mensual | Suscripciones activas mes N / mes N-1 |
| Tasa de cobro exitoso           | >95%         | Pagos aprobados / intentados          |
| Tiempo de resolución de errores | <24h         | Tiempo desde fallo hasta resolución   |
| Chargebacks                     | <0.5%        | Chargebacks / total transacciones     |

---

## APÉNDICES

### A. Archivos Clave del Sistema Actual

| Archivo                                              | Líneas | Responsabilidad          |
| ---------------------------------------------------- | ------ | ------------------------ |
| `pagos/mercadopago.service.ts`                       | 402    | SDK MP + Circuit Breaker |
| `pagos/services/payment-webhook.service.ts`          | 408    | Procesamiento webhooks   |
| `pagos/guards/mercadopago-webhook.guard.ts`          | 455    | Seguridad webhooks       |
| `pagos/services/payment-alert.service.ts`            | 353    | Sistema de alertas       |
| `pagos/presentation/services/pagos-tutor.service.ts` | 453    | Orquestación tutor       |
| `domain/constants/payment.constants.ts`              | 333    | Constantes y mapeos      |

### B. External References Soportados

| Tipo              | Formato                                          | Ejemplo                                                |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Membresía         | `membresia-{id}-tutor-{id}-producto-{id}`        | `membresia-abc123-tutor-def456-producto-ghi789`        |
| Inscripción Curso | `inscripcion-{id}-estudiante-{id}-producto-{id}` | `inscripcion-abc123-estudiante-def456-producto-ghi789` |
| Inscripción 2026  | `inscripcion2026-{id}-tutor-{id}-tipo-{tipo}`    | `inscripcion2026-abc123-tutor-def456-tipo-COLONIA`     |

### C. Estados de MercadoPago Mapeados

| Estado MP      | Estado Interno | Acción                      |
| -------------- | -------------- | --------------------------- |
| `pending`      | `PENDIENTE`    | Esperar                     |
| `approved`     | `PAGADO`       | Activar servicio            |
| `authorized`   | `PAGADO`       | Activar servicio            |
| `in_process`   | `PENDIENTE`    | Esperar                     |
| `rejected`     | `RECHAZADO`    | Notificar usuario           |
| `cancelled`    | `CANCELADO`    | Desactivar servicio         |
| `refunded`     | `REEMBOLSADO`  | Desactivar + alerta         |
| `charged_back` | `REEMBOLSADO`  | Desactivar + alerta CRÍTICA |

---

**Documento generado**: 2025-12-18
**Autor**: Claude (análisis automatizado)
**Próxima revisión sugerida**: Al iniciar implementación de suscripciones
