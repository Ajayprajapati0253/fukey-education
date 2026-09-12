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


@Module({
  controllers: [
    AiController,
    CartController,
    CareerApplicationController,
    CartController,
    CourseController


  ],

  providers: [
    AiService,
    PrismaService,
    CartService,
    CareerApplicationService,
    CourseService
  ],

  exports: [
    AiService,
  ],
})
export class UserModule {}