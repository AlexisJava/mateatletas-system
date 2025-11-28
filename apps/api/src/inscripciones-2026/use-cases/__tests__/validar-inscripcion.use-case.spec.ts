import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidarInscripcionUseCase } from '../validar-inscripcion.use-case';
import { PricingCalculatorService } from '../../../domain/services/pricing-calculator.service';
import {
  CreateInscripcion2026Dto,
  TipoInscripcion2026,
  MundoSTEAM,
} from '../../dto/create-inscripcion-2026.dto';

describe('ValidarInscripcionUseCase', () => {
  let useCase: ValidarInscripcionUseCase;
  let mockPricingCalculator: jest.Mocked<PricingCalculatorService>;

  // Mock data
  const mockTutorData = {
    nombre: 'Juan Perez',
    email: 'juan@test.com',
    password: 'Password123!',
    telefono: '1234567890',
    dni: '12345678',
    cuil: '20-12345678-9',
  };

  const mockEstudianteColonia = {
    nombre: 'Maria Perez',
    edad: 10,
    dni: '87654321',
    cursos_seleccionados: [
      {
        course_id: 'curso-1',
        course_name: 'Robotica',
        course_area: 'Tecnologia',
        instructor: 'Prof. Ana',
        day_of_week: 'Lunes',
        time_slot: '10:00-12:00',
      },
    ],
  };

  const mockEstudianteCiclo = {
    nombre: 'Pedro Perez',
    edad: 12,
    dni: '11111111',
    mundo_seleccionado: MundoSTEAM.MATEMATICA,
  };

  const mockEstudiantePackCompleto = {
    nombre: 'Ana Perez',
    edad: 11,
    dni: '22222222',
    cursos_seleccionados: [
      {
        course_id: 'curso-2',
        course_name: 'Programacion',
        course_area: 'Tecnologia',
        instructor: 'Prof. Carlos',
        day_of_week: 'Martes',
        time_slot: '14:00-16:00',
      },
    ],
    mundo_seleccionado: MundoSTEAM.PROGRAMACION,
  };

  beforeEach(async () => {
    mockPricingCalculator = {
      calcularTarifaInscripcion: jest.fn().mockReturnValue(50000),
      calcularDescuentoInscripcion2026: jest.fn().mockReturnValue(0),
      calcularTotalInscripcion2026: jest.fn().mockReturnValue({
        total: 100000,
        descuento: 0,
      }),
      aplicarDescuento: jest.fn(),
    } as unknown as jest.Mocked<PricingCalculatorService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidarInscripcionUseCase,
        {
          provide: PricingCalculatorService,
          useValue: mockPricingCalculator,
        },
      ],
    }).compile();

    useCase = module.get<ValidarInscripcionUseCase>(ValidarInscripcionUseCase);
  });

  describe('validateInscriptionData', () => {
    describe('COLONIA validation', () => {
      it('should_validate_colonia_requires_cursos', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.COLONIA,
          tutor: mockTutorData,
          estudiantes: [
            {
              nombre: 'Test',
              edad: 10,
              dni: '12345678',
              // Sin cursos_seleccionados
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow(
          'Estudiante 1: Debe seleccionar al menos 1 curso de Colonia',
        );
      });

      it('should_validate_colonia_no_mundo_allowed', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.COLONIA,
          tutor: mockTutorData,
          estudiantes: [
            {
              ...mockEstudianteColonia,
              mundo_seleccionado: MundoSTEAM.MATEMATICA, // No permitido en Colonia
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow(
          'Estudiante 1: No debe seleccionar mundo STEAM para Colonia',
        );
      });

      it('should_pass_valid_colonia_inscription', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.COLONIA,
          tutor: mockTutorData,
          estudiantes: [mockEstudianteColonia],
        };

        // Act
        const result = useCase.execute(dto);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.inscripcionFee).toBeDefined();
      });
    });

    describe('CICLO_2026 validation', () => {
      it('should_validate_ciclo2026_requires_mundo', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.CICLO_2026,
          tutor: mockTutorData,
          estudiantes: [
            {
              nombre: 'Test',
              edad: 10,
              dni: '12345678',
              // Sin mundo_seleccionado
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow(
          'Estudiante 1: Debe seleccionar un mundo STEAM para Ciclo 2026',
        );
      });

      it('should_validate_ciclo2026_no_cursos_allowed', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.CICLO_2026,
          tutor: mockTutorData,
          estudiantes: [
            {
              ...mockEstudianteCiclo,
              cursos_seleccionados: mockEstudianteColonia.cursos_seleccionados, // No permitido
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow(
          'Estudiante 1: No debe seleccionar cursos de Colonia para Ciclo 2026',
        );
      });

      it('should_pass_valid_ciclo2026_inscription', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.CICLO_2026,
          tutor: mockTutorData,
          estudiantes: [mockEstudianteCiclo],
        };

        // Act
        const result = useCase.execute(dto);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe('PACK_COMPLETO validation', () => {
      it('should_validate_pack_completo_requires_cursos', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.PACK_COMPLETO,
          tutor: mockTutorData,
          estudiantes: [
            {
              nombre: 'Test',
              edad: 10,
              dni: '12345678',
              mundo_seleccionado: MundoSTEAM.MATEMATICA,
              // Sin cursos
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow(
          'Estudiante 1: Debe seleccionar al menos 1 curso de Colonia para Pack Completo',
        );
      });

      it('should_validate_pack_completo_requires_mundo', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.PACK_COMPLETO,
          tutor: mockTutorData,
          estudiantes: [
            {
              ...mockEstudianteColonia,
              // Sin mundo_seleccionado
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow(
          'Estudiante 1: Debe seleccionar un mundo STEAM para Pack Completo',
        );
      });

      it('should_pass_valid_pack_completo_inscription', () => {
        // Arrange
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.PACK_COMPLETO,
          tutor: mockTutorData,
          estudiantes: [mockEstudiantePackCompleto],
        };

        // Act
        const result = useCase.execute(dto);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe('multiple students validation', () => {
      it('should_validate_all_students_individually', () => {
        // Arrange - segundo estudiante inválido
        const dto: CreateInscripcion2026Dto = {
          tipo_inscripcion: TipoInscripcion2026.COLONIA,
          tutor: mockTutorData,
          estudiantes: [
            mockEstudianteColonia, // válido
            {
              nombre: 'Invalid',
              edad: 10,
              dni: '99999999',
              // Sin cursos - inválido
            },
          ],
        };

        // Act & Assert
        expect(() => useCase.execute(dto)).toThrow(BadRequestException);
        expect(() => useCase.execute(dto)).toThrow('Estudiante 2:');
      });
    });
  });

  describe('calculatePricing', () => {
    it('should_calculate_inscription_fee_for_colonia', () => {
      // Arrange
      mockPricingCalculator.calcularTarifaInscripcion.mockReturnValue(30000);

      const dto: CreateInscripcion2026Dto = {
        tipo_inscripcion: TipoInscripcion2026.COLONIA,
        tutor: mockTutorData,
        estudiantes: [mockEstudianteColonia],
      };

      // Act
      const result = useCase.execute(dto);

      // Assert
      expect(result.inscripcionFee).toBe(30000);
      expect(
        mockPricingCalculator.calcularTarifaInscripcion,
      ).toHaveBeenCalledWith('COLONIA');
    });

    it('should_calculate_inscription_fee_for_ciclo_2026', () => {
      // Arrange
      mockPricingCalculator.calcularTarifaInscripcion.mockReturnValue(50000);

      const dto: CreateInscripcion2026Dto = {
        tipo_inscripcion: TipoInscripcion2026.CICLO_2026,
        tutor: mockTutorData,
        estudiantes: [mockEstudianteCiclo],
      };

      // Act
      const result = useCase.execute(dto);

      // Assert
      expect(result.inscripcionFee).toBe(50000);
      expect(
        mockPricingCalculator.calcularTarifaInscripcion,
      ).toHaveBeenCalledWith('CICLO_2026');
    });

    it('should_calculate_monthly_total_with_sibling_discount', () => {
      // Arrange
      mockPricingCalculator.calcularTotalInscripcion2026.mockReturnValue({
        total: 176000,
        descuento: 24000, // 12% descuento hermanos
      });

      const dto: CreateInscripcion2026Dto = {
        tipo_inscripcion: TipoInscripcion2026.COLONIA,
        tutor: mockTutorData,
        estudiantes: [mockEstudianteColonia, mockEstudianteColonia], // 2 hermanos
      };

      // Act
      const result = useCase.execute(dto);

      // Assert
      expect(result.monthlyTotal).toBe(176000);
      expect(result.siblingDiscount).toBe(24000);
      expect(
        mockPricingCalculator.calcularTotalInscripcion2026,
      ).toHaveBeenCalledWith('COLONIA', 2, [1, 1]); // 2 estudiantes, 1 curso c/u
    });

    it('should_calculate_cursos_per_student_correctly', () => {
      // Arrange
      const estudianteConDosCursos = {
        ...mockEstudianteColonia,
        cursos_seleccionados: [
          ...mockEstudianteColonia.cursos_seleccionados,
          {
            course_id: 'curso-extra',
            course_name: 'Arte',
            course_area: 'Arte',
            instructor: 'Prof. Luis',
            day_of_week: 'Miercoles',
            time_slot: '10:00-12:00',
          },
        ],
      };

      const dto: CreateInscripcion2026Dto = {
        tipo_inscripcion: TipoInscripcion2026.COLONIA,
        tutor: mockTutorData,
        estudiantes: [mockEstudianteColonia, estudianteConDosCursos],
      };

      // Act
      useCase.execute(dto);

      // Assert
      expect(
        mockPricingCalculator.calcularTotalInscripcion2026,
      ).toHaveBeenCalledWith('COLONIA', 2, [1, 2]); // primer estudiante 1 curso, segundo 2 cursos
    });
  });

  describe('mapTipoToPricing', () => {
    it('should_throw_for_invalid_tipo', () => {
      // Arrange
      const dto = {
        tipo_inscripcion: 'INVALID_TYPE' as TipoInscripcion2026,
        tutor: mockTutorData,
        estudiantes: [mockEstudianteColonia],
      };

      // Act & Assert
      expect(() => useCase.execute(dto)).toThrow(BadRequestException);
      expect(() => useCase.execute(dto)).toThrow(
        'Tipo de inscripción inválido',
      );
    });
  });
});
