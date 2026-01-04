import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
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

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.wsUrl = this.configService.get<string>('LIVEKIT_URL') || '';
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

    const token = await this.generarToken(docenteId, roomName, true);

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

    const token = await this.generarToken(estudianteId, roomName, false);

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
  ): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      ttl: '4h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
    });

    return await token.toJwt();
  }
}
