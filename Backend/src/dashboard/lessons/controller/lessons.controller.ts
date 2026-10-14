import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { LessonsService } from '../services/lessons.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('lesson-info/:slug/:type/:lessonId')
  getLessonInfo(
    @Req() req: any,
    @Param('slug') slug: string,
    @Param('type') type: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonsService.getLessonInfo(
      req.user.sub,
      slug,
      type,
      lessonId,
    );
  }

  @Patch('make-lesson-complete/:lessonId')
  makeLessonComplete(
    @Req() req: any,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonsService.makeLessonComplete(req.user.sub, lessonId);
  }

  
@Get('learning/:slug/progress')
learningProgress(
  @Req() req: any,
  @Param('slug') slug: string,
) {
  return this.lessonsService.learningProgress(req.user.sub, slug);
}

}