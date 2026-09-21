import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { UpdateCurrencyDto } from '../dto/update-currency.dto';

@Injectable()
export class CurrencyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const currencies =
      await this.prisma.multi_currencies.findMany({
        orderBy: {
          id: 'asc',
        },
      });

    return {
      status: 'success',
      data: currencies.map((currency) => ({
        ...currency,
        id: currency.id.toString(),
      })),
    };
  }

  async findOne(id: string) {
    const currency =
      await this.prisma.multi_currencies.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    return {
      status: 'success',
      data: {
        ...currency,
        id: currency.id.toString(),
      },
    };
  }

  async create(dto: CreateCurrencyDto) {
    const existingName =
      await this.prisma.multi_currencies.findFirst({
        where: {
          currency_name: dto.currency_name,
        },
      });

    if (existingName) {
      throw new ConflictException(
        'Currency name already exist',
      );
    }

    const existingCountry =
      await this.prisma.multi_currencies.findFirst({
        where: {
          country_code: dto.country_code,
        },
      });

    if (existingCountry) {
      throw new ConflictException(
        'Country code already exist',
      );
    }

    const existingCode =
      await this.prisma.multi_currencies.findFirst({
        where: {
          currency_code: dto.currency_code,
        },
      });

    if (existingCode) {
      throw new ConflictException(
        'Currency code already exist',
      );
    }

    if (dto.is_default === 'yes') {
      await this.prisma.multi_currencies.updateMany({
        where: {
          is_default: 'yes',
        },
        data: {
          is_default: 'no',
        },
      });
    }

    const currency =
      await this.prisma.multi_currencies.create({
        data: {
          currency_name: dto.currency_name,
          country_code: dto.country_code,
          currency_code: dto.currency_code,
          currency_icon: dto.currency_icon,
          currency_rate: dto.currency_rate,
          is_default: dto.is_default ?? 'no',
          currency_position:
            dto.currency_position ?? 'before_price',
          status: dto.status ?? 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Created Successfully',
      data: {
        ...currency,
        id: currency.id.toString(),
      },
    };
  }

  async update(
    id: string,
    dto: UpdateCurrencyDto,
  ) {
    const currencyId = BigInt(id);

    const currency =
      await this.prisma.multi_currencies.findUnique({
        where: {
          id: currencyId,
        },
      });

    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    const existingName =
      await this.prisma.multi_currencies.findFirst({
        where: {
          currency_name: dto.currency_name,
          id: {
            not: currencyId,
          },
        },
      });

    if (existingName) {
      throw new ConflictException(
        'Currency name already exist',
      );
    }

    const existingCountry =
      await this.prisma.multi_currencies.findFirst({
        where: {
          country_code: dto.country_code,
          id: {
            not: currencyId,
          },
        },
      });

    if (existingCountry) {
      throw new ConflictException(
        'Country code already exist',
      );
    }

    const existingCode =
      await this.prisma.multi_currencies.findFirst({
        where: {
          currency_code: dto.currency_code,
          id: {
            not: currencyId,
          },
        },
      });

    if (existingCode) {
      throw new ConflictException(
        'Currency code already exist',
      );
    }

    if (
      dto.is_default === 'yes' &&
      currency.is_default !== 'yes'
    ) {
      await this.prisma.multi_currencies.updateMany({
        where: {
          is_default: 'yes',
        },
        data: {
          is_default: 'no',
        },
      });
    } else if (
      dto.is_default === 'no' &&
      currency.is_default === 'yes'
    ) {
      await this.prisma.multi_currencies.updateMany({
        where: {
          id: BigInt(1),
        },
        data: {
          is_default: 'yes',
        },
      });
    }

    const updatedCurrency =
      await this.prisma.multi_currencies.update({
        where: {
          id: currencyId,
        },
        data: {
          currency_name: dto.currency_name,
          country_code: dto.country_code,
          currency_code: dto.currency_code,
          currency_icon: dto.currency_icon,
          currency_rate: dto.currency_rate,
          is_default: dto.is_default,
          currency_position: dto.currency_position,
          status: dto.status,
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: {
        ...updatedCurrency,
        id: updatedCurrency.id.toString(),
      },
    };
  }

  async remove(id: string) {
    const currencyId = BigInt(id);

    const currency =
      await this.prisma.multi_currencies.findUnique({
        where: {
          id: currencyId,
        },
      });

    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    if (currency.is_default === 'yes') {
      throw new ConflictException(
        'Default currency can not be deleted',
      );
    }

    await this.prisma.multi_currencies.delete({
      where: {
        id: currencyId,
      },
    });

    return {
      status: 'success',
      message: 'Delete Successfully',
    };
  }
}