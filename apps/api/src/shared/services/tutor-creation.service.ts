import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma, Tutor } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Datos necesarios para crear un tutor
 */
export interface CreateTutorData {
  nombre: string;
  email: string;
  telefono: string;
  cuil: string;
  dni?: string;
  password: string;
  ciudad?: string;
}

/**
 * Servicio compartido para la creación de tutores
 *
 * Este servicio proporciona funcionalidad unificada para:
 * - Validación de email único
 * - Generación de username a partir del email
 * - Hash seguro de contraseñas con bcrypt
 * - Creación de tutores con datos normalizados
 * - Búsqueda o creación idempotente (findOrCreate)
 *
 * Centraliza la lógica duplicada entre ColoniaService e Inscripciones2026Service,
 * eliminando ~45 líneas de código duplicado.
 *
 * @example
 * ```typescript
 * // Validar email único
 * await tutorCreation.validateUniqueEmail('juan@example.com');
 *
 * // Crear tutor dentro de una transacción
 * const tutor = await tutorCreation.createTutor(tx, {
 *   nombre: 'Juan Pérez',
 *   email: 'juan@example.com',
 *   telefono: '1234567890',
 *   cuil: '20123456789',
 *   password: 'SecurePass123',
 * });
 *
 * // Buscar o crear tutor
 * const tutor = await tutorCreation.findOrCreateTutor(tx, data);
 * ```
 */
@Injectable()
export class TutorCreationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que un email no esté registrado en la base de datos
   *
   * @param email - Email a validar
   * @throws ConflictException si el email ya existe
   *
   * @example
   * ```typescript
   * await validateUniqueEmail('juan@example.com');
   * // Si ya existe, lanza ConflictException
   * ```
   */
  async validateUniqueEmail(email: string): Promise<void> {
    const existingTutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    if (existingTutor) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  /**
   * Genera un username a partir del email
   *
   * Extrae la parte local del email (antes del @) y la convierte en lowercase
   * para usarla como username.
   *
   * @param email - Email del tutor
   * @returns Username generado
   *
   * @example
   * ```typescript
   * generateUsername('Juan.Perez@Example.com')
   * // Returns: 'juan.perez'
   * ```
   */
  generateUsername(email: string): string {
    const localPart = email.split('@')[0];
    if (!localPart) {
      throw new Error(
        `Email inválido: "${email}" - no contiene parte local antes de @`,
      );
    }
    return localPart.toLowerCase();
  }

  /**
   * Genera el hash de una contraseña usando bcrypt
   *
   * @param password - Contraseña en texto plano
   * @returns Hash bcrypt de la contraseña
   *
   * @example
   * ```typescript
   * const hash = await hashPassword('SecurePass123');
   * // Returns: '$2b$12$...'
   * ```
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Crea un nuevo tutor en la base de datos
   *
   * Este método debe ser llamado dentro de una transacción Prisma.
   * Normaliza los datos del tutor:
   * - Email en lowercase
   * - Username generado desde el email
   * - Contraseña hasheada con bcrypt
   * - Rol asignado como 'TUTOR'
   *
   * @param tx - Cliente de transacción Prisma
   * @param data - Datos del tutor a crear
   * @returns Tutor creado
   *
   * @example
   * ```typescript
   * const tutor = await prisma.$transaction(async (tx) => {
   *   return await tutorCreation.createTutor(tx, {
   *     nombre: 'Juan Pérez',
   *     email: 'juan@example.com',
   *     telefono: '1234567890',
   *     cuil: '20123456789',
   *     password: 'SecurePass123',
   *   });
   * });
   * ```
   */
  async createTutor(
    tx: Prisma.TransactionClient,
    data: CreateTutorData,
  ): Promise<Tutor> {
    const passwordHash = await this.hashPassword(data.password);
    const username = this.generateUsername(data.email);

    return await tx.tutor.create({
      data: {
        nombre: data.nombre,
        apellido: '',
        email: data.email.toLowerCase(),
        username: username,
        password_hash: passwordHash,
        telefono: data.telefono,
        cuil: data.cuil,
        dni: data.dni,
        roles: ['TUTOR'],
      },
    });
  }

  /**
   * Busca un tutor por email o lo crea si no existe (patrón findOrCreate)
   *
   * Este método implementa el patrón findOrCreate de forma atómica dentro
   * de una transacción. Es útil cuando se necesita reutilizar un tutor
   * existente o crear uno nuevo si no existe.
   *
   * @param tx - Cliente de transacción Prisma
   * @param data - Datos del tutor a buscar/crear
   * @returns Tutor encontrado o creado
   *
   * @example
   * ```typescript
   * const tutor = await prisma.$transaction(async (tx) => {
   *   return await tutorCreation.findOrCreateTutor(tx, {
   *     nombre: 'Juan Pérez',
   *     email: 'juan@example.com',
   *     telefono: '1234567890',
   *     cuil: '20123456789',
   *     password: 'SecurePass123',
   *   });
   * });
   * // Si el tutor existe, lo retorna
   * // Si no existe, lo crea y luego lo retorna
   * ```
   */
  async findOrCreateTutor(
    tx: Prisma.TransactionClient,
    data: CreateTutorData,
  ): Promise<Tutor> {
    const existingTutor = await tx.tutor.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingTutor) {
      return existingTutor;
    }

    return await this.createTutor(tx, data);
  }
}
