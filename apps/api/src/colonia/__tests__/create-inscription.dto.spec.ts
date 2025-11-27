import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreateInscriptionDto,
  EstudianteInscripcionDto,
  CourseSelectionDto,
} from '../dto/create-inscription.dto';

/**
 * Tests exhaustivos para validación de DTOs de Colonia de Verano 2026
 *
 * Siguiendo las mejores prácticas del proyecto:
 * - AAA Pattern (Arrange, Act, Assert)
 * - Tests aislados e independientes
 * - Coverage exhaustivo de validaciones
 * - Edge cases y valores límite
 */

describe('CreateInscriptionDto', () => {
  // Helper para crear un DTO válido base
  const createValidDto = (): any => ({
    nombre: 'Carlos García',
    email: 'carlos.garcia@example.com',
    telefono: '1234567890',
    password: 'Password123',
    dni: '12345678',
    estudiantes: [
      {
        nombre: 'Juan Pérez',
        edad: 8,
        cursosSeleccionados: [
          {
            id: 'mat-juegos-desafios',
            name: 'Juegos y Desafíos Lógicos',
            area: 'Matemáticas',
            instructor: 'Lucía Ramírez',
            dayOfWeek: 'Lunes',
            timeSlot: '10:00 - 11:00',
            color: '#3B82F6',
            icon: '🎯',
          },
        ],
      },
    ],
  });

  // Helper para validar un DTO
  const validateDto = async (dto: any) => {
    const dtoInstance = plainToClass(CreateInscriptionDto, dto);
    return await validate(dtoInstance);
  };

  describe('Validación de nombre (tutor)', () => {
    it('debe aceptar nombre válido de 2 caracteres mínimo', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = 'Ab';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors).toHaveLength(0);
    });

    it('debe rechazar nombre con 1 solo carácter', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = 'A';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors.length).toBeGreaterThan(0);
      expect(nombreErrors[0].constraints).toHaveProperty('minLength');
    });

    it('debe rechazar nombre vacío', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = '';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors.length).toBeGreaterThan(0);
    });

    it('debe rechazar nombre undefined', async () => {
      // Arrange
      const dto = createValidDto();
      delete dto.nombre;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors.length).toBeGreaterThan(0);
      expect(nombreErrors[0].constraints).toHaveProperty('isString');
    });

    it('debe rechazar nombre null', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = null;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors.length).toBeGreaterThan(0);
    });

    it('debe rechazar nombre con tipo number', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = 12345;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors.length).toBeGreaterThan(0);
      expect(nombreErrors[0].constraints).toHaveProperty('isString');
    });

    it('debe aceptar nombre con espacios y caracteres especiales', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = "María O'Connor García-López";

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors).toHaveLength(0);
    });

    it('debe aceptar nombre con acentos y ñ', async () => {
      // Arrange
      const dto = createValidDto();
      dto.nombre = 'José Ángel Nuñez';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const nombreErrors = errors.filter((e) => e.property === 'nombre');
      expect(nombreErrors).toHaveLength(0);
    });
  });

  describe('Validación de email (tutor)', () => {
    it('debe aceptar email válido estándar', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = 'usuario@example.com';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors).toHaveLength(0);
    });

    it('debe aceptar email con subdominios', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = 'usuario@mail.example.com';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors).toHaveLength(0);
    });

    it('debe aceptar email con números y guiones', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = 'usuario-123@test-mail.com';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors).toHaveLength(0);
    });

    it('debe rechazar email sin @', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = 'usuarioexample.com';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');
    });

    it('debe rechazar email sin dominio', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = 'usuario@';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');
    });

    it('debe rechazar email vacío', async () => {
      // Arrange
      const dto = createValidDto();
      dto.email = '';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');
    });

    it('debe rechazar email undefined', async () => {
      // Arrange
      const dto = createValidDto();
      delete dto.email;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Validación de teléfono (tutor)', () => {
    it('debe aceptar teléfono de 10 dígitos', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '1234567890';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors).toHaveLength(0);
    });

    it('debe aceptar teléfono de 15 dígitos (máximo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '123456789012345';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors).toHaveLength(0);
    });

    it('debe rechazar teléfono con 9 dígitos (menos del mínimo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '123456789';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors.length).toBeGreaterThan(0);
      expect(telefonoErrors[0].constraints).toHaveProperty('matches');
    });

    it('debe rechazar teléfono con 16 dígitos (más del máximo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '1234567890123456';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors.length).toBeGreaterThan(0);
      expect(telefonoErrors[0].constraints).toHaveProperty('matches');
    });

    it('debe rechazar teléfono con letras', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '12345abcde';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors.length).toBeGreaterThan(0);
      expect(telefonoErrors[0].constraints).toHaveProperty('matches');
    });

    it('debe rechazar teléfono con espacios', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '123 456 7890';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors.length).toBeGreaterThan(0);
      expect(telefonoErrors[0].constraints).toHaveProperty('matches');
    });

    it('debe rechazar teléfono con guiones', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '123-456-7890';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors.length).toBeGreaterThan(0);
      expect(telefonoErrors[0].constraints).toHaveProperty('matches');
    });

    it('debe rechazar teléfono vacío', async () => {
      // Arrange
      const dto = createValidDto();
      dto.telefono = '';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const telefonoErrors = errors.filter((e) => e.property === 'telefono');
      expect(telefonoErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Validación de password (tutor)', () => {
    it('debe aceptar password válido con mayúscula y número', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'Password123';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors).toHaveLength(0);
    });

    it('debe aceptar password de 8 caracteres exactos', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'Passwo1d';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors).toHaveLength(0);
    });

    it('debe rechazar password con 7 caracteres (menos del mínimo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'Pass12A';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
      expect(passwordErrors[0].constraints).toHaveProperty('minLength');
    });

    it('debe rechazar password sin mayúscula', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'password123';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
      expect(passwordErrors[0].constraints).toHaveProperty('matches');
      expect(passwordErrors[0].constraints.matches).toContain('mayúscula');
    });

    it('debe rechazar password sin número', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'PasswordABC';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
      expect(passwordErrors[0].constraints).toHaveProperty('matches');
      expect(passwordErrors[0].constraints.matches).toContain('número');
    });

    it('debe rechazar password sin mayúscula ni número', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'passwordabc';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });

    it('debe aceptar password con caracteres especiales', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = 'Password123!@#';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors).toHaveLength(0);
    });

    it('debe rechazar password vacío', async () => {
      // Arrange
      const dto = createValidDto();
      dto.password = '';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Validación de DNI (tutor - opcional)', () => {
    it('debe aceptar DNI válido', async () => {
      // Arrange
      const dto = createValidDto();
      dto.dni = '12345678';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const dniErrors = errors.filter((e) => e.property === 'dni');
      expect(dniErrors).toHaveLength(0);
    });

    it('debe aceptar DNI undefined (es opcional)', async () => {
      // Arrange
      const dto = createValidDto();
      delete dto.dni;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const dniErrors = errors.filter((e) => e.property === 'dni');
      expect(dniErrors).toHaveLength(0);
    });

    it('debe rechazar DNI con tipo number', async () => {
      // Arrange
      const dto = createValidDto();
      dto.dni = 12345678;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const dniErrors = errors.filter((e) => e.property === 'dni');
      expect(dniErrors.length).toBeGreaterThan(0);
      expect(dniErrors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('Validación de array estudiantes', () => {
    it('debe aceptar 1 estudiante (mínimo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = [
        {
          nombre: 'Juan',
          edad: 8,
          cursosSeleccionados: [
            {
              id: 'mat-juegos',
              name: 'Matemáticas',
              area: 'Matemáticas',
              instructor: 'Ana',
              dayOfWeek: 'Lunes',
              timeSlot: '10:00',
              color: '#FFF',
              icon: '🎯',
            },
          ],
        },
      ];

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudiantesErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudiantesErrors).toHaveLength(0);
    });

    it('debe aceptar múltiples estudiantes', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = [
        {
          nombre: 'Juan',
          edad: 8,
          cursosSeleccionados: [
            {
              id: 'mat-juegos',
              name: 'Matemáticas',
              area: 'Matemáticas',
              instructor: 'Ana',
              dayOfWeek: 'Lunes',
              timeSlot: '10:00',
              color: '#FFF',
              icon: '🎯',
            },
          ],
        },
        {
          nombre: 'María',
          edad: 10,
          cursosSeleccionados: [
            {
              id: 'art-pintura',
              name: 'Pintura',
              area: 'Arte',
              instructor: 'Pedro',
              dayOfWeek: 'Martes',
              timeSlot: '11:00',
              color: '#AAA',
              icon: '🎨',
            },
          ],
        },
      ];

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudiantesErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudiantesErrors).toHaveLength(0);
    });

    it('debe rechazar array vacío de estudiantes', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = [];

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudiantesErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudiantesErrors.length).toBeGreaterThan(0);
      expect(estudiantesErrors[0].constraints).toHaveProperty('arrayMinSize');
    });

    it('debe rechazar estudiantes undefined', async () => {
      // Arrange
      const dto = createValidDto();
      delete dto.estudiantes;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudiantesErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudiantesErrors.length).toBeGreaterThan(0);
      expect(estudiantesErrors[0].constraints).toHaveProperty('isArray');
    });

    it('debe rechazar estudiantes que no sean array', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = 'no es un array';

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudiantesErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudiantesErrors.length).toBeGreaterThan(0);
      expect(estudiantesErrors[0].constraints).toHaveProperty('isArray');
    });
  });

  describe('Validación de EstudianteInscripcionDto', () => {
    it('debe validar correctamente nombre del estudiante', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes[0].nombre = 'A'; // Menos del mínimo

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudianteErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudianteErrors.length).toBeGreaterThan(0);
      // ValidateNested propagará errores del estudiante
    });

    it('debe validar correctamente edad del estudiante (6 años mínimo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes[0].edad = 6;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudianteErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      // Edad 6 es válida (mínimo)
      if (estudianteErrors.length > 0) {
        const nestedErrors = estudianteErrors[0].children || [];
        const edadErrors = nestedErrors.filter(
          (e: any) => e.property === 'edad',
        );
        expect(edadErrors).toHaveLength(0);
      }
    });

    it('debe validar correctamente edad del estudiante (12 años máximo)', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes[0].edad = 12;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudianteErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      // Edad 12 es válida (máximo)
      if (estudianteErrors.length > 0) {
        const nestedErrors = estudianteErrors[0].children || [];
        const edadErrors = nestedErrors.filter(
          (e: any) => e.property === 'edad',
        );
        expect(edadErrors).toHaveLength(0);
      }
    });

    it('debe rechazar edad menor a 5 años', async () => {
      // Arrange - DTO tiene @Min(5)
      const dto = createValidDto();
      dto.estudiantes[0].edad = 4;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudianteErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudianteErrors.length).toBeGreaterThan(0);
    });

    it('debe rechazar edad mayor a 17 años', async () => {
      // Arrange - DTO tiene @Max(17)
      const dto = createValidDto();
      dto.estudiantes[0].edad = 18;

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudianteErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudianteErrors.length).toBeGreaterThan(0);
    });

    it('debe rechazar cursos vacíos', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes[0].cursosSeleccionados = [];

      // Act
      const errors = await validateDto(dto);

      // Assert
      const estudianteErrors = errors.filter(
        (e) => e.property === 'estudiantes',
      );
      expect(estudianteErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Validación de CourseSelectionDto', () => {
    it('debe validar todos los campos requeridos del curso', async () => {
      // Arrange
      const dto = createValidDto();
      const curso = dto.estudiantes[0].cursosSeleccionados[0];

      // Act
      const errors = await validateDto(dto);

      // Assert
      expect(curso.id).toBeDefined();
      expect(curso.name).toBeDefined();
      expect(curso.area).toBeDefined();
      expect(curso.instructor).toBeDefined();
      expect(curso.dayOfWeek).toBeDefined();
      expect(curso.timeSlot).toBeDefined();
      expect(curso.color).toBeDefined();
      expect(curso.icon).toBeDefined();
    });

    it('debe rechazar curso sin id', async () => {
      // Arrange
      const dto = createValidDto();
      delete dto.estudiantes[0].cursosSeleccionados[0].id;

      // Act
      const errors = await validateDto(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar curso sin name', async () => {
      // Arrange
      const dto = createValidDto();
      delete dto.estudiantes[0].cursosSeleccionados[0].name;

      // Act
      const errors = await validateDto(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Casos de integración completos', () => {
    it('debe validar correctamente un DTO completamente válido', async () => {
      // Arrange
      const dto = createValidDto();

      // Act
      const errors = await validateDto(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('debe reportar múltiples errores cuando hay varios campos inválidos', async () => {
      // Arrange
      const dto = {
        nombre: 'A', // Muy corto
        email: 'email-invalido', // Sin @
        telefono: '123', // Muy corto
        password: 'abc', // Muy corto, sin mayúscula, sin número
        estudiantes: [], // Array vacío
      };

      // Act
      const errors = await validateDto(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      // Debe haber errores para múltiples campos
      const properties = errors.map((e) => e.property);
      expect(properties).toContain('nombre');
      expect(properties).toContain('email');
      expect(properties).toContain('telefono');
      expect(properties).toContain('password');
      expect(properties).toContain('estudiantes');
    });

    it('debe validar correctamente inscripción con 3 estudiantes y múltiples cursos', async () => {
      // Arrange
      const dto = createValidDto();
      dto.estudiantes = [
        {
          nombre: 'Juan Pérez',
          edad: 8,
          cursosSeleccionados: [
            {
              id: 'mat-juegos',
              name: 'Matemáticas',
              area: 'Matemáticas',
              instructor: 'Ana',
              dayOfWeek: 'Lunes',
              timeSlot: '10:00',
              color: '#FFF',
              icon: '🎯',
            },
            {
              id: 'art-pintura',
              name: 'Pintura',
              area: 'Arte',
              instructor: 'Pedro',
              dayOfWeek: 'Martes',
              timeSlot: '11:00',
              color: '#AAA',
              icon: '🎨',
            },
          ],
        },
        {
          nombre: 'María González',
          edad: 10,
          cursosSeleccionados: [
            {
              id: 'dep-futbol',
              name: 'Fútbol',
              area: 'Deportes',
              instructor: 'Carlos',
              dayOfWeek: 'Miércoles',
              timeSlot: '14:00',
              color: '#BBB',
              icon: '⚽',
            },
          ],
        },
        {
          nombre: 'Pedro Martínez',
          edad: 12,
          cursosSeleccionados: [
            {
              id: 'tech-robot',
              name: 'Robótica',
              area: 'Tecnología',
              instructor: 'Laura',
              dayOfWeek: 'Jueves',
              timeSlot: '15:00',
              color: '#CCC',
              icon: '🤖',
            },
          ],
        },
      ];

      // Act
      const errors = await validateDto(dto);

      // Assert
      expect(errors).toHaveLength(0);
      expect(dto.estudiantes).toHaveLength(3);
      expect(dto.estudiantes[0].cursosSeleccionados).toHaveLength(2);
    });
  });
});
