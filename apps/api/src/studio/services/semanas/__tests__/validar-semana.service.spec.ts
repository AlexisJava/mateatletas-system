import { Test, TestingModule } from '@nestjs/testing';
import {
  ValidarSemanaService,
  ValidacionContexto,
} from '../validar-semana.service';
import { CatalogoService } from '../../../catalogo/catalogo.service';
import { CasaTipo, CategoriaComponente } from '@prisma/client';
import {
  SemanaContenidoJson,
  ActividadJson,
  BloqueJson,
} from '../../../interfaces';

describe('ValidarSemanaService', () => {
  let service: ValidarSemanaService;
  let catalogoService: jest.Mocked<CatalogoService>;

  // Componentes habilitados mock (simula la BD)
  const componentesHabilitadosMock = [
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
    {
      id: '3',
      tipo: 'DragDrop',
      nombre: 'Drag Drop',
      categoria: CategoriaComponente.INTERACTIVO,
      habilitado: true,
      implementado: true,
    },
    {
      id: '4',
      tipo: 'MultipleChoice',
      nombre: 'Opción Múltiple',
      categoria: CategoriaComponente.INTERACTIVO,
      habilitado: true,
      implementado: true,
    },
  ];

  // Factory para crear contenido de semana válido
  const crearSemanaValidaMock = (
    overrides: Partial<SemanaContenidoJson> = {},
  ): SemanaContenidoJson => ({
    numero: overrides.numero ?? 1,
    nombre: overrides.nombre ?? 'Semana de Introducción',
    descripcion: overrides.descripcion ?? 'Primera semana del curso',
    objetivosAprendizaje: overrides.objetivosAprendizaje ?? ['Objetivo 1'],
    actividades: overrides.actividades ?? [crearActividadValidaMock()],
    recursos: overrides.recursos ?? [],
    resumenGamificacion: overrides.resumenGamificacion ?? {
      xpTotalSemana: 100,
      xpBonusPosible: 20,
      badgesPosibles: [],
    },
  });

  // Factory para crear actividad válida
  const crearActividadValidaMock = (
    overrides: Partial<ActividadJson> = {},
  ): ActividadJson => ({
    numero: overrides.numero ?? 1,
    nombre: overrides.nombre ?? 'Actividad de Prueba',
    descripcion: overrides.descripcion ?? 'Descripción de la actividad',
    duracionMinutos: overrides.duracionMinutos ?? 15,
    objetivos: overrides.objetivos ?? ['Objetivo'],
    prerrequisitos: overrides.prerrequisitos ?? null,
    bloques: overrides.bloques ?? [
      crearBloqueValidoMock({ orden: 1 }),
      crearBloqueValidoMock({ orden: 2, componente: 'Quiz' }),
    ],
    gamificacion: overrides.gamificacion ?? {
      xpCompletar: 10,
      xpBonusSinErrores: 5,
      badge: null,
    },
    notasDocente: overrides.notasDocente ?? null,
  });

  // Factory para crear bloque válido
  const crearBloqueValidoMock = (
    overrides: Partial<BloqueJson> = {},
  ): BloqueJson => ({
    orden: overrides.orden ?? 1,
    componente: overrides.componente ?? 'TextBlock',
    titulo: overrides.titulo ?? 'Título del bloque',
    contenido: overrides.contenido ?? {},
    minimoParaAprobar: overrides.minimoParaAprobar,
    repasoSiFalla: overrides.repasoSiFalla,
  });

  // Contexto de validación por defecto
  const contextoDefault: ValidacionContexto = {
    casa: CasaTipo.VERTEX,
    numeroSemanaEsperado: 1,
    actividadesEsperadas: 1,
  };

  beforeEach(async () => {
    const mockCatalogoService = {
      listarHabilitados: jest
        .fn()
        .mockResolvedValue(componentesHabilitadosMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidarSemanaService,
        { provide: CatalogoService, useValue: mockCatalogoService },
      ],
    }).compile();

    service = module.get<ValidarSemanaService>(ValidarSemanaService);
    catalogoService = module.get(CatalogoService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutar', () => {
    describe('happy path', () => {
      it('debe retornar valido=true cuando el contenido cumple todas las reglas', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock();

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(true);
        expect(result.errores).toHaveLength(0);
      });

      it('debe incluir info de resumen con cantidad de actividades validadas', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock(),
            crearActividadValidaMock({ numero: 2 }),
          ],
        });
        const contexto = { ...contextoDefault, actividadesEsperadas: 2 };

        // Act
        const result = await service.ejecutar(contenido, contexto);

        // Assert
        expect(result.info.length).toBeGreaterThan(0);
        expect(result.info[0].mensaje).toContain('2 actividades');
      });
    });

    describe('validación de campos requeridos de semana', () => {
      it('debe agregar error cuando falta nombre', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({ nombre: '' });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.nombre',
            mensaje: expect.stringContaining('requerido'),
          }),
        );
      });

      it('debe agregar error cuando falta descripcion', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({ descripcion: '' });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.descripcion',
            mensaje: expect.stringContaining('requerida'),
          }),
        );
      });

      it('debe agregar error cuando objetivosAprendizaje está vacío', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({ objetivosAprendizaje: [] });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.objetivosAprendizaje',
            mensaje: expect.stringContaining('al menos un objetivo'),
          }),
        );
      });

      it('debe agregar error cuando actividades está vacío', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({ actividades: [] });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.actividades',
            mensaje: expect.stringContaining('al menos una actividad'),
          }),
        );
      });
    });

    describe('validación de número de semana', () => {
      it('debe agregar error cuando número de semana no coincide con el esperado', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({ numero: 3 });
        const contexto = { ...contextoDefault, numeroSemanaEsperado: 1 };

        // Act
        const result = await service.ejecutar(contenido, contexto);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.numero',
            mensaje: expect.stringContaining('no coincide'),
          }),
        );
      });

      it('debe incluir sugerencia en el mensaje de error de número', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({ numero: 5 });
        const contexto = { ...contextoDefault, numeroSemanaEsperado: 2 };

        // Act
        const result = await service.ejecutar(contenido, contexto);

        // Assert
        const errorNumero = result.errores.find(
          (e) => e.ubicacion === 'semana.numero',
        );
        expect(errorNumero?.sugerencia).toBeDefined();
        expect(errorNumero?.sugerencia).toContain('2');
      });
    });

    describe('validación de cantidad de actividades', () => {
      it('debe agregar warning cuando hay menos actividades de las esperadas', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [crearActividadValidaMock()],
        });
        const contexto = { ...contextoDefault, actividadesEsperadas: 3 };

        // Act
        const result = await service.ejecutar(contenido, contexto);

        // Assert
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.actividades',
            mensaje: expect.stringContaining('Se esperaban 3'),
          }),
        );
      });

      it('debe agregar warning cuando hay más actividades de las esperadas', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock(),
            crearActividadValidaMock({ numero: 2 }),
            crearActividadValidaMock({ numero: 3 }),
          ],
        });
        const contexto = { ...contextoDefault, actividadesEsperadas: 1 };

        // Act
        const result = await service.ejecutar(contenido, contexto);

        // Assert
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            ubicacion: 'semana.actividades',
            mensaje: expect.stringContaining('más actividades'),
          }),
        );
      });
    });

    describe('validación de actividades', () => {
      it('debe agregar error cuando falta nombre de actividad', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [crearActividadValidaMock({ nombre: '' })],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'actividad_1.nombre',
            mensaje: expect.stringContaining('requerido'),
          }),
        );
      });

      it('debe agregar error cuando duracionMinutos es menor a 5', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [crearActividadValidaMock({ duracionMinutos: 3 })],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'actividad_1.duracionMinutos',
            mensaje: expect.stringContaining('entre 5 y 60'),
          }),
        );
      });

      it('debe agregar error cuando duracionMinutos es mayor a 60', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [crearActividadValidaMock({ duracionMinutos: 90 })],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'actividad_1.duracionMinutos',
          }),
        );
      });

      it('debe agregar error cuando actividad tiene menos de 2 bloques', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [crearBloqueValidoMock()],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'actividad_1.bloques',
            mensaje: expect.stringContaining('al menos 2 bloques'),
          }),
        );
      });

      it('debe agregar error cuando actividad tiene más de 10 bloques', async () => {
        // Arrange
        const bloques = Array.from({ length: 11 }, (_, i) =>
          crearBloqueValidoMock({ orden: i + 1 }),
        );
        const contenido = crearSemanaValidaMock({
          actividades: [crearActividadValidaMock({ bloques })],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'actividad_1.bloques',
            mensaje: expect.stringContaining('más de 10 bloques'),
          }),
        );
      });

      it('debe agregar error cuando falta configuración de gamificacion', async () => {
        // Arrange
        const actividadSinGamificacion = crearActividadValidaMock();
        // @ts-expect-error - Forzando undefined para test
        actividadSinGamificacion.gamificacion = undefined;
        const contenido = crearSemanaValidaMock({
          actividades: [actividadSinGamificacion],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: 'actividad_1.gamificacion',
            mensaje: expect.stringContaining('requerida'),
          }),
        );
      });
    });

    describe('validación de bloques', () => {
      it('debe agregar error cuando componente no existe en el catálogo', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({
                  orden: 1,
                  componente: 'ComponenteInexistente',
                }),
                crearBloqueValidoMock({ orden: 2 }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: expect.stringContaining('componente'),
            mensaje: expect.stringContaining('no está habilitado'),
          }),
        );
      });

      it('debe agregar error cuando falta titulo del bloque', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({ orden: 1, titulo: '' }),
                crearBloqueValidoMock({ orden: 2 }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: expect.stringContaining('titulo'),
            mensaje: expect.stringContaining('requerido'),
          }),
        );
      });

      it('debe agregar warning cuando tiene minimoParaAprobar pero no repasoSiFalla', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({
                  orden: 1,
                  minimoParaAprobar: 80,
                  repasoSiFalla: undefined,
                }),
                crearBloqueValidoMock({ orden: 2 }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            mensaje: expect.stringContaining('minimoParaAprobar'),
          }),
        );
      });

      it('debe agregar error cuando minimoParaAprobar es menor a 70', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({ orden: 1, minimoParaAprobar: 50 }),
                crearBloqueValidoMock({ orden: 2 }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: expect.stringContaining('minimoParaAprobar'),
            mensaje: expect.stringContaining('entre 70 y 100'),
          }),
        );
      });

      it('debe agregar error cuando minimoParaAprobar es mayor a 100', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({ orden: 1, minimoParaAprobar: 110 }),
                crearBloqueValidoMock({ orden: 2 }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: expect.stringContaining('minimoParaAprobar'),
          }),
        );
      });
    });

    describe('validación de orden de bloques', () => {
      it('debe agregar error cuando hay órdenes duplicados', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({ orden: 1 }),
                crearBloqueValidoMock({ orden: 1, componente: 'Quiz' }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: expect.stringContaining('bloques'),
            mensaje: expect.stringContaining('únicos'),
          }),
        );
      });

      it('debe agregar error cuando órdenes no son secuenciales desde 1', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({ orden: 2 }),
                crearBloqueValidoMock({ orden: 3, componente: 'Quiz' }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            ubicacion: expect.stringContaining('bloques'),
            mensaje: expect.stringContaining('secuenciales'),
          }),
        );
      });
    });

    describe('catálogo de componentes', () => {
      it('debe aceptar componentes válidos del catálogo', async () => {
        // Arrange - usar varios componentes válidos
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({ orden: 1, componente: 'DragDrop' }),
                crearBloqueValidoMock({
                  orden: 2,
                  componente: 'MultipleChoice',
                }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(true);
        const erroresComponente = result.errores.filter((e) =>
          e.mensaje.includes('habilitado'),
        );
        expect(erroresComponente).toHaveLength(0);
      });

      it('debe rechazar componentes inexistentes', async () => {
        // Arrange
        const contenido = crearSemanaValidaMock({
          actividades: [
            crearActividadValidaMock({
              bloques: [
                crearBloqueValidoMock({
                  orden: 1,
                  componente: 'FakeComponent123',
                }),
                crearBloqueValidoMock({ orden: 2 }),
              ],
            }),
          ],
        });

        // Act
        const result = await service.ejecutar(contenido, contextoDefault);

        // Assert
        expect(result.valido).toBe(false);
        expect(result.errores).toContainEqual(
          expect.objectContaining({
            mensaje: expect.stringContaining('FakeComponent123'),
          }),
        );
      });
    });
  });
});
