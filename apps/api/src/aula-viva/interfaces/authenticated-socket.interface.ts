import { Socket } from 'socket.io';

/**
 * Roles permitidos en el sistema de aula virtual
 */
export type RolAulaViva = 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN';

/**
 * Datos del usuario autenticado almacenados en el socket
 */
export interface SocketUserData {
  userId: string;
  nombre: string;
  rol: RolAulaViva;
}

/**
 * Socket autenticado con datos de usuario tipados
 */
export interface AuthenticatedSocket extends Socket {
  data: SocketUserData;
}
