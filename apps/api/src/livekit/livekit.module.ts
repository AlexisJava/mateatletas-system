import { Module } from '@nestjs/common';
import { LivekitController } from './livekit.controller';
import { LivekitTokenService } from './services/livekit-token.service';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [LivekitController],
  providers: [LivekitTokenService, PrismaService],
  exports: [LivekitTokenService],
})
export class LivekitModule {}
