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

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Controller('admin/roles')
@UseGuards(AdminAuthGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rolesService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 15,
    );
  }

  @Get('permissions')
  async getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get('permission-groups')
  async getPermissionGroups() {
    return this.rolesService.getPermissionGroups();
  }

  @Get('assign')
  async getAssignRoleData() {
    return this.rolesService.getAssignRoleData();
  }

  @Get('admin/:id')
  async getAdminRoles(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.rolesService.getAdminRoles(
      id.toString(),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.rolesService.findOne(
      id.toString(),
    );
  }

  @Post()
  async create(
    @Body() dto: CreateRoleDto,
  ) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(
      id.toString(),
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.rolesService.remove(
      id.toString(),
    );
  }

  @Post('assign')
  async assignRoles(
    @Body() dto: AssignRoleDto,
  ) {
    return this.rolesService.assignRoles(dto);
  }
}