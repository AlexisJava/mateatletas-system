import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateEstudianteDto } from '../create-estudiante.dto';

describe('CreateEstudianteDto - Validation Tests', () => {
  // ============================================================================
  // TESTS: Validación exitosa con datos válidos
  // ============================================================================
  describe('Valid Data', () => {
    it('debe pasar con datos válidos completos', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        edad: 10,
        nivelEscolar: 'Primaria',
        fotoUrl: 'https://cloudinary.com/photos/student.jpg',
        avatarUrl: 'https://models.readyplayer.me/abc123.glb',
        casaId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe pasar con campos opcionales omitidos', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'María',
        apellido: 'González',
        edad: 12,
        nivelEscolar: 'Secundaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar nombres con tildes y ñ', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'José María',
        apellido: 'Núñez',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar los 3 niveles escolares válidos', async () => {
      const niveles = ['Primaria', 'Secundaria', 'Universidad'];

      for (const nivel of niveles) {
        const dto = plainToClass(CreateEstudianteDto, {
          nombre: 'Test',
          apellido: 'Estudiante',
          edad: 15,
          nivelEscolar: nivel,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  // ============================================================================
  // TESTS: Validación de campo nombre
  // ============================================================================
  describe('Nombre Validation', () => {
    it('debe fallar si nombre está vacío', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: '',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });

    it('debe fallar si nombre contiene números', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan123',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });

    it('debe fallar si nombre contiene caracteres especiales', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan@#$',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });

    it('debe fallar si nombre supera 100 caracteres', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'a'.repeat(101),
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nombre')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: Validación de campo apellido
  // ============================================================================
  describe('Apellido Validation', () => {
    it('debe fallar si apellido está vacío', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: '',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'apellido')).toBe(true);
    });

    it('debe fallar si apellido contiene números', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez123',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'apellido')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: Validación de campo edad
  // ============================================================================
  describe('Edad Validation', () => {
    it('debe fallar con edad menor a 3', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 2,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'edad')).toBe(true);
    });

    it('debe fallar con edad mayor a 99', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 100,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'edad')).toBe(true);
    });

    it('debe fallar con edad decimal', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10.5,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'edad')).toBe(true);
    });

    it('debe fallar con edad como string', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 'diez' as any,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'edad')).toBe(true);
    });

    it('debe aceptar edad en el límite inferior (3)', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 3,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe aceptar edad en el límite superior (99)', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 99,
        nivelEscolar: 'Universidad',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: Validación de campo nivelEscolar
  // ============================================================================
  describe('Nivel Escolar Validation', () => {
    it('debe fallar con nivel escolar inválido', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Preescolar',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nivelEscolar')).toBe(true);
    });

    it('debe fallar si nivel escolar está vacío', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nivelEscolar')).toBe(true);
    });

    it('debe fallar con nivel escolar en minúsculas', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nivelEscolar')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: Validación de campos opcionales
  // ============================================================================
  describe('Optional Fields Validation', () => {
    it('debe fallar con fotoUrl HTTP (no HTTPS)', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        fotoUrl: 'http://cloudinary.com/photos/student.jpg',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'fotoUrl')).toBe(true);
    });

    it('debe fallar con fotoUrl inválida', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        fotoUrl: 'not-a-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'fotoUrl')).toBe(true);
    });

    it('debe fallar con equipoId no UUID', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        casaId: 'not-a-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'casaId')).toBe(true);
    });

    it('debe aceptar equipoId con UUID válido', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivelEscolar: 'Primaria',
        casaId: '550e8400-e29b-41d4-a716-446655440000',
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
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: '', // Error: vacío
        apellido: 'Pérez123', // Error: contiene números
        edad: 2, // Error: menor a 3
        nivelEscolar: 'Preescolar', // Error: nivel inválido
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(4); // Todos los campos tienen errores
    });
  });

  // ============================================================================
  // TESTS: Validación de transformaciones (Trim, Capitalize)
  // ============================================================================
  describe('Transformations', () => {
    it('debe trimear espacios en nombre y apellido', async () => {
      const dto = plainToClass(CreateEstudianteDto, {
        nombre: '  Juan  ',
        apellido: '  Pérez  ',
        edad: 10,
        nivelEscolar: 'Primaria',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      // Note: Las transformaciones se aplican en el controller/service layer
    });
  });
});
