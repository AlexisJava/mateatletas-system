/**
 * Circuit Breaker Implementation
 *
 * Patrón que previene cascading failures al "abrir el circuito" cuando un servicio falla repetidamente
 *
 * Estados:
 * - CLOSED (Cerrado): Funcionamiento normal, permite requests
 * - OPEN (Abierto): Muchos fallos detectados, rechaza requests (retorna fallback)
 * - HALF_OPEN (Semi-abierto): Después de timeout, prueba 1 request para ver si se recuperó
 *
 * Ejemplo:
 * - Request 1-4: Éxito → Estado CLOSED
 * - Request 5-9: Fallan → Contador de fallos incrementa
 * - Request 10: Falla (5to fallo) → Estado cambia a OPEN
 * - Request 11-20: Rechazadas inmediatamente (retorna fallback)
 * - Después de 60s: Estado cambia a HALF_OPEN
 * - Request 21: Si tiene éxito → CLOSED, si falla → OPEN de nuevo
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /**
   * Número de fallos consecutivos antes de abrir el circuito
   * Default: 5
   */
  failureThreshold?: number;

  /**
   * Milisegundos de timeout antes de intentar recovery (pasar a HALF_OPEN)
   * Default: 60000 (60 segundos)
   */
  resetTimeout?: number;

  /**
   * Nombre del circuito (para logging)
   */
  name?: string;

  /**
   * Función fallback a ejecutar cuando el circuito está OPEN
   * Si no se provee, lanza CircuitBreakerOpenError
   */
  fallback?: (...args: unknown[]) => unknown;
}

export class CircuitBreakerOpenError extends Error {
  constructor(circuitName: string) {
    super(`Circuit breaker is OPEN for: ${circuitName}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttempt: number = Date.now();

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly name: string;
  private readonly fallback?: (...args: any[]) => any;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 60000; // 60 segundos
    this.name = options.name ?? 'UnnamedCircuit';
    this.fallback = options.fallback;
  }

  /**
   * Ejecuta una función protegida por el circuit breaker
   *
   * @param fn - Función a ejecutar
   * @param args - Argumentos para la función
   * @returns Resultado de la función o fallback
   */
  async execute<T>(
    fn: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T> {
    // Si el circuito está OPEN, verificar si es momento de intentar recovery
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        // Todavía no es momento de reintentar
        console.warn(
          `[CircuitBreaker:${this.name}] Circuit is OPEN, using fallback`,
        );
        return this.executeFallback(args);
      }
      // Es momento de intentar recovery
      this.state = CircuitState.HALF_OPEN;
      console.log(
        `[CircuitBreaker:${this.name}] Circuit moving to HALF_OPEN, attempting recovery`,
      );
    }

    try {
      // Intentar ejecutar la función
      const result = await fn(...args);

      // Éxito! Resetear el circuito
      this.onSuccess();
      return result;
    } catch (error) {
      // Fallo! Registrar y posiblemente abrir el circuito
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Maneja éxito de una operación
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      console.log(
        `[CircuitBreaker:${this.name}] Recovery successful, circuit CLOSED`,
      );
      this.state = CircuitState.CLOSED;
    }
  }

  /**
   * Maneja fallo de una operación
   */
  private onFailure(error: any): void {
    this.failureCount++;

    console.error(
      `[CircuitBreaker:${this.name}] Failure ${this.failureCount}/${this.failureThreshold}`,
      error.message || error,
    );

    if (
      this.failureCount >= this.failureThreshold ||
      this.state === CircuitState.HALF_OPEN
    ) {
      // Abrir el circuito
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;

      console.error(
        `[CircuitBreaker:${this.name}] Circuit OPEN, will retry at ${new Date(this.nextAttempt).toISOString()}`,
      );
    }
  }

  /**
   * Ejecuta la función fallback
   */
  private executeFallback(args: any[]): any {
    if (this.fallback) {
      console.log(`[CircuitBreaker:${this.name}] Executing fallback`);
      return this.fallback(...args);
    }

    throw new CircuitBreakerOpenError(this.name);
  }

  /**
   * Obtiene el estado actual del circuito
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Obtiene métricas del circuito
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      nextAttempt:
        this.state === CircuitState.OPEN
          ? new Date(this.nextAttempt).toISOString()
          : null,
    };
  }

  /**
   * Resetea manualmente el circuito (para testing)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = Date.now();
    console.log(`[CircuitBreaker:${this.name}] Circuit manually reset`);
  }
}
