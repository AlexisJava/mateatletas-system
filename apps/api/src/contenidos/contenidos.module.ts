import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';

// Controllers
import {
  ContenidoAdminController,
  ContenidoEstudianteController,
} from './controllers';

// Services
import {
  ContenidoAdminService,
  ContenidoPublicacionService,
  ContenidoEstudianteService,
  NodoService,
  ProgresoService,
} from './services';

@Module({
  imports: [DatabaseModule],
  controllers: [ContenidoAdminController, ContenidoEstudianteController],
  providers: [
    // Admin services
    ContenidoAdminService,
    ContenidoPublicacionService,
    NodoService,
    // Estudiante services
    ContenidoEstudianteService,
    ProgresoService,
  ],
  exports: [ContenidoAdminService, ContenidoEstudianteService],
})
export class ContenidosModule {}
