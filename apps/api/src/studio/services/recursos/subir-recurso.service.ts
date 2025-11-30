import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  SubirRecursoDto,
  RecursoSubidoResponse,
} from '../../dto/subir-recurso.dto';
import { TipoRecursoStudio, UPLOAD_CONFIG } from '../../interfaces';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Servicio para subir recursos multimedia
 * Responsabilidad única: Validar y guardar archivos de recursos
 */
@Injectable()
export class SubirRecursoService {
  private readonly uploadBasePath = '/uploads/cursos';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sube un recurso al servidor
   * @param dto Datos del recurso
   * @param file Archivo subido
   * @returns Información del recurso creado
   */
  async ejecutar(
    dto: SubirRecursoDto,
    file: Express.Multer.File,
  ): Promise<RecursoSubidoResponse> {
    // Verificar que el curso existe
    const cursoExiste = await this.prisma.cursoStudio.count({
      where: { id: dto.cursoId },
    });

    if (!cursoExiste) {
      throw new NotFoundException(`Curso con ID ${dto.cursoId} no encontrado`);
    }

    // Validar tipo y tamaño del archivo
    this.validarArchivo(file, dto.tipo);

    // Generar path de destino
    const carpetaTipo = this.getCarpetaPorTipo(dto.tipo);
    const nombreArchivo = this.generarNombreUnico(file.originalname);
    const rutaRelativa = `${this.uploadBasePath}/${dto.cursoId}/${carpetaTipo}/${nombreArchivo}`;

    // TODO: En producción, esto debería usar un servicio de storage (S3, Cloudinary, etc.)
    // Por ahora, simulamos el guardado
    // await this.guardarArchivo(file, rutaRelativa);

    // Crear registro en base de datos
    const recurso = await this.prisma.recursoStudio.create({
      data: {
        curso_id: dto.cursoId,
        tipo: dto.tipo,
        nombre: file.originalname,
        archivo: rutaRelativa,
        tamanio_bytes: file.size,
      },
    });

    return {
      id: recurso.id,
      nombre: recurso.nombre,
      archivo: recurso.archivo,
      tipo: recurso.tipo,
      tamanioBytes: recurso.tamanio_bytes,
    };
  }

  /**
   * Valida el archivo según el tipo de recurso
   */
  private validarArchivo(
    file: Express.Multer.File,
    tipo: TipoRecursoStudio,
  ): void {
    const config = UPLOAD_CONFIG[tipo];

    // Validar formato
    if (!config.formatos.includes(file.mimetype)) {
      throw new BadRequestException(
        `Formato no válido para ${tipo}. Formatos permitidos: ${config.formatos.join(', ')}`,
      );
    }

    // Validar tamaño
    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024);
      throw new BadRequestException(
        `El archivo excede el tamaño máximo de ${maxSizeMB} MB para ${tipo}`,
      );
    }
  }

  /**
   * Obtiene la carpeta según el tipo de recurso
   */
  private getCarpetaPorTipo(tipo: TipoRecursoStudio): string {
    const carpetas: Record<TipoRecursoStudio, string> = {
      IMAGEN: 'imagenes',
      AUDIO: 'audios',
      VIDEO: 'videos',
      DOCUMENTO: 'documentos',
    };
    return carpetas[tipo];
  }

  /**
   * Genera un nombre único para el archivo
   */
  private generarNombreUnico(originalName: string): string {
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${random}${extension}`;
  }

  /**
   * Guarda el archivo en el sistema de archivos
   * TODO: Reemplazar por servicio de storage en producción
   */
  private async guardarArchivo(
    file: Express.Multer.File,
    rutaRelativa: string,
  ): Promise<void> {
    const rutaCompleta = path.join(process.cwd(), rutaRelativa);
    const directorio = path.dirname(rutaCompleta);

    // Crear directorios si no existen
    await fs.mkdir(directorio, { recursive: true });

    // Guardar archivo
    await fs.writeFile(rutaCompleta, file.buffer);
  }
}
