import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { QuizzesService } from '../services/quizzes.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('learning/:slug/quiz/:id')
  quizIndex(
    @Req() req: any,
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quizzesService.quizIndex(req.user.sub, slug, id);
  }

@Post('learning/:slug/quiz/:id')
quizStore(
  @Req() req: any,
  @Param('slug') slug: string,
  @Param('id') id: string,
  @Body()
  body: {
    answers: Array<{
      question_id: number;
      answer_id: number;
    }>;
  },
) {
  // Add this validation here
  if (!body || !Array.isArray(body.answers)) {
    throw new BadRequestException(
      'answers must be an array',
    );
  }

  return this.quizzesService.quizStore(
    req.user.sub,
    slug,
    Number(id),
    body.answers,
  );
}

  @Get('learning/:slug/quiz-results/:id')
  quizResults(
    @Req() req: any,
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quizzesService.quizResults(req.user.sub, slug, id);
  }

  @Get('quiz-attempts')
  quizAttempts(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.quizzesService.quizAttempts(
      req.user.sub,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get('quiz-attempts/:id')
quizAttemptDetails(
  @Req() req: any,
  @Param('id') id: string,
) {
  return this.quizzesService.quizAttemptDetails(
    req.user.sub,
    Number(id),
  );
}
}