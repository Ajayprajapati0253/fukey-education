
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UserPopupService {
  constructor(private readonly prisma: PrismaService) {}


async latest(userId?: string | number | bigint | null) {
  // Laravel behavior: unauthenticated user gets JSON null.
  if (userId === undefined || userId === null) {
    return null;
  }

  let id: bigint;

  try {
    if (!/^[1-9]\d*$/.test(String(userId))) {
      throw new Error('Invalid ID');
    }

    id = BigInt(userId);
  } catch {
    throw new BadRequestException('Invalid user ID');
  }

  // Find popups already seen by this user.
  const seenRecords = await this.prisma.popup_user_seen.findMany({
    where: {
      user_id: id,
    },
    select: {
      popup_id: true,
    },
  });

  const seenPopupIds = seenRecords.map((item) => item.popup_id);

  // Find the latest active popup not seen by this user.
  const popup = await this.prisma.popups.findFirst({
    where: {
      is_active: true,
      ...(seenPopupIds.length > 0
        ? {
            id: {
              notIn: seenPopupIds,
            },
          }
        : {}),
    },
    orderBy: [
      { created_at: 'desc' },
      { id: 'desc' },
    ],
  });

  if (!popup) {
    return null;
  }

  return {
    ...popup,
    id: popup.id.toString(),
  };
}


  async markSeen(
    userId: string | number | bigint | null | undefined,
    popupId: string,
  ) {
    if (userId === undefined || userId === null) {
      throw new BadRequestException('Authentication required');
    }

    let userBigInt: bigint;
    let popupBigInt: bigint;

    try {
      if (!/^[1-9]\d*$/.test(String(userId))) {
        throw new Error();
      }

      if (!/^[1-9]\d*$/.test(popupId)) {
        throw new Error();
      }

      userBigInt = BigInt(userId);
      popupBigInt = BigInt(popupId);
    } catch {
      throw new BadRequestException('Invalid user ID or popup ID');
    }

    const popup = await this.prisma.popups.findUnique({
      where: { id: popupBigInt },
      select: { id: true },
    });

    if (!popup) {
      throw new NotFoundException('Popup not found');
    }

    const existing = await this.prisma.popup_user_seen.findFirst({
      where: {
        user_id: userBigInt,
        popup_id: popupBigInt,
      },
    });

    if (!existing) {
      await this.prisma.popup_user_seen.create({
        data: {
          user_id: userBigInt,
          popup_id: popupBigInt,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    return { success: true };
  }
}
