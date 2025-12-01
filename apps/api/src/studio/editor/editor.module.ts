import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { ValidarSemanaService } from '../services/semanas/validar-semana.service';

@Module({
  imports: [CatalogoModule],
  controllers: [EditorController],
  providers: [EditorService, ValidarSemanaService],
  exports: [EditorService],
})
export class EditorModule {}
