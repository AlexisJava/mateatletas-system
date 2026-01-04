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
import {
  UnirseSalaDto,
  SalirSalaDto,
  EnviarMensajeDto,
  ToggleChatDto,
} from './dto';
import { randomUUID } from 'crypto';

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

/** Estructura de un mensaje de chat */
interface MensajeChat {
  id: string;
  visibleIdUsuario: string;
  nombreUsuario: string;
  rol: 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN';
  contenido: string;
  timestamp: string;
  salaId: string;
}

/** Respuesta al enviar mensaje */
interface EnviarMensajeResponse {
  exito: boolean;
  mensaje?: MensajeChat;
  error?: string;
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
    this.logger.log('Gateway inicializado con middleware JWT');
  }

  handleConnection(client: AuthenticatedSocket): void {
    const { nombre, rol } = client.data;
    this.logger.log(`Cliente conectado: ${client.id} | ${nombre} (${rol})`);
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
  async handleUnirseSala(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UnirseSalaDto,
  ): Promise<UnirseSalaResponse> {
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

    // Unir al room de Socket.IO (await necesario para sincronizar rooms)
    await client.join(salaId);

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

  /**
   * Maneja envío de mensajes de chat
   */
  @SubscribeMessage('enviar-mensaje')
  handleEnviarMensaje(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: EnviarMensajeDto,
  ): EnviarMensajeResponse {
    const { salaId, contenido } = payload;

    // Validar que el mensaje no esté vacío
    if (!contenido || contenido.trim().length === 0) {
      return { exito: false, error: 'El mensaje no puede estar vacío' };
    }

    // Validar longitud máxima (en handler, no en DTO)
    // NOTA: La validación se hace aquí y no con @MaxLength en el DTO porque
    // ValidationPipe en WebSockets rechaza silenciosamente sin enviar callback,
    // lo que causa timeouts en el cliente esperando respuesta.
    if (contenido.length > 2000) {
      return {
        exito: false,
        error: 'El mensaje excede el límite de 2000 caracteres',
      };
    }

    // Verificar que el usuario está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Verificar que el chat esté habilitado
    if (!this.presenciaService.isChatHabilitado(salaId)) {
      return {
        exito: false,
        error: 'El chat está deshabilitado por el docente',
      };
    }

    // Construir el mensaje
    const mensaje: MensajeChat = {
      id: randomUUID(),
      visibleIdUsuario: client.data.userId,
      nombreUsuario: client.data.nombre,
      rol: client.data.rol,
      contenido: contenido.trim(),
      timestamp: new Date().toISOString(),
      salaId,
    };

    // Emitir a todos en la sala (incluyendo el remitente)
    this.server.to(salaId).emit('nuevo-mensaje', mensaje);

    this.logger.debug(
      `Mensaje enviado en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true, mensaje };
  }

  /**
   * Permite al docente habilitar/deshabilitar el chat de una sala
   * Solo usuarios con rol DOCENTE pueden usar este evento
   */
  @SubscribeMessage('toggle-chat')
  handleToggleChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ToggleChatDto,
  ): { exito: boolean; habilitado?: boolean; error?: string } {
    const { salaId, habilitado } = payload;

    // Solo docentes pueden controlar el chat
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede controlar el chat' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Actualizar estado del chat
    this.presenciaService.setChatHabilitado(salaId, habilitado);

    // Notificar a todos en la sala del cambio
    this.server.to(salaId).emit('chat-toggle', {
      salaId,
      habilitado,
      mensaje: habilitado
        ? 'El docente ha habilitado el chat'
        : 'El docente ha deshabilitado el chat',
    });

    this.logger.log(
      `Chat ${habilitado ? 'habilitado' : 'deshabilitado'} en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true, habilitado };
  }
}
