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
import {
  Logger,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsErrorInterceptor } from './interceptors/ws-error.interceptor';
import { createWsJwtMiddleware } from './middleware/ws-jwt.middleware';
import type { AuthenticatedSocket } from './interfaces';
import { PresenciaService, Participante } from './services/presencia.service';
import { ManosService } from './services/manos.service';
import { ModeracionService, TipoMuteo } from './services/moderacion.service';
import { ReaccionesService } from './services/reacciones.service';
import { PulsoService } from './services/pulso.service';
import { SelectorService } from './services/selector.service';
import { QuizService } from './services/quiz.service';
import { ContadorService } from './services/contador.service';
import { GamificacionRealtimeService } from './services/gamificacion-realtime.service';
import {
  UnirseSalaDto,
  SalirSalaDto,
  EnviarMensajeDto,
  ToggleChatDto,
  LevantarManoDto,
  BajarManoDto,
  DarPalabraDto,
  MutearParticipanteDto,
  DesmutearParticipanteDto,
  MutearTodosDto,
  DesmutearTodosDto,
  ExpulsarParticipanteDto,
  HablandoDto,
  EnviarReaccionDto,
  CrearPulsoDto,
  ResponderPulsoDto,
  CerrarPulsoDto,
  SeleccionarAleatorioDto,
  ResetearSelectorDto,
} from './dto';
import {
  CrearQuizDto,
  ResponderQuizDto,
  CerrarQuizDto,
  QuizPublico,
  QuizResultado,
} from './dto/quiz.dto';
import {
  IniciarContadorDto,
  PausarContadorDto,
  ReanudarContadorDto,
  CancelarContadorDto,
  ContadorIniciadoPayload,
} from './dto/contador.dto';
import { randomUUID } from 'crypto';
import { PrismaService } from '../core/database/prisma.service';

/** Respuesta al unirse a una sala */
interface UnirseSalaResponse {
  exito: boolean;
  salaId?: string;
  participantes?: Participante[];
  error?: string;
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
@UseInterceptors(new WsErrorInterceptor())
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
    private readonly manosService: ManosService,
    private readonly moderacionService: ModeracionService,
    private readonly reaccionesService: ReaccionesService,
    private readonly pulsoService: PulsoService,
    private readonly selectorService: SelectorService,
    private readonly quizService: QuizService,
    private readonly contadorService: ContadorService,
    private readonly gamificacionRealtimeService: GamificacionRealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server): void {
    server.use(createWsJwtMiddleware(this.jwtService));
    // Configurar server para notificaciones de gamificación en tiempo real
    this.gamificacionRealtimeService.setServer(server);
    this.logger.log(
      'Gateway inicializado con middleware JWT y gamificación realtime',
    );
  }

  handleConnection(client: AuthenticatedSocket): void {
    const { nombre, rol } = client.data;
    this.logger.log(`Cliente conectado: ${client.id} | ${nombre} (${rol})`);
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data?.userId ?? 'desconocido';
    const nombre = client.data?.nombre ?? 'desconocido';

    // Remover manos levantadas del usuario y notificar
    const salasConManoBajada = this.manosService.removerManosPorUsuario(userId);
    for (const salaId of salasConManoBajada) {
      this.server.to(salaId).emit('mano-bajada', { odooId: userId });
    }

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

    // Verificar si el usuario está expulsado de esta sala
    if (this.moderacionService.estaExpulsado(salaId, client.data.userId)) {
      const motivo = this.moderacionService.getMotivoExpulsion(
        salaId,
        client.data.userId,
      );
      this.logger.warn(
        `Usuario ${client.data.nombre} intentó unirse a sala ${salaId} pero está expulsado`,
      );
      return {
        exito: false,
        error:
          motivo ??
          'Has sido expulsado de esta sala. Podrás volver en 24 horas.',
      };
    }

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

    // Sprint 3.5: Auto-unir estudiantes a su room de casa para recibir broadcast de puntos
    if (client.data.rol === 'ESTUDIANTE') {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: client.data.userId },
        select: { casaId: true },
      });

      if (estudiante?.casaId) {
        const casaRoom = `casa:${estudiante.casaId}`;
        await client.join(casaRoom);
        this.logger.debug(
          `Estudiante ${client.data.nombre} unido a room de casa ${casaRoom}`,
        );
      }
    }

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

  // ============================================================================
  // HANDLERS: LEVANTAR LA MANO
  // ============================================================================

  /**
   * Permite a un estudiante levantar la mano en una sala
   * Solo usuarios con rol ESTUDIANTE pueden usar este evento
   *
   * Evento emitido: mano-levantada (broadcast a toda la sala)
   */
  @SubscribeMessage('levantar-mano')
  handleLevantarMano(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: LevantarManoDto,
  ): { exito: boolean; error?: string } {
    const { salaId } = payload;

    // Solo estudiantes pueden levantar la mano
    if (client.data.rol !== 'ESTUDIANTE') {
      return {
        exito: false,
        error: 'Solo estudiantes pueden levantar la mano',
      };
    }

    // Verificar que el estudiante está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Levantar la mano
    const mano = this.manosService.levantarMano(
      salaId,
      client.data.userId,
      client.data.nombre,
    );

    // Notificar a todos en la sala
    this.server.to(salaId).emit('mano-levantada', {
      odooId: mano.odooId,
      nombre: mano.nombre,
      timestamp: mano.timestamp.toISOString(),
    });

    this.logger.log(`${client.data.nombre} levantó la mano en sala ${salaId}`);

    return { exito: true };
  }

  /**
   * Permite a un estudiante bajar la mano en una sala
   * Solo usuarios con rol ESTUDIANTE pueden usar este evento
   *
   * Evento emitido: mano-bajada (broadcast a toda la sala)
   */
  @SubscribeMessage('bajar-mano')
  handleBajarMano(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: BajarManoDto,
  ): { exito: boolean; error?: string } {
    const { salaId } = payload;

    // Solo estudiantes pueden bajar la mano
    if (client.data.rol !== 'ESTUDIANTE') {
      return { exito: false, error: 'Solo estudiantes pueden bajar la mano' };
    }

    // Verificar que el estudiante está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Bajar la mano
    const bajada = this.manosService.bajarMano(salaId, client.data.userId);

    if (!bajada) {
      return { exito: false, error: 'No tenías la mano levantada' };
    }

    // Notificar a todos en la sala
    this.server.to(salaId).emit('mano-bajada', {
      odooId: client.data.userId,
    });

    this.logger.log(`${client.data.nombre} bajó la mano en sala ${salaId}`);

    return { exito: true };
  }

  /**
   * Permite al docente dar la palabra a un estudiante
   * Solo usuarios con rol DOCENTE pueden usar este evento
   * La mano del estudiante baja automáticamente al darle la palabra
   *
   * Evento emitido: palabra-otorgada (broadcast a toda la sala)
   */
  @SubscribeMessage('dar-palabra')
  handleDarPalabra(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DarPalabraDto,
  ): { exito: boolean; error?: string } {
    const { salaId, odooIdEstudiante } = payload;

    // Solo docentes pueden dar la palabra
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede dar la palabra' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Dar la palabra (baja la mano automáticamente)
    const mano = this.manosService.darPalabra(salaId, odooIdEstudiante);

    if (!mano) {
      return {
        exito: false,
        error: 'El estudiante no tiene la mano levantada',
      };
    }

    // Notificar a todos en la sala
    this.server.to(salaId).emit('palabra-otorgada', {
      odooId: mano.odooId,
      nombre: mano.nombre,
    });

    this.logger.log(
      `Palabra otorgada a ${mano.nombre} en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true };
  }

  // ============================================================================
  // HANDLERS: MODERACIÓN (MUTEAR/EXPULSAR)
  // ============================================================================

  /**
   * Permite al docente mutear a un participante
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: participante-muteado (broadcast a toda la sala)
   */
  @SubscribeMessage('mutear-participante')
  handleMutearParticipante(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MutearParticipanteDto,
  ): { exito: boolean; error?: string } {
    const { salaId, odooIdEstudiante, tipo } = payload;

    // Solo docentes pueden mutear
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede mutear participantes',
      };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Mutear al participante
    this.moderacionService.mutear(salaId, odooIdEstudiante, tipo as TipoMuteo);

    // Notificar a todos en la sala
    this.server.to(salaId).emit('participante-muteado', {
      odooId: odooIdEstudiante,
      tipo,
    });

    this.logger.log(
      `${odooIdEstudiante} muteado (${tipo}) en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true };
  }

  /**
   * Permite al docente desmutear a un participante
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: participante-desmuteado (broadcast a toda la sala)
   */
  @SubscribeMessage('desmutear-participante')
  handleDesmutearParticipante(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DesmutearParticipanteDto,
  ): { exito: boolean; error?: string } {
    const { salaId, odooIdEstudiante } = payload;

    // Solo docentes pueden desmutear
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede desmutear participantes',
      };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Desmutear al participante
    const estabaMuteado = this.moderacionService.desmutear(
      salaId,
      odooIdEstudiante,
    );

    if (!estabaMuteado) {
      return { exito: false, error: 'El participante no estaba muteado' };
    }

    // Notificar a todos en la sala
    this.server.to(salaId).emit('participante-desmuteado', {
      odooId: odooIdEstudiante,
    });

    this.logger.log(
      `${odooIdEstudiante} desmuteado en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true };
  }

  /**
   * Permite al docente mutear a todos los participantes
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: todos-muteados (broadcast a toda la sala)
   */
  @SubscribeMessage('mutear-todos')
  handleMutearTodos(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MutearTodosDto,
  ): { exito: boolean; error?: string } {
    const { salaId, tipo, excepto = [] } = payload;

    // Solo docentes pueden mutear
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede mutear a todos' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Obtener lista de participantes en la sala
    const participantes = this.presenciaService.getParticipantesDeSala(salaId);
    const odooIds = participantes.map((p) => p.odidentidadUsuario);

    // El docente siempre se excluye automáticamente
    const exceptoConDocente = [...new Set([...excepto, client.data.userId])];

    // Mutear a todos
    const muteados = this.moderacionService.mutearTodos(
      salaId,
      tipo as TipoMuteo,
      exceptoConDocente,
      odooIds,
    );

    // Notificar a todos en la sala
    this.server.to(salaId).emit('todos-muteados', {
      tipo,
      excepto: exceptoConDocente,
      muteados,
    });

    this.logger.log(
      `Todos muteados (${tipo}) en sala ${salaId} por ${client.data.nombre}, excepto: ${exceptoConDocente.join(', ')}`,
    );

    return { exito: true };
  }

  /**
   * Permite al docente desmutear a todos los participantes
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: todos-desmuteados (broadcast a toda la sala)
   */
  @SubscribeMessage('desmutear-todos')
  handleDesmutearTodos(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DesmutearTodosDto,
  ): { exito: boolean; error?: string } {
    const { salaId } = payload;

    // Solo docentes pueden desmutear
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede desmutear a todos' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Desmutear a todos
    const desmuteados = this.moderacionService.desmutearTodos(salaId);

    // Notificar a todos en la sala
    this.server.to(salaId).emit('todos-desmuteados', {
      desmuteados,
    });

    this.logger.log(
      `Todos desmuteados en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true };
  }

  /**
   * Permite al docente expulsar a un participante
   * Solo usuarios con rol DOCENTE pueden usar este evento
   * El participante expulsado no puede volver a unirse por 24 horas
   *
   * Eventos emitidos:
   * - participante-expulsado (solo al expulsado, con motivo)
   * - alguien-expulsado (broadcast a toda la sala, sin motivo)
   */
  @SubscribeMessage('expulsar-participante')
  handleExpulsarParticipante(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ExpulsarParticipanteDto,
  ): { exito: boolean; error?: string } {
    const { salaId, odooIdEstudiante, motivo } = payload;

    // Solo docentes pueden expulsar
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede expulsar participantes',
      };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Buscar el socket del estudiante a expulsar
    const participantes = this.presenciaService.getParticipantesDeSala(salaId);
    const participanteExpulsado = participantes.find(
      (p) => p.odidentidadUsuario === odooIdEstudiante,
    );

    if (!participanteExpulsado) {
      return { exito: false, error: 'El participante no está en la sala' };
    }

    // Registrar la expulsión
    this.moderacionService.expulsar(salaId, odooIdEstudiante, motivo);

    // Bajar la mano si la tenía levantada
    this.manosService.bajarMano(salaId, odooIdEstudiante);

    // Notificar al expulsado (con motivo privado)
    const socketExpulsado = this.server.sockets.sockets.get(
      participanteExpulsado.socketId,
    );
    if (socketExpulsado) {
      socketExpulsado.emit('participante-expulsado', {
        motivo: motivo ?? 'Has sido expulsado de la clase',
      });

      // Forzar desconexión del socket
      socketExpulsado.disconnect(true);
    }

    // Notificar a todos en la sala (sin motivo por privacidad)
    this.server.to(salaId).emit('alguien-expulsado', {
      odooId: odooIdEstudiante,
      nombre: participanteExpulsado.nombre,
    });

    this.logger.log(
      `${participanteExpulsado.nombre} expulsado de sala ${salaId} por ${client.data.nombre}${motivo ? `: ${motivo}` : ''}`,
    );

    return { exito: true };
  }

  // ============================================================================
  // HANDLERS: INDICADOR "ESTÁ HABLANDO"
  // ============================================================================

  /**
   * Relay del indicador de actividad de voz
   * Se integra con Voice Activity Detection (VAD) de LiveKit en el frontend
   *
   * El cliente envía este evento cuando detecta inicio/fin de habla,
   * y el servidor lo retransmite a todos los demás en la sala
   *
   * Evento emitido: usuario-hablando (broadcast a toda la sala excepto el sender)
   */
  @SubscribeMessage('hablando')
  handleHablando(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: HablandoDto,
  ): { exito: boolean; error?: string } {
    const { salaId, activo } = payload;

    // Verificar que el usuario está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Broadcast a todos en la sala excepto el sender
    client.to(salaId).emit('usuario-hablando', {
      odooId: client.data.userId,
      activo,
    });

    return { exito: true };
  }

  // ============================================================================
  // HANDLERS: REACCIONES EN TIEMPO REAL
  // ============================================================================

  /**
   * Permite a cualquier participante enviar una reacción
   * Incluye rate limiting (1 reacción cada 2 segundos) y agregación
   *
   * Evento emitido: reaccion (broadcast a toda la sala)
   * Payload emitido: { tipo, emoji, contador, ultimosUsuarios }
   */
  @SubscribeMessage('enviar-reaccion')
  handleEnviarReaccion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: EnviarReaccionDto & { salaId: string },
  ): { exito: boolean; error?: string } {
    const { salaId, tipo } = payload;

    // Verificar que el usuario está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Enviar reacción con rate limiting
    const result = this.reaccionesService.enviarReaccion(
      salaId,
      client.data.userId,
      client.data.nombre,
      tipo,
    );

    if (!result.exito) {
      return { exito: false, error: result.error };
    }

    // Broadcast la reacción agregada a toda la sala
    this.server.to(salaId).emit('reaccion', result.reaccion);

    return { exito: true };
  }

  // ============================================================================
  // HANDLERS: PULSO DE ATENCIÓN (ENCUESTAS RÁPIDAS)
  // ============================================================================

  /**
   * Permite al docente crear un pulso/encuesta rápida
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: pulso-creado (broadcast a toda la sala)
   */
  @SubscribeMessage('crear-pulso')
  handleCrearPulso(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CrearPulsoDto,
  ): { exito: boolean; pulsoId?: string; error?: string } {
    const { salaId, pregunta, opciones } = payload;

    // Validación manual para evitar timeout por ValidationPipe silencioso
    // (ver: https://github.com/nestjs/nest/issues/5267)
    if (!salaId || salaId.trim().length === 0) {
      return { exito: false, error: 'salaId es requerido' };
    }
    if (!pregunta || pregunta.trim().length === 0) {
      return { exito: false, error: 'La pregunta es requerida' };
    }
    if (pregunta.length > 200) {
      return {
        exito: false,
        error: 'La pregunta no puede exceder 200 caracteres',
      };
    }
    if (!opciones || opciones.length < 2) {
      return { exito: false, error: 'Se requieren al menos 2 opciones' };
    }
    if (opciones.length > 6) {
      return { exito: false, error: 'No se permiten más de 6 opciones' };
    }

    // Solo docentes pueden crear pulsos
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede crear pulsos' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Crear el pulso
    const result = this.pulsoService.crearPulso(
      salaId,
      client.data.userId,
      pregunta,
      opciones,
    );

    if (!result.exito) {
      return { exito: false, error: result.error };
    }

    // Broadcast a toda la sala
    this.server.to(salaId).emit('pulso-creado', result.pulso);

    this.logger.log(`Pulso creado en sala ${salaId} por ${client.data.nombre}`);

    return { exito: true, pulsoId: result.pulso!.id };
  }

  /**
   * Permite a un estudiante responder a un pulso activo
   * Solo usuarios con rol ESTUDIANTE pueden usar este evento
   *
   * Evento emitido: pulso-actualizado (broadcast a toda la sala)
   */
  @SubscribeMessage('responder-pulso')
  handleResponderPulso(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ResponderPulsoDto,
  ): { exito: boolean; error?: string } {
    const { salaId, pulsoId, opcionIndex } = payload;

    // Validación manual para evitar timeout por ValidationPipe silencioso
    // (ver: https://github.com/nestjs/nest/issues/5267)
    if (!salaId || typeof salaId !== 'string' || salaId.trim().length === 0) {
      return { exito: false, error: 'salaId es requerido' };
    }
    if (
      !pulsoId ||
      typeof pulsoId !== 'string' ||
      pulsoId.trim().length === 0
    ) {
      return { exito: false, error: 'pulsoId es requerido' };
    }
    if (typeof opcionIndex !== 'number' || !Number.isInteger(opcionIndex)) {
      return { exito: false, error: 'opcionIndex debe ser un número entero' };
    }
    if (opcionIndex < 0) {
      return { exito: false, error: 'opcionIndex debe ser >= 0' };
    }

    // Solo estudiantes pueden responder
    if (client.data.rol !== 'ESTUDIANTE') {
      return {
        exito: false,
        error: 'Solo estudiantes pueden responder pulsos',
      };
    }

    // Verificar que el estudiante está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Responder al pulso
    const result = this.pulsoService.responderPulso(
      salaId,
      pulsoId,
      client.data.userId,
      opcionIndex,
    );

    if (!result.exito) {
      return { exito: false, error: result.error };
    }

    // Broadcast estadísticas actualizadas a toda la sala
    this.server.to(salaId).emit('pulso-actualizado', result.stats);

    return { exito: true };
  }

  /**
   * Permite al docente cerrar un pulso activo
   * Solo el docente que creó el pulso puede cerrarlo
   *
   * Evento emitido: pulso-cerrado (broadcast a toda la sala)
   */
  @SubscribeMessage('cerrar-pulso')
  handleCerrarPulso(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CerrarPulsoDto,
  ): { exito: boolean; error?: string } {
    const { salaId, pulsoId } = payload;

    // Solo docentes pueden cerrar pulsos
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede cerrar pulsos' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Cerrar el pulso
    const result = this.pulsoService.cerrarPulso(
      salaId,
      pulsoId,
      client.data.userId,
    );

    if (!result.exito) {
      return { exito: false, error: result.error };
    }

    // Broadcast resultados finales a toda la sala
    this.server.to(salaId).emit('pulso-cerrado', result.resultadosFinales);

    this.logger.log(
      `Pulso cerrado en sala ${salaId} por ${client.data.nombre}`,
    );

    return { exito: true };
  }

  // ============================================================================
  // HANDLERS: SELECTOR ALEATORIO
  // ============================================================================

  /**
   * Permite al docente seleccionar un estudiante aleatorio
   * Selección justa: evita repetir hasta que todos hayan sido seleccionados
   *
   * Evento emitido: estudiante-seleccionado (broadcast a toda la sala)
   */
  @SubscribeMessage('seleccionar-aleatorio')
  handleSeleccionarAleatorio(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SeleccionarAleatorioDto,
  ): {
    exito: boolean;
    error?: string;
    estudiante?: {
      odooId: string;
      nombre: string;
      timestamp: string;
      restantes: number;
      rondaCompletada: boolean;
    };
  } {
    const { salaId } = payload;

    // Solo docentes pueden usar el selector
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo el docente puede usar el selector' };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Obtener estudiantes conectados (excluir docentes)
    const participantes = this.presenciaService.getParticipantesDeSala(salaId);
    const estudiantes = participantes
      .filter((p: Participante) => p.rol === 'ESTUDIANTE')
      .map((p: Participante) => ({
        odooId: p.odidentidadUsuario,
        nombre: p.nombre,
      }));

    // Seleccionar aleatorio
    const result = this.selectorService.seleccionarAleatorio(
      salaId,
      estudiantes,
    );

    if (!result.exito) {
      return { exito: false, error: result.error };
    }

    // Broadcast a toda la sala
    this.server.to(salaId).emit('estudiante-seleccionado', {
      odooId: result.seleccionado?.odooId,
      nombre: result.seleccionado?.nombre,
      timestamp: result.seleccionado?.timestamp,
      restantes: result.restantes,
      rondaCompletada: result.rondaCompletada,
    });

    this.logger.log(
      `Estudiante seleccionado en sala ${salaId}: ${result.seleccionado?.nombre}`,
    );

    return {
      exito: true,
      estudiante: {
        odooId: result.seleccionado!.odooId,
        nombre: result.seleccionado!.nombre,
        timestamp: result.seleccionado!.timestamp,
        restantes: result.restantes!,
        rondaCompletada: result.rondaCompletada!,
      },
    };
  }

  /**
   * Permite al docente resetear el selector (nueva ronda)
   *
   * Evento emitido: selector-reseteado (broadcast a toda la sala)
   */
  @SubscribeMessage('resetear-selector')
  handleResetearSelector(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ResetearSelectorDto,
  ): { exito: boolean; ronda?: number; error?: string } {
    const { salaId } = payload;

    // Solo docentes pueden resetear
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede resetear el selector',
      };
    }

    // Verificar que el docente está en la sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Resetear selector
    const result = this.selectorService.resetearSelector(salaId);

    if (!result.exito) {
      return { exito: false, error: result.error };
    }

    // Broadcast a toda la sala
    this.server.to(salaId).emit('selector-reseteado', {
      ronda: result.ronda,
    });

    this.logger.log(
      `Selector reseteado en sala ${salaId}, ronda ${result.ronda}`,
    );

    return { exito: true, ronda: result.ronda! };
  }

  // ============================================================================
  // HANDLERS: QUIZ EN VIVO (ESTILO KAHOOT)
  // ============================================================================

  /**
   * Valida los datos de un quiz (validación manual por bug ValidationPipe)
   * @returns null si es válido, o mensaje de error
   */
  private validarDatosQuiz(payload: CrearQuizDto): string | null {
    if (!payload.pregunta || payload.pregunta.length > 500) {
      return 'Pregunta inválida (máx 500 caracteres)';
    }
    if (
      !payload.opciones ||
      payload.opciones.length < 2 ||
      payload.opciones.length > 6
    ) {
      return 'Debe haber 2-6 opciones';
    }
    if (
      payload.respuestaCorrecta === undefined ||
      payload.respuestaCorrecta < 0 ||
      payload.respuestaCorrecta >= payload.opciones.length
    ) {
      return 'Respuesta correcta inválida';
    }
    const tiempoSeg = payload.tiempoSeg ?? 20;
    if (tiempoSeg < 5 || tiempoSeg > 120) {
      return 'Tiempo debe ser 5-120 segundos';
    }
    return null;
  }

  /**
   * Permite al docente crear un quiz en vivo
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: quiz:nuevo (broadcast a toda la sala, sin respuesta correcta)
   */
  @SubscribeMessage('quiz:crear')
  handleCrearQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CrearQuizDto,
  ): { exito: boolean; quiz?: QuizPublico; error?: string } {
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo docentes pueden crear quiz' };
    }

    const salaId = payload.salaId;
    if (!salaId) {
      return { exito: false, error: 'salaId es requerido' };
    }

    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    const errorValidacion = this.validarDatosQuiz(payload);
    if (errorValidacion) {
      return { exito: false, error: errorValidacion };
    }

    try {
      const tiempoSeg = payload.tiempoSeg ?? 20;
      const quiz = this.quizService.crearQuiz(salaId, {
        ...payload,
        tiempoSeg,
      });

      const quizPublico: QuizPublico = {
        id: quiz.id,
        pregunta: quiz.pregunta,
        opciones: quiz.opciones,
        tiempoSeg: quiz.tiempoSeg,
        timestampInicio: quiz.timestampInicio.toISOString(),
      };

      this.server.to(salaId).emit('quiz:nuevo', quizPublico);
      this.logger.log(
        `Quiz creado en sala ${salaId} por ${client.data.nombre}`,
      );

      return { exito: true, quiz: quizPublico };
    } catch (error) {
      return {
        exito: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Permite a un estudiante responder a un quiz activo
   * Solo usuarios con rol ESTUDIANTE pueden usar este evento
   * Puntos basados en velocidad de respuesta (estilo Kahoot)
   *
   * Evento emitido: quiz:respuesta-recibida (broadcast contador de respuestas)
   */
  @SubscribeMessage('quiz:responder')
  handleResponderQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ResponderQuizDto,
  ): { exito: boolean; puntosObtenidos?: number; error?: string } {
    // 1. Solo estudiantes pueden responder
    if (client.data.rol !== 'ESTUDIANTE') {
      return { exito: false, error: 'Solo estudiantes pueden responder' };
    }

    // 2. Obtener salaId
    const salaId = payload.salaId;
    if (!salaId) {
      return { exito: false, error: 'salaId es requerido' };
    }

    // 3. Verificar presencia en sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // 4. Validaciones
    if (!payload.quizId) {
      return { exito: false, error: 'quizId es requerido' };
    }
    if (payload.opcionIndex === undefined || payload.opcionIndex < 0) {
      return { exito: false, error: 'opcionIndex inválido' };
    }

    // 5. Registrar respuesta
    const resultado = this.quizService.responderQuiz(
      salaId,
      payload.quizId,
      client.data.userId,
      payload.opcionIndex,
    );

    if (resultado.exito) {
      // Notificar contador de respuestas (sin revelar respuestas individuales)
      const quizActivo = this.quizService.getQuizActivo(salaId);
      this.server.to(salaId).emit('quiz:respuesta-recibida', {
        quizId: payload.quizId,
        totalRespuestas: quizActivo?.respuestas.size ?? 0,
      });
    }

    return resultado;
  }

  /**
   * Permite al docente cerrar un quiz y ver resultados
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: quiz:resultado (broadcast con ranking y distribución)
   */
  @SubscribeMessage('quiz:cerrar')
  handleCerrarQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CerrarQuizDto,
  ): { exito: boolean; resultado?: QuizResultado; error?: string } {
    // 1. Solo docentes pueden cerrar quiz
    if (client.data.rol !== 'DOCENTE') {
      return { exito: false, error: 'Solo docentes pueden cerrar quiz' };
    }

    // 2. Validar payload
    if (!payload.salaId || !payload.quizId) {
      return { exito: false, error: 'salaId y quizId son requeridos' };
    }

    // 3. Verificar presencia en sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(payload.salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    try {
      const resultado = this.quizService.cerrarQuiz(
        payload.salaId,
        payload.quizId,
      );

      // Broadcast resultados completos a toda la sala
      this.server.to(payload.salaId).emit('quiz:resultado', resultado);

      this.logger.log(
        `Quiz cerrado en sala ${payload.salaId} por ${client.data.nombre}`,
      );

      return { exito: true, resultado };
    } catch (error) {
      return {
        exito: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // ============================================================================
  // HANDLERS: CONTADOR COMPARTIDO
  // ============================================================================

  /**
   * Permite al docente iniciar un contador compartido
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: contador-iniciado (broadcast a toda la sala)
   */
  @SubscribeMessage('iniciar-contador')
  handleIniciarContador(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: IniciarContadorDto,
  ): { exito: boolean; error?: string } {
    // Solo docentes pueden iniciar contadores
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede iniciar contadores',
      };
    }

    const salaId = payload.salaId;
    if (!salaId) {
      return { exito: false, error: 'salaId es requerido' };
    }

    // Verificar presencia en sala
    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    // Validar segundos
    const segundos = payload.segundos;
    if (!segundos || segundos < 1 || segundos > 3600) {
      return { exito: false, error: 'Segundos debe ser entre 1 y 3600' };
    }

    // Iniciar contador con callback para broadcast de terminación
    const contador = this.contadorService.iniciar(
      salaId,
      segundos,
      payload.mensaje,
      () => {
        this.server.to(salaId).emit('contador-terminado', {});
        this.logger.log(`Contador terminado en sala ${salaId}`);
      },
    );

    if (!contador) {
      return { exito: false, error: 'Ya hay un contador activo en esta sala' };
    }

    // Broadcast a toda la sala
    const contadorPayload: ContadorIniciadoPayload = {
      segundos: contador.segundosTotal,
      mensaje: contador.mensaje,
      timestampInicio: contador.timestampInicio.toISOString(),
    };
    this.server.to(salaId).emit('contador-iniciado', contadorPayload);

    this.logger.log(
      `Contador iniciado en sala ${salaId}: ${segundos}s por ${client.data.nombre}`,
    );

    return { exito: true };
  }

  /**
   * Permite al docente pausar el contador
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: contador-pausado (broadcast a toda la sala)
   */
  @SubscribeMessage('pausar-contador')
  handlePausarContador(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PausarContadorDto,
  ): { exito: boolean; segundosRestantes?: number; error?: string } {
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede pausar el contador',
      };
    }

    const salaId = payload.salaId;
    if (!salaId) {
      return { exito: false, error: 'salaId es requerido' };
    }

    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    const segundosRestantes = this.contadorService.pausar(salaId);

    if (segundosRestantes === null) {
      return {
        exito: false,
        error: 'No hay contador activo o ya está pausado',
      };
    }

    // Broadcast a toda la sala
    this.server.to(salaId).emit('contador-pausado', { segundosRestantes });

    this.logger.log(
      `Contador pausado en sala ${salaId}: ${segundosRestantes}s restantes`,
    );

    return { exito: true, segundosRestantes };
  }

  /**
   * Permite al docente reanudar el contador pausado
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: contador-reanudado (broadcast a toda la sala)
   */
  @SubscribeMessage('reanudar-contador')
  handleReanudarContador(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ReanudarContadorDto,
  ): { exito: boolean; error?: string } {
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede reanudar el contador',
      };
    }

    const salaId = payload.salaId;
    if (!salaId) {
      return { exito: false, error: 'salaId es requerido' };
    }

    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    const reanudado = this.contadorService.reanudar(salaId);

    if (!reanudado) {
      return { exito: false, error: 'No hay contador pausado para reanudar' };
    }

    const contador = this.contadorService.getContador(salaId);
    const segundosRestantes = this.contadorService.getSegundosRestantes(salaId);

    // Broadcast a toda la sala
    this.server.to(salaId).emit('contador-reanudado', {
      segundosRestantes,
      timestampReanudacion: contador?.timestampInicio.toISOString(),
    });

    this.logger.log(
      `Contador reanudado en sala ${salaId}: ${segundosRestantes}s restantes`,
    );

    return { exito: true };
  }

  /**
   * Permite al docente cancelar el contador
   * Solo usuarios con rol DOCENTE pueden usar este evento
   *
   * Evento emitido: contador-cancelado (broadcast a toda la sala)
   */
  @SubscribeMessage('cancelar-contador')
  handleCancelarContador(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CancelarContadorDto,
  ): { exito: boolean; error?: string } {
    if (client.data.rol !== 'DOCENTE') {
      return {
        exito: false,
        error: 'Solo el docente puede cancelar el contador',
      };
    }

    const salaId = payload.salaId;
    if (!salaId) {
      return { exito: false, error: 'salaId es requerido' };
    }

    const salasDelUsuario = this.presenciaService.getSalasDeSocket(client.id);
    if (!salasDelUsuario.includes(salaId)) {
      return { exito: false, error: 'No estás en esta sala' };
    }

    const cancelado = this.contadorService.cancelar(salaId);

    if (!cancelado) {
      return { exito: false, error: 'No hay contador activo para cancelar' };
    }

    // Broadcast a toda la sala
    this.server.to(salaId).emit('contador-cancelado', {});

    this.logger.log(`Contador cancelado en sala ${salaId}`);

    return { exito: true };
  }
}
