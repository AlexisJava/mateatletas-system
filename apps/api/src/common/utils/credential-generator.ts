/**
 * Genera credenciales únicas y seguras para usuarios del sistema
 *
 * SEGURIDAD: Usa crypto.randomBytes() para generación criptográficamente segura
 * Math.random() NO es seguro para credenciales - es predecible
 */
import * as crypto from 'crypto';

/**
 * Genera un username único para tutores
 * Formato: nombre.apellido + sufijo aleatorio de 4 caracteres
 * Ejemplo: carlos.perez.abc1
 */
export function generateTutorUsername(
  nombre: string,
  apellido: string,
): string {
  const normalizedNombre = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const normalizedApellido = apellido
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const suffix = generateRandomSuffix(4);
  return `${normalizedNombre}.${normalizedApellido}.${suffix}`;
}

/**
 * Genera un username único para estudiantes
 * Formato: nombre.apellido + sufijo aleatorio de 4 caracteres
 * Ejemplo: juan.perez.xyz2
 */
export function generateEstudianteUsername(
  nombre: string,
  apellido: string,
): string {
  const normalizedNombre = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const normalizedApellido = apellido
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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
 * Formato: 4 dígitos (1000-9999)
 * Usa crypto para seguridad
 */
export function generateEstudiantePin(): string {
  // Genera número entre 1000 y 9999 usando crypto
  const randomBytes = crypto.randomBytes(2);
  const randomNumber = randomBytes.readUInt16BE(0);
  // Mapear 0-65535 a 1000-9999
  const pin = 1000 + (randomNumber % 9000);
  return pin.toString();
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
 * Usa letras minúsculas y números con crypto seguro
 */
function generateRandomSuffix(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    const byte = bytes.readUInt8(i);
    result += chars.charAt(byte % chars.length);
  }
  return result;
}

/**
 * Genera una cadena aleatoria segura para contraseñas
 * Usa crypto.randomBytes() - criptográficamente seguro
 * Incluye mayúsculas, minúsculas, números y símbolos
 */
function generateSecureRandomString(length: number): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  const bytes = crypto.randomBytes(length + 4); // Extra bytes para garantizar tipos
  let result = '';

  // Asegurar al menos uno de cada tipo usando bytes aleatorios
  result += uppercase.charAt(bytes.readUInt8(0) % uppercase.length);
  result += lowercase.charAt(bytes.readUInt8(1) % lowercase.length);
  result += numbers.charAt(bytes.readUInt8(2) % numbers.length);
  result += symbols.charAt(bytes.readUInt8(3) % symbols.length);

  // Rellenar el resto con bytes aleatorios
  for (let i = result.length; i < length; i++) {
    result += allChars.charAt(bytes.readUInt8(i) % allChars.length);
  }

  // Mezclar usando Fisher-Yates con crypto
  const chars = result.split('');
  const shuffleBytes = crypto.randomBytes(chars.length);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleBytes.readUInt8(i) % (i + 1);
    const temp = chars[i];
    chars[i] = chars[j] as string;
    chars[j] = temp as string;
  }

  return chars.join('');
}
