import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { JitsiService } from 'src/admin/live-class/services/jitsi.service';

import { YoutubeLiveService } from 'src/admin/live-class/services/youtube-live.service';
import { YoutubeAuthService } from 'src/admin/live-class/services/youtube-auth.service';

import { InstructorLiveClassController } from './live-class/controller/instructor-live-class.controller';
import { InstructorLiveClassService } from './live-class/services/instructor-live-class.service';

@Module({
  controllers: [
    InstructorLiveClassController,
  ],

  providers: [
    PrismaService,
    JitsiService,

    YoutubeAuthService,
    YoutubeLiveService,

    InstructorLiveClassService,
  ],
})
export class InstructorModule {}