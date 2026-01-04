import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { createWsJwtMiddleware } from './middleware/ws-jwt.middleware';
import type { AuthenticatedSocket } from './interfaces';
import { PresenciaService, Participante } from './services/presencia.service';
import { UnirseSalaDto, SalirSalaDto } from './dto';

/** Respuesta al unirse a una sala */
interface UnirseSalaResponse {
  exito: boolean;
  salaId: string;
  participantes: Participante[];
}

/** Datos emitidos cuando un participante entra/sale */
interface ParticipanteEvento {
  odidentidadUsuario: string;
  nombre: string;
  rol: string;
  salaId: string;
}

/**
 * Gateway WebSocket para Aula Virtual en Vivo
 *
 * Eventos:
 * - unirse-sala: Cliente se une a una sala (clase o comisión)
 * - salir-sala: Cliente sale de una sala específica
 *
 * Eventos emitidos a clientes:
 * - participante-entro: Notifica a la sala que alguien entró
 * - participante-salio: Notifica a la sala que alguien salió
 */
@WebSocketGateway({
  namespace: '/aula-viva',
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    credentials: true,
  },
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AulaVivaGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AulaVivaGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly presenciaService: PresenciaService,
  ) {}

  afterInit(server: Server): void {
    server.use(createWsJwtMiddleware(this.jwtService));
    this.logger.log('WebSocket Gateway /aula-viva inicializado');
  }

  handleConnection(client: AuthenticatedSocket): void {
    const { userId, nombre, rol } = client.data;
    this.logger.log(
      `Cliente conectado: ${client.id} | Usuario: ${userId} (${nombre}) | Rol: ${rol}`,
    );
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data?.userId ?? 'desconocido';
    const nombre = client.data?.nombre ?? 'desconocido';

    // Remover de todas las salas y notificar
    const salasAfectadas = this.presenciaService.removerParticipante(client.id);

    for (const salaId of salasAfectadas) {
      const evento: ParticipanteEvento = {
        odidentidadUsuario: userId,
        nombre,
        rol: client.data?.rol ?? 'ESTUDIANTE',
        salaId,
      };
      this.server.to(salaId).emit('participante-salio', evento);
    }

    this.logger.log(
      `Cliente desconectado: ${client.id} | Usuario: ${userId} | Salas: ${salasAfectadas.length}`,
    );
  }

  /**
   * Maneja solicitud de unirse a una sala
   */
  @SubscribeMessage('unirse-sala')
  handleUnirseSala(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UnirseSalaDto,
  ): UnirseSalaResponse {
    // Construir ID de sala según el tipo
    const salaId = payload.claseGrupoId
      ? `clase:${payload.claseGrupoId}`
      : `comision:${payload.comisionId}`;

    // Crear participante
    const participante: Participante = {
      odidentidadUsuario: client.data.userId,
      odidentidadSala: salaId,
      socketId: client.id,
      nombre: client.data.nombre,
      rol: client.data.rol,
      conectadoEn: new Date(),
    };

    // Unir al room de Socket.IO
    void client.join(salaId);

    // Registrar en servicio de presencia
    this.presenciaService.agregarParticipante(participante);

    // Notificar a otros en la sala
    const evento: ParticipanteEvento = {
      odidentidadUsuario: client.data.userId,
      nombre: client.data.nombre,
      rol: client.data.rol,
      salaId,
    };
    client.to(salaId).emit('participante-entro', evento);

    // Retornar lista de participantes actuales
    const participantes = this.presenciaService.getParticipantesDeSala(salaId);

    this.logger.log(
      `Usuario ${client.data.nombre} unido a sala ${salaId} | Total: ${participantes.length}`,
    );

    return {
      exito: true,
      salaId,
      participantes,
    };
  }

  /**
   * Maneja solicitud de salir de una sala específica
   */
  @SubscribeMessage('salir-sala')
  handleSalirSala(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SalirSalaDto,
  ): { exito: boolean } {
    const { salaId } = payload;

    // Salir del room de Socket.IO
    void client.leave(salaId);

    // Remover del servicio de presencia
    this.presenciaService.removerParticipanteDeSala(client.id, salaId);

    // Notificar a otros en la sala
    const evento: ParticipanteEvento = {
      odidentidadUsuario: client.data.userId,
      nombre: client.data.nombre,
      rol: client.data.rol,
      salaId,
    };
    this.server.to(salaId).emit('participante-salio', evento);

    this.logger.log(`Usuario ${client.data.nombre} salió de sala ${salaId}`);

    return { exito: true };
  }
}
