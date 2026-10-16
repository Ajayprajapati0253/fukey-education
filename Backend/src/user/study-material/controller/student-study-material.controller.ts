
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';
import { StudentStudyMaterialService } from '../services/student-study-material.service';

@Controller('user/study-material')
@UseGuards(JwtAuthGuard)
export class StudentStudyMaterialController {
  constructor(
    private readonly studyMaterialService: StudentStudyMaterialService,
  ) {}

  private checkStudent(req: any) {
    if (req.user?.role !== 'student') {
      throw new ForbiddenException('Student access required.');
    }
  }

  // GET /user/study-material/classes
  @Get('classes')
  getClasses(@Req() req: any) {
    this.checkStudent(req);
    return this.studyMaterialService.getClasses();
  }

  // GET /user/study-material/subjects?class=class-10
  @Get('subjects')
  getSubjects(
    @Query('class') classSlug: string,
    @Req() req: any,
  ) {
    this.checkStudent(req);
    return this.studyMaterialService.getSubjects(classSlug);
  }

  // GET /user/study-material?subject=maths&language=en&type=mcq
  @Get()
  getMaterials(
    @Query('subject') subjectSlug: string,
    @Query('language') language = 'en',
    @Query('type') type: string,
    @Req() req: any,
  ) {
    this.checkStudent(req);

    return this.studyMaterialService.getMaterials(
      subjectSlug,
      language,
      req.user.sub,
      type,
    );
  }

  // GET /user/study-material/123
  @Get(':id')
  getMaterialById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    this.checkStudent(req);

    return this.studyMaterialService.getMaterialById(
      BigInt(id),
      req.user.sub,
    );
  }
}
