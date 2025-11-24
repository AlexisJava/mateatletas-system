-- Buscar usuario Alexis Figueroa en todas las tablas de usuarios
SELECT 
  'ADMIN' as tipo_usuario,
  id,
  email,
  nombre,
  apellido,
  password_temporal as password,
  debe_cambiar_password
FROM admins 
WHERE nombre ILIKE '%alexis%' OR apellido ILIKE '%figueroa%' OR email ILIKE '%alexis%'

UNION ALL

SELECT 
  'TUTOR' as tipo_usuario,
  id,
  email,
  nombre,
  apellido,
  password_temporal as password,
  debe_cambiar_password
FROM tutores 
WHERE nombre ILIKE '%alexis%' OR apellido ILIKE '%figueroa%' OR email ILIKE '%alexis%'

UNION ALL

SELECT 
  'DOCENTE' as tipo_usuario,
  id,
  email,
  nombre,
  apellido,
  password_temporal as password,
  debe_cambiar_password
FROM docentes 
WHERE nombre ILIKE '%alexis%' OR apellido ILIKE '%figueroa%' OR email ILIKE '%alexis%'

UNION ALL

SELECT 
  'ESTUDIANTE' as tipo_usuario,
  id,
  email,
  nombre,
  apellido,
  password_temporal as password,
  debe_cambiar_password
FROM estudiantes 
WHERE nombre ILIKE '%alexis%' OR apellido ILIKE '%figueroa%' OR email ILIKE '%alexis%';
