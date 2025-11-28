import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClaseBusinessValidator } from '../validators/clase-business.validator';
import { PrismaService } from '../../core/database/prisma.service';

describe('ClaseBusinessValidator', () => {
  let validator: ClaseBusinessValidator;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaseBusinessValidator,
        {
          provide: PrismaService,
          useValue: {
            rutaCurricular: { findUnique: jest.fn() },
            docente: { findUnique: jest.fn() },
            sector: { findUnique: jest.fn() },
            producto: { findUnique: jest.fn() },
            estudiante: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    validator = module.get<ClaseBusinessValidator>(ClaseBusinessValidator);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validarRutaCurricularExiste', () => {
    it('debe pasar si la ruta curricular existe', async () => {
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue({
        id: 'ruta-1',
        nombre: 'Álgebra',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        validator.validarRutaCurricularExiste('ruta-1'),
      ).resolves.not.toThrow();
    });

    it('debe lanzar NotFoundException si la ruta no existe', async () => {
      jest.spyOn(prisma.rutaCurricular, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarRutaCurricularExiste('ruta-inexistente'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarRutaCurricularExiste('ruta-inexistente'),
      ).rejects.toThrow(
        'Ruta curricular con ID ruta-inexistente no encontrada',
      );
    });
  });

  describe('validarDocenteExiste', () => {
    it('debe pasar si el docente existe', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        titulo: 'Matemático',
        sector_id: 'sector-1',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        validator.validarDocenteExiste('docente-1'),
      ).resolves.not.toThrow();
    });

    it('debe lanzar NotFoundException si el docente no existe', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarDocenteExiste('docente-inexistente'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarDocenteExiste('docente-inexistente'),
      ).rejects.toThrow('Docente con ID docente-inexistente no encontrado');
    });
  });

  describe('validarSectorExiste', () => {
    it('debe pasar si el sector existe', async () => {
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue({
        id: 'sector-1',
        nombre: 'Matemáticas',
        icono: '🔢',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        validator.validarSectorExiste('sector-1'),
      ).resolves.not.toThrow();
    });

    it('debe lanzar NotFoundException si el sector no existe', async () => {
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarSectorExiste('sector-inexistente'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarSectorExiste('sector-inexistente'),
      ).rejects.toThrow('Sector con ID sector-inexistente no encontrado');
    });
  });

  describe('validarProductoEsCurso', () => {
    it('debe pasar si el producto existe y es de tipo Curso', async () => {
      jest.spyOn(prisma.producto, 'findUnique').mockResolvedValue({
        id: 'producto-1',
        nombre: 'Curso de Álgebra',
        tipo: 'Curso',
        descripcion: 'Curso completo',
        precio_mensual: 1000,
        precio_anual: 10000,
        estado: 'Activo',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        validator.validarProductoEsCurso('producto-1'),
      ).resolves.not.toThrow();
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      jest.spyOn(prisma.producto, 'findUnique').mockResolvedValue(null);

      await expect(
        validator.validarProductoEsCurso('producto-inexistente'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        validator.validarProductoEsCurso('producto-inexistente'),
      ).rejects.toThrow('Producto con ID producto-inexistente no encontrado');
    });

    it('debe lanzar BadRequestException si el producto no es de tipo Curso', async () => {
      jest.spyOn(prisma.producto, 'findUnique').mockResolvedValue({
        id: 'producto-1',
        nombre: 'Suscripción Mensual',
        tipo: 'Suscripción',
        descripcion: 'Suscripción',
        precio_mensual: 500,
        precio_anual: 5000,
        estado: 'Activo',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        validator.validarProductoEsCurso('producto-1'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        validator.validarProductoEsCurso('producto-1'),
      ).rejects.toThrow('El producto asociado debe ser de tipo Curso');
    });
  });

  describe('validarFechaFutura', () => {
    it('debe pasar si la fecha es futura', () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7); // +7 días

      expect(() => validator.validarFechaFutura(fechaFutura)).not.toThrow();
    });

    it('debe lanzar BadRequestException si la fecha es pasada', () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 7); // -7 días

      expect(() => validator.validarFechaFutura(fechaPasada)).toThrow(
        BadRequestException,
      );

      expect(() => validator.validarFechaFutura(fechaPasada)).toThrow(
        'La fecha de inicio debe ser en el futuro',
      );
    });

    it('debe lanzar BadRequestException si la fecha es ahora', () => {
      const ahora = new Date();

      expect(() => validator.validarFechaFutura(ahora)).toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si la fecha es hace 1 segundo', () => {
      const haceUnSegundo = new Date();
      haceUnSegundo.setSeconds(haceUnSegundo.getSeconds() - 1);

      expect(() => validator.validarFechaFutura(haceUnSegundo)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validarClaseNoCancelada', () => {
    it('debe pasar si la clase está programada', () => {
      const clase = {
        id: 'clase-1',
        estado: 'Programada',
      } as any;

      expect(() => validator.validarClaseNoCancelada(clase)).not.toThrow();
    });

    it('debe lanzar BadRequestException si la clase está cancelada', () => {
      const clase = {
        id: 'clase-1',
        estado: 'Cancelada',
      } as any;

      expect(() => validator.validarClaseNoCancelada(clase)).toThrow(
        BadRequestException,
      );

      expect(() => validator.validarClaseNoCancelada(clase)).toThrow(
        'La clase ya está cancelada',
      );
    });
  });

  describe('validarClaseActiva', () => {
    it('debe pasar si la clase está programada', () => {
      const clase = {
        id: 'clase-1',
        estado: 'Programada',
      } as any;

      expect(() => validator.validarClaseActiva(clase)).not.toThrow();
    });

    it('debe lanzar BadRequestException si la clase está cancelada', () => {
      const clase = {
        id: 'clase-1',
        estado: 'Cancelada',
      } as any;

      expect(() => validator.validarClaseActiva(clase)).toThrow(
        BadRequestException,
      );

      expect(() => validator.validarClaseActiva(clase)).toThrow(
        'No se pueden realizar operaciones en una clase cancelada',
      );
    });
  });

  describe('validarPermisosCancelacion', () => {
    const clase = {
      id: 'clase-1',
      docente_id: 'docente-1',
    } as any;

    it('debe permitir cancelación si el usuario es admin', () => {
      expect(() =>
        validator.validarPermisosCancelacion(clase, 'cualquier-id', 'admin'),
      ).not.toThrow();
    });

    it('debe permitir cancelación si el usuario es el docente propietario', () => {
      expect(() =>
        validator.validarPermisosCancelacion(clase, 'docente-1', 'docente'),
      ).not.toThrow();
    });

    it('debe denegar cancelación si el usuario es otro docente', () => {
      expect(() =>
        validator.validarPermisosCancelacion(clase, 'docente-2', 'docente'),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validarPermisosCancelacion(clase, 'docente-2', 'docente'),
      ).toThrow('No tienes permiso para cancelar esta clase');
    });

    it('debe denegar cancelación si el usuario es tutor', () => {
      expect(() =>
        validator.validarPermisosCancelacion(clase, 'tutor-1', 'tutor'),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validarPermisosCancelacion(clase, 'tutor-1', 'tutor'),
      ).toThrow('Solo admin y docentes pueden cancelar clases');
    });

    it('debe denegar cancelación si el usuario es estudiante', () => {
      expect(() =>
        validator.validarPermisosCancelacion(
          clase,
          'estudiante-1',
          'estudiante',
        ),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validarPermisosCancelacion(
          clase,
          'estudiante-1',
          'estudiante',
        ),
      ).toThrow('Solo admin y docentes pueden cancelar clases');
    });

    it('debe denegar cancelación para cualquier otro rol no reconocido', () => {
      expect(() =>
        validator.validarPermisosCancelacion(clase, 'user-1', 'invitado'),
      ).toThrow(ForbiddenException);
    });
  });

  describe('validarCuposDisponibles', () => {
    it('debe pasar si hay cupos suficientes', () => {
      const clase = {
        id: 'clase-1',
        cupos_maximo: 10,
        cupos_ocupados: 5,
      } as any;

      expect(() => validator.validarCuposDisponibles(clase, 3)).not.toThrow();
    });

    it('debe pasar si se asignan exactamente los cupos disponibles', () => {
      const clase = {
        id: 'clase-1',
        cupos_maximo: 10,
        cupos_ocupados: 5,
      } as any;

      expect(() => validator.validarCuposDisponibles(clase, 5)).not.toThrow();
    });

    it('debe lanzar BadRequestException si no hay cupos suficientes', () => {
      const clase = {
        id: 'clase-1',
        cupos_maximo: 10,
        cupos_ocupados: 8,
      } as any;

      expect(() => validator.validarCuposDisponibles(clase, 5)).toThrow(
        BadRequestException,
      );

      expect(() => validator.validarCuposDisponibles(clase, 5)).toThrow(
        'No hay suficientes cupos disponibles. Cupos disponibles: 2, intentando asignar: 5',
      );
    });

    it('debe lanzar BadRequestException si la clase está llena', () => {
      const clase = {
        id: 'clase-1',
        cupos_maximo: 10,
        cupos_ocupados: 10,
      } as any;

      expect(() => validator.validarCuposDisponibles(clase, 1)).toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si se intenta asignar más de los cupos máximos', () => {
      const clase = {
        id: 'clase-1',
        cupos_maximo: 10,
        cupos_ocupados: 0,
      } as any;

      expect(() => validator.validarCuposDisponibles(clase, 15)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validarEstudiantesExisten', () => {
    it('debe retornar estudiantes si todos existen', async () => {
      const estudiantes = [
        {
          id: 'est-1',
          nombre: 'María',
          apellido: 'García',
          nivelEscolar: 'Primaria',
          tutor_id: 'tutor-1',
          avatar_gradient: 'gradient-1',
          created_at: new Date(),
          updated_at: new Date(),
          tutor: {
            id: 'tutor-1',
            nombre: 'Tutor',
            apellido: 'Test',
            email: 'tutor@test.com',
            password: 'hash',
            telefono: '123456',
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        {
          id: 'est-2',
          nombre: 'Pedro',
          apellido: 'López',
          nivelEscolar: 'Secundaria',
          tutor_id: 'tutor-1',
          avatar_gradient: 'gradient-2',
          created_at: new Date(),
          updated_at: new Date(),
          tutor: {
            id: 'tutor-1',
            nombre: 'Tutor',
            apellido: 'Test',
            email: 'tutor@test.com',
            password: 'hash',
            telefono: '123456',
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];

      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue(estudiantes);

      const resultado = await validator.validarEstudiantesExisten([
        'est-1',
        'est-2',
      ]);

      expect(resultado).toEqual(estudiantes);
      expect(resultado).toHaveLength(2);
    });

    it('debe lanzar BadRequestException si falta algún estudiante', async () => {
      // Solo encuentra 1 de 2
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([
        {
          id: 'est-1',
          nombre: 'María',
          apellido: 'García',
          nivelEscolar: 'Primaria',
          tutor_id: 'tutor-1',
          avatar_gradient: 'gradient-1',
          created_at: new Date(),
          updated_at: new Date(),
          tutor: {
            id: 'tutor-1',
            nombre: 'Tutor',
            apellido: 'Test',
            email: 'tutor@test.com',
            password: 'hash',
            telefono: '123456',
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ]);

      await expect(
        validator.validarEstudiantesExisten(['est-1', 'est-2']),
      ).rejects.toThrow(BadRequestException);

      await expect(
        validator.validarEstudiantesExisten(['est-1', 'est-2']),
      ).rejects.toThrow('Uno o más estudiantes no fueron encontrados');
    });

    it('debe lanzar BadRequestException si no encuentra ningún estudiante', async () => {
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);

      await expect(
        validator.validarEstudiantesExisten(['est-inexistente']),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validarEstudiantesNoInscritos', () => {
    it('debe pasar si ningún estudiante está inscrito', () => {
      const clase = {
        id: 'clase-1',
        inscripciones: [{ estudiante_id: 'est-1' }, { estudiante_id: 'est-2' }],
      } as any;

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, ['est-3', 'est-4']),
      ).not.toThrow();
    });

    it('debe pasar si la clase no tiene inscripciones', () => {
      const clase = {
        id: 'clase-1',
        inscripciones: [],
      } as any;

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, ['est-1', 'est-2']),
      ).not.toThrow();
    });

    it('debe lanzar BadRequestException si algún estudiante ya está inscrito', () => {
      const clase = {
        id: 'clase-1',
        inscripciones: [{ estudiante_id: 'est-1' }, { estudiante_id: 'est-2' }],
      } as any;

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, ['est-2', 'est-3']),
      ).toThrow(BadRequestException);

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, ['est-2', 'est-3']),
      ).toThrow('Los siguientes estudiantes ya están inscritos: est-2');
    });

    it('debe lanzar BadRequestException si múltiples estudiantes están inscritos', () => {
      const clase = {
        id: 'clase-1',
        inscripciones: [
          { estudiante_id: 'est-1' },
          { estudiante_id: 'est-2' },
          { estudiante_id: 'est-3' },
        ],
      } as any;

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, [
          'est-1',
          'est-2',
          'est-4',
        ]),
      ).toThrow(BadRequestException);

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, [
          'est-1',
          'est-2',
          'est-4',
        ]),
      ).toThrow('Los siguientes estudiantes ya están inscritos: est-1, est-2');
    });

    it('debe lanzar BadRequestException si todos los estudiantes están inscritos', () => {
      const clase = {
        id: 'clase-1',
        inscripciones: [{ estudiante_id: 'est-1' }, { estudiante_id: 'est-2' }],
      } as any;

      expect(() =>
        validator.validarEstudiantesNoInscritos(clase, ['est-1', 'est-2']),
      ).toThrow(BadRequestException);
    });
  });
});
