import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { LiveClassService } from '../services/live-class.service';
import { CreateLiveClassDto } from '../dto/create-live-class.dto';
import { UpdateLiveClassDto } from '../dto/update-live-class.dto';
import { RecurringLiveClassService } from '../services/recurring-live-class.service';



@Controller('admin/live-classes')
@UseGuards(AdminAuthGuard)
export class LiveClassController {
  constructor(
    private readonly liveClassService: LiveClassService,
    private readonly recurringLiveClassService: RecurringLiveClassService,

  ) {}

  @Get()
  async findAll() {
    return this.liveClassService.findAll();
  }

  @Get('kpi')
async getKpi() {
  return this.liveClassService.getKpi();
}

  @Post()
  async create(@Body() dto: CreateLiveClassDto) {
    return this.liveClassService.create(dto);
  }

    @Post('generate-recurring')
        async generateRecurring() {
        return this.recurringLiveClassService
            .generateRecurringLiveClasses();
        }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.liveClassService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLiveClassDto,
  ) {
    return this.liveClassService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.liveClassService.remove(id);
  }


  
}