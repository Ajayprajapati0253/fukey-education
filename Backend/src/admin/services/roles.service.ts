import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Injectable()
export class RolesService {
  private readonly ADMIN_MODEL_TYPE = 'App\\Models\\Admin';

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all roles
   */
  async findAll(page = 1, limit = 15) {
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      this.prisma.roles.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
        },
        include: {
          role_has_permissions: {
            include: {
              permissions: true,
            },
          },
        },
      }),

      this.prisma.roles.count(),
    ]);

    return {
      data: roles.map((role) => ({
        id: role.id.toString(),
        name: role.name,
        guard_name: role.guard_name,
        permissions: role.role_has_permissions.map(
          (item) => ({
            id: item.permissions.id.toString(),
            name: item.permissions.name,
            group_name: item.permissions.group_name,
          }),
        ),
        created_at: role.created_at,
        updated_at: role.updated_at,
      })),

      meta: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all permissions
   */
  async getPermissions() {
    const permissions =
      await this.prisma.permissions.findMany({
        orderBy: {
          id: 'asc',
        },
      });

    return permissions.map((permission) => ({
      id: permission.id.toString(),
      name: permission.name,
      guard_name: permission.guard_name,
      group_name: permission.group_name,
    }));
  }

  /**
   * Get permission groups
   *
   * Equivalent to:
   * Admin::getPermissionGroup()
   */
  async getPermissionGroups() {
    const permissions =
      await this.prisma.permissions.findMany({
        orderBy: {
          id: 'asc',
        },
      });

    const groups: Record<string, any[]> = {};

    for (const permission of permissions) {
      const groupName =
        permission.group_name ?? 'Other';

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push({
        id: permission.id.toString(),
        name: permission.name,
      });
    }

    return groups;
  }

  /**
   * Create role
   */
  async create(dto: CreateRoleDto) {
    const existingRole =
      await this.prisma.roles.findFirst({
        where: {
          name: dto.name,
          guard_name: 'admin',
        },
      });

    if (existingRole) {
      throw new ConflictException(
        'Role already exists',
      );
    }

    const role = await this.prisma.roles.create({
      data: {
        name: dto.name,
        guard_name: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (
      dto.permissions &&
      dto.permissions.length > 0
    ) {
      await this.syncPermissions(
        role.id,
        dto.permissions,
      );
    }

    return {
      message: 'Role created successfully',
      role: {
        id: role.id.toString(),
        name: role.name,
        guard_name: role.guard_name,
      },
    };
  }

  /**
   * Get single role
   */
  async findOne(id: string) {
    const role =
      await this.prisma.roles.findUnique({
        where: {
          id: BigInt(id),
        },
        include: {
          role_has_permissions: {
            include: {
              permissions: true,
            },
          },
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    return {
      id: role.id.toString(),
      name: role.name,
      guard_name: role.guard_name,
      permissions:
        role.role_has_permissions.map(
          (item) => ({
            id: item.permissions.id.toString(),
            name: item.permissions.name,
          }),
        ),
    };
  }

  /**
   * Update role
   */
  async update(
    id: string,
    dto: UpdateRoleDto,
  ) {
    const role =
      await this.prisma.roles.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    const existingRole =
      await this.prisma.roles.findFirst({
        where: {
          name: dto.name,
          guard_name: 'admin',
          NOT: {
            id: role.id,
          },
        },
      });

    if (existingRole) {
      throw new ConflictException(
        'Role already exists',
      );
    }

    await this.prisma.roles.update({
      where: {
        id: role.id,
      },
      data: {
        name: dto.name,
        updated_at: new Date(),
      },
    });

    /*
     * Laravel:
     *
     * if (! empty($request->permissions)) {
     *     $role->name = $request->name;
     *     $role->save();
     *     $role->syncPermissions($request->permissions);
     * }
     *
     * We preserve that behavior.
     */
    if (
      dto.permissions &&
      dto.permissions.length > 0
    ) {
      await this.syncPermissions(
        role.id,
        dto.permissions,
      );
    }

    return {
      message: 'Role updated successfully',
    };
  }

  /**
   * Delete role
   */
  async remove(id: string) {
    const role =
      await this.prisma.roles.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    // Laravel:
    // abort_if($role->id == 1, 403);

    if (role.id === BigInt(1)) {
      throw new ForbiddenException(
        'This role cannot be deleted',
      );
    }

    await this.prisma.roles.delete({
      where: {
        id: role.id,
      },
    });

    return {
      message: 'Role deleted successfully',
    };
  }

  /**
   * Sync permissions with role
   *
   * Laravel equivalent:
   * $role->syncPermissions($request->permissions);
   */
  private async syncPermissions(
    roleId: bigint,
    permissionNames: string[],
  ) {
    const permissions =
      await this.prisma.permissions.findMany({
        where: {
          name: {
            in: permissionNames,
          },
          guard_name: 'admin',
        },
      });

    if (
      permissions.length !==
      permissionNames.length
    ) {
      throw new NotFoundException(
        'One or more permissions not found',
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.role_has_permissions.deleteMany({
          where: {
            role_id: roleId,
          },
        });

        if (permissions.length > 0) {
          await tx.role_has_permissions.createMany({
            data: permissions.map(
              (permission) => ({
                role_id: roleId,
                permission_id: permission.id,
              }),
            ),
            skipDuplicates: true,
          });
        }
      },
    );
  }

  /**
   * Get admin role assignment page data
   */
  async getAssignRoleData() {
    const [admins, roles] =
      await Promise.all([
        this.prisma.admins.findMany({
          where: {
            status: 'active',
          },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
          orderBy: {
            name: 'asc',
          },
        }),

        this.prisma.roles.findMany({
          orderBy: {
            name: 'asc',
          },
        }),
      ]);

    return {
      admins: admins.map((admin) => ({
        ...admin,
        id: admin.id.toString(),
      })),

      roles: roles.map((role) => ({
        id: role.id.toString(),
        name: role.name,
      })),
    };
  }

  /**
   * Get roles assigned to admin
   *
   * Laravel equivalent:
   * getAdminRoles()
   */
  async getAdminRoles(adminId: string) {
    const admin =
      await this.prisma.admins.findUnique({
        where: {
          id: BigInt(adminId),
        },
      });

    if (!admin) {
      return {
        success: false,
        data: [],
      };
    }

    const adminRoles =
      await this.prisma.model_has_roles.findMany({
        where: {
          model_id: admin.id,
          model_type:
            this.ADMIN_MODEL_TYPE,
        },
        include: {
          roles: true,
        },
      });

    const roles =
      await this.prisma.roles.findMany({
        orderBy: {
          name: 'asc',
        },
      });

    return {
      success: true,
      data: roles.map((role) => ({
        id: role.id.toString(),
        name: role.name,
        selected:
          adminRoles.some(
            (adminRole) =>
              adminRole.role_id === role.id,
          ),
      })),
    };
  }

  /**
   * Assign roles to admin
   *
   * Laravel equivalent:
   * $admin->syncRoles($request->role);
   */
  async assignRoles(dto: AssignRoleDto) {
    const admin =
      await this.prisma.admins.findUnique({
        where: {
          id: BigInt(dto.user_id),
        },
      });

      console.log('Admin:', admin);
    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
      );
    }

    console.log('DTO ROLE:', dto.role);
    console.log('ROLE 0:', dto.role?.[0]);
    const roles =
      await this.prisma.roles.findMany({
        where: {
          name: {
            in: dto.role,
          },
          guard_name: 'admin',
        },
      });

      console.log('FOUND ROLES:', roles);
    if (roles.length !== dto.role.length) {
      throw new NotFoundException(
        'One or more roles not found',
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.model_has_roles.deleteMany({
          where: {
            model_id: admin.id,
            model_type:
              this.ADMIN_MODEL_TYPE,
          },
        });

        if (roles.length > 0) {
          await tx.model_has_roles.createMany({
            data: roles.map((role) => ({
              role_id: role.id,
              model_id: admin.id,
              model_type:
                this.ADMIN_MODEL_TYPE,
            })),
            skipDuplicates: true,
          });
        }
      },
    );

    return {
      message: 'Roles assigned successfully',
    };
  }
}