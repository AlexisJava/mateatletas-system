# Circuit Breakers - Guía de Uso

**Fecha:** 18 de Octubre, 2025
**Estado:** ✅ Implementado y testeado en AdminService

---

## Qué es un Circuit Breaker

Un Circuit Breaker es un patrón de diseño que **previene fallos en cascada** cuando un servicio dependiente falla repetidamente.

**Analogía:** Como el interruptor automático de tu casa:

- Si hay sobrecarga eléctrica → El interruptor se "abre" (corta la corriente)
- Proteges tu casa de quemarse
- Después de un tiempo, intentas cerrar el interruptor de nuevo

**En software:**

- Si un servicio falla 5+ veces → Circuit se "abre" (deja de llamarlo)
- Protege el sistema de seguir intentando operaciones que fallarán
- Después de 60 segundos, intenta de nuevo

---

## Estados del Circuit Breaker

### 🟢 CLOSED (Cerrado) - Funcionamiento Normal

```
Usuario → AdminService → AdminStatsService → BD
                ✅ Éxito
```

- Requests pasan normalmente
- Servicios delegados funcionan
- Contador de fallos = 0

---

### 🔴 OPEN (Abierto) - Fallo Detectado

```
Usuario → AdminService → ❌ Circuit OPEN → Retorna fallback
```

**Cuándo se abre:**

- Después de 5 fallos consecutivos
- O si falla en estado HALF_OPEN

**Qué pasa:**

- NO se llama al servicio delegado
- Se retorna valor fallback inmediatamente
- Se evita sobrecarga del servicio fallido

**Ejemplo:**

```typescript
// AdminStatsService falla 5 veces
getDashboardStats(); // Fallo 1
getDashboardStats(); // Fallo 2
getDashboardStats(); // Fallo 3
getDashboardStats(); // Fallo 4
getDashboardStats(); // Fallo 5 → Circuit OPEN

// Ahora el circuit está OPEN
getDashboardStats(); // Retorna fallback inmediatamente:
// { totalEstudiantes: 0, totalDocentes: 0, ... }
```

---

### 🟡 HALF_OPEN (Semi-abierto) - Intentando Recovery

```
Después de 60 segundos:
Usuario → AdminService → AdminStatsService (1 intento de prueba)
                           ✅ Éxito → CLOSED
                           ❌ Fallo → OPEN de nuevo
```

- Pasa exactamente 1 request de prueba
- Si tiene éxito → Vuelve a CLOSED
- Si falla → Vuelve a OPEN por otros 60 segundos

---

## Implementación en AdminService

### Circuit Breakers Configurados

AdminService tiene **5 circuit breakers**, uno por cada servicio delegado:

```typescript
private readonly statsCircuit = new CircuitBreaker({
  name: 'AdminStatsService',
  failureThreshold: 5,      // Abrir después de 5 fallos
  resetTimeout: 60000,       // Intentar recovery después de 60s
  fallback: () => ({         // Qué retornar cuando está OPEN
    totalEstudiantes: 0,
    totalDocentes: 0,
    totalClases: 0,
    clasesHoy: 0,
  }),
});
```

### Tabla de Circuit Breakers

| Circuit                     | Fallback         | ¿Por qué?                                                  |
| --------------------------- | ---------------- | ---------------------------------------------------------- |
| **AdminStatsService**       | Stats en 0       | Stats son informativos, no críticos                        |
| **AdminAlertasService**     | Array vacío `[]` | Alertas son informativas                                   |
| **AdminUsuariosService**    | Array vacío `[]` | Listar usuarios puede fallar, pero admin sigue funcionando |
| **AdminEstudiantesService** | Array vacío `[]` | Listar estudiantes puede fallar                            |
| **AdminRolesService**       | **SIN fallback** | Cambiar roles es CRÍTICO, debe fallar explícitamente       |

---

## Casos de Uso Reales

### Caso 1: Base de Datos Lenta (Timeout)

**Escenario:**

```
AdminStatsService consulta la BD
→ Query toma 30+ segundos (timeout)
→ Lanza error: "Connection timeout"
→ Se repite 5 veces
```

**Sin Circuit Breaker:**

```
GET /admin/dashboard
→ Espera 30 segundos
→ Error 500
→ Usuario ve pantalla de error
→ Dashboard NO carga
→ Admin NO puede ver nada
```

**Con Circuit Breaker:**

```
GET /admin/dashboard (primeras 5 veces)
→ Espera 30 segundos cada una
→ Falla 5 veces
→ Circuit OPEN

GET /admin/dashboard (a partir de la 6ta vez)
→ Retorna fallback INMEDIATAMENTE:
   { totalEstudiantes: 0, totalDocentes: 0, ... }
→ Dashboard carga en <100ms
→ Admin puede ver alertas, usuarios, estudiantes
→ Solo las stats muestran 0
```

**Beneficio:**

- ✅ Dashboard parcialmente funcional
- ✅ Admin puede seguir trabajando
- ✅ No sobrecarga la BD con más queries fallidas
- ✅ Recovery automático después de 60s

---

### Caso 2: Servicio de Alertas Caído

**Escenario:**

```
AdminAlertasService.listarAlertas() crashea
→ Código con bug, lanza NullPointerException
→ Se repite 5 veces
```

**Sin Circuit Breaker:**

```
GET /admin/dashboard
→ Llama a getDashboardStats() ✅
→ Llama a listarAlertas() ❌ Crashea
→ Todo el dashboard falla
→ Error 500
```

**Con Circuit Breaker:**

```
GET /admin/dashboard
→ Llama a statsCircuit.execute() ✅
→ Llama a alertasCircuit.execute() ❌
   → Circuit OPEN, retorna []
→ Dashboard carga con:
   - Stats correctas
   - Alertas vacías (pero no crashea)
   - Resto del sistema funciona
```

**Beneficio:**

- ✅ Degradación elegante
- ✅ Usuario ve que hay 0 alertas (en lugar de error completo)
- ✅ Resto del admin funciona

---

### Caso 3: Operaciones Críticas (Sin Fallback)

**Escenario:**

```
POST /admin/usuarios/123/role
→ Cambiar rol de usuario a "Admin"
→ AdminRolesService falla
```

**Con Circuit Breaker (SIN fallback):**

```
rolesCircuit.execute(() => changeUserRole(id, role))
→ Si circuit OPEN: Lanza CircuitBreakerOpenError
→ Usuario ve: "Servicio temporalmente no disponible"
→ NO se cambia el rol silenciosamente
```

**Por qué NO tiene fallback:**

- Cambiar roles es una operación **crítica**
- NO podemos retornar "success" si realmente falló
- Mejor fallar explícitamente que dar falsa confirmación

---

## Monitoreo de Circuit Breakers

### Endpoint de Métricas

```http
GET /api/admin/circuit-metrics
Authorization: Bearer <token-admin>
```

**Response:**

```json
{
  "stats": {
    "state": "CLOSED",
    "failureCount": 0,
    "failureThreshold": 5,
    "nextAttempt": null
  },
  "alertas": {
    "state": "OPEN",
    "failureCount": 5,
    "failureThreshold": 5,
    "nextAttempt": "2025-10-18T13:05:30.123Z"
  },
  "usuarios": {
    "state": "CLOSED",
    "failureCount": 2,
    "failureThreshold": 5,
    "nextAttempt": null
  },
  "estudiantes": {
    "state": "HALF_OPEN",
    "failureCount": 5,
    "failureThreshold": 5,
    "nextAttempt": "2025-10-18T13:04:15.456Z"
  },
  "roles": {
    "state": "CLOSED",
    "failureCount": 0,
    "failureThreshold": 5,
    "nextAttempt": null
  }
}
```

### Interpretación

**state: "CLOSED"**

- ✅ Servicio funcionando normalmente
- Requests pasan sin problemas

**state: "OPEN"**

- ❌ Servicio ha fallado 5+ veces
- Usando fallback
- Check `nextAttempt` para ver cuándo reintentará

**state: "HALF_OPEN"**

- ⚠️ Intentando recovery
- Próximo request determinará si cierra o reabre

**failureCount > 0 pero < 5**

- ⚠️ Servicio teniendo problemas intermitentes
- No ha llegado al threshold todavía

---

## Logs del Circuit Breaker

### Logs de Fallos

```
[CircuitBreaker:AdminStatsService] Failure 1/5 Connection timeout
[CircuitBreaker:AdminStatsService] Failure 2/5 Connection timeout
[CircuitBreaker:AdminStatsService] Failure 3/5 Connection timeout
[CircuitBreaker:AdminStatsService] Failure 4/5 Connection timeout
[CircuitBreaker:AdminStatsService] Failure 5/5 Connection timeout
[CircuitBreaker:AdminStatsService] Circuit OPEN, will retry at 2025-10-18T13:05:00.000Z
```

### Logs de Fallback

```
[CircuitBreaker:AdminStatsService] Circuit is OPEN, using fallback
```

### Logs de Recovery

```
[CircuitBreaker:AdminStatsService] Circuit moving to HALF_OPEN, attempting recovery
[CircuitBreaker:AdminStatsService] Recovery successful, circuit CLOSED
```

---

## Testing del Circuit Breaker

### Simular Fallo de Servicio

```typescript
// En test o desarrollo, puedes forzar fallos
// apps/api/src/admin/services/admin-stats.service.ts

async getDashboardStats() {
  // Simular fallo
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Simulated failure');
  }

  // Código normal...
}
```

### Verificar Comportamiento

1. **Hacer 5 requests que fallen:**

   ```bash
   for i in {1..5}; do
     curl http://localhost:3000/admin/dashboard
   done
   ```

2. **Ver que circuit se abre:**

   ```bash
   curl http://localhost:3000/admin/circuit-metrics | jq '.stats.state'
   # Debe retornar: "OPEN"
   ```

3. **Verificar fallback:**

   ```bash
   curl http://localhost:3000/admin/dashboard
   # Debe retornar stats en 0 inmediatamente (no esperar timeout)
   ```

4. **Esperar 60 segundos y verificar recovery:**
   ```bash
   sleep 60
   curl http://localhost:3000/admin/dashboard
   # Si el servicio se recuperó, circuit cierra
   ```

---

## Configuración Avanzada

### Ajustar Threshold

```typescript
// Más permisivo (para servicios con fallos transitorios)
new CircuitBreaker({
  failureThreshold: 10, // Permite 10 fallos antes de abrir
  resetTimeout: 30000, // Intenta recovery cada 30s
});

// Más estricto (para servicios críticos)
new CircuitBreaker({
  failureThreshold: 3, // Abre después de solo 3 fallos
  resetTimeout: 120000, // Espera 2 minutos antes de reintentar
});
```

### Fallbacks Dinámicos

```typescript
new CircuitBreaker({
  name: 'AdminStatsService',
  fallback: () => {
    // Retornar datos cacheados si existen
    const cached = getCachedStats();
    if (cached) return cached;

    // Sino, retornar defaults
    return { totalEstudiantes: 0, ... };
  },
});
```

### Circuit Breaker por Usuario

```typescript
class AdminService {
  private userCircuits = new Map<string, CircuitBreaker>();

  async getDashboardStatsForUser(userId: string) {
    // Circuit breaker diferente por usuario
    if (!this.userCircuits.has(userId)) {
      this.userCircuits.set(userId, new CircuitBreaker({ ... }));
    }

    const circuit = this.userCircuits.get(userId)!;
    return circuit.execute(() => this.statsService.getDashboardStats());
  }
}
```

---

## Buenas Prácticas

### ✅ DO

1. **Usa fallbacks para operaciones no críticas**
   - Stats, alertas informativas, listas

2. **NO uses fallbacks para operaciones críticas**
   - Cambio de roles, eliminación de usuarios, pagos

3. **Monitorea las métricas regularmente**
   - Circuits abiertos = servicio con problemas

4. **Ajusta thresholds según el servicio**
   - Servicios externos: threshold bajo, timeout corto
   - Servicios internos: threshold alto, timeout largo

5. **Logs estructurados**
   - Circuit breaker ya logea automáticamente

### ❌ DON'T

1. **No uses fallback que mienta al usuario**

   ```typescript
   // ❌ MAL
   fallback: () => ({ success: true }); // Miente que tuvo éxito

   // ✅ BIEN
   fallback: () => []; // Claramente vacío
   ```

2. **No pongas threshold demasiado alto**

   ```typescript
   // ❌ MAL
   failureThreshold: 100; // Permitirá 100 fallos antes de proteger

   // ✅ BIEN
   failureThreshold: 5; // Detecta problemas rápido
   ```

3. **No uses timeout demasiado corto**

   ```typescript
   // ❌ MAL
   resetTimeout: 1000; // Intenta recovery cada segundo (sobrecarga)

   // ✅ BIEN
   resetTimeout: 60000; // Da tiempo al servicio de recuperarse
   ```

---

## Troubleshooting

### Problema: Circuit siempre OPEN

**Causa:** Servicio delegado realmente tiene problemas

**Solución:**

1. Revisar logs del servicio delegado
2. Verificar conexión a BD
3. Verificar que el servicio exista

### Problema: Fallback no se ejecuta

**Causa:** Circuit no tiene fallback configurado

**Solución:**

```typescript
new CircuitBreaker({
  fallback: () => valorPorDefecto, // ← Agregar esto
});
```

### Problema: Recovery no funciona

**Causa:** Servicio sigue fallando en HALF_OPEN

**Solución:**

- Arreglar el servicio primero
- O aumentar `resetTimeout` para dar más tiempo

---

## Próximos Pasos

🔜 **Futuras mejoras:**

- [ ] Circuit breakers en otros servicios (Clases, Estudiantes, Pagos)
- [ ] Dashboard visual de métricas (Grafana)
- [ ] Alertas automáticas cuando circuit se abre
- [ ] Persistencia de estado de circuits (Redis)
- [ ] Rate limiting por circuit breaker

---

**✅ Circuit Breakers implementados y probados. Sistema más resiliente ante fallos.**
