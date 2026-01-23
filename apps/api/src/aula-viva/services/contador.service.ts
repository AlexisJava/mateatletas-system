import { Injectable, Logger } from '@nestjs/common';

/**
 * Estado interno de un contador activo
 */
interface ContadorState {
  salaId: string;
  segundosTotal: number;
  segundosRestantes: number;
  mensaje?: string;
  timestampInicio: Date;
  pausado: boolean;
  timeoutId?: NodeJS.Timeout;
  onTerminado: () => void;
}

@Injectable()
export class ContadorService {
  private readonly logger = new Logger(ContadorService.name);
  private contadores: Map<string, ContadorState> = new Map();

  /**
   * Inicia un nuevo contador en la sala
   * @returns El estado del contador o null si ya existe uno activo
   */
  iniciar(
    salaId: string,
    segundos: number,
    mensaje: string | undefined,
    onTerminado: () => void,
  ): ContadorState | null {
    const existente = this.contadores.get(salaId);
    if (existente) {
      this.logger.warn(`Ya existe un contador activo en sala ${salaId}`);
      return null;
    }

    const contador: ContadorState = {
      salaId,
      segundosTotal: segundos,
      segundosRestantes: segundos,
      mensaje,
      timestampInicio: new Date(),
      pausado: false,
      onTerminado,
    };

    // Programar terminación automática
    contador.timeoutId = setTimeout(() => {
      this.terminar(salaId);
    }, segundos * 1000);

    this.contadores.set(salaId, contador);
    this.logger.log(`Contador iniciado en sala ${salaId}: ${segundos}s`);

    return contador;
  }

  /**
   * Pausa el contador
   * @returns segundos restantes o null si no existe/ya pausado
   */
  pausar(salaId: string): number | null {
    const contador = this.contadores.get(salaId);
    if (!contador || contador.pausado) {
      return null;
    }

    // Cancelar timeout
    if (contador.timeoutId) {
      clearTimeout(contador.timeoutId);
      contador.timeoutId = undefined;
    }

    // Calcular tiempo transcurrido
    const tiempoTranscurrido =
      (Date.now() - contador.timestampInicio.getTime()) / 1000;
    contador.segundosRestantes = Math.max(
      0,
      contador.segundosTotal - tiempoTranscurrido,
    );
    contador.pausado = true;

    this.logger.log(
      `Contador pausado en sala ${salaId}: ${contador.segundosRestantes.toFixed(1)}s restantes`,
    );

    return Math.round(contador.segundosRestantes);
  }

  /**
   * Reanuda un contador pausado
   * @returns true si se reanudó, false si no existe o no estaba pausado
   */
  reanudar(salaId: string): boolean {
    const contador = this.contadores.get(salaId);
    if (!contador || !contador.pausado) {
      return false;
    }

    // Actualizar referencias de tiempo
    contador.timestampInicio = new Date();
    contador.segundosTotal = contador.segundosRestantes;
    contador.pausado = false;

    // Reprogramar timeout
    contador.timeoutId = setTimeout(() => {
      this.terminar(salaId);
    }, contador.segundosRestantes * 1000);

    this.logger.log(
      `Contador reanudado en sala ${salaId}: ${contador.segundosRestantes.toFixed(1)}s`,
    );

    return true;
  }

  /**
   * Cancela el contador sin emitir terminado
   */
  cancelar(salaId: string): boolean {
    const contador = this.contadores.get(salaId);
    if (!contador) {
      return false;
    }

    if (contador.timeoutId) {
      clearTimeout(contador.timeoutId);
    }

    this.contadores.delete(salaId);
    this.logger.log(`Contador cancelado en sala ${salaId}`);

    return true;
  }

  /**
   * Obtiene el estado actual del contador
   */
  getContador(salaId: string): ContadorState | undefined {
    return this.contadores.get(salaId);
  }

  /**
   * Calcula los segundos restantes actuales (considerando pausa)
   */
  getSegundosRestantes(salaId: string): number {
    const contador = this.contadores.get(salaId);
    if (!contador) {
      return 0;
    }

    if (contador.pausado) {
      return Math.round(contador.segundosRestantes);
    }

    const tiempoTranscurrido =
      (Date.now() - contador.timestampInicio.getTime()) / 1000;
    return Math.max(0, Math.round(contador.segundosTotal - tiempoTranscurrido));
  }

  /**
   * Limpia el estado de una sala (cuando docente sale)
   */
  limpiarSala(salaId: string): void {
    const contador = this.contadores.get(salaId);
    if (contador?.timeoutId) {
      clearTimeout(contador.timeoutId);
    }
    this.contadores.delete(salaId);
    this.logger.debug(`Estado de contador limpiado para sala ${salaId}`);
  }

  /**
   * Limpia TODOS los contadores (usado en tests)
   */
  limpiarTodo(): void {
    for (const contador of this.contadores.values()) {
      if (contador.timeoutId) {
        clearTimeout(contador.timeoutId);
      }
    }
    this.contadores.clear();
    this.logger.debug('Todos los contadores limpiados');
  }

  /**
   * Termina el contador y ejecuta callback
   */
  private terminar(salaId: string): void {
    const contador = this.contadores.get(salaId);
    if (!contador) {
      return;
    }

    this.logger.log(`Contador terminado en sala ${salaId}`);

    // Limpiar timeout por si acaso
    if (contador.timeoutId) {
      clearTimeout(contador.timeoutId);
    }

    // Guardar callback antes de eliminar
    const onTerminado = contador.onTerminado;

    // Eliminar contador
    this.contadores.delete(salaId);

    // Ejecutar callback (emite broadcast)
    onTerminado();
  }
}
