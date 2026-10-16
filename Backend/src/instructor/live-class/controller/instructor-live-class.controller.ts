import {
  Controller,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { InstructorLiveClassService } from '../services/instructor-live-class.service';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';
import { CreateInstructorLiveClassDto } from '../dto/create-instructor-live-class.dto';

@Controller('instructor/live-classes')
@UseGuards(JwtAuthGuard)
export class InstructorLiveClassController {
  constructor(
    private readonly instructorLiveClassService: InstructorLiveClassService,
  ) {}

  @Get()
  async findAll(@Req() req: any) {
    if (req.user.role !== 'instructor') {
      throw new ForbiddenException(
        'Instructor access required.',
      );
    }

    return this.instructorLiveClassService.findAll(
      BigInt(req.user.sub),
    );
  }

@Get(':id')
async findOne(
  @Req() req: any,
  @Param('id') id: string,
) {
  if (req.user.role !== 'instructor') {
    throw new ForbiddenException(
      'Instructor access required.',
    );
  }

  return this.instructorLiveClassService.findOne(
    BigInt(id),
    BigInt(req.user.sub),
  );
}

@Post()
async create(
  @Req() req: any,
  @Body() dto: CreateInstructorLiveClassDto,
) {
  if (req.user.role !== 'instructor') {
    throw new ForbiddenException(
      'Instructor access required.',
    );
  }

  return this.instructorLiveClassService.create(
    BigInt(req.user.sub),
    dto,
  );
}
}