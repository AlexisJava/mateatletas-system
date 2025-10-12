import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './auth/auth.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { EquiposModule } from './equipos/equipos.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    EstudiantesModule,
    EquiposModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
