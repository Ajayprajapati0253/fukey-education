import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';
import { StudentOnlineTestService } from '../services/student-online-test.service';
import { QuestionBankDto } from '../dto/question-bank.dto';

@Controller('user/online-test')
@UseGuards(JwtAuthGuard)
export class StudentOnlineTestController {
  constructor(
    private readonly onlineTestService: StudentOnlineTestService,
  ) {}

  private checkStudent(req: any) {
    if (req.user?.role !== 'student') {
      throw new ForbiddenException('Student access required.');
    }
  }

  // GET /user/online-test/question-bank
  @Get('question-bank')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  getQuestionBank(
    @Query() dto: QuestionBankDto,
    @Req() req: any,
  ) {
    this.checkStudent(req);

    return this.onlineTestService.getQuestionBank(dto);
  }
}