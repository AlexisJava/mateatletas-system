/**
 * ============================================================================
 * CLOCK SERVICE - Abstracción de tiempo para Dependency Injection
 * ============================================================================
 *
 * Patrón: Service Abstraction / Dependency Inversion
 *
 * Este servicio abstrae la obtención de la fecha/hora actual, permitiendo:
 * 1. Testing determinístico sin hacks de globals
 * 2. Time travel en tests de integración
 * 3. Simulación de escenarios temporales (períodos de decisión, deadlines)
 *
 * Uso en producción:
 *   constructor(private readonly clock: ClockService) {}
 *   const now = this.clock.now();
 *
 * Uso en tests:
 *   const mockClock = { now: () => new Date('2025-11-20') };
 *   module.overrideProvider(ClockService).useValue(mockClock);
 */

import { Injectable } from '@nestjs/common';

export interface IClock {
  now(): Date;
  currentYear(): number;
  currentMonth(): number; // 1-12 (no 0-11)
}

@Injectable()
export class ClockService implements IClock {
  /**
   * Retorna la fecha/hora actual del sistema
   */
  now(): Date {
    return new Date();
  }

  /**
   * Retorna el año actual
   */
  currentYear(): number {
    return this.now().getFullYear();
  }

  /**
   * Retorna el mes actual (1-12, no 0-11 como Date.getMonth())
   */
  currentMonth(): number {
    return this.now().getMonth() + 1;
  }
}
