import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsEmail,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsOptional,
  Matches,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Tipo de inscripción disponible para 2026
 */
export enum TipoInscripcion2026 {
  COLONIA = 'colonia',
  CICLO_2026 = 'ciclo2026',
  PACK_COMPLETO = 'pack-completo',
}

/**
 * Mundos STEAM disponibles para Ciclo 2026
 */
export enum MundoSTEAM {
  MATEMATICA = 'matematica',
  PROGRAMACION = 'programacion',
  CIENCIAS = 'ciencias',
}

/**
 * DTO para datos del padre/madre/tutor al crear inscripción
 */
export class TutorDataDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  telefono: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{7,8}$/, { message: 'DNI debe tener 7-8 dígitos' })
  dni?: string;

  @IsString()
  @IsNotEmpty({ message: 'El CUIL/CUIT es requerido para facturación' })
  @Matches(/^\d{11}$/, { message: 'CUIL/CUIT debe tener 11 dígitos (sin guiones)' })
  cuil: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'La contraseña debe tener al menos un número' })
  password: string;
}

/**
 * DTO para un curso de colonia seleccionado
 */
export class CourseSelectionDto {
  @IsString()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsNotEmpty()
  course_name: string;

  @IsString()
  @IsNotEmpty()
  course_area: string;

  @IsString()
  @IsNotEmpty()
  instructor: string;

  @IsString()
  @IsNotEmpty()
  day_of_week: string;

  @IsString()
  @IsNotEmpty()
  time_slot: string;
}

/**
 * DTO para datos de estudiante a inscribir
 */
export class EstudianteInscripcionDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del estudiante es requerido' })
  nombre: string;

  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(5, { message: 'La edad mínima es 5 años' })
  @Max(17, { message: 'La edad máxima es 17 años' })
  edad: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{7,8}$/, { message: 'DNI debe tener 7-8 dígitos' })
  dni?: string;

  // Para Colonia o Pack Completo: selección de cursos (1-2)
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos 1 curso' })
  @ArrayMaxSize(2, { message: 'Máximo 2 cursos por estudiante' })
  @ValidateNested({ each: true })
  @Type(() => CourseSelectionDto)
  cursos_seleccionados?: CourseSelectionDto[];

  // Para Ciclo 2026 o Pack Completo: selección de mundo STEAM
  @IsOptional()
  @IsEnum(MundoSTEAM, { message: 'Mundo STEAM inválido' })
  mundo_seleccionado?: MundoSTEAM;
}

/**
 * DTO principal para crear una inscripción 2026
 */
export class CreateInscripcion2026Dto {
  @IsEnum(TipoInscripcion2026, {
    message: 'Tipo de inscripción inválido. Debe ser: colonia, ciclo2026 o pack-completo'
  })
  @IsNotEmpty()
  tipo_inscripcion: TipoInscripcion2026;

  @ValidateNested()
  @Type(() => TutorDataDto)
  @IsNotEmpty()
  tutor: TutorDataDto;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe inscribir al menos 1 estudiante' })
  @ValidateNested({ each: true })
  @Type(() => EstudianteInscripcionDto)
  estudiantes: EstudianteInscripcionDto[];

  @IsOptional()
  @IsString()
  origen_inscripcion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;
}

/**
 * DTO de respuesta al crear inscripción
 */
export interface CreateInscripcion2026Response {
  success: boolean;
  inscripcionId: string;
  tutorId: string;
  estudiantes_creados: {
    id: string;
    nombre: string;
    pin: string;
  }[];
  pago_info: {
    monto_total: number;
    descuento_aplicado: number;
    mercadopago_preference_id: string;
    mercadopago_init_point: string;
  };
}
