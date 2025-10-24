import { EstadoPlanificacion } from '@prisma/client';

/**
 * Planificacion Entity - Domain Model
 *
 * Represents a monthly planning for a specific group.
 * This is a rich domain model with business logic.
 */
export class PlanificacionEntity {
  constructor(
    public readonly id: string,
    public readonly grupoId: string,
    public readonly mes: number,
    public readonly anio: number,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly tematicaPrincipal: string,
    public readonly objetivosAprendizaje: string[],
    public readonly estado: EstadoPlanificacion,
    public readonly createdByAdminId: string,
    public readonly notasDocentes: string | null,
    public readonly fechaPublicacion: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.mes < 1 || this.mes > 12) {
      throw new Error('El mes debe estar entre 1 y 12');
    }

    if (this.anio < 2024) {
      throw new Error('El año debe ser 2024 o posterior');
    }

    // objetivosAprendizaje es opcional, no validamos si está vacío

    if (!this.titulo.trim()) {
      throw new Error('El título no puede estar vacío');
    }
  }

  /**
   * Business logic: Check if planning can be published
   */
  public canBePublished(actividadesCount: number): boolean {
    return this.estado === EstadoPlanificacion.BORRADOR && actividadesCount > 0;
  }

  /**
   * Business logic: Check if planning is active
   */
  public isActive(): boolean {
    return this.estado === EstadoPlanificacion.PUBLICADA;
  }

  /**
   * Business logic: Get planning period identifier
   */
  public getPeriodIdentifier(): string {
    return `${this.grupoId}-${this.mes}/${this.anio}`;
  }

  /**
   * Create entity from database record
   */
  public static fromPersistence(data: {
    id: string;
    grupo_id: string;
    mes: number;
    anio: number;
    titulo: string;
    descripcion: string;
    tematica_principal: string;
    objetivos_aprendizaje: string[];
    estado: EstadoPlanificacion;
    created_by_admin_id: string;
    notas_docentes: string | null;
    fecha_publicacion: Date | null;
    created_at: Date;
    updated_at: Date;
  }): PlanificacionEntity {
    return new PlanificacionEntity(
      data.id,
      data.grupo_id,
      data.mes,
      data.anio,
      data.titulo,
      data.descripcion,
      data.tematica_principal,
      data.objetivos_aprendizaje,
      data.estado,
      data.created_by_admin_id,
      data.notas_docentes,
      data.fecha_publicacion,
      data.created_at,
      data.updated_at,
    );
  }

  /**
   * Convert entity to plain object for persistence
   */
  public toPersistence(): {
    id: string;
    grupo_id: string;
    mes: number;
    anio: number;
    titulo: string;
    descripcion: string;
    tematica_principal: string;
    objetivos_aprendizaje: string[];
    estado: EstadoPlanificacion;
    created_by_admin_id: string;
    notas_docentes: string | null;
    fecha_publicacion: Date | null;
  } {
    return {
      id: this.id,
      grupo_id: this.grupoId,
      mes: this.mes,
      anio: this.anio,
      titulo: this.titulo,
      descripcion: this.descripcion,
      tematica_principal: this.tematicaPrincipal,
      objetivos_aprendizaje: this.objetivosAprendizaje,
      estado: this.estado,
      created_by_admin_id: this.createdByAdminId,
      notas_docentes: this.notasDocentes,
      fecha_publicacion: this.fechaPublicacion,
    };
  }
}
