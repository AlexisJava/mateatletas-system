import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RolAulaViva } from '../interfaces';

/**
 * Tipo para middleware de Socket.IO
 */
export type WsMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;

/**
 * Payload esperado del JWT
 */
interface JwtPayload {
  sub: string;
  nombre: string;
  rol: RolAulaViva;
  iat?: number;
  exp?: number;
}

/**
 * Crea un middleware que valida tokens JWT en conexiones WebSocket
 *
 * El token debe enviarse en socket.handshake.auth.token
 *
 * @param jwtService - Servicio JWT de NestJS para verificar tokens
 * @returns Middleware de Socket.IO
 */
export const createWsJwtMiddleware = (jwtService: JwtService): WsMiddleware => {
  return (socket: Socket, next: (err?: Error) => void): void => {
    const token = socket.handshake?.auth?.token as string | undefined;

    if (!token) {
      next(new Error('Token no proporcionado'));
      return;
    }

    try {
      const payload = jwtService.verify<JwtPayload>(token);

      socket.data = {
        userId: payload.sub,
        nombre: payload.nombre,
        rol: payload.rol,
      };

      next();
    } catch {
      next(new Error('Token inválido o expirado'));
    }
  };
};
