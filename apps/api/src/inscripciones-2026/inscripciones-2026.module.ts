import { Module } from '@nestjs/common';
import { Inscripciones2026Controller } from './inscripciones-2026.controller';
import { Inscripciones2026Service } from './inscripciones-2026.service';
import { InscripcionOwnershipGuard } from './guards/inscripcion-ownership.guard';
import { DatabaseModule } from '../core/database/database.module';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  imports: [DatabaseModule, PagosModule],
  controllers: [Inscripciones2026Controller],
  providers: [Inscripciones2026Service, InscripcionOwnershipGuard],
  exports: [Inscripciones2026Service],
})
export class Inscripciones2026Module {}
