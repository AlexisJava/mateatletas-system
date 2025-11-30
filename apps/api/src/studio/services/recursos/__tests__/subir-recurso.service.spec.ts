import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubirRecursoService } from '../subir-recurso.service';
import { PrismaService } from '../../../../core/database/prisma.service';
import { TipoRecursoStudio } from '../../../interfaces';
import { SubirRecursoDto } from '../../../dto/subir-recurso.dto';

describe('SubirRecursoService', () => {
  let service: SubirRecursoService;
  let prisma: jest.Mocked<PrismaService>;

  // Factory para crear archivos mock de Multer
  const crearFileMock = (
    overrides: Partial<{
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }> = {},
  ): Express.Multer.File =>
    ({
      originalname: 'test-image.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('contenido-test'),
      ...overrides,
    }) as Express.Multer.File;

  // Factory para crear DTOs
  const crearDtoMock = (
    overrides: Partial<SubirRecursoDto> = {},
  ): SubirRecursoDto => ({
    cursoId: 'curso-123',
    tipo: TipoRecursoStudio.IMAGEN,
    ...overrides,
  });

  // Factory para crear recursos de BD
  const crearRecursoBdMock = (
    overrides: Partial<{
      id: string;
      curso_id: string;
      tipo: string;
      nombre: string;
      archivo: string;
      tamanio_bytes: number;
      created_at: Date;
      updated_at: Date;
    }> = {},
  ) => ({
    id: 'recurso-generado-123',
    curso_id: 'curso-123',
    tipo: 'IMAGEN',
    nombre: 'test-image.png',
    archivo: '/uploads/cursos/curso-123/imagenes/test-image_123456_abc123.png',
    tamanio_bytes: 1024,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    ...overrides,
  });

  beforeEach(async () => {
    const mockPrisma = {
      cursoStudio: {
        count: jest.fn(),
      },
      recursoStudio: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubirRecursoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubirRecursoService>(SubirRecursoService);
    prisma = module.get(PrismaService);
  });

  describe('ejecutar - Happy path', () => {
    it('debe subir una imagen válida (png) y retornar el recurso creado', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.IMAGEN });
      const file = crearFileMock({
        originalname: 'mi-imagen.png',
        mimetype: 'image/png',
        size: 2048,
      });
      const recursoBd = crearRecursoBdMock({
        nombre: 'mi-imagen.png',
        tamanio_bytes: 2048,
      });

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      const resultado = await service.ejecutar(dto, file);

      // Assert
      expect(resultado).toEqual({
        id: recursoBd.id,
        nombre: recursoBd.nombre,
        archivo: recursoBd.archivo,
        tipo: recursoBd.tipo,
        tamanioBytes: recursoBd.tamanio_bytes,
      });
    });

    it('debe subir un audio válido (mp3/mpeg) con carpeta audios', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.AUDIO });
      const file = crearFileMock({
        originalname: 'sonido.mp3',
        mimetype: 'audio/mpeg',
        size: 5000000,
      });
      const recursoBd = crearRecursoBdMock({
        tipo: 'AUDIO',
        nombre: 'sonido.mp3',
      });

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      await service.ejecutar(dto, file);

      // Assert
      expect(prisma.recursoStudio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: TipoRecursoStudio.AUDIO,
          }),
        }),
      );
      const createCall = prisma.recursoStudio.create.mock.calls[0][0];
      expect(createCall.data.archivo).toContain('/audios/');
    });

    it('debe subir un video válido (mp4) con carpeta videos', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.VIDEO });
      const file = crearFileMock({
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 50000000,
      });
      const recursoBd = crearRecursoBdMock({
        tipo: 'VIDEO',
        nombre: 'video.mp4',
      });

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      await service.ejecutar(dto, file);

      // Assert
      const createCall = prisma.recursoStudio.create.mock.calls[0][0];
      expect(createCall.data.archivo).toContain('/videos/');
    });

    it('debe subir un documento válido (pdf) con carpeta documentos', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.DOCUMENTO });
      const file = crearFileMock({
        originalname: 'manual.pdf',
        mimetype: 'application/pdf',
        size: 1000000,
      });
      const recursoBd = crearRecursoBdMock({
        tipo: 'DOCUMENTO',
        nombre: 'manual.pdf',
      });

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      await service.ejecutar(dto, file);

      // Assert
      const createCall = prisma.recursoStudio.create.mock.calls[0][0];
      expect(createCall.data.archivo).toContain('/documentos/');
    });
  });

  describe('ejecutar - Validación de curso', () => {
    it('debe lanzar NotFoundException cuando el curso no existe', async () => {
      // Arrange
      const cursoIdInexistente = 'curso-inexistente-999';
      const dto = crearDtoMock({ cursoId: cursoIdInexistente });
      const file = crearFileMock();

      prisma.cursoStudio.count.mockResolvedValue(0);

      // Act & Assert
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        `Curso con ID ${cursoIdInexistente} no encontrado`,
      );
    });
  });

  describe('ejecutar - Validación de formato', () => {
    it('debe lanzar BadRequestException para imagen con formato inválido (gif)', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.IMAGEN });
      const file = crearFileMock({
        originalname: 'animacion.gif',
        mimetype: 'image/gif',
      });

      prisma.cursoStudio.count.mockResolvedValue(1);

      // Act & Assert
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        /Formato no válido para IMAGEN/,
      );
    });

    it('debe lanzar BadRequestException para audio con formato inválido (flac)', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.AUDIO });
      const file = crearFileMock({
        originalname: 'musica.flac',
        mimetype: 'audio/flac',
      });

      prisma.cursoStudio.count.mockResolvedValue(1);

      // Act & Assert
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        /Formato no válido para AUDIO/,
      );
    });

    it('debe lanzar BadRequestException para documento con formato inválido (docx)', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.DOCUMENTO });
      const file = crearFileMock({
        originalname: 'documento.docx',
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      prisma.cursoStudio.count.mockResolvedValue(1);

      // Act & Assert
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        /Formato no válido para DOCUMENTO/,
      );
    });
  });

  describe('ejecutar - Validación de tamaño', () => {
    it('debe lanzar BadRequestException cuando imagen excede 5MB', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.IMAGEN });
      const tamañoExcedido = 6 * 1024 * 1024; // 6 MB
      const file = crearFileMock({
        originalname: 'imagen-grande.png',
        mimetype: 'image/png',
        size: tamañoExcedido,
      });

      prisma.cursoStudio.count.mockResolvedValue(1);

      // Act & Assert
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        /excede el tamaño máximo de 5 MB/,
      );
    });

    it('debe lanzar BadRequestException cuando video excede 100MB', async () => {
      // Arrange
      const dto = crearDtoMock({ tipo: TipoRecursoStudio.VIDEO });
      const tamañoExcedido = 101 * 1024 * 1024; // 101 MB
      const file = crearFileMock({
        originalname: 'video-grande.mp4',
        mimetype: 'video/mp4',
        size: tamañoExcedido,
      });

      prisma.cursoStudio.count.mockResolvedValue(1);

      // Act & Assert
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.ejecutar(dto, file)).rejects.toThrow(
        /excede el tamaño máximo de 100 MB/,
      );
    });
  });

  describe('ejecutar - Generación de ruta', () => {
    it('debe generar ruta con estructura /uploads/cursos/{cursoId}/{carpeta}/', async () => {
      // Arrange
      const cursoId = 'curso-abc-123';
      const dto = crearDtoMock({ cursoId, tipo: TipoRecursoStudio.IMAGEN });
      const file = crearFileMock();
      const recursoBd = crearRecursoBdMock();

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      await service.ejecutar(dto, file);

      // Assert
      const createCall = prisma.recursoStudio.create.mock.calls[0][0];
      expect(createCall.data.archivo).toMatch(
        new RegExp(`^/uploads/cursos/${cursoId}/imagenes/`),
      );
    });

    it('debe generar nombre único con formato {base}_{timestamp}_{random}{ext}', async () => {
      // Arrange
      const dto = crearDtoMock();
      const file = crearFileMock({ originalname: 'mi-archivo.png' });
      const recursoBd = crearRecursoBdMock();

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      await service.ejecutar(dto, file);

      // Assert
      const createCall = prisma.recursoStudio.create.mock.calls[0][0];
      const nombreArchivo = createCall.data.archivo.split('/').pop();

      // Verificar patrón: mi-archivo_{timestamp}_{random}.png
      expect(nombreArchivo).toMatch(/^mi-archivo_\d+_[a-z0-9]+\.png$/);
    });
  });

  describe('ejecutar - Mapeo de respuesta', () => {
    it('debe mapear tamanio_bytes a tamanioBytes en la respuesta', async () => {
      // Arrange
      const dto = crearDtoMock();
      const file = crearFileMock({ size: 12345 });
      const recursoBd = crearRecursoBdMock({ tamanio_bytes: 12345 });

      prisma.cursoStudio.count.mockResolvedValue(1);
      prisma.recursoStudio.create.mockResolvedValue(recursoBd);

      // Act
      const resultado = await service.ejecutar(dto, file);

      // Assert
      expect(resultado.tamanioBytes).toBe(12345);
      expect(resultado).not.toHaveProperty('tamanio_bytes');
    });
  });
});
