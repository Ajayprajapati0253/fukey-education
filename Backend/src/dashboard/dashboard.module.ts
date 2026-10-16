import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { WishlistService } from './wishlist/services/wishlist.service';
import { WishlistController } from './wishlist/controller/wishlist.controller';
import { QuizzesController } from './quizzes/controller/quizzes.controller';
import { QuizzesService } from './quizzes/services/quizzes.service';
import { LessonsController } from './lessons/controller/lessons.controller';
import { CoursesController } from './courses/controller/courses.controller';
import { CoursesService } from './courses/services/courses.service';
import { LessonsService } from './lessons/services/lessons.service';
import { QnaController } from './qna/controller/qna.controller';
import { QnaService } from './qna/services/qna.service';
import { AnnouncementsService } from './announcements/services/announcements.service';
import { AnnouncementsController } from './announcements/controller/announcements.controller';
import { ProfileController } from './profile/controller/profile.controller';
import { ProfileService } from './profile/services/profile.service';
import { ReviewsController } from './reviews/controller/reviews.controller';
import { ReviewsService } from './reviews/services/reviews.service';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    WishlistController,
    QuizzesController,
    LessonsController,
    CoursesController,
    QnaController,
    AnnouncementsController,
    ReviewsController,
    ProfileController,


  ],
  providers: [
    WishlistService,
    QuizzesService,
    LessonsService,
    CoursesService,
    QnaService,
    AnnouncementsService,
    ReviewsService,
    ProfileService,
  ],
})
export class DashboardModule {}