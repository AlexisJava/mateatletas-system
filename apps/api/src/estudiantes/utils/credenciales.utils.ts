import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

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
