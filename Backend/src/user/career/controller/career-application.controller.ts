import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CareerApplicationService } from '../services/career-application.service';
import { CreateCareerApplicationDto } from '../dto/create-career-application.dto';

@Controller('career-applications')
export class CareerApplicationController {
  constructor(
    private readonly careerApplicationService: CareerApplicationService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('resume'))
  
  async create(
    @Body() dto: CreateCareerApplicationDto,
    @UploadedFile() file: Express.Multer.File,
    

  ) 
  {
    return this.careerApplicationService.create(dto, file);
  }

}