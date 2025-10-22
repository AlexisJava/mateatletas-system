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
  findUserByEmail(email: string): Promise<any | null>;

  /**
   * Buscar usuario por ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o null
   */
  findUserById(id: string): Promise<any | null>;

  /**
   * Validar credenciales del usuario
   * @param user - Usuario a validar
   * @param password - Password en texto plano
   * @returns True si las credenciales son válidas
   */
  validateCredentials(user: any, password: string): Promise<boolean>;

  /**
   * Obtener perfil completo del usuario
   * @param userId - ID del usuario
   * @returns Perfil del usuario con relaciones
   */
  getProfile(userId: string): Promise<any>;

  /**
   * Nombre del rol que maneja este handler
   */
  getRoleName(): string;
}
