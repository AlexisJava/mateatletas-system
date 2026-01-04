import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { IsCuid } from '../../common/decorators';

/**
 * DTO para unirse a una sala de aula virtual
 *
 * Exactamente uno de los campos debe estar presente:
 * - claseGrupoId: para unirse a una clase en vivo (CUID)
 * - comisionId: para unirse a una comisión/grupo de estudiantes (CUID)
 */
export class UnirseSalaDto {
  @IsOptional()
  @IsCuid({ message: 'claseGrupoId debe ser un CUID válido' })
  claseGrupoId?: string;

  @IsOptional()
  @IsCuid({ message: 'comisionId debe ser un CUID válido' })
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
