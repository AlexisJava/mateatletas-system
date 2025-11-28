# 🔧 GUÍA PASO A PASO: CONFIGURAR MERCADOPAGO EN PRODUCCIÓN

**Fecha:** 2025-11-20
**Objetivo:** Configurar credenciales reales de MercadoPago en Railway y Vercel
**Estado:** 🚨 **URGENTE - SISTEMA NO FUNCIONAL SIN ESTO**

---

## ⚠️ PROBLEMA ACTUAL

Tu sistema tiene `MERCADOPAGO_ACCESS_TOKEN="TEST-XXXXXXXX..."` en producción, lo que significa:

- ❌ MercadoPago está en **modo mock**
- ❌ Los usuarios **NO pueden pagar**
- ❌ Todas las inscripciones **fallarán con error 500**

---

## 📋 PASOS PARA SOLUCIONAR

### **PASO 1: Obtener Credenciales Reales de MercadoPago**

#### 1.1. Ingresar al Panel de Desarrolladores

🔗 **URL:** https://www.mercadopago.com.ar/developers/panel/app

#### 1.2. Crear o Seleccionar Aplicación

- Si no tenés una aplicación, crear una nueva: **"Mateatletas"**
- Tipo: **"Marketplace y plataformas"** o **"Pagos online"**

#### 1.3. Obtener Credenciales de PRODUCCIÓN

⚠️ **IMPORTANTE:** Necesitás credenciales de **PRODUCCIÓN**, NO de TEST

En el panel, ir a:

```
Tu aplicación → Credenciales → Credenciales de producción
```

Vas a ver 2 credenciales:

1. **Public Key** (comienza con `APP_USR-...`)
2. **Access Token** (comienza con `APP_USR-...`)

**Copiar ambas** y guardarlas en un lugar seguro temporalmente.

#### 1.4. Verificar Estado de la Aplicación

- La aplicación debe estar **ACTIVA** y **APROBADA** por MercadoPago
- Si está en "Pendiente de aprobación", contactar soporte de MercadoPago

---

### **PASO 2: Generar Webhook Secret**

El `MERCADOPAGO_WEBHOOK_SECRET` es un secret que vos mismo generás para validar webhooks.

#### Opción A: Generar con Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Opción B: Generar con OpenSSL

```bash
openssl rand -hex 32
```

**Copiar** el resultado (será algo como: `a3f5d9e2c8b1...`)

---

### **PASO 3: Configurar Variables en Railway (Backend)**

#### 3.1. Listar Servicios en Railway

```bash
railway link
```

Seleccionar: **Mateatletas-System** → **production**

#### 3.2. Agregar Variables

```bash
# Access Token de MercadoPago (PRODUCCIÓN)
railway variables set MERCADOPAGO_ACCESS_TOKEN="APP_USR-XXXXXXXX-XXXXXX-XXXXXX-XXXXXX"

# Webhook Secret (el que generaste en Paso 2)
railway variables set MERCADOPAGO_WEBHOOK_SECRET="a3f5d9e2c8b1..."
```

#### 3.3. Verificar Variables

```bash
railway variables
```

Buscar las líneas:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-... ✅ (debe empezar con APP_USR, NO con TEST)
MERCADOPAGO_WEBHOOK_SECRET=a3f5d9e2c8b1... ✅
```

#### 3.4. Redeploy Automático

Railway automáticamente redeployeará cuando cambies variables.

Verificar que el deploy termine:

```bash
railway logs
```

Buscar en los logs:

```
✅ MercadoPago SDK initialized successfully with Circuit Breaker protection
```

Si ves:

```
⚠️  MercadoPago en MODO MOCK
```

→ **Algo salió mal**, revisar el token.

---

### **PASO 4: Configurar Variables en Vercel (Frontend)**

El frontend también necesita la **Public Key** de MercadoPago.

#### 4.1. Verificar Proyecto Vinculado

```bash
vercel whoami
```

#### 4.2. Listar Proyectos

```bash
vercel ls
```

Identificar tu proyecto (probablemente "mateatletas-web" o similar)

#### 4.3. Link al Proyecto (si no está linkeado)

```bash
cd apps/web
vercel link
```

#### 4.4. Agregar Variables de Entorno

```bash
# Public Key de MercadoPago (para el checkout en el frontend)
vercel env add NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY production

# Cuando pregunte el valor, pegar: APP_USR-XXXXXXXX-... (Public Key)
```

#### 4.5. Redeploy Frontend

```bash
vercel --prod
```

---

### **PASO 5: Configurar Webhook en Panel de MercadoPago**

⚠️ **CRÍTICO:** MercadoPago necesita saber a dónde enviar las notificaciones de pago.

#### 5.1. Ir al Panel de Webhooks

🔗 **URL:** https://www.mercadopago.com.ar/developers/panel/app

Ir a:

```
Tu aplicación → Webhooks → Configurar webhook
```

#### 5.2. Agregar URL de Webhook

**URL del webhook:**

```
https://mateatletas-system-production.up.railway.app/api/inscripciones-2026/webhook
```

**Eventos a suscribir:**

- ✅ `payment.created`
- ✅ `payment.updated`

**Versión de API:** `v1` (latest)

#### 5.3. Guardar y Activar

- Click en **"Guardar"**
- Asegurarse que esté **ACTIVO** ✅

#### 5.4. Probar Webhook (Opcional)

MercadoPago tiene una herramienta de prueba de webhooks en el panel.

Enviar un webhook de prueba y verificar que llegue al backend (ver logs de Railway).

---

### **PASO 6: VERIFICAR QUE TODO FUNCIONE**

#### 6.1. Verificar Logs de Railway

```bash
railway logs --tail
```

Buscar:

```
✅ MercadoPago SDK initialized successfully with Circuit Breaker protection
✅ Validación de firma de webhook habilitada
```

#### 6.2. Test Manual de Inscripción

1. Ir a: https://www.mateatletasclub.com.ar/
2. Click en **"Inscribir"** en algún plan
3. Llenar el formulario
4. Click en **"Pagar"**

**Resultado esperado:**

- ✅ Te redirige a MercadoPago
- ✅ Podés completar el pago con tarjeta real
- ✅ Después del pago, volvés al sitio con confirmación

**Si algo falla:**

- Ver logs de Railway: `railway logs`
- Ver errores en la consola del navegador (F12)

#### 6.3. Test de Webhook

Después de hacer un pago de prueba:

```bash
railway logs | grep "Webhook"
```

Deberías ver:

```
📨 Webhook recibido: payment.updated - payment.approved
✅ Webhook validado: data_id=12345678, request_id=abc-def-123
```

---

## 🔒 SEGURIDAD: CHECKLIST

Antes de considerar que está listo:

- [ ] ✅ `MERCADOPAGO_ACCESS_TOKEN` empieza con `APP_USR-` (NO `TEST-`)
- [ ] ✅ `MERCADOPAGO_WEBHOOK_SECRET` está configurado (32+ caracteres)
- [ ] ✅ Webhook configurado en panel de MercadoPago
- [ ] ✅ Webhook URL es HTTPS (Railway provee HTTPS automáticamente)
- [ ] ✅ Logs de Railway muestran "✅ MercadoPago SDK initialized successfully"
- [ ] ✅ Test manual de inscripción funciona end-to-end
- [ ] ✅ Webhook se recibe correctamente (logs muestran "✅ Webhook validado")

---

## 🚨 TROUBLESHOOTING

### Problema: "MercadoPago en MODO MOCK" en logs

**Causa:** Token inválido o con formato incorrecto
**Solución:**

1. Verificar que el token empiece con `APP_USR-`
2. Copiar el token directamente del panel (sin espacios extras)
3. Verificar que sea el **Access Token**, NO la Public Key

### Problema: "Webhook secret not configured"

**Causa:** Variable `MERCADOPAGO_WEBHOOK_SECRET` faltante
**Solución:**

```bash
railway variables set MERCADOPAGO_WEBHOOK_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

### Problema: Webhooks no llegan

**Causa:** URL mal configurada o servicio no accesible
**Solución:**

1. Verificar que Railway esté deployed y funcionando
2. Probar manualmente: `curl https://mateatletas-system-production.up.railway.app/api/health`
3. Verificar URL en panel de MercadoPago
4. Verificar que los eventos estén seleccionados

### Problema: "Invalid webhook signature"

**Causa:** Secret configurado en Railway no coincide con el del panel de MP
**Solución:**

- Nota: El secret que generás vos NO se configura en el panel de MercadoPago
- Es solo para validación interna
- Si el error persiste, regenerar el secret y reintentar

---

## 📞 SOPORTE

### MercadoPago

- **Documentación:** https://www.mercadopago.com.ar/developers/es/docs
- **Soporte:** https://www.mercadopago.com.ar/developers/es/support
- **Slack de Desarrolladores:** https://mercadopagodevs.slack.com/

### Railway

- **Documentación:** https://docs.railway.app/
- **Discord:** https://discord.gg/railway

---

## ✅ SIGUIENTE PASO

Una vez configurado todo:

1. **Probar con pago real** (tarjeta de crédito real, monto mínimo)
2. **Verificar que el webhook actualice el estado** en la base de datos
3. **Monitorear logs** por las próximas 24-48 horas

---

## 🎯 COMANDOS RÁPIDOS (RESUMEN)

```bash
# 1. Generar webhook secret
WEBHOOK_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Configurar Railway
railway link  # Seleccionar Mateatletas-System → production
railway variables set MERCADOPAGO_ACCESS_TOKEN="APP_USR-XXXXXXXX..."
railway variables set MERCADOPAGO_WEBHOOK_SECRET="$WEBHOOK_SECRET"

# 3. Configurar Vercel
cd apps/web
vercel env add NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY production
# Pegar Public Key cuando lo pida
vercel --prod

# 4. Verificar
railway logs --tail
```

---

## 📝 NOTAS IMPORTANTES

1. **Nunca commitear credenciales reales** al repositorio
2. **Guardar credenciales en un password manager** (1Password, LastPass, etc.)
3. **Rotar credenciales** si se comprometen
4. **Monitorear transacciones** en el panel de MercadoPago regularmente
5. **Tener un plan B** (ej: pagos manuales) por si MercadoPago tiene downtime

---

**✅ Una vez completados todos los pasos, tu sistema estará 100% funcional para recibir pagos reales.**
