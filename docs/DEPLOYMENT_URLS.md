# 🚀 URLs de Producción - Mateatletas System

**Fecha:** 2025-11-02
**Estado:** ✅ **PRODUCCIÓN COMPLETA**

---

## 📍 URLs Principales

### Frontend (Vercel)
- **URL Producción:** https://mateatletas-fztrxxmes-alexis-figueroas-projects-d4fb75f1.vercel.app
- **Inspect URL:** https://vercel.com/alexis-figueroas-projects-d4fb75f1/mateatletas-web
- **Dashboard:** https://vercel.com/dashboard
- **Framework:** Next.js 15.5.4 con Turbopack

### Backend (Railway)
- **URL Pública:** https://mateatletas-system-production.up.railway.app
- **API Base:** https://mateatletas-system-production.up.railway.app/api
- **Health Check:** https://mateatletas-system-production.up.railway.app/api/health
- **Swagger Docs:** https://mateatletas-system-production.up.railway.app/api/docs
- **Dashboard:** https://railway.app/dashboard
- **Framework:** NestJS con Prisma

### Dominio Personalizado
- **Dominio:** www.mateatletasclub.com.ar
- **Apunta a:** Vercel (Frontend) actualmente
- **Estado:** Requiere configuración para apuntar a Railway si se desea

---

## 🔐 Variables de Entorno Configuradas

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://mateatletas-system-production.up.railway.app/api
```

### Railway (Backend)
```bash
# Producción
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
JWT_SECRET=***
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://mateatletas-fztrxxmes-alexis-figueroas-projects-d4fb75f1.vercel.app
BACKEND_URL=https://mateatletas-system.railway.internal
ENABLE_SWAGGER=true
LOG_LEVEL=info
BLOB_READ_WRITE_TOKEN=***

# Admin inicial
ADMIN_EMAIL=***
ADMIN_PASSWORD=***
ADMIN_NOMBRE=***
ADMIN_APELLIDO=***

# MercadoPago (MOCK mode)
# MERCADOPAGO_ACCESS_TOKEN no configurado - usando MOCK
# MERCADOPAGO_WEBHOOK_SECRET no configurado
```

---

## 🧪 Verificación de Conectividad

### Test Backend Health
```bash
curl https://mateatletas-system-production.up.railway.app/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2025-11-02T05:40:29.971Z","service":"Mateatletas API"}
```

### Test Frontend → Backend
1. Abrir: https://mateatletas-fztrxxmes-alexis-figueroas-projects-d4fb75f1.vercel.app
2. Abrir DevTools → Console
3. Verificar que las peticiones a `/api/*` se dirijan a `mateatletas-system-production.up.railway.app`
4. No debe haber errores CORS

### Test CORS
```bash
curl -H "Origin: https://mateatletas-fztrxxmes-alexis-figueroas-projects-d4fb75f1.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://mateatletas-system-production.up.railway.app/api/health

# Debe incluir en headers:
# access-control-allow-origin: https://mateatletas-fztrxxmes-alexis-figueroas-projects-d4fb75f1.vercel.app
```

---

## 📊 Endpoints Disponibles

### API Root
```bash
GET https://mateatletas-system-production.up.railway.app/api
```

### Health Check
```bash
GET https://mateatletas-system-production.up.railway.app/api/health
```

### Swagger Documentation
```bash
GET https://mateatletas-system-production.up.railway.app/api/docs
```

### Auth
```bash
POST https://mateatletas-system-production.up.railway.app/api/auth/login
POST https://mateatletas-system-production.up.railway.app/api/auth/register
POST https://mateatletas-system-production.up.railway.app/api/auth/logout
```

### Estudiantes
```bash
GET https://mateatletas-system-production.up.railway.app/api/estudiantes
POST https://mateatletas-system-production.up.railway.app/api/estudiantes
```

Ver Swagger docs para lista completa de endpoints.

---

## 🔄 Comandos Útiles

### Redesplegar Frontend (Vercel)
```bash
cd /home/alexis/Documentos/Mateatletas-Ecosystem
vercel --prod
```

### Ver Logs Backend (Railway)
```bash
railway logs
```

### Ver Estado Railway
```bash
railway status
```

### Actualizar Variable en Vercel
```bash
vercel env rm NOMBRE_VARIABLE production --yes
echo "VALOR" | vercel env add NOMBRE_VARIABLE production
vercel --prod  # Redeploy para aplicar cambios
```

### Actualizar Variable en Railway
```bash
railway variables --set NOMBRE_VARIABLE=valor
# Railway se reinicia automáticamente
```

---

## ⚠️ Notas Importantes

### Deployment Protection (Vercel)
- **Estado Actual:** Habilitado (requiere autenticación de Vercel)
- **Desactivar:** Dashboard → Settings → Deployment Protection → Disable
- **Alternativa:** Configurar dominio personalizado

### Limitaciones Actuales
1. **MercadoPago:** En modo MOCK (configurar `MERCADOPAGO_ACCESS_TOKEN` para producción real)
2. **Redis:** Cache en memoria (configurar Redis addon en Railway para mejor performance)
3. **Dominio:** `www.mateatletasclub.com.ar` apunta a Vercel, no a Railway

### Próximos Pasos Recomendados
1. ✅ Desactivar Deployment Protection en Vercel
2. ⚠️ Configurar MercadoPago real
3. ⚠️ Agregar Redis para cache distribuido
4. ⚠️ Configurar dominio personalizado correctamente
5. ⚠️ Setup monitoring (Sentry, DataDog)
6. ⚠️ CI/CD con GitHub Actions

---

## 🎯 Resumen de Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Usuario                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                  │
│  https://mateatletas-fztrxxmes...vercel.app        │
│  - Next.js 15.5.4                                   │
│  - React 19.1.0                                     │
│  - Material-UI                                      │
└──────────────────┬──────────────────────────────────┘
                   │ NEXT_PUBLIC_API_URL
                   ▼
┌─────────────────────────────────────────────────────┐
│  Backend (Railway)                                  │
│  https://mateatletas-system-production.up.railway.app│
│  - NestJS                                           │
│  - Prisma ORM                                       │
│  - PostgreSQL                                       │
│  - JWT Auth                                         │
│  - CORS habilitado para Vercel                      │
└─────────────────────────────────────────────────────┘
```

---

**FIN DEL DOCUMENTO**

*Última actualización: 2025-11-02*
*Estado: Frontend y Backend desplegados y comunicándose correctamente ✅*
