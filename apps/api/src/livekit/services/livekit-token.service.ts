import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { PrismaService } from '../../core/database/prisma.service';

interface TokenRequest {
  claseGrupoId?: string;
  comisionId?: string;
}

interface TokenResponse {
  token: string;
  wsUrl: string;
  roomName: string;
}

@Injectable()
export class LivekitTokenService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly wsUrl: string;
  private readonly roomService: RoomServiceClient;
  private readonly logger = new Logger(LivekitTokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const wsUrl = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !wsUrl) {
      throw new Error(
        'LiveKit configuration missing. Required env vars: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL',
      );
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.wsUrl = wsUrl;

    // RoomServiceClient para controlar participantes (dar/quitar palabra)
    // Convertir wss:// a https:// para la API HTTP de LiveKit
    const httpUrl = wsUrl
      .replace('wss://', 'https://')
      .replace('ws://', 'http://');
    this.roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
  }

  async generarTokenDocente(
    docenteId: string,
    request: TokenRequest,
  ): Promise<TokenResponse> {
    this.validarRequest(request);

    const { roomName, roomType } = this.getRoomInfo(request);

    if (roomType === 'claseGrupo') {
      await this.validarDocenteClaseGrupo(docenteId, request.claseGrupoId!);
    } else {
      await this.validarDocenteComision(docenteId, request.comisionId!);
    }

    // Obtener nombre del docente
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      select: { nombre: true, apellido: true },
    });
    const nombreDocente = docente
      ? `${docente.nombre} ${docente.apellido}`.trim()
      : 'Docente';

    const token = await this.generarToken(
      docenteId,
      roomName,
      true,
      true,
      nombreDocente,
    );

    return {
      token,
      wsUrl: this.wsUrl,
      roomName,
    };
  }

  async generarTokenEstudiante(
    estudianteId: string,
    request: TokenRequest,
  ): Promise<TokenResponse> {
    this.validarRequest(request);

    const { roomName, roomType } = this.getRoomInfo(request);

    if (roomType === 'claseGrupo') {
      await this.validarEstudianteClaseGrupo(
        estudianteId,
        request.claseGrupoId!,
      );
    } else {
      await this.validarEstudianteComision(estudianteId, request.comisionId!);
    }

    // Obtener nombre del estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { nombre: true, apellido: true },
    });
    const nombreEstudiante = estudiante
      ? `${estudiante.nombre} ${estudiante.apellido}`.trim()
      : 'Estudiante';

    const token = await this.generarToken(
      estudianteId,
      roomName,
      false,
      false,
      nombreEstudiante,
    );

    return {
      token,
      wsUrl: this.wsUrl,
      roomName,
    };
  }

  private validarRequest(request: TokenRequest): void {
    const hasClaseGrupo = !!request.claseGrupoId;
    const hasComision = !!request.comisionId;

    if (hasClaseGrupo && hasComision) {
      throw new BadRequestException(
        'Debe proporcionar claseGrupoId o comisionId, no ambos',
      );
    }

    if (!hasClaseGrupo && !hasComision) {
      throw new BadRequestException(
        'Debe proporcionar claseGrupoId o comisionId',
      );
    }
  }

  private getRoomInfo(request: TokenRequest): {
    roomName: string;
    roomType: 'claseGrupo' | 'comision';
  } {
    if (request.claseGrupoId) {
      return {
        roomName: `clase-grupo-${request.claseGrupoId}`,
        roomType: 'claseGrupo',
      };
    }
    return {
      roomName: `comision-${request.comisionId}`,
      roomType: 'comision',
    };
  }

  private async validarDocenteClaseGrupo(
    docenteId: string,
    claseGrupoId: string,
  ): Promise<void> {
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      select: { docente_id: true },
    });

    if (!claseGrupo || claseGrupo.docente_id !== docenteId) {
      throw new ForbiddenException('No tienes permisos para esta clase');
    }
  }

  private async validarDocenteComision(
    docenteId: string,
    comisionId: string,
  ): Promise<void> {
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      select: { docente_id: true },
    });

    if (!comision || comision.docente_id !== docenteId) {
      throw new ForbiddenException('No tienes permisos para esta comisión');
    }
  }

  private async validarEstudianteClaseGrupo(
    estudianteId: string,
    claseGrupoId: string,
  ): Promise<void> {
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      select: { id: true },
    });

    if (!claseGrupo) {
      throw new ForbiddenException('Clase no encontrada');
    }

    const inscripcion = await this.prisma.inscripcionClaseGrupo.findFirst({
      where: {
        clase_grupo_id: claseGrupoId,
        estudiante_id: estudianteId,
        fecha_baja: null, // Inscripción activa = sin fecha de baja
      },
    });

    if (!inscripcion) {
      throw new ForbiddenException('No estás inscrito en esta clase');
    }
  }

  private async validarEstudianteComision(
    estudianteId: string,
    comisionId: string,
  ): Promise<void> {
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      select: { id: true },
    });

    if (!comision) {
      throw new ForbiddenException('Comisión no encontrada');
    }

    const inscripcion = await this.prisma.inscripcionComision.findFirst({
      where: {
        comision_id: comisionId,
        estudiante_id: estudianteId,
        estado: 'Confirmada',
      },
    });

    if (!inscripcion) {
      throw new ForbiddenException(
        'No tienes inscripción activa en esta comisión',
      );
    }
  }

  private async generarToken(
    identity: string,
    roomName: string,
    canPublish: boolean,
    isDocente: boolean = false,
    name?: string,
  ): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      name: name || identity, // Nombre visible en la sala
      ttl: '4h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
      canPublishData: true, // Permite enviar mensajes de chat via DataChannel
      roomAdmin: isDocente, // Docente puede controlar participantes
    });

    return await token.toJwt();
  }

  // ============================================================================
  // CONTROL DE PARTICIPANTES (DAR/QUITAR PALABRA)
  // ============================================================================

  /**
   * Dar palabra a un estudiante (habilitar su micrófono)
   * @param roomName - Nombre de la sala LiveKit
   * @param participantIdentity - Identity del participante (estudianteId)
   */
  async darPalabra(
    roomName: string,
    participantIdentity: string,
  ): Promise<void> {
    this.logger.log(
      `darPalabra: roomName=${roomName}, participantIdentity=${participantIdentity}`,
    );

    // Primero verificar que el participante existe en la sala
    const participants = await this.roomService.listParticipants(roomName);
    const participantExists = participants.some(
      (p) => p.identity === participantIdentity,
    );

    this.logger.log(
      `Participantes en sala: ${participants.map((p) => p.identity).join(', ')}`,
    );

    if (!participantExists) {
      throw new Error(
        `Participante ${participantIdentity} no encontrado en sala ${roomName}`,
      );
    }

    const result = await this.roomService.updateParticipant(
      roomName,
      participantIdentity,
      {
        permission: {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        },
      },
    );

    this.logger.log(`darPalabra result: ${JSON.stringify(result)}`);
  }

  /**
   * Quitar palabra a un estudiante (deshabilitar su micrófono)
   * @param roomName - Nombre de la sala LiveKit
   * @param participantIdentity - Identity del participante (estudianteId)
   */
  async quitarPalabra(
    roomName: string,
    participantIdentity: string,
  ): Promise<void> {
    this.logger.log(
      `quitarPalabra: roomName=${roomName}, participantIdentity=${participantIdentity}`,
    );

    const result = await this.roomService.updateParticipant(
      roomName,
      participantIdentity,
      {
        permission: {
          canPublish: false,
          canSubscribe: true,
          canPublishData: true,
        },
      },
    );

    this.logger.log(`quitarPalabra result: ${JSON.stringify(result)}`);
  }

  /**
   * Obtener lista de participantes de una sala
   * @param roomName - Nombre de la sala LiveKit
   */
  async getParticipantes(roomName: string) {
    return this.roomService.listParticipants(roomName);
  }

  /**
   * Dar palabra a TODOS los participantes de una sala (excepto el docente)
   * @param roomName - Nombre de la sala LiveKit
   * @param docenteIdentity - Identity del docente (para excluirlo)
   */
  async darPalabraTodos(
    roomName: string,
    docenteIdentity: string,
  ): Promise<{ exitosos: number; fallidos: number }> {
    this.logger.log(
      `darPalabraTodos: roomName=${roomName}, docenteIdentity=${docenteIdentity}`,
    );

    const participants = await this.roomService.listParticipants(roomName);
    const estudiantes = participants.filter(
      (p) => p.identity !== docenteIdentity,
    );

    this.logger.log(
      `Estudiantes a habilitar: ${estudiantes.map((p) => p.identity).join(', ')}`,
    );

    let exitosos = 0;
    let fallidos = 0;

    for (const estudiante of estudiantes) {
      try {
        await this.roomService.updateParticipant(
          roomName,
          estudiante.identity,
          {
            permission: {
              canPublish: true,
              canSubscribe: true,
              canPublishData: true,
            },
          },
        );
        exitosos++;
      } catch (error) {
        this.logger.error(
          `Error habilitando ${estudiante.identity}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
        fallidos++;
      }
    }

    this.logger.log(
      `darPalabraTodos completado: ${exitosos} exitosos, ${fallidos} fallidos`,
    );

    return { exitosos, fallidos };
  }

  /**
   * Quitar palabra a TODOS los participantes de una sala (excepto el docente)
   * @param roomName - Nombre de la sala LiveKit
   * @param docenteIdentity - Identity del docente (para excluirlo)
   */
  async quitarPalabraTodos(
    roomName: string,
    docenteIdentity: string,
  ): Promise<{ exitosos: number; fallidos: number }> {
    this.logger.log(
      `quitarPalabraTodos: roomName=${roomName}, docenteIdentity=${docenteIdentity}`,
    );

    const participants = await this.roomService.listParticipants(roomName);
    const estudiantes = participants.filter(
      (p) => p.identity !== docenteIdentity,
    );

    let exitosos = 0;
    let fallidos = 0;

    for (const estudiante of estudiantes) {
      try {
        await this.roomService.updateParticipant(
          roomName,
          estudiante.identity,
          {
            permission: {
              canPublish: false,
              canSubscribe: true,
              canPublishData: true,
            },
          },
        );
        exitosos++;
      } catch (error) {
        this.logger.error(
          `Error deshabilitando ${estudiante.identity}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
        fallidos++;
      }
    }

    this.logger.log(
      `quitarPalabraTodos completado: ${exitosos} exitosos, ${fallidos} fallidos`,
    );

    return { exitosos, fallidos };
  }

  /**
   * Construir nombre de sala a partir de IDs
   */
  buildRoomName(request: TokenRequest): string {
    return this.getRoomInfo(request).roomName;
  }
}
