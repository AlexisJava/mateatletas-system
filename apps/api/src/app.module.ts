import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './auth/auth.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { EquiposModule } from './equipos/equipos.module';
import { DocentesModule } from './docentes/docentes.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { PagosModule } from './pagos/pagos.module';
import { ClasesModule } from './clases/clases.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AdminModule } from './admin/admin.module';
import { GamificacionModule } from './gamificacion/gamificacion.module';
import { CursosModule } from './cursos/cursos.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    EstudiantesModule,
    EquiposModule,
    DocentesModule,
    CatalogoModule,
    PagosModule,
    ClasesModule,
    AsistenciaModule,
    AdminModule,
    GamificacionModule,
    CursosModule, // SLICE #16: Estructura de cursos y lecciones
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
