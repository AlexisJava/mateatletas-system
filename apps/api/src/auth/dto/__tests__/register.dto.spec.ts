import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterDto } from '../register.dto';

describe('RegisterDto - Validation Tests', () => {
  // ============================================================================
  // TESTS: Validación exitosa con datos válidos
  // ============================================================================
  describe('Valid Data', () => {
    it('debe pasar con datos válidos completos', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan.perez@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        dni: '12345678',
        telefono: '+54 9 11 1234-5678',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe pasar con campos opcionales omitidos', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'maria@example.com',
        password: 'StrongPass456!',
        nombre: 'María',
        apellido: 'González',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de email
  // ============================================================================
  describe('Email Validation', () => {
    it('debe fallar con email inválido (sin @)', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'invalid-email',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('debe fallar con email inválido (sin dominio)', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('debe fallar con email que supera 255 caracteres', async () => {
      const longEmail = 'a'.repeat(246) + '@example.com'; // 246 + 12 = 258
      const dto = plainToClass(RegisterDto, {
        email: longEmail,
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('debe aceptar email con subdominios', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan.perez@empresa.com.ar',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de contraseña
  // ============================================================================
  describe('Password Validation', () => {
    it('debe fallar con contraseña menor a 8 caracteres', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'Pass1!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('debe fallar con contraseña sin mayúscula', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'password123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('debe fallar con contraseña sin minúscula', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'PASSWORD123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('debe fallar con contraseña sin número', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'PasswordABC!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('debe fallar con contraseña sin carácter especial', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'Password123',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('debe fallar con contraseña que supera 128 caracteres', async () => {
      const longPassword = 'A'.repeat(126) + 'b1!'; // 126 + 3 = 129 (excede límite de 128)
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: longPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('debe aceptar contraseña fuerte válida', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'MyStrongPass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar contraseña con todos los caracteres especiales permitidos', async () => {
      const specialChars = ['@', '$', '!', '%', '*', '?', '&'];

      for (const char of specialChars) {
        const dto = plainToClass(RegisterDto, {
          email: 'juan@example.com',
          password: `Password123${char}`,
          nombre: 'Juan',
          apellido: 'Pérez',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  // ============================================================================
  // TESTS: Validación de nombre
  // ============================================================================
  describe('Nombre Validation', () => {
    it('debe fallar con nombre menor a 2 caracteres', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'J',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });

    it('debe fallar con nombre que contiene números', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan123',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });

    it('debe fallar con nombre que contiene caracteres especiales', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan@#$',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });

    it('debe aceptar nombre con tildes y ñ', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'jose@example.com',
        password: 'SecurePass123!',
        nombre: 'José María',
        apellido: 'Núñez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar nombres compuestos con espacio', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de DNI
  // ============================================================================
  describe('DNI Validation (Optional)', () => {
    it('debe fallar con DNI de 6 dígitos (menor a 7)', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '123456',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'dni')).toBe(true);
    });

    it('debe fallar con DNI de 9 dígitos (mayor a 8)', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '123456789',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'dni')).toBe(true);
    });

    it('debe fallar con DNI que contiene letras', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '1234567A',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'dni')).toBe(true);
    });

    it('debe fallar con DNI que contiene puntos o guiones', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12.345.678',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'dni')).toBe(true);
    });

    it('debe aceptar DNI de 7 dígitos', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '1234567',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar DNI de 8 dígitos', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar registro sin DNI (opcional)', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'juan@example.com',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de múltiples errores simultáneos
  // ============================================================================
  describe('Multiple Errors', () => {
    it('debe detectar múltiples errores simultáneamente', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'invalid-email', // Error: email inválido
        password: 'weak', // Error: contraseña débil
        nombre: 'J123', // Error: nombre con números
        apellido: '', // Error: apellido vacío
        dni: '12345', // Error: DNI menor a 7 dígitos
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(5); // Todos los campos tienen errores
    });
  });

  // ============================================================================
  // TESTS: Edge Cases
  // ============================================================================
  describe('Edge Cases', () => {
    it('debe manejar email con mayúsculas (debe convertirse a minúsculas)', async () => {
      const dto = plainToClass(RegisterDto, {
        email: 'JUAN.PEREZ@EXAMPLE.COM',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      // Note: La transformación @Lowercase() se aplica antes de la validación
    });

    it('debe trimear espacios en email', async () => {
      const dto = plainToClass(RegisterDto, {
        email: '  juan@example.com  ',
        password: 'SecurePass123!',
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
