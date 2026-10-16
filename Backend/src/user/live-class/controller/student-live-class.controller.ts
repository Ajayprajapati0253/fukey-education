
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';
import { StudentLiveClassService } from '../services/student-live-class.service';

@Controller('student/live-classes')
@UseGuards(JwtAuthGuard)
export class StudentLiveClassController {
  constructor(
    private readonly studentLiveClassService: StudentLiveClassService,
  ) {}

  private checkStudent(req: any) {
    if (req.user.role !== 'student') {
      throw new ForbiddenException('Student access required.');
    }
  }

  @Get()
  async findAll(@Req() req: any) {
    this.checkStudent(req);

    return this.studentLiveClassService.findAll(
      BigInt(req.user.sub),
    );
  }

  @Get(':id/join')
  async join(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    this.checkStudent(req);

    return this.studentLiveClassService.join(
      BigInt(req.user.sub),
      BigInt(id),
    );
  }
}
