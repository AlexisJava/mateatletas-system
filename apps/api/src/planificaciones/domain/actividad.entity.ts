import { NivelDificultad } from '@prisma/client';

/**
 * ActividadSemanal Entity - Domain Model
 *
 * Represents a weekly activity within a monthly planning.
 * Mapped to the real Prisma schema.
 */
export class ActividadEntity {
  constructor(
    public readonly id: string,
    public readonly planificacionId: string,
    public readonly semanaNumero: number,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly componenteNombre: string,
    public readonly componenteProps: Record<string, unknown>,
    public readonly nivelDificultad: NivelDificultad,
    public readonly tiempoEstimadoMinutos: number,
    public readonly puntosGamificacion: number,
    public readonly instruccionesDocente: string,
    public readonly instruccionesEstudiante: string,
    public readonly recursosUrl: Record<string, unknown> | null,
    public readonly orden: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.semanaNumero < 1 || this.semanaNumero > 4) {
      throw new Error('La semana debe estar entre 1 y 4');
    }

    if (this.orden < 0) {
      throw new Error('El orden debe ser un número positivo');
    }

    if (this.puntosGamificacion < 0) {
      throw new Error('Los puntos de gamificación no pueden ser negativos');
    }

    if (this.tiempoEstimadoMinutos <= 0) {
      throw new Error('El tiempo estimado debe ser mayor a 0');
    }

    if (!this.titulo.trim()) {
      throw new Error('El título no puede estar vacío');
    }

    if (!this.componenteNombre.trim()) {
      throw new Error('El componente nombre no puede estar vacío');
    }
  }

  /**
   * Business logic: Calculate points based on performance
   */
  public calculatePoints(performancePercentage: number): number {
    if (performancePercentage < 0 || performancePercentage > 100) {
      throw new Error('El porcentaje de desempeño debe estar entre 0 y 100');
    }
    return Math.round((this.puntosGamificacion * performancePercentage) / 100);
  }

  /**
   * Create entity from database record
   */
  public static fromPersistence(data: {
    id: string;
    planificacion_id: string;
    semana_numero: number;
    titulo: string;
    descripcion: string;
    componente_nombre: string;
    componente_props: Record<string, unknown>;
    nivel_dificultad: NivelDificultad;
    tiempo_estimado_minutos: number;
    puntos_gamificacion: number;
    instrucciones_docente: string;
    instrucciones_estudiante: string;
    recursos_url: Record<string, unknown> | null;
    orden: number;
    created_at: Date;
    updated_at: Date;
  }): ActividadEntity {
    return new ActividadEntity(
      data.id,
      data.planificacion_id,
      data.semana_numero,
      data.titulo,
      data.descripcion,
      data.componente_nombre,
      data.componente_props,
      data.nivel_dificultad,
      data.tiempo_estimado_minutos,
      data.puntos_gamificacion,
      data.instrucciones_docente,
      data.instrucciones_estudiante,
      data.recursos_url,
      data.orden,
      data.created_at,
      data.updated_at,
    );
  }

  /**
   * Convert entity to plain object for persistence
   */
  public toPersistence(): {
    id: string;
    planificacion_id: string;
    semana_numero: number;
    titulo: string;
    descripcion: string;
    componente_nombre: string;
    componente_props: Record<string, unknown>;
    nivel_dificultad: NivelDificultad;
    tiempo_estimado_minutos: number;
    puntos_gamificacion: number;
    instrucciones_docente: string;
    instrucciones_estudiante: string;
    recursos_url: Record<string, unknown> | null;
    orden: number;
  } {
    return {
      id: this.id,
      planificacion_id: this.planificacionId,
      semana_numero: this.semanaNumero,
      titulo: this.titulo,
      descripcion: this.descripcion,
      componente_nombre: this.componenteNombre,
      componente_props: this.componenteProps,
      nivel_dificultad: this.nivelDificultad,
      tiempo_estimado_minutos: this.tiempoEstimadoMinutos,
      puntos_gamificacion: this.puntosGamificacion,
      instrucciones_docente: this.instruccionesDocente,
      instrucciones_estudiante: this.instruccionesEstudiante,
      recursos_url: this.recursosUrl,
      orden: this.orden,
    };
  }
}
