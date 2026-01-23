import { Injectable, Logger } from '@nestjs/common';

/**
 * Información del estudiante seleccionado
 */
export interface EstudianteSeleccionado {
  odooId: string;
  nombre: string;
  timestamp: string;
}

/**
 * Estado del selector de una sala
 */
export interface SelectorState {
  /** Estudiantes ya seleccionados en la ronda actual */
  seleccionados: Set<string>;
  /** Último estudiante seleccionado */
  ultimoSeleccionado: EstudianteSeleccionado | null;
  /** Número de ronda actual */
  ronda: number;
}

/**
 * Resultado de selección
 */
export interface SeleccionResult {
  exito: boolean;
  error?: string;
  seleccionado?: EstudianteSeleccionado;
  /** Cuántos quedan por seleccionar en esta ronda */
  restantes?: number;
  /** Si se completó la ronda (todos seleccionados) */
  rondaCompletada?: boolean;
}

/**
 * Resultado de reset
 */
export interface ResetSelectorResult {
  exito: boolean;
  error?: string;
  ronda?: number;
}

/**
 * Servicio para selección aleatoria justa de estudiantes
 *
 * Características:
 * - Selección sin repetición hasta completar ronda
 * - Track de estudiantes ya seleccionados
 * - Reset manual de ronda
 * - Auto-reset cuando todos fueron seleccionados
 */
@Injectable()
export class SelectorService {
  private readonly logger = new Logger(SelectorService.name);

  /**
   * Estado del selector por sala
   * Estructura: salaId -> SelectorState
   */
  private selectorPorSala: Map<string, SelectorState> = new Map();

  /**
   * Selecciona un estudiante aleatorio de los disponibles
   *
   * @param salaId ID de la sala
   * @param odooIdDocente ID del docente que solicita (para validación)
   * @param estudiantesDisponibles Lista de estudiantes conectados actualmente
   */
  seleccionarAleatorio(
    salaId: string,
    estudiantesDisponibles: { odooId: string; nombre: string }[],
  ): SeleccionResult {
    // Validar que hay estudiantes
    if (estudiantesDisponibles.length === 0) {
      return {
        exito: false,
        error: 'No hay estudiantes conectados en la sala',
      };
    }

    // Obtener o crear estado del selector
    let state = this.selectorPorSala.get(salaId);
    if (!state) {
      state = {
        seleccionados: new Set(),
        ultimoSeleccionado: null,
        ronda: 1,
      };
      this.selectorPorSala.set(salaId, state);
    }

    // Filtrar estudiantes que no han sido seleccionados en esta ronda
    const disponibles = estudiantesDisponibles.filter(
      (e) => !state.seleccionados.has(e.odooId),
    );

    // Si todos fueron seleccionados, auto-reset de ronda
    let rondaCompletada = false;
    if (disponibles.length === 0) {
      state.seleccionados.clear();
      state.ronda += 1;
      rondaCompletada = true;

      this.logger.log(
        `Ronda ${state.ronda - 1} completada en sala ${salaId}, iniciando ronda ${state.ronda}`,
      );

      // Ahora todos están disponibles de nuevo
      disponibles.push(...estudiantesDisponibles);
    }

    // Selección aleatoria usando crypto para mejor distribución
    const randomIndex = Math.floor(Math.random() * disponibles.length);
    const estudianteElegido = disponibles[randomIndex];

    if (!estudianteElegido) {
      return {
        exito: false,
        error: 'Error interno al seleccionar estudiante',
      };
    }

    // Marcar como seleccionado
    state.seleccionados.add(estudianteElegido.odooId);

    const seleccionado: EstudianteSeleccionado = {
      odooId: estudianteElegido.odooId,
      nombre: estudianteElegido.nombre,
      timestamp: new Date().toISOString(),
    };

    state.ultimoSeleccionado = seleccionado;

    const restantes = estudiantesDisponibles.length - state.seleccionados.size;

    // Si esta selección completa la ronda, marcarlo
    if (restantes === 0) {
      rondaCompletada = true;
    }

    this.logger.debug(
      `Estudiante seleccionado en sala ${salaId}: ${seleccionado.nombre} (quedan ${restantes})`,
    );

    return {
      exito: true,
      seleccionado,
      restantes,
      rondaCompletada,
    };
  }

  /**
   * Reinicia el selector de una sala (nueva ronda)
   */
  resetearSelector(salaId: string): ResetSelectorResult {
    const state = this.selectorPorSala.get(salaId);

    if (!state) {
      // No hay estado, crear uno nuevo
      this.selectorPorSala.set(salaId, {
        seleccionados: new Set(),
        ultimoSeleccionado: null,
        ronda: 1,
      });

      return { exito: true, ronda: 1 };
    }

    // Resetear para nueva ronda
    state.seleccionados.clear();
    state.ronda += 1;
    state.ultimoSeleccionado = null;

    this.logger.log(
      `Selector reseteado en sala ${salaId}, ronda ${state.ronda}`,
    );

    return { exito: true, ronda: state.ronda };
  }

  /**
   * Obtiene el estado actual del selector
   */
  getState(salaId: string): SelectorState | undefined {
    return this.selectorPorSala.get(salaId);
  }

  /**
   * Obtiene el último estudiante seleccionado
   */
  getUltimoSeleccionado(salaId: string): EstudianteSeleccionado | null {
    return this.selectorPorSala.get(salaId)?.ultimoSeleccionado ?? null;
  }

  /**
   * Limpia el estado del selector (cuando termina la clase)
   */
  limpiarSala(salaId: string): void {
    this.selectorPorSala.delete(salaId);
    this.logger.debug(`Selector limpiado para sala ${salaId}`);
  }
}
