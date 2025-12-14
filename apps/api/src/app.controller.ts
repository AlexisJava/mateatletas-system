import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * AppController - Root Controller
 *
 * Proporciona información básica sobre la API y redirecciona
 * a endpoints útiles (documentación, health checks).
 *
 * Para health checks completos, usar HealthModule en /health
 */
@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * Endpoint raíz que proporciona información sobre la API
   * y enlaces a recursos útiles
   */
  @Get()
  getApiInfo(): {
    message: string;
    version: string;
    docs: string;
    health: string;
  } {
    return {
      message: 'Mateatletas API',
      version: '1.0.0',
      docs: '/api-docs',
      health: '/health',
    };
  }
}
