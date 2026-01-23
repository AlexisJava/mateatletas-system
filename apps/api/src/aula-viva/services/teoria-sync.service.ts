import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NodoService, NodoArbol } from '../../contenidos/services/nodo.service';
import { EstadoContenido } from '@prisma/client';
import {
  NodoTeoriaPublico,
  TeoriaIniciadaPayload,
  SlideCambiadoPayload,
  ScrollSincronizadoPayload,
} from '../dto/teoria-sync.dto';

/**
 * Estado interno de teoría compartida en una sala
 */
interface TeoriaState {
  salaId: string;
  contenidoId: string;
  titulo: string;
  nodos: NodoTeoriaPublico[];
  nodoActualId: string | null;
  scrollPosition: number;
  docenteId: string;
  docenteNombre: string;
  timestampInicio: Date;
}

/**
 * Resultado de operaciones del servicio
 */
interface OperationResult<T = void> {
  exito: boolean;
  error?: string;
  result?: T;
}

/**
 * Service para gestionar la sincronización de teoría en tiempo real
 *
 * Permite que un docente comparta slides de contenido teórico con
 * los estudiantes de la sala. Los estudiantes ven el mismo slide
 * que el docente, sincronizado en tiempo real.
 *
 * Responsabilidades:
 * - Iniciar/cerrar sesión de teoría compartida
 * - Sincronizar cambio de slide
 * - Sincronizar posición de scroll (opcional, para contenido largo)
 *
 * El estado se mantiene en memoria (Map por salaId).
 * Se limpia cuando el docente cierra la teoría o la sala termina.
 */
@Injectable()
export class TeoriaSyncService {
  private readonly logger = new Logger(TeoriaSyncService.name);
  private teoriaPorSala: Map<string, TeoriaState> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodoService: NodoService,
  ) {}

  /**
   * Inicia una sesión de teoría compartida
   *
   * @param salaId - ID de la sala
   * @param contenidoId - ID del contenido de teoría
   * @param docenteId - ID del docente
   * @param docenteNombre - Nombre del docente para mostrar
   */
  async iniciarTeoria(
    salaId: string,
    contenidoId: string,
    docenteId: string,
    docenteNombre: string,
  ): Promise<OperationResult<TeoriaIniciadaPayload>> {
    // Verificar si ya hay teoría activa
    const existente = this.teoriaPorSala.get(salaId);
    if (existente) {
      return {
        exito: false,
        error: 'Ya hay una teoría activa en esta sala',
      };
    }

    // Obtener contenido y verificar que está publicado
    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
      select: {
        id: true,
        titulo: true,
        estado: true,
      },
    });

    if (!contenido) {
      return {
        exito: false,
        error: 'Contenido no encontrado',
      };
    }

    if (contenido.estado !== EstadoContenido.PUBLICADO) {
      return {
        exito: false,
        error: 'El contenido debe estar publicado para compartir',
      };
    }

    // Obtener árbol de nodos
    let arbol: NodoArbol[];
    try {
      arbol = await this.nodoService.getArbol(contenidoId);
    } catch {
      return {
        exito: false,
        error: 'Error al obtener nodos del contenido',
      };
    }

    // Aplanar árbol a lista de nodos públicos
    const nodosPublicos = this.aplanarArbol(arbol);

    if (nodosPublicos.length === 0) {
      return {
        exito: false,
        error: 'El contenido no tiene slides para compartir',
      };
    }

    // Crear estado
    const primerNodoId = nodosPublicos[0]?.id ?? null;
    const state: TeoriaState = {
      salaId,
      contenidoId,
      titulo: contenido.titulo,
      nodos: nodosPublicos,
      nodoActualId: primerNodoId,
      scrollPosition: 0,
      docenteId,
      docenteNombre,
      timestampInicio: new Date(),
    };

    this.teoriaPorSala.set(salaId, state);
    this.logger.log(
      `Teoría iniciada en sala ${salaId}: "${contenido.titulo}" (${nodosPublicos.length} slides)`,
    );

    const payload: TeoriaIniciadaPayload = {
      contenidoId: state.contenidoId,
      titulo: state.titulo,
      nodos: state.nodos,
      nodoActualId: state.nodoActualId,
      docenteNombre: state.docenteNombre,
      timestamp: new Date().toISOString(),
    };

    return { exito: true, result: payload };
  }

  /**
   * Cambia el slide actual (navegación del docente)
   *
   * @param salaId - ID de la sala
   * @param nodoId - ID del nuevo nodo/slide
   */
  cambiarSlide(
    salaId: string,
    nodoId: string,
  ): OperationResult<SlideCambiadoPayload> {
    const state = this.teoriaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay teoría activa en esta sala',
      };
    }

    // Verificar que el nodo existe en el contenido
    const nodoExiste = state.nodos.some((n) => n.id === nodoId);
    if (!nodoExiste) {
      return {
        exito: false,
        error: 'Slide no encontrado en el contenido actual',
      };
    }

    state.nodoActualId = nodoId;
    state.scrollPosition = 0; // Reset scroll al cambiar slide

    this.logger.debug(`Slide cambiado en sala ${salaId}: ${nodoId}`);

    const payload: SlideCambiadoPayload = {
      nodoId,
      timestamp: new Date().toISOString(),
    };

    return { exito: true, result: payload };
  }

  /**
   * Actualiza la posición de scroll (para contenido largo)
   *
   * @param salaId - ID de la sala
   * @param scrollPosition - Posición de scroll (0-100)
   */
  actualizarScroll(
    salaId: string,
    scrollPosition: number,
  ): OperationResult<ScrollSincronizadoPayload> {
    const state = this.teoriaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay teoría activa en esta sala',
      };
    }

    // Validar rango
    const normalizedScroll = Math.max(0, Math.min(100, scrollPosition));
    state.scrollPosition = normalizedScroll;

    const payload: ScrollSincronizadoPayload = {
      scrollPosition: normalizedScroll,
      timestamp: new Date().toISOString(),
    };

    return { exito: true, result: payload };
  }

  /**
   * Cierra la sesión de teoría compartida
   *
   * @param salaId - ID de la sala
   */
  cerrarTeoria(salaId: string): OperationResult {
    const state = this.teoriaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay teoría activa en esta sala',
      };
    }

    this.teoriaPorSala.delete(salaId);
    this.logger.log(`Teoría cerrada en sala ${salaId}`);

    return { exito: true };
  }

  /**
   * Obtiene el estado actual de teoría de una sala
   */
  getTeoriaActiva(salaId: string): TeoriaState | undefined {
    return this.teoriaPorSala.get(salaId);
  }

  /**
   * Limpia el estado de una sala (llamar cuando termina la clase)
   */
  limpiarSala(salaId: string): void {
    this.teoriaPorSala.delete(salaId);
    this.logger.debug(`Estado de teoría limpiado para sala ${salaId}`);
  }

  /**
   * Limpia TODO el estado (solo para tests)
   */
  clearAll(): void {
    this.teoriaPorSala.clear();
    this.logger.debug('Todo el estado de teoría limpiado');
  }

  /**
   * Aplana el árbol de nodos a una lista plana ordenada
   * Solo incluye nodos hoja (con contenidoJson)
   */
  private aplanarArbol(arbol: NodoArbol[], orden = 0): NodoTeoriaPublico[] {
    const resultado: NodoTeoriaPublico[] = [];

    for (const nodo of arbol) {
      // Si tiene hijos, procesar recursivamente
      if (nodo.hijos && nodo.hijos.length > 0) {
        resultado.push(
          ...this.aplanarArbol(nodo.hijos, orden + resultado.length),
        );
      } else if (nodo.contenidoJson) {
        // Solo incluir nodos hoja con contenido
        let contenidoParsed: Record<string, unknown> = {};
        try {
          contenidoParsed = JSON.parse(nodo.contenidoJson) as Record<
            string,
            unknown
          >;
        } catch {
          // Si no se puede parsear, usar objeto vacío
          this.logger.warn(`Error parseando contenidoJson del nodo ${nodo.id}`);
        }

        resultado.push({
          id: nodo.id,
          tipo: (contenidoParsed.tipo as string) ?? 'slide',
          titulo: nodo.titulo,
          contenidoJson: contenidoParsed,
          orden: orden + resultado.length,
        });
      }
    }

    return resultado;
  }
}
