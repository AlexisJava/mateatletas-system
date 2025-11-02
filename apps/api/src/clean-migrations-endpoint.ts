// Endpoint temporal para limpiar _prisma_migrations
// Agregar esto temporalmente al app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller('admin')
export class CleanMigrationsController {
  constructor(private prisma: PrismaService) {}

  @Get('clean-migrations')
  async cleanMigrations() {
    try {
      // Ver estado actual
      const before = await this.prisma.$queryRaw<any[]>`
        SELECT migration_name, started_at, finished_at
        FROM _prisma_migrations
        ORDER BY started_at
      `;

      // Limpiar tabla
      await this.prisma.$executeRaw`TRUNCATE TABLE _prisma_migrations`;

      // Verificar después
      const after = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as total FROM _prisma_migrations
      `;

      return {
        success: true,
        message: 'Tabla _prisma_migrations limpiada',
        before: {
          count: before.length,
          migrations: before
        },
        after: {
          count: after[0].total
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
