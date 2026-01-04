import { IsString, IsOptional, IsUUID, ValidateIf } from 'class-validator';

/**
 * DTO para unirse a una sala de aula virtual
 *
 * Exactamente uno de los campos debe estar presente:
 * - claseGrupoId: para unirse a una clase en vivo
 * - comisionId: para unirse a una comisión/grupo de estudiantes
 */
export class UnirseSalaDto {
  @IsOptional()
  @IsUUID('4', { message: 'claseGrupoId debe ser un UUID válido' })
  claseGrupoId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'comisionId debe ser un UUID válido' })
  comisionId?: string;

  /**
   * Validación: exactamente uno debe estar presente
   * Este campo virtual fuerza la validación cuando ambos están ausentes
   */
  @ValidateIf((o: UnirseSalaDto) => !o.claseGrupoId && !o.comisionId)
  @IsString({ message: 'Debe proporcionar claseGrupoId o comisionId' })
  readonly _requiereUno?: never;
}

/**
 * DTO para salir de una sala específica
 */
export class SalirSalaDto {
  @IsString({ message: 'salaId debe ser un string' })
  salaId!: string;
}
