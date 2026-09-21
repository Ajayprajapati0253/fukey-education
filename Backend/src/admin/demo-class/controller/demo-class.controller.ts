import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DemoClassService } from '../services/demo-class.service';
import { CreateDemoClassDto } from '../dto/create-demo-class.dto';
import { UpdateDemoClassDto } from '../dto/update-demo-class.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/demo-classes')
@UseGuards(AdminAuthGuard)
export class DemoClassController {
  constructor(private readonly demoClassService: DemoClassService) {}

  @Get()
  findAll() {
    return this.demoClassService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demoClassService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDemoClassDto) {
    return this.demoClassService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDemoClassDto,
  ) {
    return this.demoClassService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demoClassService.remove(id);
  }
}