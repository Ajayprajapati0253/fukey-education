import { Controller, Get } from '@nestjs/common';
import { DemoClassService } from '../services/demo-class.service';

@Controller('api/v1/demo-filters')
export class DemoFilterController {
  constructor(
    private readonly demoClassService: DemoClassService,
  ) {}

  @Get()
  getDemoFilters() {
    return this.demoClassService.getDemoFilters();
  }

  
}