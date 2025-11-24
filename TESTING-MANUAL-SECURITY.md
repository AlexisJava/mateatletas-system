# 🔐 TESTING MANUAL - FIXES DE SEGURIDAD

Este documento detalla cómo testear manualmente todos los fixes de seguridad aplicados a los módulos **Auth** y **Colonia**.

---

## 📋 RESUMEN DE FIXES

### Módulo AUTH (7 fixes)
1. ✅ Password MaxLength (DoS Prevention)
2. ✅ Rate Limiting en Login (5/min)
3. ✅ Redis Fail-Secure (throw UnauthorizedException)
4. ✅ Timing Attack Prevention (bcrypt dummy hash)
5. ✅ Email Enumeration Prevention (generic error)
6. ✅ Cookie maxAge sync (1 hora)
7. ✅ Login Attempt Tracking (5 intentos/15min)

### Módulo COLONIA (4 fixes)
1. ✅ Password MaxLength (DoS Prevention)
2. ✅ Payment Amount Validation (Anti-Fraude)
3. ✅ Rate Limiting Inscripción (5/hora)
4. ✅ Username Uniqueness (Race Condition)

---

## 🧪 TESTING AUTOMATIZADO

Ejecutar el script de testing:

```bash
# Asegurarse de que el servidor esté corriendo
npm run start:dev

# En otra terminal, ejecutar tests
./test-security-fixes.sh
```

El script valida:
- ✅ Password MaxLength (Auth y Colonia)
- ✅ Rate Limiting (Login y Colonia)
- ✅ Login Attempt Tracking

---

## 🔍 TESTING MANUAL

### AUTH - Fix #3: Redis Fail-Secure

**Objetivo**: Verificar que cuando Redis falla, el sistema rechaza tokens (fail-secure).

**Pasos**:
1. Iniciar sesión y obtener un token válido
2. Detener Redis: `docker stop redis` o `sudo systemctl stop redis`
3. Intentar acceder a un endpoint protegido con el token
4. **Resultado esperado**: `401 Unauthorized` con mensaje "Servicio temporalmente no disponible"
5. **Sin el fix**: El request pasaría (inseguro)

```bash
# Login para obtener token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"ValidPass123"}' \
  | jq -r '.access_token')

# Detener Redis
sudo systemctl stop redis

# Intentar acceder a endpoint protegido
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 401 Unauthorized
```

---

### AUTH - Fix #4: Timing Attack Prevention

**Objetivo**: Verificar que el tiempo de respuesta es constante para usuarios existentes y no existentes.

**Pasos**:
1. Medir tiempo de login con usuario **inexistente**
2. Medir tiempo de login con usuario **existente** pero password incorrecta
3. **Resultado esperado**: Tiempos similares (diferencia < 100ms)
4. **Sin el fix**: Usuario inexistente respondería instantáneamente (sin bcrypt)

```bash
# Usuario inexistente
time curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@test.com","password":"wrong"}'

# Usuario existente, password incorrecta
time curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"real@test.com","password":"wrong"}'

# Los tiempos deberían ser similares (~200-300ms ambos)
```

---

### AUTH - Fix #5: Email Enumeration Prevention

**Objetivo**: Verificar que no se puede distinguir entre email registrado y no registrado.

**Pasos**:
1. Intentar registrar un email **ya registrado**
2. Intentar registrar un email **nuevo**
3. **Resultado esperado**: Ambos retornan `400 Bad Request` con mensaje genérico
4. **Sin el fix**: Email existente retornaría `409 Conflict` (permite enumeración)

```bash
# Registro con email existente
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@test.com",
    "password": "ValidPass123",
    "nombre": "Test",
    "apellido": "User"
  }'
# Esperado: 400 Bad Request "Datos de registro inválidos"

# Registro con email nuevo pero datos inválidos
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@test.com",
    "password": "short",
    "nombre": "Test",
    "apellido": "User"
  }'
# Esperado: 400 Bad Request "Datos de registro inválidos"
```

---

### AUTH - Fix #6: Cookie maxAge Sync

**Objetivo**: Verificar que la cookie expira en 1 hora (sincronizada con JWT).

**Pasos**:
1. Hacer login y capturar la cookie `auth-token`
2. Inspeccionar el header `Set-Cookie`
3. **Resultado esperado**: `Max-Age=3600` (1 hora)
4. **Sin el fix**: `Max-Age=604800` (7 días)

```bash
# Login y capturar headers
curl -v -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"ValidPass123"}' \
  2>&1 | grep -i "set-cookie"

# Buscar: Max-Age=3600
# Ejemplo: Set-Cookie: auth-token=...; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
```

---

### COLONIA - Fix #2: Payment Amount Validation (CRÍTICO)

**Objetivo**: Verificar que un pago de $1 no acredita una inscripción de $50,000.

**Flujo completo**:

1. **Crear inscripción** (generar `external_reference`)
2. **Simular pago de $1** en MercadoPago (monto incorrecto)
3. **Simular webhook** con `status=approved` y `transaction_amount=1`
4. **Resultado esperado**: `400 Bad Request` "El monto pagado no coincide"
5. **Sin el fix**: La inscripción se marca como `paid` (FRAUDE)

```bash
# Paso 1: Crear inscripción
RESPONSE=$(curl -s -X POST http://localhost:3001/api/colonia/inscripcion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fraud-test@test.com",
    "password": "ValidPass123",
    "nombre": "Fraud Test",
    "telefono": "1234567890",
    "estudiantes": [{
      "nombre": "Estudiante",
      "edad": 8,
      "cursosSeleccionados": [{
        "id": "mat-1",
        "name": "Matemática",
        "area": "STEM",
        "instructor": "Prof",
        "dayOfWeek": "Lunes",
        "timeSlot": "09:00-10:00",
        "color": "#FF0000",
        "icon": "calculator"
      }]
    }]
  }')

echo "$RESPONSE" | jq .

# Extraer pagoId del external_reference (es el pagoId directamente)
PAGO_ID=$(echo "$RESPONSE" | jq -r '.pago.mercadoPagoUrl' | grep -oP 'external_reference=\K[^&]+')
MONTO_ESPERADO=$(echo "$RESPONSE" | jq -r '.pago.monto')

echo "Pago ID: $PAGO_ID"
echo "Monto esperado: $MONTO_ESPERADO"

# Paso 2: Simular webhook con monto incorrecto (ej: $1 en lugar de $50,000)
curl -X POST http://localhost:3001/api/colonia/webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": 12345,
    \"action\": \"payment.updated\",
    \"type\": \"payment\",
    \"data\": {
      \"id\": \"test-payment-123\"
    },
    \"live_mode\": false,
    \"date_created\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"user_id\": \"123456\",
    \"api_version\": \"v1\"
  }"

# NOTA: Este test requiere mockar MercadoPago.getPayment() para retornar:
# {
#   "id": "test-payment-123",
#   "status": "approved",
#   "transaction_amount": 1,  // ← MONTO INCORRECTO
#   "external_reference": "$PAGO_ID"
# }

# Resultado esperado: 400 Bad Request
# Logs del servidor: 🚨 INTENTO DE FRAUDE: Monto pagado no coincide
```

**Testing con MercadoPago Sandbox**:

Para testear esto realmente, necesitas:
1. Configurar MercadoPago en modo test
2. Crear preferencia de pago
3. Ir al checkout y pagar **un monto diferente** (no es posible en sandbox)
4. **Alternativa**: Usar Postman para simular el webhook con monto incorrecto

---

### COLONIA - Fix #4: Username Uniqueness

**Objetivo**: Verificar que no hay colisiones de username incluso con inscripciones simultáneas.

**Test de Race Condition**:

```bash
# Crear 5 inscripciones simultáneas con el mismo nombre "Juan"
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/colonia/inscripcion \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"juan-test-$i@test.com\",
      \"password\": \"ValidPass123\",
      \"nombre\": \"Juan Test $i\",
      \"telefono\": \"1234567890\",
      \"estudiantes\": [{
        \"nombre\": \"Juan\",
        \"edad\": 8,
        \"cursosSeleccionados\": [{
          \"id\": \"test\",
          \"name\": \"Test\",
          \"area\": \"Test\",
          \"instructor\": \"Test\",
          \"dayOfWeek\": \"Lunes\",
          \"timeSlot\": \"09:00\",
          \"color\": \"#000\",
          \"icon\": \"test\"
        }]
      }]
    }" &
done

wait

# Verificar en la base de datos que todos los usernames son únicos
psql -U postgres -d mateatletas -c "
  SELECT username, COUNT(*) as count
  FROM estudiante
  WHERE nombre = 'Juan'
  GROUP BY username
  HAVING COUNT(*) > 1;
"

# Resultado esperado: 0 rows (sin duplicados)
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Compilación
- [ ] `npx tsc --noEmit` retorna 0 errores
- [ ] `npm run build` exitoso

### Tests Automatizados
- [ ] `./test-security-fixes.sh` todos los tests pasan
- [ ] Password MaxLength (Auth) ✓
- [ ] Password MaxLength (Colonia) ✓
- [ ] Rate Limiting Login ✓
- [ ] Rate Limiting Colonia ✓
- [ ] Login Attempt Tracking ✓

### Tests Manuales
- [ ] Redis Fail-Secure (detener Redis → 401)
- [ ] Timing Attack Prevention (tiempos similares)
- [ ] Email Enumeration Prevention (error genérico)
- [ ] Cookie maxAge = 3600s (1 hora)
- [ ] Payment Amount Validation (monto incorrecto → 400)
- [ ] Username Uniqueness (inscripciones simultáneas sin duplicados)

### Verificación en Logs
- [ ] Login fallido → IP logueada
- [ ] 5 intentos fallidos → "Demasiados intentos"
- [ ] Monto incorrecto → "🚨 INTENTO DE FRAUDE"
- [ ] Redis caído → "Redis caído - bloqueando por seguridad"

---

## 🎯 CASOS DE USO REALES

### Escenario 1: Brute Force Attack
**Ataque**: Un bot intenta 1000 logins/segundo
**Protección activa**:
- Rate Limiting (5/min) → 429 después de 5 requests
- Login Attempt Tracking → Cuenta bloqueada después de 5 intentos fallidos

### Escenario 2: DoS via bcrypt
**Ataque**: Enviar passwords de 10MB para saturar CPU
**Protección activa**:
- MaxLength(128) → Request rechazado en validación (antes de bcrypt)

### Escenario 3: Payment Fraud
**Ataque**: Pagar $1 con external_reference de inscripción de $50,000
**Protección activa**:
- Payment Amount Validation → 400 Bad Request, pago NO acreditado

### Escenario 4: Email Enumeration
**Ataque**: Probar emails para saber quién está registrado
**Protección activa**:
- Generic error → Mismo mensaje para email existente y no existente

---

## 📝 NOTAS IMPORTANTES

1. **Redis**: Algunos tests requieren tener Redis corriendo. Instalar con:
   ```bash
   sudo apt install redis-server
   sudo systemctl start redis
   ```

2. **Base de Datos**: Los tests crean datos de prueba. Limpiar después:
   ```sql
   DELETE FROM login_attempts WHERE email LIKE '%test%';
   DELETE FROM tutor WHERE email LIKE '%test%';
   ```

3. **MercadoPago**: Los tests de webhook requieren configurar `MERCADOPAGO_WEBHOOK_SECRET`.

4. **Producción**: NUNCA ejecutar estos tests en producción. Solo en desarrollo/staging.

---

## 🚀 SIGUIENTES PASOS

Después de validar todos los tests:

1. **Commit & Push** de los cambios
2. **Deploy a Staging** para testing adicional
3. **Monitoreo** de logs en staging:
   - Buscar "🚨 INTENTO DE FRAUDE"
   - Verificar rate limiting funciona
4. **Deploy a Producción** si todo está OK