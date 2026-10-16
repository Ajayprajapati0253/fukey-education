
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // States
  async states() {
    const states = await this.prisma.states.findMany({
      where: {
        country_id: BigInt(101),
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return states.map((state) => ({
      id: state.id.toString(),
      name: state.name,
    }));
  }

  // Cities by state ID
  async cities(stateId: number) {
    const cities = await this.prisma.cities.findMany({
      where: {
        state_id: BigInt(stateId),
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities.map((city) => ({
      id: city.id.toString(),
      name: city.name,
    }));
  }

  // Search cities
  async searchCities(q?: string) {
    const search = q?.trim();

    if (!search) {
      throw new BadRequestException({
        status: 'error',
        message: {
          q: ['Search query is required'],
        },
      });
    }

    const cities = await this.prisma.cities.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      take: 20,
      orderBy: {
        name: 'asc',
      },
    });

    return cities.map((city) => ({
      ...city,
      id: city.id.toString(),
      state_id: city.state_id.toString(),
    }));
  }
}
