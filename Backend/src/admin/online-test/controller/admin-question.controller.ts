import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { AdminQuestionService } from '../services/admin-question.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { QuestionQueryDto } from '../dto/question-query.dto';

@Controller('admin/online-test/questions')
export class AdminQuestionController {
  constructor(
    private readonly questionService: AdminQuestionService,
  ) {}

  @Get()
  findAll(@Query() query: QuestionQueryDto) {
    return this.questionService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.validateId(id);
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    this.validateId(id);
    return this.questionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.validateId(id);
    return this.questionService.remove(id);
  }

  private validateId(id: string) {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('Invalid question ID.');
    }
  }
}