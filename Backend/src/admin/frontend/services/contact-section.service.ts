import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ContactSectionService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const contact = await this.prisma.contact_sections.findFirst();

    return {
      success: true,
      data: contact,
    };
  }

  async update(id: number, data: {
    address?: string;
    phone_one?: string;
    phone_two?: string;
    email_one?: string;
    email_two?: string;
    map?: string;
  }) {
    const contact = await this.prisma.contact_sections.upsert({
      where: {
        id,
      },
      update: {
        address: data.address,
        phone_one: data.phone_one,
        phone_two: data.phone_two,
        email_one: data.email_one,
        email_two: data.email_two,
        map: data.map ? `https://${data.map}` : data.map,
      },
      create: {
        id,
        address: data.address,
        phone_one: data.phone_one,
        phone_two: data.phone_two,
        email_one: data.email_one,
        email_two: data.email_two,
        map: data.map ? `https://${data.map}` : data.map,
      },
    });

    return {
      success: true,
      message: 'Updated successfully',
      data: contact,
    };
  }
}