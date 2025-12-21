import { Injectable, NotFoundException } from '@nestjs/common';
import { MundoTipo } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio para gestionar los Mundos STEAM del sistema Mateatletas
 *
 * Sistema de 3 mundos:
 * - MATEMATICA: Numeros, algebra, geometria
 * - PROGRAMACION: Codigo, algoritmos, logica
 * - CIENCIAS: Fisica, quimica, biologia
 */
@Injectable()
export class MundosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los mundos ordenados por orden de visualizacion
   */
  async findAll(): Promise<MundoBasico[]> {
    return this.prisma.mundo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Obtiene un mundo por su ID
   *
   * @param id - ID del mundo
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<MundoBasico> {
    const mundo = await this.prisma.mundo.findUnique({
      where: { id },
    });

    if (!mundo) {
      throw new NotFoundException(`Mundo con ID ${id} no encontrado`);
    }

    return mundo;
  }

  /**
   * Obtiene un mundo por su tipo
   *
   * @param tipo - Tipo de mundo (MATEMATICA, PROGRAMACION, CIENCIAS)
   * @throws NotFoundException si no existe
   */
  async findByTipo(tipo: MundoTipo): Promise<MundoBasico> {
    const mundo = await this.prisma.mundo.findUnique({
      where: { tipo },
    });

    if (!mundo) {
      throw new NotFoundException(`Mundo de tipo ${tipo} no encontrado`);
    }

    return mundo;
  }
}

// Tipos auxiliares para el servicio
interface MundoBasico {
  id: string;
  tipo: MundoTipo;
  nombre: string;
  descripcion: string | null;
  icono: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  gradiente: string;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}
