import { Module } from '@nestjs/common';

import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';

import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [
    AiController,
  ],

  providers: [
    AiService,
    PrismaService,
  ],

  exports: [
    AiService,
  ],
})
export class AiModule {}