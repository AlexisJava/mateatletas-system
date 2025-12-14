import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  OnboardingEstado,
  NivelInterno,
  CasaTipo,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { TiersService } from '../tiers/tiers.service';
import { CasasService } from '../casas/casas.service';

/**
 * Configuración de avatar del estudiante
 */
export interface AvatarConfig {
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  accessories: string[];
}

/**
 * Resultado de registrar un test de ubicación
 */
export interface ResultadoTestUbicacion {
  id: string;
  estudiante_id: string;
  mundo_id: string;
  nivel_asignado: NivelInterno;
  puntaje: number;
  bajo_de_casa: boolean;
  casa_original_id: string | null;
  casa_asignada_id: string | null;
}

/**
 * Progreso del onboarding
 */
export interface ProgresoOnboarding {
  estado_actual: OnboardingEstado;
  mundos_seleccionados: string[];
  tests_completados: number;
  tests_pendientes: number;
  casa_asignada: string | null;
  avatar_configurado: boolean;
  porcentaje_completado: number;
}

/**
 * Servicio para gestionar el flujo de Onboarding de estudiantes 2026
 *
 * Flujo:
 * 1. PENDIENTE -> SELECCION_MUNDOS (iniciar)
 * 2. SELECCION_MUNDOS -> TEST_UBICACION (seleccionar mundos)
 * 3. TEST_UBICACION -> CONFIRMACION_CASA (completar tests)
 * 4. CONFIRMACION_CASA -> CREACION_AVATAR (confirmar casa)
 * 5. CREACION_AVATAR -> COMPLETADO (guardar avatar)
 */
@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiersService: TiersService,
    private readonly casasService: CasasService,
  ) {}

  /**
   * Obtiene el estado actual del onboarding de un estudiante
   *
   * @param estudianteId - ID del estudiante
   * @throws NotFoundException si no existe inscripción 2026
   */
  async getEstadoOnboarding(estudianteId: string): Promise<OnboardingEstado> {
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción 2026 no encontrada para estudiante ${estudianteId}`,
      );
    }

    return inscripcion.onboarding_estado;
  }

  /**
   * Inicia el proceso de onboarding (PENDIENTE -> SELECCION_MUNDOS)
   *
   * @param estudianteId - ID del estudiante
   * @throws NotFoundException si no existe inscripción 2026
   * @throws BadRequestException si ya inició el onboarding
   */
  async iniciarOnboarding(estudianteId: string): Promise<OnboardingEstado> {
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción 2026 no encontrada para estudiante ${estudianteId}`,
      );
    }

    if (inscripcion.onboarding_estado !== OnboardingEstado.PENDIENTE) {
      throw new BadRequestException('El onboarding ya fue iniciado');
    }

    await this.prisma.estudianteInscripcion2026.update({
      where: { id: inscripcion.id },
      data: { onboarding_estado: OnboardingEstado.SELECCION_MUNDOS },
    });

    return OnboardingEstado.SELECCION_MUNDOS;
  }

  /**
   * Registra la selección de mundos del estudiante
   *
   * @param estudianteId - ID del estudiante
   * @param mundosAsync - IDs de mundos async seleccionados
   * @param mundosSync - IDs de mundos sync seleccionados (solo PRO)
   * @throws BadRequestException si la selección no cumple las reglas del tier
   */
  async seleccionarMundos(
    estudianteId: string,
    mundosAsync: string[],
    mundosSync: string[] = [],
  ): Promise<OnboardingEstado> {
    // Obtener inscripción con tier
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
      include: { tier: true },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción 2026 no encontrada para estudiante ${estudianteId}`,
      );
    }

    if (inscripcion.onboarding_estado !== OnboardingEstado.SELECCION_MUNDOS) {
      throw new BadRequestException(
        'No está en el estado correcto para seleccionar mundos',
      );
    }

    // Obtener tipos de mundos para validación
    const mundosAsyncData = await this.prisma.mundo.findMany({
      where: { id: { in: mundosAsync } },
    });
    const mundosSyncData = await this.prisma.mundo.findMany({
      where: { id: { in: mundosSync } },
    });

    const mundosAsyncTipos = mundosAsyncData.map((m) => m.tipo);
    const mundosSyncTipos = mundosSyncData.map((m) => m.tipo);

    // Validar según tier
    if (!inscripcion.tier) {
      throw new BadRequestException('El estudiante no tiene un tier asignado');
    }
    this.tiersService.validarSeleccionMundos(
      inscripcion.tier.nombre,
      mundosAsyncTipos,
      mundosSyncTipos,
    );

    // Guardar selección en inscripción
    const mundosSeleccionados = [...mundosAsync, ...mundosSync];
    await this.prisma.estudianteInscripcion2026.update({
      where: { id: inscripcion.id },
      data: {
        mundos_seleccionados: mundosSeleccionados,
        onboarding_estado: OnboardingEstado.TEST_UBICACION,
      },
    });

    return OnboardingEstado.TEST_UBICACION;
  }

  /**
   * Registra el resultado de un test de ubicación
   *
   * Asigna nivel según puntaje:
   * - 0-40: BASICO
   * - 41-70: INTERMEDIO
   * - 71-90: AVANZADO
   * - 91-100: OLIMPICO
   *
   * Puede bajar de casa si el puntaje es muy bajo (<30)
   *
   * @param estudianteId - ID del estudiante
   * @param mundoId - ID del mundo del test
   * @param puntaje - Puntaje obtenido (0-100)
   * @param preguntasTotal - Total de preguntas
   * @param respuestasCorrectas - Respuestas correctas
   */
  async registrarResultadoTest(
    estudianteId: string,
    mundoId: string,
    puntaje: number,
    preguntasTotal: number,
    respuestasCorrectas: number,
  ): Promise<ResultadoTestUbicacion> {
    // Obtener estudiante con casa actual
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: { casa: true },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante ${estudianteId} no encontrado`);
    }

    // Determinar nivel por puntaje
    const nivelAsignado = this.determinarNivelPorPuntaje(puntaje);

    // Verificar si debe bajar de casa (puntaje < 30)
    let bajoDeCasa = false;
    const casaOriginalId: string | null = estudiante.casaId;
    let casaAsignadaId: string | null = estudiante.casaId;

    if (puntaje < 30 && estudiante.casa) {
      // Determinar casa inferior
      const casaInferior = this.obtenerCasaInferior(estudiante.casa.tipo);
      if (
        casaInferior &&
        this.casasService.puedeDescender(estudiante.casa.tipo, casaInferior)
      ) {
        const nuevaCasa = await this.casasService.findByTipo(casaInferior);
        bajoDeCasa = true;
        casaAsignadaId = nuevaCasa.id;

        // Actualizar casa del estudiante
        await this.prisma.estudiante.update({
          where: { id: estudianteId },
          data: { casaId: nuevaCasa.id },
        });
      }
    }

    // Crear registro de resultado
    const resultado = await this.prisma.testUbicacionResultado.create({
      data: {
        estudiante_id: estudianteId,
        mundo_id: mundoId,
        preguntas_total: preguntasTotal,
        respuestas_correctas: respuestasCorrectas,
        puntaje,
        nivel_asignado: nivelAsignado,
        casa_original_id: casaOriginalId,
        casa_asignada_id: casaAsignadaId,
        bajo_de_casa: bajoDeCasa,
      },
    });

    // Crear o actualizar nivel del estudiante en ese mundo
    await this.prisma.estudianteMundoNivel.upsert({
      where: {
        estudiante_id_mundo_id: {
          estudiante_id: estudianteId,
          mundo_id: mundoId,
        },
      },
      create: {
        estudiante_id: estudianteId,
        mundo_id: mundoId,
        nivel_interno: nivelAsignado,
      },
      update: {
        nivel_interno: nivelAsignado,
      },
    });

    // Verificar si completó todos los tests y avanzar estado
    await this.verificarAvanceEstado(estudianteId);

    return {
      id: resultado.id,
      estudiante_id: resultado.estudiante_id,
      mundo_id: resultado.mundo_id,
      nivel_asignado: resultado.nivel_asignado,
      puntaje: resultado.puntaje,
      bajo_de_casa: resultado.bajo_de_casa,
      casa_original_id: resultado.casa_original_id,
      casa_asignada_id: resultado.casa_asignada_id,
    };
  }

  /**
   * Confirma la casa del estudiante y avanza al paso de avatar
   *
   * @param estudianteId - ID del estudiante
   */
  async confirmarCasa(estudianteId: string): Promise<OnboardingEstado> {
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción 2026 no encontrada para estudiante ${estudianteId}`,
      );
    }

    if (inscripcion.onboarding_estado !== OnboardingEstado.CONFIRMACION_CASA) {
      throw new BadRequestException(
        'No está en el estado correcto para confirmar casa',
      );
    }

    await this.prisma.estudianteInscripcion2026.update({
      where: { id: inscripcion.id },
      data: { onboarding_estado: OnboardingEstado.CREACION_AVATAR },
    });

    return OnboardingEstado.CREACION_AVATAR;
  }

  /**
   * Guarda la configuración del avatar y completa el onboarding
   *
   * @param estudianteId - ID del estudiante
   * @param avatarConfig - Configuración del avatar
   */
  async guardarAvatar(
    estudianteId: string,
    avatarConfig: AvatarConfig,
  ): Promise<OnboardingEstado> {
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción 2026 no encontrada para estudiante ${estudianteId}`,
      );
    }

    if (inscripcion.onboarding_estado !== OnboardingEstado.CREACION_AVATAR) {
      throw new BadRequestException(
        'No está en el estado correcto para guardar avatar',
      );
    }

    await this.prisma.estudianteInscripcion2026.update({
      where: { id: inscripcion.id },
      data: {
        avatar_config: avatarConfig as unknown as Prisma.InputJsonValue,
        onboarding_estado: OnboardingEstado.COMPLETADO,
        onboarding_completado_at: new Date(),
      },
    });

    return OnboardingEstado.COMPLETADO;
  }

  /**
   * Obtiene el progreso del onboarding
   *
   * @param estudianteId - ID del estudiante
   */
  async getProgresoOnboarding(
    estudianteId: string,
  ): Promise<ProgresoOnboarding> {
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción 2026 no encontrada para estudiante ${estudianteId}`,
      );
    }

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    // Obtener tests completados
    const testsCompletados = await this.prisma.testUbicacionResultado.count({
      where: { estudiante_id: estudianteId },
    });

    // Mundos seleccionados de la inscripción
    const mundosSeleccionados = inscripcion.mundos_seleccionados ?? [];
    const testsPendientes = Math.max(
      0,
      mundosSeleccionados.length - testsCompletados,
    );

    // Calcular porcentaje
    const estadosPorcentaje: Record<OnboardingEstado, number> = {
      [OnboardingEstado.PENDIENTE]: 0,
      [OnboardingEstado.SELECCION_MUNDOS]: 20,
      [OnboardingEstado.TEST_UBICACION]: 40,
      [OnboardingEstado.CONFIRMACION_CASA]: 60,
      [OnboardingEstado.CREACION_AVATAR]: 80,
      [OnboardingEstado.COMPLETADO]: 100,
    };

    return {
      estado_actual: inscripcion.onboarding_estado,
      mundos_seleccionados: mundosSeleccionados,
      tests_completados: testsCompletados,
      tests_pendientes: testsPendientes,
      casa_asignada: estudiante?.casaId ?? null,
      avatar_configurado: inscripcion.avatar_config !== null,
      porcentaje_completado: estadosPorcentaje[inscripcion.onboarding_estado],
    };
  }

  // =====================
  // MÉTODOS PRIVADOS
  // =====================

  /**
   * Determina el nivel interno según el puntaje del test
   */
  private determinarNivelPorPuntaje(puntaje: number): NivelInterno {
    if (puntaje >= 91) return NivelInterno.OLIMPICO;
    if (puntaje >= 71) return NivelInterno.AVANZADO;
    if (puntaje >= 41) return NivelInterno.INTERMEDIO;
    return NivelInterno.BASICO;
  }

  /**
   * Obtiene la casa inferior para regla de descenso
   */
  private obtenerCasaInferior(casaActual: CasaTipo): CasaTipo | null {
    switch (casaActual) {
      case 'PULSAR':
        return 'VERTEX';
      case 'VERTEX':
        return 'QUANTUM';
      case 'QUANTUM':
        return null; // No hay casa inferior
      default:
        return null;
    }
  }

  /**
   * Verifica si el estudiante completó todos los tests y avanza el estado
   */
  private async verificarAvanceEstado(estudianteId: string): Promise<void> {
    const inscripcion = await this.prisma.estudianteInscripcion2026.findFirst({
      where: { estudiante_id: estudianteId },
    });

    if (
      !inscripcion ||
      inscripcion.onboarding_estado !== OnboardingEstado.TEST_UBICACION
    ) {
      return;
    }

    const mundosSeleccionados = inscripcion.mundos_seleccionados ?? [];
    const testsCompletados = await this.prisma.testUbicacionResultado.count({
      where: { estudiante_id: estudianteId },
    });

    // Si completó todos los tests, avanzar a confirmación de casa
    if (
      testsCompletados >= mundosSeleccionados.length &&
      mundosSeleccionados.length > 0
    ) {
      await this.prisma.estudianteInscripcion2026.update({
        where: { id: inscripcion.id },
        data: { onboarding_estado: OnboardingEstado.CONFIRMACION_CASA },
      });
    }
  }
}
