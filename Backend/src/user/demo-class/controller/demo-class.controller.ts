import { Controller, Get, Query } from '@nestjs/common';
import { DemoClassService } from '../services/demo-class.service';
import { DemoClassQueryDto } from '../dto/demo-class-query.dto';

@Controller('api/demo-classes')
export class DemoClassController {
  constructor(
    private readonly demoClassService: DemoClassService,
  ) {}

  @Get()
  getDemoClasses(@Query() dto: DemoClassQueryDto) {
    return this.demoClassService.getDemoClasses(dto);
  }
}