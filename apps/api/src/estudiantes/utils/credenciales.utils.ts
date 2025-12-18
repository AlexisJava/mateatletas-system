import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * Genera un username único basado en nombre y apellido
 * Formato: nombre.apellido (lowercase, sin espacios ni acentos)
 * Si existe, agrega número: nombre.apellido2, nombre.apellido3, etc.
 */
export async function generarUsername(
  nombre: string,
  apellido: string,
  prisma: PrismaService,
): Promise<string> {
  // Normalizar: lowercase, remover acentos, remover espacios
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

  const base = `${normalize(nombre)}.${normalize(apellido)}`;
  let username = base;
  let counter = 2;

  // Verificar si el username ya existe en tutor o estudiante
  while (
    (await prisma.tutor.findUnique({ where: { username } })) ||
    (await prisma.estudiante.findUnique({ where: { username } }))
  ) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
}

/**
 * Genera una contraseña temporal alfanumérica de 8 caracteres
 * Caracteres permitidos: A-Z, a-z, 0-9
 */
export function generarPasswordTemporal(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Hashea una contraseña usando bcrypt
 * ✅ SECURITY: Uses 12 rounds (NIST SP 800-63B 2025)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // ✅ Updated from 10 to 12 (2025-11-21)
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Lista de palabras simples para passphrase de estudiantes
 * Palabras cortas, fáciles de leer y escribir para niños
 */
const PALABRAS_PASSPHRASE = [
  'Sol',
  'Luna',
  'Mar',
  'Cielo',
  'Rojo',
  'Azul',
  'Verde',
  'Gato',
  'Perro',
  'Leon',
  'Tigre',
  'Puma',
  'Oso',
  'Lobo',
  'Alfa',
  'Beta',
  'Gama',
  'Nube',
  'Flor',
  'Arbol',
  'Rio',
];

/**
 * Genera una passphrase memorable para estudiantes
 * Formato: Palabra+Número-Palabra+Número
 * Ejemplo: "Sol7-Luna3", "Gato5-Rojo2"
 *
 * ✅ SECURITY: Usa crypto.randomBytes() (CSPRNG) para selección aleatoria
 * Longitud: 10-12 caracteres (suficiente para cuenta sin datos sensibles)
 */
export function generarPasswordEstudiante(): string {
  const bytes = randomBytes(4);
  const palabra1 = PALABRAS_PASSPHRASE[bytes[0]! % PALABRAS_PASSPHRASE.length];
  const numero1 = bytes[1]! % 10;
  const palabra2 = PALABRAS_PASSPHRASE[bytes[2]! % PALABRAS_PASSPHRASE.length];
  const numero2 = bytes[3]! % 10;

  return `${palabra1}${numero1}-${palabra2}${numero2}`;
}
