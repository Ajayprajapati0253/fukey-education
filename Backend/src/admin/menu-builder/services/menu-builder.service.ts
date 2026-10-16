import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { AddMenuItemDto } from '../dto/add-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';


@Injectable()
export class MenubuilderService {
  constructor(private readonly prisma: PrismaService) {}

  private now() {
    return new Date();
  }

  private toId(value: number | string | bigint): bigint {
    try {
      const id = BigInt(value);
      if (id <= 0n) throw new Error();
      return id;
    } catch {
      throw new BadRequestException('Invalid ID.');
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'menu';
  }

  private serialize<T>(value: T): T {
    return JSON.parse(
      JSON.stringify(value, (_key, item) =>
        typeof item === 'bigint' ? item.toString() : item,
      ),
    );
  }

  private async menuOrFail(id: number | string | bigint) {
    const menu = await this.prisma.menus.findUnique({
      where: { id: this.toId(id) },
    });

    if (!menu) throw new NotFoundException('Menu not found.');
    return menu;
  }

  private async itemOrFail(id: number | string | bigint) {
    const item = await this.prisma.menu_items.findUnique({
      where: { id: this.toId(id) },
    });

    if (!item) throw new NotFoundException('Menu item not found.');
    return item;
  }

  private async saveMenuTranslations(
    menuId: bigint,
    translations?: Record<string, string>,
  ) {
    if (!translations) return;

    for (const [langCode, name] of Object.entries(translations)) {
      if (typeof name !== 'string') continue;

      const existing = await this.prisma.menu_translations.findFirst({
        where: { menu_id: menuId, lang_code: langCode },
      });

      if (existing) {
        await this.prisma.menu_translations.update({
          where: { id: existing.id },
          data: { name, updated_at: this.now() },
        });
      } else {
        await this.prisma.menu_translations.create({
          data: {
            menu_id: menuId,
            lang_code: langCode,
            name,
            created_at: this.now(),
            updated_at: this.now(),
          },
        });
      }
    }
  }

  private async saveItemTranslations(
    itemId: bigint,
    translations?: Record<string, string>,
  ) {
    if (!translations) return;

    for (const [langCode, label] of Object.entries(translations)) {
      if (typeof label !== 'string') continue;

      const existing =
        await this.prisma.menu_item_translations.findFirst({
          where: { menu_item_id: itemId, lang_code: langCode },
        });

      if (existing) {
        await this.prisma.menu_item_translations.update({
          where: { id: existing.id },
          data: { label, updated_at: this.now() },
        });
      } else {
        await this.prisma.menu_item_translations.create({
          data: {
            menu_item_id: itemId,
            lang_code: langCode,
            label,
            created_at: this.now(),
            updated_at: this.now(),
          },
        });
      }
    }
  }

  // GET /admin/menubuilder
  async index(menuId?: number, action?: string) {
    const menuList = await this.prisma.menus.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    if (action && (!menuId || menuId === 0)) {
      return this.serialize({
        menus: [],
        indmenu: null,
        menulist: menuList,
      });
    }

    const selectedId =
      menuId && menuId > 0
        ? this.toId(menuId)
        : menuList.length
          ? menuList[0].id
          : null;

    if (!selectedId) {
      return this.serialize({
        menus: [],
        indmenu: null,
        menulist: menuList,
      });
    }

    const selectedMenu = await this.prisma.menus.findUnique({
      where: { id: selectedId },
      include: {
        menu_translations: true,
      },
    });

    if (!selectedMenu) throw new NotFoundException('Menu not found.');

    const items = await this.prisma.menu_items.findMany({
      where: { menu_id: selectedId },
      include: { menu_item_translations: true },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    const itemMap = new Map<string, any>();
    const roots: any[] = [];

    for (const item of items) {
      itemMap.set(item.id.toString(), {
        ...item,
        children: [],
      });
    }

    for (const item of items) {
      const current = itemMap.get(item.id.toString());
      const parentId = item.parent_id.toString();

      if (
        item.parent_id !== 0n &&
        item.parent_id !== item.id &&
        itemMap.has(parentId)
      ) {
        itemMap.get(parentId).children.push(current);
      } else {
        roots.push(current);
      }
    }

    return this.serialize({
      status: true,
      menulist: menuList,
      indmenu: selectedMenu,
      menus: roots,
    });
  }

  // POST /admin/menubuilder
  async createMenu(dto: CreateMenuDto) {
    const name = dto.menuname.trim();
    if (!name) throw new BadRequestException('Menu name is required.');

    const baseSlug = this.slugify(name);
    let slug = baseSlug;

    if (await this.prisma.menus.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
    }

    const menu = await this.prisma.$transaction(async (tx) => {
      const created = await tx.menus.create({
        data: {
          name,
          slug,
          created_at: this.now(),
          updated_at: this.now(),
        },
      });

      for (const [langCode, translatedName] of Object.entries(
        dto.translations ?? {},
      )) {
        if (typeof translatedName !== 'string') continue;

        await tx.menu_translations.create({
          data: {
            menu_id: created.id,
            lang_code: langCode,
            name: translatedName,
            created_at: this.now(),
            updated_at: this.now(),
          },
        });
      }

      return created;
    });

    return { resp: menu.id.toString() };
  }

  // DELETE /admin/menubuilder/:id
  async deleteMenu(id: number) {
    const menuId = this.toId(id);
    await this.menuOrFail(menuId);

    const count = await this.prisma.menu_items.count({
      where: { menu_id: menuId },
    });

    if (count > 0) {
      return {
        resp: 'delete_all_items',
        error: 1,
      };
    }

    await this.prisma.menus.delete({ where: { id: menuId } });

    return { resp: 'deleting_this_menu' };
  }

  // PATCH /admin/menubuilder
  async updateMenu(dto: UpdateMenuDto) {
    const menuId = this.toId(dto.idmenu);
    const menu = await this.menuOrFail(menuId);

    await this.prisma.$transaction(async (tx) => {
      if (dto.menuname !== undefined) {
        const name = dto.menuname.trim();

        if (dto.code === process.env.APP_LOCALE || !dto.code) {
          await tx.menus.update({
            where: { id: menuId },
            data: { name, updated_at: this.now() },
          });
        }

        if (dto.translations) {
          for (const [langCode, translatedName] of Object.entries(
            dto.translations,
          )) {
            const existing = await tx.menu_translations.findFirst({
              where: { menu_id: menuId, lang_code: langCode },
            });

            if (existing) {
              await tx.menu_translations.update({
                where: { id: existing.id },
                data: { name: translatedName, updated_at: this.now() },
              });
            } else {
              await tx.menu_translations.create({
                data: {
                  menu_id: menuId,
                  lang_code: langCode,
                  name: translatedName,
                  created_at: this.now(),
                  updated_at: this.now(),
                },
              });
            }
          }
        }
      }

      for (const row of dto.arraydata ?? []) {
        const itemId = this.toId(row.id);
        const item = await tx.menu_items.findFirst({
          where: { id: itemId, menu_id: menuId },
        });

        if (!item) {
          throw new NotFoundException(`Menu item ${row.id} not found.`);
        }

        const parentId = Number(row.parent) > 0
          ? this.toId(row.parent)
          : 0n;

        if (parentId === itemId) {
          throw new BadRequestException('A menu item cannot parent itself.');
        }

        if (parentId !== 0n) {
          const parent = await tx.menu_items.findFirst({
            where: { id: parentId, menu_id: menuId },
          });
          if (!parent) {
            throw new BadRequestException('Invalid parent menu item.');
          }
        }

        await tx.menu_items.update({
          where: { id: itemId },
          data: {
            parent_id: parentId,
            sort: row.sort,
            depth: row.depth,
            ...(row.role_id !== undefined ? { role_id: row.role_id } : {}),
            updated_at: this.now(),
          },
        });
      }
    });

    return { resp: 1 };
  }

  // POST /admin/menubuilder/items
  async addMenuItem(dto: AddMenuItemDto) {
    const menuId = this.toId(dto.idmenu);
    await this.menuOrFail(menuId);

    const item = await this.prisma.$transaction(async (tx) => {
      const lastRoot = await tx.menu_items.aggregate({
        where: { menu_id: menuId, parent_id: 0n },
        _max: { sort: true },
      });

      const created = await tx.menu_items.create({
        data: {
          label: dto.labelmenu,
          link: dto.linkmenu,
          menu_id: menuId,
          parent_id: 0n,
          sort: (lastRoot._max.sort ?? 0) + 1,
          depth: 0,
          role_id: dto.rolemenu ?? 0,
          created_at: this.now(),
          updated_at: this.now(),
        },
      });

      for (const [langCode, label] of Object.entries(dto.translations ?? {})) {
        if (typeof label !== 'string') continue;

        await tx.menu_item_translations.create({
          data: {
            menu_item_id: created.id,
            lang_code: langCode,
            label,
            created_at: this.now(),
            updated_at: this.now(),
          },
        });
      }

      return created;
    });

    return { resp: item.id.toString() };
  }

  // DELETE /admin/menubuilder/items/:id
  async deleteMenuItem(id: number) {
    await this.itemOrFail(id);
    await this.prisma.menu_items.delete({
      where: { id: this.toId(id) },
    });

    return { resp: 1 };
  }

  // PATCH /admin/menubuilder/items
  async updateMenuItem(dto: UpdateMenuItemDto) {
    if (dto.arraydata) {
      for (const row of dto.arraydata) {
        const itemId = this.toId(row.id);
        const item = await this.itemOrFail(itemId);

        if (row.code === process.env.APP_LOCALE || !row.code) {
          await this.prisma.menu_items.update({
            where: { id: itemId },
            data: {
              label: row.label,
              link: row.link,
              ...(row.role_id !== undefined
                ? { role_id: row.role_id || 0 }
                : {}),
              updated_at: this.now(),
            },
          });
        }

        await this.saveItemTranslations(item.id, {
          [row.code]: row.label,
        });
      }

      return { resp: 1 };
    }

    if (!dto.id) throw new BadRequestException('Menu item ID is required.');

    const item = await this.itemOrFail(dto.id);

    if (dto.code === process.env.APP_LOCALE || !dto.code) {
      await this.prisma.menu_items.update({
        where: { id: item.id },
        data: {
          ...(dto.label !== undefined ? { label: dto.label } : {}),
          ...(dto.url !== undefined ? { link: dto.url } : {}),
          ...(dto.clases !== undefined ? { class: dto.clases } : {}),
          ...(dto.role_id !== undefined ? { role_id: dto.role_id || 0 } : {}),
          updated_at: this.now(),
        },
      });
    }

    await this.saveItemTranslations(
      item.id,
      dto.translations ?? (
        dto.code
          ? { [dto.code]: dto.label ?? '' }
          : undefined
      ),
    );

    return { resp: 1 };
  }
}