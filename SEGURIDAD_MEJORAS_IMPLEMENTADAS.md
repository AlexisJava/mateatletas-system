# Mejoras de Seguridad Implementadas

## Resumen Ejecutivo

Se implementaron 4 mejoras críticas de seguridad en el sistema Mateatletas, todas con TypeScript estricto (sin `any` ni `unknown`).

**Fecha de implementación**: 2025-11-20
**Branch**: `refactor/colonia-quick-wins` → `main`
**Commit**: 74a89ae

---

## 1. Multi-Factor Authentication (MFA)

### Ubicación
- Módulo: `apps/api/src/mfa/`
- Servicios principales:
  - [MfaService](apps/api/src/mfa/services/mfa.service.ts)
  - [MfaTotpService](apps/api/src/mfa/services/mfa-totp.service.ts)
  - [MfaBackupCodesService](apps/api/src/mfa/services/mfa-backup-codes.service.ts)

### Características
- TOTP (Time-based One-Time Password) con códigos de 30 segundos
- Generación de QR codes para apps autenticadoras (Google Authenticator, Authy, etc.)
- 8 códigos de recuperación (backup codes) con hash bcrypt
- Login en dos fases:
  1. Verificación de contraseña → Token temporal (5 min)
  2. Verificación de TOTP/backup code → Token JWT final

### Endpoints
- `POST /api/auth/mfa/setup` - Iniciar configuración MFA (genera QR)
- `POST /api/auth/mfa/verify-setup` - Verificar y activar MFA
- `POST /api/auth/mfa/disable` - Desactivar MFA
- `POST /api/auth/login/complete-mfa` - Completar login con MFA

### Seguridad
- Secret TOTP único por usuario (32 bytes aleatorios)
- Backup codes hasheados con bcrypt (factor 10)
- Validación con ventana de 1 paso (±30 segundos)
- Uso único de backup codes

---

## 2. Sistema de Audit Logs

### Ubicación
- Módulo: `apps/api/src/audit/`
- Servicio: [AuditLogService](apps/api/src/audit/audit-log.service.ts)

### Características
- Registro completo de acciones sensibles
- 4 niveles de severidad: INFO, WARNING, ERROR, CRITICAL
- Tracking de cambios con diff antes/después
- Metadata contextual (IP, user agent, request ID)

### Categorías de Eventos
- `auth` - Login, logout, cambios de contraseña
- `user_management` - Creación, edición, eliminación usuarios
- `payment` - Transacciones, webhooks, cambios de estado
- `admin` - Acciones administrativas
- `security` - MFA, token blacklist, rate limiting
- `data_export` - Exportación de datos sensibles

### Uso
```typescript
await this.auditLogService.log({
  userId: user.id,
  userType: 'tutor',
  userEmail: user.email,
  action: 'mfa_enabled',
  entityType: 'user',
  entityId: user.id,
  description: 'MFA habilitado exitosamente',
  severity: AuditSeverity.INFO,
  category: 'security',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### Type Safety
- JSON fields con `Prisma.InputJsonValue` y `Prisma.JsonNull`
- Tipos estrictos para cambios y metadata

---

## 3. IP Whitelisting para Webhooks de MercadoPago

### Ubicación
- Servicio: [MercadoPagoIpWhitelistService](apps/api/src/pagos/services/mercadopago-ip-whitelist.service.ts)

### Características
- Validación CIDR de rangos oficiales de MercadoPago
- Extracción de IP real (X-Forwarded-For, X-Real-IP)
- Logging de intentos no autorizados

### Rangos de IP Autorizados
```typescript
const officialIpRanges = [
  '209.225.49.0/24',   // MercadoPago primary
  '216.33.197.0/24',   // MercadoPago secondary
  '216.33.196.0/24',   // MercadoPago tertiary
];
```

**Fuente**: [MercadoPago Docs](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)

### Uso
```typescript
const clientIp = this.ipWhitelistService.extractRealIp(
  req.headers,
  req.socket.remoteAddress
);

const isAllowed = this.ipWhitelistService.isIpAllowed(
  clientIp,
  process.env.NODE_ENV === 'development'
);

if (!isAllowed) {
  throw new UnauthorizedException('IP no autorizada');
}
```

### Mantenimiento
- Verificar rangos cada 6 meses en docs oficiales
- Variable de entorno `MERCADOPAGO_ALLOWED_IPS` para override de emergencia

---

## 4. Sistema de Rotación de Secrets

### Ubicación
- Servicio: [SecretRotationService](apps/api/src/security/services/secret-rotation.service.ts)
- Módulo: [SecurityModule](apps/api/src/security/security.module.ts)

### Características
- Monitoreo automático de secrets críticos
- Cronjob diario a las 9:00 AM
- Alertas 7 días antes de expiración
- Historial completo de rotaciones

### Secrets Monitoreados
1. `JWT_SECRET` - Firma de tokens de autenticación
2. `MERCADOPAGO_WEBHOOK_SECRET` - Validación de webhooks

### Configuración
- Rotación cada 90 días
- Warning 7 días antes de expiración
- Período de gracia de 7 días (ambos secrets válidos)

### Flujo de Rotación (Manual)
1. Cronjob detecta secret próximo a expirar (83+ días)
2. Sistema crea alerta CRITICAL en audit logs
3. Admin genera nuevo secret: `service.generateNewSecret()`
4. Admin actualiza variables de entorno en Railway
5. Sistema marca secret anterior como "expired"

### Seguridad
- NO almacena secrets reales (solo hash SHA-256)
- Secrets solo en variables de entorno
- Hash permite verificar coincidencia

### Endpoints de Admin
```typescript
// Verificar estado de secrets
GET /api/security/health

// Respuesta:
{
  jwt_secret: {
    needsRotation: false,
    daysUntilExpiration: 45,
    currentVersion: 1
  },
  webhook_secret: {
    needsRotation: false,
    daysUntilExpiration: 45,
    currentVersion: 1
  },
  overall_status: "healthy" // "healthy" | "warning" | "critical"
}
```

---

## Variables de Entorno Requeridas

### Nuevas Variables
```bash
# MFA (generado automáticamente por el sistema)
# No requiere configuración manual

# Rate Limiting
RATE_LIMIT_TTL=60000              # 60 segundos
RATE_LIMIT_MAX=100                # 100 requests/min en producción

# Secrets Críticos (ya existentes)
JWT_SECRET=<secret-aleatorio-64-bytes>
MERCADOPAGO_WEBHOOK_SECRET=<secret-de-mercadopago>
```

### Configuración en Railway
```bash
railway variables --set RATE_LIMIT_TTL=60000
railway variables --set RATE_LIMIT_MAX=100
railway variables --set JWT_SECRET="$(openssl rand -base64 64)"
```

---

## Fixes de Arquitectura

### Dependencias Circulares Resueltas
1. **SharedModule → PagosModule**
   - Fix: `forwardRef(() => PagosModule)` en SharedModule.imports
   - Razón: MercadoPagoWebhookProcessorService necesita MercadoPagoService

2. **SecurityModule → AuthModule**
   - Fix: `forwardRef(() => AuthModule)` en SecurityModule.imports
   - Razón: TokenBlacklistGuard necesita TokenBlacklistService

---

## Impacto en Seguridad

### Amenazas Mitigadas
1. **Compromiso de credenciales** → MFA agrega segunda capa
2. **Ataques de fuerza bruta** → Rate limiting mejorado
3. **Webhooks falsos** → IP whitelisting + HMAC signature
4. **Secrets estáticos eternos** → Rotación periódica
5. **Falta de trazabilidad** → Audit logs completos

### Compliance
- ✅ OWASP Top 10 (A07:2021 - Identification and Authentication Failures)
- ✅ PCI DSS 3.2 (Requirement 8 - MFA para acceso administrativo)
- ✅ GDPR Article 32 (Security of Processing - Audit trails)

---

## Testing

### Endpoints para Probar
```bash
# 1. MFA Setup
curl -X POST https://mateatletas-system.up.railway.app/api/auth/mfa/setup \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"

# 2. Security Health
curl https://mateatletas-system.up.railway.app/api/security/health

# 3. Rate Limit Test
for i in {1..105}; do
  curl https://mateatletas-system.up.railway.app/api/health
done
# Debería devolver 429 Too Many Requests en request #101
```

---

## Monitoreo Recomendado

### Métricas Clave
1. **MFA Adoption Rate**: % de admins con MFA habilitado
2. **Failed MFA Attempts**: Intentos fallidos de TOTP/backup codes
3. **Blocked IPs**: IPs bloqueadas por whitelist
4. **Secret Age**: Días hasta próxima rotación de secrets
5. **Audit Log Volume**: Eventos por categoría/severidad

### Alertas Sugeridas
- 🚨 CRITICAL: Secret expira en < 7 días
- ⚠️ WARNING: 3+ intentos fallidos de MFA en 5 minutos
- ⚠️ WARNING: IP no autorizada intentando webhook
- 📊 INFO: MFA deshabilitado por admin

---

## Mantenimiento

### Cada 6 Meses
- [ ] Verificar rangos de IP de MercadoPago
- [ ] Revisar logs de audit para patrones sospechosos
- [ ] Actualizar dependencias de seguridad (otplib, bcrypt)

### Cada 90 Días (Automático)
- [x] Secret rotation alerts (cronjob diario)
- [x] Verificación de hash de secrets

---

## Referencias

- [OWASP MFA Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
- [MercadoPago Webhook Security](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)

---

**Última actualización**: 2025-11-20
**Autor**: Claude Code
**Revisión**: Pendiente de testing en producción