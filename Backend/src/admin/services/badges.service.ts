import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

async getBadges() {
  const badges = await this.prisma.badges.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  const groupedBadges: Record<string, any[]> = {};

  for (const badge of badges) {
    const key = badge.key;

    if (!groupedBadges[key]) {
      groupedBadges[key] = [];
    }

    groupedBadges[key].push({
      ...badge,
      id: badge.id.toString(),
    });
  }

  return groupedBadges;
}

async registrationBadge(data: {
  name: string;
  from: number;
  to: number;
  key: string;
  image?: string;
}) {
  const existingBadge = await this.prisma.badges.findFirst({
    where: {
      key: data.key,
    },
  });

  let badge;

  if (existingBadge) {
    badge = await this.prisma.badges.update({
      where: {
        id: existingBadge.id,
      },
      data: {
        name: data.name,
        condition_from: data.from,
        condition_to: data.to,
        status: true,
        ...(data.image !== undefined && {
          image: data.image,
        }),
        updated_at: new Date(),
      },
    });
  } else {
    badge = await this.prisma.badges.create({
      data: {
        key: data.key,
        name: data.name,
        condition_from: data.from,
        condition_to: data.to,
        status: true,
        image: data.image ?? '',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  return {
    ...badge,
    id: badge.id.toString(),
  };
}
}