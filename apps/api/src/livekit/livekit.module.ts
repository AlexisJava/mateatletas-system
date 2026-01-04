import { Module } from '@nestjs/common';
import { LivekitController } from './livekit.controller';
import { LivekitTokenService } from './services/livekit-token.service';

/**
 * LivekitModule
 *
 * Módulo para clases en vivo con video/audio.
 *
 * Dependencias globales (no necesitan importarse):
 * - ConfigService: desde CoreModule (global)
 * - PrismaService: desde DatabaseModule (global)
 */
@Module({
  controllers: [LivekitController],
  providers: [LivekitTokenService],
  exports: [LivekitTokenService],
})
export class LivekitModule {}
