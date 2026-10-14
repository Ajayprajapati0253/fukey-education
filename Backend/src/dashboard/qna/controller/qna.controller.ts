
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { QnaService } from '../services/qna.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  @Get('questions/:course_slug/:lesson_id')
  fetchLessonQuestions(
    @Req() req: any,
    @Param('course_slug') courseSlug: string,
    @Param('lesson_id', ParseIntPipe) lessonId: number,
    @Query() query: { limit?: string; page?: string; search?: string },
  ) {
    const requestUrl =
      `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    return this.qnaService.fetchLessonQuestions(
      req.user.sub,
      courseSlug,
      lessonId,
      query,
      requestUrl,
    );
  }

  @Post('questions-create/:course_slug/:lesson_id')
  createLessonQuestion(
    @Req() req: any,
    @Param('course_slug') courseSlug: string,
    @Param('lesson_id', ParseIntPipe) lessonId: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.qnaService.createLessonQuestion(
      req.user.sub,
      courseSlug,
      lessonId,
      dto,
    );
  }

  @Delete('questions-destroy/:question_id')
  destroyQuestion(
    @Req() req: any,
    @Param('question_id', ParseIntPipe) questionId: number,
  ) {
    return this.qnaService.destroyQuestion(req.user.sub, questionId);
  }

  @Post('questions/replay/:lesson_id/:question_id')
  createReply(
    @Req() req: any,
    @Param('lesson_id', ParseIntPipe) lessonId: number,
    @Param('question_id', ParseIntPipe) questionId: number,
    @Body() dto: CreateReplyDto,
  ) {
    return this.qnaService.createReply(
      req.user.sub,
      lessonId,
      questionId,
      dto,
    );
  }

  @Delete('questions/replay/:reply_id')
  destroyReply(
    @Req() req: any,
    @Param('reply_id', ParseIntPipe) replyId: number,
  ) {
    return this.qnaService.destroyReply(req.user.sub, replyId);
  }
}
