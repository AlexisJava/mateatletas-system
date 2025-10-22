/**
 * Interfaz para handlers de roles
 * Strategy Pattern: Cada rol tiene su propia estrategia de autenticación
 */
export interface AuthenticableUser {
  password_hash: string;
}

export interface RoleHandler {
  /**
   * Buscar usuario por email
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  findUserByEmail(email: string): Promise<unknown>;

  /**
   * Buscar usuario por ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o null
   */
  findUserById(id: string): Promise<unknown>;

  /**
   * Validar credenciales del usuario
   * @param user - Usuario a validar
   * @param password - Password en texto plano
   * @returns True si las credenciales son válidas
   */
  validateCredentials(
    user: AuthenticableUser,
    password: string,
  ): Promise<boolean>;

  /**
   * Obtener perfil completo del usuario
   * @param userId - ID del usuario
   * @returns Perfil del usuario con relaciones
   */
  getProfile(userId: string): Promise<unknown>;

  /**
   * Nombre del rol que maneja este handler
   */
  getRoleName(): string;
}
