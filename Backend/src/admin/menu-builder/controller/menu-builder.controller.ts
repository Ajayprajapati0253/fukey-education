import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MenubuilderService } from '../services/menu-builder.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { AddMenuItemDto } from '../dto/add-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';



@Controller('admin/menubuilder')
@UseGuards(AdminAuthGuard)

export class MenubuilderController {
  constructor(
    private readonly menubuilderService: MenubuilderService,
  ) {}

  @Get()
  index(
    @Query('menu') menu?: string,
    @Query('action') action?: string,
  ) {
    return this.menubuilderService.index(
      menu ? Number(menu) : undefined,
      action,
    );
  }

  @Post()
  createMenu(@Body() dto: CreateMenuDto) {
    return this.menubuilderService.createMenu(dto);
  }

  @Delete(':id')
  deleteMenu(@Param('id', ParseIntPipe) id: number) {
    return this.menubuilderService.deleteMenu(id);
  }

  @Patch()
  updateMenu(@Body() dto: UpdateMenuDto) {
    return this.menubuilderService.updateMenu(dto);
  }

  @Post('items')
  addMenuItem(@Body() dto: AddMenuItemDto) {
    return this.menubuilderService.addMenuItem(dto);
  }

  @Delete('items/:id')
  deleteMenuItem(@Param('id', ParseIntPipe) id: number) {
    return this.menubuilderService.deleteMenuItem(id);
  }

  @Patch('items')
  updateMenuItem(@Body() dto: UpdateMenuItemDto) {
    return this.menubuilderService.updateMenuItem(dto);
  }
}