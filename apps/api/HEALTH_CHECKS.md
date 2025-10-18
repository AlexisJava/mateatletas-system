# Health Checks - Guía de Uso

**Fecha:** 18 de Octubre, 2025
**Estado:** ✅ Implementado y testeado

---

## Qué Son Los Health Checks

Los health checks son endpoints que permiten monitorear la salud del sistema en tiempo real.

**Casos de uso:**
- ✅ Verificar que el servidor está funcionando
- ✅ Detectar problemas de base de datos antes de que afecten usuarios
- ✅ Kubernetes/Docker puede reiniciar contenedores automáticamente si fallan
- ✅ Load balancers pueden dejar de enviar tráfico a instancias con problemas
- ✅ Monitoreo automático con alertas

---

## Endpoints Disponibles

### 1. `/health` - Health Check Completo

**Uso:** Verificación completa del sistema

**Request:**
```bash
GET http://localhost:3000/health
```

**Response (Success):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

**Response (Error - BD Caída):**
```json
{
  "status": "error",
  "info": {},
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  },
  "details": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  }
}
```

**HTTP Status:**
- `200 OK` - Todo funciona
- `503 Service Unavailable` - Algún componente crítico falló

---

### 2. `/health/ready` - Readiness Probe

**Uso:** ¿Está el sistema listo para recibir tráfico?

**Cuándo usar:**
- Kubernetes readiness probe
- Load balancer health check
- Antes de enviar tráfico a una nueva instancia

**Request:**
```bash
GET http://localhost:3000/health/ready
```

**Response:** Igual que `/health`

**Diferencia con `/health`:**
- `/health` es para monitoreo general
- `/health/ready` es para decidir si enviar tráfico

---

### 3. `/health/live` - Liveness Probe

**Uso:** ¿Está el proceso vivo (no colgado)?

**Cuándo usar:**
- Kubernetes liveness probe
- Verificar que el proceso Node.js no está colgado
- Monitoreo simple sin verificar dependencias

**Request:**
```bash
GET http://localhost:3000/health/live
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T12:34:56.789Z",
  "uptime": 3600.5
}
```

**Campos:**
- `status`: Siempre "ok" si el endpoint responde
- `timestamp`: Timestamp actual en ISO 8601
- `uptime`: Segundos que lleva corriendo el proceso

**HTTP Status:**
- `200 OK` - Proceso vivo
- Si no responde → Proceso muerto/colgado

---

## Configuración en Producción

### Docker Healthcheck

Agregar a `Dockerfile`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health/live || exit 1
```

**Parámetros:**
- `--interval=30s` - Verificar cada 30 segundos
- `--timeout=3s` - Esperar máximo 3 segundos
- `--start-period=40s` - Dar 40 segundos para que la app arranque
- `--retries=3` - Reintentar 3 veces antes de marcar como unhealthy

---

### Kubernetes Probes

Agregar a `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mateatletas-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: mateatletas-api:latest
        ports:
        - containerPort: 3000

        # Liveness Probe: Reinicia el pod si falla
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3

        # Readiness Probe: Deja de enviar tráfico si falla
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
```

**Diferencia:**
- `livenessProbe` → Si falla 3 veces, Kubernetes **reinicia el pod**
- `readinessProbe` → Si falla 2 veces, Kubernetes **deja de enviar tráfico** (pero no reinicia)

---

### AWS ALB (Application Load Balancer)

Configurar target group health check:

```
Health check path: /health
Health check interval: 30 seconds
Timeout: 5 seconds
Healthy threshold: 2
Unhealthy threshold: 3
Success codes: 200
```

---

## Monitoreo con Scripts

### Script Simple de Monitoreo

```bash
#!/bin/bash
# monitor-health.sh

API_URL="http://localhost:3000"

while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)

  if [ "$response" == "200" ]; then
    echo "$(date): ✅ System healthy"
  else
    echo "$(date): ❌ System unhealthy (HTTP $response)"
    # Opcional: Enviar alerta
    # curl -X POST https://hooks.slack.com/... -d '{"text":"API down!"}'
  fi

  sleep 30
done
```

**Uso:**
```bash
chmod +x monitor-health.sh
./monitor-health.sh
```

---

### Verificación con curl

```bash
# Health check completo
curl http://localhost:3000/health | jq

# Readiness
curl http://localhost:3000/health/ready | jq

# Liveness
curl http://localhost:3000/health/live | jq

# Solo verificar HTTP status
curl -I http://localhost:3000/health
```

---

## Agregando Más Indicadores

### Ejemplo: Verificar Redis

Si agregas Redis en el futuro, puedes expandir los health checks:

```typescript
// health.controller.ts
import { RedisHealthIndicator } from '@nestjs/terminus';

@Get()
@HealthCheck()
async check(): Promise<HealthCheckResult> {
  return this.health.check([
    // Verificar Prisma
    () => this.prismaHealth.pingCheck('database', this.prisma),

    // Verificar Redis (si lo agregas)
    () => this.redisHealth.pingCheck('redis', { host: 'localhost', port: 6379 }),
  ]);
}
```

### Ejemplo: Verificar API Externa

```typescript
import { HttpHealthIndicator } from '@nestjs/terminus';

@Get()
@HealthCheck()
async check(): Promise<HealthCheckResult> {
  return this.health.check([
    () => this.prismaHealth.pingCheck('database', this.prisma),

    // Verificar API externa (ej: servicio de pagos)
    () => this.http.pingCheck('payment-api', 'https://api.stripe.com/v1'),
  ]);
}
```

---

## Interpretando los Resultados

### Status: "ok"
✅ **Todo funciona correctamente**
- Base de datos conectada
- Sistema listo para recibir tráfico
- No se requiere acción

### Status: "error"
❌ **Problema crítico detectado**
- Base de datos desconectada
- Servicio externo caído
- Sistema NO debe recibir tráfico

**Acciones:**
1. Revisar logs: `tail -f logs/error.log`
2. Verificar conexión a BD: `npx prisma db push`
3. Reiniciar servidor si es necesario

### Status: No responde
💀 **Proceso muerto o colgado**
- Node.js crasheó
- Proceso colgado en operación infinita
- Puerto bloqueado

**Acciones:**
1. Reiniciar proceso: `pm2 restart api`
2. Revisar logs de crash
3. Verificar memoria: `free -m`

---

## Testing Manual

### Simular BD Caída

```bash
# 1. Detener Prisma (si usas Docker)
docker-compose stop postgres

# 2. Verificar health check
curl http://localhost:3000/health
# Debería retornar 503 Service Unavailable

# 3. Restaurar
docker-compose start postgres
curl http://localhost:3000/health
# Debería retornar 200 OK
```

### Simular Proceso Colgado

```typescript
// Agregar temporalmente en main.ts (NO EN PRODUCCIÓN)
setTimeout(() => {
  while(true) {} // Infinite loop - cuelga el proceso
}, 5000);
```

Después de 5 segundos:
- `/health` no responde
- Liveness probe falla
- Kubernetes reinicia el pod automáticamente

---

## Alertas y Notificaciones

### Configurar Alertas (Ejemplo con Slack)

```typescript
// health.controller.ts
import { Logger } from '@nestjs/common';

@Get()
@HealthCheck()
async check(): Promise<HealthCheckResult> {
  try {
    const result = await this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
    return result;
  } catch (error) {
    // Enviar alerta a Slack
    await this.notifySlack('🚨 Database health check failed!');
    throw error;
  }
}

private async notifySlack(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
    });
  }
}
```

---

## Métricas Útiles

### Uptime

```bash
curl http://localhost:3000/health/live | jq '.uptime'
# Retorna segundos de uptime

# Convertir a formato legible
curl -s http://localhost:3000/health/live | jq '.uptime / 3600 | floor'
# Retorna horas de uptime
```

### Logs de Health Checks

Los health checks generan logs automáticamente:

```
[2025-10-18 12:34:56] INFO: Health check - GET /health - 200 - 45ms
[2025-10-18 12:35:26] INFO: Health check - GET /health - 200 - 42ms
[2025-10-18 12:35:56] ERROR: Health check - GET /health - 503 - 3001ms - Database timeout
```

---

## Checklist de Implementación

✅ **Completado:**
- [x] Health check endpoint creado
- [x] Readiness probe implementado
- [x] Liveness probe implementado
- [x] Tests unitarios (8/8 pasando)
- [x] Verificación de base de datos (Prisma)
- [x] Importado en AppModule

🔜 **Próximos pasos (opcional):**
- [ ] Configurar Docker healthcheck
- [ ] Configurar Kubernetes probes
- [ ] Agregar Redis health indicator
- [ ] Configurar alertas
- [ ] Dashboard de métricas (Grafana)

---

## Troubleshooting

### Error: "Cannot find module '@nestjs/terminus'"

```bash
npm install @nestjs/terminus --workspace=apps/api
```

### Error: "PrismaHealthIndicator is not defined"

Verificar que DatabaseModule esté importado en HealthModule.

### Health check siempre retorna 503

1. Verificar que Prisma esté configurado correctamente
2. Ejecutar: `npx prisma generate`
3. Verificar conexión: `npx prisma db push`

### /health no responde

1. Verificar que HealthModule esté importado en AppModule
2. Verificar puerto: `lsof -i :3000`
3. Revisar logs de inicio del servidor

---

## Recursos

- [NestJS Terminus Documentation](https://docs.nestjs.com/recipes/terminus)
- [Kubernetes Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Docker Healthcheck](https://docs.docker.com/engine/reference/builder/#healthcheck)

---

**✅ Health Checks implementados correctamente. Sistema listo para monitoreo.**
