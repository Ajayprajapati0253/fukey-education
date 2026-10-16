
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePopupDto } from '../dto/create-popup.dto';
import { UpdatePopupDto } from '../dto/update-popup.dto';

@Injectable()
export class PopupService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(popup: any) {
    return {
      ...popup,
      id: popup.id.toString(),
    };
  }

  async findAll(page = 1, limit = 10) {
    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * perPage;

    const [popups, total] = await Promise.all([
      this.prisma.popups.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      this.prisma.popups.count(),
    ]);

    return {
      data: popups.map((popup) => this.serialize(popup)),
      meta: {
        current_page: currentPage,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string) {
    const popupId = this.parseId(id);
    const popup = await this.prisma.popups.findUnique({
      where: { id: popupId },
    });

    if (!popup) {
      throw new NotFoundException('Popup not found');
    }

    return { data: this.serialize(popup) };
  }

  async create(
    dto: CreatePopupDto,
    imagePath: string | null,
  ) {
    const popup = await this.prisma.popups.create({
      data: {
        title: dto.title.trim(),
        description: dto.description ?? null,
        image: imagePath,
        is_active: dto.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Popup created successfully',
      data: this.serialize(popup),
    };
  }

  async update(
    id: string,
    dto: UpdatePopupDto,
    imagePath?: string,
  ) {
    const popupId = this.parseId(id);
    const existing = await this.prisma.popups.findUnique({
      where: { id: popupId },
    });

    if (!existing) {
      throw new NotFoundException('Popup not found');
    }

    const updated = await this.prisma.popups.update({
      where: { id: popupId },
      data: {
        title: dto.title.trim(),
        description: dto.description ?? null,
        is_active: dto.is_active,
        ...(imagePath ? { image: imagePath } : {}),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Popup updated successfully',
      data: this.serialize(updated),
      // Old image ko controller mein delete karna hai,
      // update success hone ke baad.
      oldImage: imagePath ? existing.image : null,
    };
  }

  async remove(id: string) {
    const popupId = this.parseId(id);
    const popup = await this.prisma.popups.findUnique({
      where: { id: popupId },
    });

    if (!popup) {
      throw new NotFoundException('Popup not found');
    }

    await this.prisma.popups.delete({
      where: { id: popupId },
    });

    return {
      status: 'success',
      message: 'Popup deleted successfully',
      image: popup.image,
    };
  }

  private parseId(id: string): bigint {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('Invalid popup ID');
    }

    return BigInt(id);
  }
}
