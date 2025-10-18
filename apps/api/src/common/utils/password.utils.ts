/**
 * Utilidades para generación y manejo de contraseñas
 */

/**
 * Genera una contraseña segura aleatoria
 *
 * Características:
 * - 12 caracteres de longitud
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 símbolo especial
 *
 * @returns Contraseña segura generada
 */
export function generateSecurePassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin I, O para evitar confusión
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Sin i, l, o para evitar confusión
  const numbers = '23456789'; // Sin 0, 1 para evitar confusión
  const symbols = '!@#$%&*+-=?';

  let password = '';

  // Asegurar al menos 1 de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Rellenar el resto con caracteres aleatorios de todos los tipos
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres para que los obligatorios no estén siempre al inicio
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 *
 * @param password - Contraseña a validar
 * @returns true si cumple los requisitos, false en caso contrario
 */
export function isPasswordSecure(password: string): boolean {
  if (password.length < 6) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}
