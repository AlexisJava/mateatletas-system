import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './core/database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(): {
    status: string;
    timestamp: string;
    service: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Mateatletas API',
    };
  }

  @Get('db-test')
  async testDatabase(): Promise<{
    status: string;
    test_models_count: number;
  }> {
    const count = await this.prisma.testModel.count();
    return {
      status: 'Database connected',
      test_models_count: count,
    };
  }
}
