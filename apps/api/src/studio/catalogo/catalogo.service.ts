import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ComponenteCatalogo, CategoriaComponente } from '@prisma/client';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ComponenteCatalogo[]> {
    return this.prisma.componenteCatalogo.findMany({
      orderBy: { orden: 'asc' },
    });
  }

  async listarHabilitados(): Promise<ComponenteCatalogo[]> {
    return this.prisma.componenteCatalogo.findMany({
      where: { habilitado: true },
      orderBy: { orden: 'asc' },
    });
  }

  async listarPorCategoria(
    categoria: CategoriaComponente,
  ): Promise<ComponenteCatalogo[]> {
    return this.prisma.componenteCatalogo.findMany({
      where: { categoria },
      orderBy: { orden: 'asc' },
    });
  }

  async obtenerPorTipo(tipo: string): Promise<ComponenteCatalogo> {
    const componente = await this.prisma.componenteCatalogo.findUnique({
      where: { tipo },
    });

    if (!componente) {
      throw new NotFoundException(`Componente "${tipo}" no encontrado`);
    }

    return componente;
  }

  async toggle(tipo: string, habilitado: boolean): Promise<ComponenteCatalogo> {
    // Verificar que existe
    await this.obtenerPorTipo(tipo);

    return this.prisma.componenteCatalogo.update({
      where: { tipo },
      data: { habilitado },
    });
  }

  async marcarImplementado(
    tipo: string,
    implementado: boolean,
  ): Promise<ComponenteCatalogo> {
    // Verificar que existe
    await this.obtenerPorTipo(tipo);

    return this.prisma.componenteCatalogo.update({
      where: { tipo },
      data: { implementado },
    });
  }
}
