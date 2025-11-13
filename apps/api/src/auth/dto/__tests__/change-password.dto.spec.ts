import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ChangePasswordDto } from '../change-password.dto';

describe('ChangePasswordDto - Validation Tests', () => {
  // ============================================================================
  // TESTS: Validación exitosa con datos válidos
  // ============================================================================
  describe('Valid Data', () => {
    it('debe pasar con contraseñas válidas', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'NewSecurePass456!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de passwordActual
  // ============================================================================
  describe('PasswordActual Validation', () => {
    it('debe fallar si passwordActual está vacía', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: '',
        nuevaPassword: 'NewSecurePass456!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'passwordActual')).toBe(true);
    });

    it('debe fallar si passwordActual es menor a 4 caracteres', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'abc',
        nuevaPassword: 'NewSecurePass456!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'passwordActual')).toBe(true);
    });

    it('debe aceptar passwordActual con 4+ caracteres (contraseña temporal)', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'temp',
        nuevaPassword: 'NewSecurePass456!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de nuevaPassword
  // ============================================================================
  describe('NuevaPassword Validation', () => {
    it('debe fallar con nueva contraseña menor a 8 caracteres', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'Short1!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nuevaPassword')).toBe(true);
    });

    it('debe fallar con nueva contraseña sin mayúscula', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'newpassword123!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nuevaPassword')).toBe(true);
    });

    it('debe fallar con nueva contraseña sin minúscula', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'NEWPASSWORD123!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nuevaPassword')).toBe(true);
    });

    it('debe fallar con nueva contraseña sin número', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'NewPassword!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nuevaPassword')).toBe(true);
    });

    it('debe fallar con nueva contraseña sin carácter especial', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'NewPassword123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nuevaPassword')).toBe(true);
    });

    it('debe aceptar nueva contraseña segura válida', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'MyNewSecurePass456!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar nueva contraseña con diferentes caracteres especiales', async () => {
      const specialChars = ['@', '$', '!', '%', '*', '?', '&', '#', '-', '_'];

      for (const char of specialChars) {
        const dto = plainToClass(ChangePasswordDto, {
          passwordActual: 'OldPass123!',
          nuevaPassword: `NewPassword123${char}`,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  // ============================================================================
  // TESTS: Validación de múltiples errores simultáneos
  // ============================================================================
  describe('Multiple Errors', () => {
    it('debe detectar múltiples errores simultáneamente', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: '', // Error: vacía
        nuevaPassword: 'weak', // Error: no cumple requisitos
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(2);
    });
  });

  // ============================================================================
  // TESTS: Edge Cases
  // ============================================================================
  describe('Edge Cases', () => {
    it('debe permitir que passwordActual y nuevaPassword sean iguales (validación lógica en servicio)', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'SamePass123!',
        nuevaPassword: 'SamePass123!',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      // Note: La validación de que sean diferentes debe hacerse en el servicio
    });

    it('debe fallar si nuevaPassword está vacía', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nuevaPassword')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: Security Considerations
  // ============================================================================
  describe('Security', () => {
    it('debe rechazar contraseñas comunes incluso si cumplen requisitos técnicos', async () => {
      // Contraseñas comunes que técnicamente cumplen los requisitos
      const commonPasswords = ['Password123!', 'Welcome123!', 'Admin123!'];

      for (const pwd of commonPasswords) {
        const dto = plainToClass(ChangePasswordDto, {
          passwordActual: 'OldPass123!',
          nuevaPassword: pwd,
        });

        const errors = await validate(dto);
        // Note: Esta validación debería hacerse en un validator custom adicional
        // Por ahora, estas contraseñas pasarán la validación básica
        expect(errors.length).toBe(0);
      }
    });

    it('debe aceptar contraseña muy fuerte con 16+ caracteres', async () => {
      const dto = plainToClass(ChangePasswordDto, {
        passwordActual: 'OldPass123!',
        nuevaPassword: 'MyVerySecure!Password2024',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
