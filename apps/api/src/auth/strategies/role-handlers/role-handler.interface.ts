/**
 * Tipo base para usuarios con password - Acepta cualquier estructura de Prisma
 */
export interface UserWithPassword {
  id: string;
  email: string | null;
  password_hash: string | null;
  [key: string]: unknown;
}

/**
 * Tipo para perfil de usuario (sin password) - Acepta cualquier estructura de Prisma
 */
export interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  [key: string]: unknown;
}

/**
 * Interfaz para handlers de roles
 * Strategy Pattern: Cada rol tiene su propia estrategia de autenticación
 */
export interface RoleHandler {
  /**
   * Buscar usuario por email
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  findUserByEmail(email: string): Promise<UserWithPassword | null>;

  /**
   * Buscar usuario por ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o null
   */
  findUserById(id: string): Promise<UserWithPassword | null>;

  /**
   * Validar credenciales del usuario
   * @param user - Usuario a validar
   * @param password - Password en texto plano
   * @returns True si las credenciales son válidas
   */
  validateCredentials(
    user: UserWithPassword,
    password: string,
  ): Promise<boolean>;

  /**
   * Obtener perfil completo del usuario
   * @param userId - ID del usuario
   * @returns Perfil del usuario con relaciones o null si no existe
   */
  getProfile(userId: string): Promise<UserProfile | null>;

  /**
   * Nombre del rol que maneja este handler
   */
  getRoleName(): string;
}
