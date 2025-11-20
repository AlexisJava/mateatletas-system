# 🚨 AUDITORÍA CRÍTICA: SISTEMA DE PAGOS EN PRODUCCIÓN

**Fecha:** 2025-11-20
**Auditor:** Claude Code
**Severidad:** 🔴 **CRÍTICA**

---

## 📋 RESUMEN EJECUTIVO

La landing page con formularios de inscripción **está en producción** pero el sistema de pagos **NO está funcional** debido a configuración incompleta de MercadoPago. Si un usuario intenta inscribirse en este momento, **el sistema fallará completamente**.

---

## 🔴 HALLAZGOS CRÍTICOS

### 1. **MercadoPago configurado en MODO MOCK en producción**

**Ubicación:** `.env.vercel.production:15`

```bash
MERCADOPAGO_ACCESS_TOKEN="TEST-XXXXXXXX-XXXXXX-XXXXXX-XXXXXX"
```

**Impacto:**
- ❌ El servicio detecta tokens inválidos y activa `mockMode = true`
- ❌ Cualquier intento de crear una preferencia de pago lanzará un error:
  ```
  "MercadoPago está en modo mock. Use MockPagosService para crear preferencias mock."
  ```
- ❌ Los webhooks no podrán procesar pagos reales
- ❌ **Los usuarios NO pueden completar inscripciones**

**Código afectado:** `apps/api/src/pagos/mercadopago.service.ts:64-68`
```typescript
if (!accessToken || accessToken.includes('XXXXXXXX')) {
  this.logger.warn('⚠️  MercadoPago en MODO MOCK...');
  this.mockMode = true;
}
```

---

### 2. **Flujo de inscripción expuesto públicamente**

**URLs en producción:**
- Landing page: `https://www.mateatletasclub.com.ar/`
- Endpoint de inscripción: `POST /api/inscripciones-2026` ✅ (funcional)
- Endpoint de webhook: `POST /api/inscripciones-2026/webhook` ✅ (funcional)

**Flujo actual cuando un usuario intenta inscribirse:**

```mermaid
Usuario → Landing Page → Modal de Inscripción
                              ↓
                    POST /inscripciones-2026
                              ↓
                    createInscripcion2026()
                              ↓
                    mercadoPagoService.createPreference()
                              ↓
                    💥 ERROR: "MercadoPago está en modo mock"
                              ↓
                    ❌ Usuario recibe error 500
                    ❌ NO se crea la preferencia
                    ❌ NO se redirige a MercadoPago
```

---

### 3. **Variables faltantes o con valores mock**

| Variable | Estado Actual | Valor Esperado | Severidad |
|----------|---------------|----------------|-----------|
| `MERCADOPAGO_ACCESS_TOKEN` | `TEST-XXXXXXXX...` | Token real de producción | 🔴 CRÍTICO |
| `MERCADOPAGO_WEBHOOK_SECRET` | `VALUE or ${(REF)}` | Secret real para validar webhooks | 🟠 ALTO |
| `MERCADOPAGO_PUBLIC_KEY` | ❌ No definida | Clave pública (frontend) | 🟡 MEDIO |

---

## 🛠️ ANÁLISIS TÉCNICO

### **Endpoints afectados:**

1. **POST /api/inscripciones-2026** (PÚBLICO)
   - Crea inscripción 2026
   - Intenta generar preferencia de MercadoPago
   - **FALLA** en `mercadoPagoService.createPreference()`

2. **POST /api/inscripciones-2026/webhook** (WEBHOOK)
   - Recibe notificaciones de MercadoPago
   - Protegido con `MercadoPagoWebhookGuard`
   - **NUNCA recibirá webhooks** porque no hay pagos reales

3. **POST /api/pagos/webhook** (WEBHOOK)
   - Webhook genérico de pagos
   - También afectado por modo mock

4. **POST /api/pagos/suscripcion** (AUTENTICADO)
   - Genera preferencias para membresías
   - También en modo mock

5. **POST /api/pagos/curso** (AUTENTICADO)
   - Genera preferencias para cursos
   - También en modo mock

### **Servicios de protección que SÍ funcionan:**

✅ **Idempotencia de webhooks:** `WebhookIdempotencyService`
✅ **Validación de montos:** `PaymentAmountValidatorService`
✅ **Circuit Breaker:** Protección contra fallos de API
✅ **Transacciones atómicas:** En `Inscripciones2026Service`
✅ **Validación de firma HMAC:** `MercadoPagoWebhookGuard`

**PERO** ninguno de estos se ejecutará porque MercadoPago está en modo mock.

---

## 📊 RIESGO DE NEGOCIO

### **Si el sistema queda así:**

| Escenario | Probabilidad | Impacto | Consecuencia |
|-----------|--------------|---------|--------------|
| Usuario intenta inscribirse | 🔴 ALTA | 🔴 CRÍTICO | Error 500, pérdida de conversión |
| Usuario abandona el proceso | 🔴 ALTA | 🔴 ALTO | Pérdida de ingresos |
| Reputación dañada | 🟠 MEDIA | 🟠 ALTO | "La página no funciona" |
| Múltiples intentos fallidos | 🟠 MEDIA | 🟡 MEDIO | Saturación de logs con errores |

### **Estimación de pérdidas:**

- **Conversión esperada:** ~5-10% de visitantes
- **Ticket promedio:** $55,000 - $60,000
- **Costo por día sin funcionar:** Pérdida de todas las conversiones potenciales

---

## ✅ SOLUCIÓN INMEDIATA

### **Opción 1: Deshabilitar inscripciones hasta tener credenciales**

```typescript
// apps/web/src/components/pricing/PricingCards.tsx
const handleSubscribe = (planId: string) => {
  alert('Inscripciones temporalmente cerradas. ¡Volvé pronto!');
  return;
  // ... resto del código
};
```

### **Opción 2: Configurar MercadoPago correctamente (RECOMENDADO)**

**Pasos:**

1. **Obtener credenciales reales de MercadoPago:**
   - Ir a: https://www.mercadopago.com.ar/developers/panel/app
   - Obtener `Access Token` de PRODUCCIÓN (no TEST)
   - Copiar `Public Key` de PRODUCCIÓN
   - Configurar webhook secret en MercadoPago

2. **Actualizar variables en Railway:**
   ```bash
   railway variables set MERCADOPAGO_ACCESS_TOKEN="APP-XXXXXXXXXXXXXXXX"
   railway variables set MERCADOPAGO_WEBHOOK_SECRET="tu-secret-generado"
   ```

3. **Actualizar variables en Vercel:**
   ```bash
   vercel env add MERCADOPAGO_ACCESS_TOKEN production
   # Pegar el token real cuando lo pida

   vercel env add MERCADOPAGO_WEBHOOK_SECRET production
   # Pegar el secret cuando lo pida
   ```

4. **Configurar webhooks en MercadoPago:**
   - URL: `https://mateatletas-system-production.up.railway.app/api/inscripciones-2026/webhook`
   - Eventos: `payment.created`, `payment.updated`

5. **Redeploy:**
   ```bash
   railway up  # Backend
   vercel --prod  # Frontend
   ```

---

## 🔍 VERIFICACIÓN POST-CONFIGURACIÓN

### **Tests manuales:**

1. **Verificar que MercadoPago salió de modo mock:**
   ```bash
   curl https://mateatletas-system-production.up.railway.app/api/health
   # Buscar en logs: "✅ MercadoPago SDK initialized successfully"
   ```

2. **Test de inscripción end-to-end:**
   - Ir a landing page
   - Llenar formulario de inscripción
   - Verificar que redirige a MercadoPago
   - Hacer un pago de prueba (con tarjeta de test)
   - Verificar que webhook actualiza el estado

3. **Verificar webhook funciona:**
   ```bash
   # Simular webhook desde MercadoPago (usar herramienta de testing de MP)
   ```

---

## 📝 RECOMENDACIONES ADICIONALES

### **Corto plazo (antes de lanzar):**

1. ✅ Agregar banner de mantenimiento si no se puede configurar MP ahora
2. ✅ Configurar monitoring/alertas para errores de MercadoPago
3. ✅ Documentar proceso de configuración de credenciales
4. ✅ Crear checklist de deployment para producción

### **Mediano plazo (mejoras):**

1. 🔄 Agregar endpoint `/api/health` que incluya estado de MercadoPago
2. 🔄 Implementar feature flag para habilitar/deshabilitar inscripciones
3. 🔄 Agregar tests E2E para flujo completo de inscripción
4. 🔄 Mejorar mensajes de error para usuarios (no mostrar error 500)

### **Largo plazo (arquitectura):**

1. 📈 Separar modo "test" vs "production" con diferentes tokens
2. 📈 Implementar sistema de staging completo
3. 📈 Agregar dashboard admin para ver estado de integraciones

---

## 📞 CONTACTO

Si necesitás ayuda con la configuración:
1. Revisar docs de MercadoPago: https://www.mercadopago.com.ar/developers/
2. Contactar soporte de MercadoPago para credenciales
3. Verificar que la cuenta de MP esté activa y aprobada

---

## 🎯 CONCLUSIÓN

**Estado actual:** 🔴 SISTEMA NO FUNCIONAL EN PRODUCCIÓN

**Acción requerida:** INMEDIATA

**Próximos pasos:**
1. Decidir si deshabilitar temporalmente o configurar MercadoPago YA
2. Obtener credenciales reales de MercadoPago
3. Configurar variables de entorno
4. Testear end-to-end antes de habilitar inscripciones públicamente

**Riesgo si no se actúa:** Pérdida de conversiones, reputación dañada, frustración de usuarios.