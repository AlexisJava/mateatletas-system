/**
 * Genera credenciales únicas y seguras para usuarios del sistema
 */

/**
 * Genera un username único para tutores
 * Formato: nombre.apellido + sufijo aleatorio de 4 caracteres
 * Ejemplo: carlos.perez.abc1
 */
export function generateTutorUsername(nombre: string, apellido: string): string {
  const normalizedNombre = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedApellido = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const suffix = generateRandomSuffix(4);
  return `${normalizedNombre}.${normalizedApellido}.${suffix}`;
}

/**
 * Genera un username único para estudiantes
 * Formato: nombre.apellido + sufijo aleatorio de 4 caracteres
 * Ejemplo: juan.perez.xyz2
 */
export function generateEstudianteUsername(nombre: string, apellido: string): string {
  const normalizedNombre = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedApellido = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const suffix = generateRandomSuffix(4);
  return `${normalizedNombre}.${normalizedApellido}.${suffix}`;
}

/**
 * Genera una contraseña temporal segura para tutores
 * Formato: Tutor-P@ss- + 12 caracteres aleatorios
 * Incluye mayúsculas, minúsculas, números y símbolos
 * Ejemplo: Tutor-P@ss-AbC123XyZ456
 */
export function generateTutorPassword(): string {
  const prefix = 'Tutor-P@ss-';
  const randomPart = generateSecureRandomString(12);
  return `${prefix}${randomPart}`;
}

/**
 * Genera un PIN numérico de 4 dígitos para estudiantes
 * Formato: 4 dígitos
 * Ejemplo: 1234
 */
export function generateEstudiantePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Genera una contraseña temporal segura para docentes
 * Formato: Docente-P@ss- + 12 caracteres aleatorios
 * Incluye mayúsculas, minúsculas, números y símbolos
 * Ejemplo: Docente-P@ss-AbC123XyZ456
 */
export function generateDocentePassword(): string {
  const prefix = 'Docente-P@ss-';
  const randomPart = generateSecureRandomString(12);
  return `${prefix}${randomPart}`;
}

/**
 * Genera un sufijo aleatorio de longitud especificada
 * Usa letras minúsculas y números
 */
function generateRandomSuffix(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Genera una cadena aleatoria segura para contraseñas
 * Incluye mayúsculas, minúsculas, números y símbolos
 */
function generateSecureRandomString(length: number): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let result = '';

  // Asegurar al menos uno de cada tipo
  result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  result += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Rellenar el resto
  for (let i = result.length; i < length; i++) {
    result += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Mezclar para que los caracteres garantizados no estén siempre al inicio
  return result.split('').sort(() => Math.random() - 0.5).join('');
}
