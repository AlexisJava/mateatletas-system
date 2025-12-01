import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EditorService } from '../editor.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { CatalogoService } from '../../catalogo/catalogo.service';
import { ValidarSemanaService } from '../../services/semanas/validar-semana.service';
import { GuardarSemanaDto } from '../dto/guardar-semana.dto';
import {
  CasaTipo,
  EstadoSemanaStudio,
  CategoriaComponente,
} from '@prisma/client';

describe('EditorService', () => {
  let service: EditorService;
  let prisma: jest.Mocked<PrismaService>;
  let catalogoService: jest.Mocked<CatalogoService>;
  let validarSemanaService: jest.Mocked<ValidarSemanaService>;

  const mockCurso = {
    id: 'curso-1',
    nombre: 'Curso Test',
    casa: CasaTipo.VERTEX,
  };

  const mockSemana = {
    id: 'semana-1',
    curso_id: 'curso-1',
    numero: 1,
    nombre: 'Semana Test',
    descripcion: 'Descripción test',
    estado: EstadoSemanaStudio.VACIA,
    contenido: null,
    creado_en: new Date(),
    actualizado_en: new Date(),
    curso: mockCurso,
  };

  const mockSemanaConContenido = {
    ...mockSemana,
    contenido: {
      numero: 1,
      nombre: 'Semana Test',
      descripcion: 'Descripción',
      objetivosAprendizaje: ['Objetivo 1'],
      actividades: [
        {
          numero: 1,
          nombre: 'Actividad 1',
          descripcion: 'Desc',
          duracionMinutos: 15,
          objetivos: ['Obj'],
          prerrequisitos: null,
          bloques: [
            {
              orden: 1,
              componente: 'TextBlock',
              titulo: 'Intro',
              contenido: {},
            },
            {
              orden: 2,
              componente: 'Quiz',
              titulo: 'Evaluación',
              contenido: {},
            },
          ],
          gamificacion: { xpCompletar: 10, xpBonusSinErrores: 5, badge: null },
          notasDocente: null,
        },
      ],
      recursos: [],
      resumenGamificacion: {
        xpTotalSemana: 15,
        xpBonusPosible: 5,
        badgesPosibles: [],
      },
    },
  };

  const mockComponentes = [
    {
      id: '1',
      tipo: 'TextBlock',
      nombre: 'Texto',
      categoria: CategoriaComponente.CONTENIDO,
      habilitado: true,
      implementado: true,
    },
    {
      id: '2',
      tipo: 'Quiz',
      nombre: 'Quiz',
      categoria: CategoriaComponente.INTERACTIVO,
      habilitado: true,
      implementado: true,
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      semanaStudio: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockCatalogoService = {
      listarHabilitados: jest.fn().mockResolvedValue(mockComponentes),
    };

    const mockValidarSemanaService = {
      ejecutar: jest.fn().mockResolvedValue({
        valido: true,
        errores: [],
        warnings: [],
        info: [],
      }),
      clearCache: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CatalogoService, useValue: mockCatalogoService },
        { provide: ValidarSemanaService, useValue: mockValidarSemanaService },
      ],
    }).compile();

    service = module.get<EditorService>(EditorService);
    prisma = module.get(PrismaService);
    catalogoService = module.get(CatalogoService);
    validarSemanaService = module.get(ValidarSemanaService);
  });

  it('should_be_defined', () => {
    expect(service).toBeDefined();
  });

  describe('cargarSemana', () => {
    it('should_return_semana_with_metadata_and_componentes_when_exists', async () => {
      prisma.semanaStudio.findUnique.mockResolvedValue(mockSemanaConContenido);

      const result = await service.cargarSemana('curso-1', 1);

      expect(result.semana).toEqual(mockSemanaConContenido);
      expect(result.metadata.titulo).toBe('Semana Test');
      expect(result.componentesDisponibles).toContain('TextBlock');
      expect(result.componentesDisponibles).toContain('Quiz');
    });

    it('should_return_empty_bloques_when_semana_has_no_content', async () => {
      prisma.semanaStudio.findUnique.mockResolvedValue(mockSemana);

      const result = await service.cargarSemana('curso-1', 1);

      expect(result.bloques).toHaveLength(0);
      expect(result.metadata.titulo).toBe('');
    });

    it('should_throw_NotFoundException_when_semana_not_found', async () => {
      prisma.semanaStudio.findUnique.mockResolvedValue(null);

      await expect(service.cargarSemana('curso-1', 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('guardarSemana', () => {
    const guardarDto: GuardarSemanaDto = {
      metadata: {
        titulo: 'Nueva Semana',
        descripcion: 'Descripción nueva',
        objetivos: ['Objetivo nuevo'],
      },
      bloques: [
        {
          id: 'b1',
          orden: 1,
          componente: 'TextBlock',
          titulo: 'Intro',
          contenido: {},
        },
        {
          id: 'b2',
          orden: 2,
          componente: 'Quiz',
          titulo: 'Quiz',
          contenido: {},
        },
      ],
    };

    it('should_save_and_return_updated_semana_when_valid', async () => {
      prisma.semanaStudio.findUnique.mockResolvedValue(mockSemana);
      prisma.semanaStudio.update.mockResolvedValue({
        ...mockSemana,
        nombre: 'Nueva Semana',
        estado: EstadoSemanaStudio.COMPLETA,
      });

      const result = await service.guardarSemana('curso-1', 1, guardarDto);

      expect(prisma.semanaStudio.update).toHaveBeenCalled();
      expect(result.metadata.titulo).toBe('Nueva Semana');
      expect(validarSemanaService.ejecutar).toHaveBeenCalled();
    });

    it('should_throw_NotFoundException_when_semana_not_found', async () => {
      prisma.semanaStudio.findUnique.mockResolvedValue(null);

      await expect(
        service.guardarSemana('curso-1', 99, guardarDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_error_when_validation_fails', async () => {
      prisma.semanaStudio.findUnique.mockResolvedValue(mockSemana);
      validarSemanaService.ejecutar.mockResolvedValue({
        valido: false,
        errores: [
          { tipo: 'error', ubicacion: 'test', mensaje: 'Error de validación' },
        ],
        warnings: [],
        info: [],
      });

      await expect(
        service.guardarSemana('curso-1', 1, guardarDto),
      ).rejects.toThrow('Validación fallida');
    });

    it('should_throw_error_when_componente_not_habilitado', async () => {
      const dtoConComponenteInvalido: GuardarSemanaDto = {
        ...guardarDto,
        bloques: [
          {
            id: 'b1',
            orden: 1,
            componente: 'ComponenteNoExiste',
            titulo: 'Test',
            contenido: {},
          },
          {
            id: 'b2',
            orden: 2,
            componente: 'TextBlock',
            titulo: 'Test2',
            contenido: {},
          },
        ],
      };

      prisma.semanaStudio.findUnique.mockResolvedValue(mockSemana);
      validarSemanaService.ejecutar.mockResolvedValue({
        valido: false,
        errores: [
          {
            tipo: 'error',
            ubicacion: 'bloque',
            mensaje: 'Componente no habilitado',
          },
        ],
        warnings: [],
        info: [],
      });

      await expect(
        service.guardarSemana('curso-1', 1, dtoConComponenteInvalido),
      ).rejects.toThrow('Validación fallida');
    });
  });

  describe('validarSinGuardar', () => {
    const validarDto: GuardarSemanaDto = {
      metadata: {
        titulo: 'Test',
        descripcion: 'Test desc',
      },
      bloques: [
        {
          id: 'b1',
          orden: 1,
          componente: 'TextBlock',
          titulo: 'Intro',
          contenido: {},
        },
        {
          id: 'b2',
          orden: 2,
          componente: 'Quiz',
          titulo: 'Quiz',
          contenido: {},
        },
      ],
    };

    it('should_return_valid_true_when_data_is_correct', async () => {
      validarSemanaService.ejecutar.mockResolvedValue({
        valido: true,
        errores: [],
        warnings: [],
        info: [],
      });

      const result = await service.validarSinGuardar(validarDto);

      expect(result.valido).toBe(true);
      expect(result.errores).toHaveLength(0);
      expect(validarSemanaService.clearCache).toHaveBeenCalled();
    });

    it('should_return_errors_when_validation_fails', async () => {
      validarSemanaService.ejecutar.mockResolvedValue({
        valido: false,
        errores: [
          { tipo: 'error', ubicacion: 'bloque', mensaje: 'Error 1' },
          { tipo: 'error', ubicacion: 'bloque2', mensaje: 'Error 2' },
        ],
        warnings: [],
        info: [],
      });

      const result = await service.validarSinGuardar(validarDto);

      expect(result.valido).toBe(false);
      expect(result.errores).toContain('Error 1');
      expect(result.errores).toContain('Error 2');
    });
  });
});
