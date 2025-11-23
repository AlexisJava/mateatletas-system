-- CreateTable: login_attempts para tracking de intentos de login
-- Previene brute force attacks bloqueando cuenta tras 5 intentos fallidos en 15 min

CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para consultas rápidas de intentos recientes por email
CREATE INDEX idx_login_attempts_email_created ON login_attempts(email, created_at DESC);

-- Índice para consultas de auditoría por IP
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip);

-- Comentarios para documentación
COMMENT ON TABLE login_attempts IS 'Registro de intentos de login para prevención de brute force';
COMMENT ON COLUMN login_attempts.email IS 'Email del usuario intentando autenticarse';
COMMENT ON COLUMN login_attempts.ip IS 'Dirección IP del cliente (soporta IPv4 e IPv6)';
COMMENT ON COLUMN login_attempts.success IS 'true si login exitoso, false si falló';
COMMENT ON COLUMN login_attempts.created_at IS 'Timestamp del intento de login';