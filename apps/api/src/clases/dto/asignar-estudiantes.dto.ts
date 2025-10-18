import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AsignarEstudiantesDto {
  @IsArray()
  @IsNotEmpty({ message: 'Debe proporcionar al menos un estudiante' })
  @IsString({ each: true })
  estudianteIds!: string[];
}
