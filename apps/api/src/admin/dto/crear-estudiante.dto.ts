import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsCuid } from '../../common/validators/is-cuid.validator';

/**
 * DTO para crear estudiante directamente sin necesidad de clase
 *
 * FLUJO DE USO:
 * 1. Admin va a /admin/estudiantes
 * 2. Selecciona pestaña de sector (Matemática, Programación, Preinscriptos)
 * 3. Click en "Añadir Estudiante"
 * 4. Completa formulario completo con todos los datos
 * 5. Sistema auto-crea tutor (si no existe) + estudiante
 * 6. Genera credenciales para ambos
 * 7. Retorna credenciales en UI para que admin las copie
 *
 * DIFERENCIA CON AgregarEstudianteConTutorDto:
 * - Este NO requiere claseId (estudiante se crea sin clase)
 * - Este REQUIERE sectorId obligatorio
 * - Este permite equipoId, puntosIniciales, nivelInicial opcionales
 * - Útil para migración de estudiantes actuales del club
 *
 * CREDENCIALES GENERADAS:
 * - Tutor: username + password temporal (DEBE cambiar en primer login)
 * - Estudiante: username + PIN de 4 dígitos (puede mantenerlo)
 */
export class CrearEstudianteDto {
  // ==================== DATOS DEL ESTUDIANTE ====================

  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombreEstudiante!: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Pérez',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  apellidoEstudiante!: string;

  @ApiProperty({
    description: 'Edad del estudiante (3-18 años)',
    example: 10,
    minimum: 3,
    maximum: 18,
  })
  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(3, { message: 'La edad mínima es 3 años' })
  @Max(18, { message: 'La edad máxima es 18 años' })
  edadEstudiante!: number;

  @ApiProperty({
    description: 'Nivel escolar del estudiante',
    example: 'Primaria',
    enum: ['Primaria', 'Secundaria', 'Universidad'],
  })
  @IsEnum(['Primaria', 'Secundaria', 'Universidad'])
  nivelEscolar!: 'Primaria' | 'Secundaria' | 'Universidad';

  @ApiProperty({
    description: 'ID del sector (Matemática o Programación)',
    example: 'cm123abc456def789',
  })
  @IsCuid()
  sectorId!: string;

  @ApiPropertyOptional({
    description:
      'Puntos iniciales para el estudiante (para migración de datos existentes)',
    example: 350,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Los puntos deben ser un número entero' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  puntosIniciales?: number;

  @ApiPropertyOptional({
    description:
      'Nivel inicial del estudiante (para migración de datos existentes)',
    example: 3,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El nivel debe ser un número entero' })
  @Min(1, { message: 'El nivel mínimo es 1' })
  nivelInicial?: number;

  @ApiPropertyOptional({
    description: 'ID del equipo (Fénix, Dragón, Tigre, Águila) - opcional',
    example: 'cm123abc456def789',
  })
  @IsOptional()
  @IsCuid()
  equipoId?: string;

  // ==================== DATOS DEL TUTOR ====================

  @ApiProperty({
    description: 'Nombre del tutor/padre',
    example: 'Carlos',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, {
    message: 'El nombre del tutor debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El nombre del tutor no puede exceder 50 caracteres',
  })
  nombreTutor!: string;

  @ApiProperty({
    description: 'Apellido del tutor/padre',
    example: 'Pérez',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, {
    message: 'El apellido del tutor debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El apellido del tutor no puede exceder 50 caracteres',
  })
  apellidoTutor!: string;

  @ApiPropertyOptional({
    description:
      'Email del tutor (opcional, puede completarlo en primer login)',
    example: 'carlos.perez@email.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  emailTutor?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del tutor (opcional)',
    example: '+5491123456789',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefonoTutor?: string;

  @ApiPropertyOptional({
    description: 'DNI del tutor (opcional)',
    example: '12345678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El DNI no puede exceder 20 caracteres' })
  dniTutor?: string;
}
