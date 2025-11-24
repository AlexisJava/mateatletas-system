-- Buscar credenciales de alexis.figueroa@est.fi.uncoma.edu.ar
SELECT 
  'ADMIN' as tipo_usuario,
  email,
  nombre,
  apellido,
  password_temporal as password_temp,
  debe_cambiar_password,
  'Email: ' || email || E'\nPassword: ' || COALESCE(password_temporal, '(sin password temporal - usar la que configuraste)') as credenciales
FROM admins 
WHERE email = 'alexis.figueroa@est.fi.uncoma.edu.ar'

UNION ALL

SELECT 
  'TUTOR' as tipo_usuario,
  email,
  nombre,
  apellido,
  password_temporal as password_temp,
  debe_cambiar_password,
  'Email: ' || email || E'\nPassword: ' || COALESCE(password_temporal, '(sin password temporal - usar la que configuraste)') as credenciales
FROM tutores 
WHERE email = 'alexis.figueroa@est.fi.uncoma.edu.ar'

UNION ALL

SELECT 
  'DOCENTE' as tipo_usuario,
  email,
  nombre,
  apellido,
  password_temporal as password_temp,
  debe_cambiar_password,
  'Email: ' || email || E'\nPassword: ' || COALESCE(password_temporal, '(sin password temporal - usar la que configuraste)') as credenciales
FROM docentes 
WHERE email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
