import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(__dirname, '../../../../.env'), // Root .env
        path.resolve(__dirname, '../../../.env'), // App .env (if exists)
      ],
    }),
  ],
})
export class AppConfigModule {}
