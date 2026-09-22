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


@Module({
  controllers: [
    AiController,
    CartController,
    CareerApplicationController,
    CartController,
    CourseController,
    DemoFilterController,
    DemoClassController,
    EbookController


  ],

  providers: [
    AiService,
    PrismaService,
    CartService,
    CareerApplicationService,
    CourseService,
    DemoClassService,
    EbookService
  ],

  exports: [
    AiService,
  ],
})
export class UserModule {}