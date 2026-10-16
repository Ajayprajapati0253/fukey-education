import { Module } from '@nestjs/common';
import { AiController } from './ai/controllers/ai.controller';
import { AiService } from './ai/services/ai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartController } from './cart/controllers/cart.controller';
import { CartService } from './cart/services/cart.service';
import { CareerApplicationController } from './career/controller/career-application.controller';
import { CareerApplicationService } from './career/services/career-application.service';
import { CourseService } from './course/services/course.service';
import { CourseController } from './course/controller/course.controller';
import { DemoFilterController } from './demo-class/controller/demo-filter.controller';
import { DemoClassService } from './demo-class/services/demo-class.service';
import { DemoClassController } from './demo-class/controller/demo-class.controller';
import { EbookService } from './ebook/services/ebook.service';
import { EbookController } from './ebook/controller/ebook.controller';
import { StudentLiveClassController } from './live-class/controller/student-live-class.controller';
import { StudentLiveClassService } from './live-class/services/student-live-class.service';
import { JitsiService } from 'src/admin/live-class/services/jitsi.service';
import { StudentStudyMaterialController } from './study-material/controller/student-study-material.controller';
import { StudentStudyMaterialService } from './study-material/services/student-study-material.service';
import { StudentOnlineTestController } from './online-test/controller/student-online-test.controller';
import { StudentOnlineTestService } from './online-test/services/student-online-test.service';
import { YtCoursesController } from './yt-courses/controller/yt-courses.controller';
import { YtCoursesService } from './yt-courses/services/yt-courses.service';


@Module({
  controllers: [
    AiController,
    CareerApplicationController,
    CartController,
    CourseController,
    DemoFilterController,
    DemoClassController,
    EbookController,
    StudentLiveClassController,
    StudentStudyMaterialController,
    StudentOnlineTestController,
    YtCoursesController


  ],

  providers: [
    AiService,
    PrismaService,
    CartService,
    CareerApplicationService,
    CourseService,
    DemoClassService,
    EbookService,
    StudentLiveClassService,
    JitsiService,
    StudentStudyMaterialService,
    StudentOnlineTestService,
    YtCoursesService,
  ],

  exports: [
    AiService,
  ],
})
export class UserModule {}