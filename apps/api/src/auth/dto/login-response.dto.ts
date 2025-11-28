import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../decorators/roles.decorator';

/**
 * Respuesta de login estándar
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
  })
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    role: Role;
    roles: Role[];
    [key: string]: unknown;
  };

  @ApiProperty({
    description: 'Indica si se requiere MFA (solo para admins)',
    required: false,
  })
  requires_mfa?: boolean;

  @ApiProperty({
    description: 'Token temporal para verificación MFA (válido 5 minutos)',
    required: false,
  })
  mfa_token?: string;
}
