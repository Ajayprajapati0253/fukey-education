import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateFreeCourseDeleteRequestDto } from '../dto/update-free-course-delete-request.dto';

@Injectable()
export class FreeCourseDeleteRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const requests =
      await this.prisma.free_course_delete_requests.findMany({
        orderBy: {
          id: 'desc',
        },
      });

    return {
      status: 'success',
      data: requests.map((item) => ({
        ...item,
        id: Number(item.id),
        free_course_id: Number(item.free_course_id),
      })),
    };
  }

  async update(
    id: number,
    dto: UpdateFreeCourseDeleteRequestDto,
  ) {
    const request =
      await this.prisma.free_course_delete_requests.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!request) {
      throw new NotFoundException(
        'Free course delete request not found',
      );
    }

    const course = await this.prisma.free_courses.findUnique({
      where: {
        id: request.free_course_id,
      },
    });

    if (!course) {
      throw new NotFoundException('Free course not found');
    }

    if (dto.action === 'inactive') {
      await this.prisma.$transaction([
        this.prisma.free_courses.update({
          where: {
            id: request.free_course_id,
          },
          data: {
            deleted_at: new Date(),
          },
        }),

        this.prisma.free_course_delete_requests.update({
          where: {
            id: BigInt(id),
          },
          data: {
            status: true,
          },
        }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.free_courses.update({
          where: {
            id: request.free_course_id,
          },
          data: {
            deleted_at: null,
          },
        }),

        this.prisma.free_course_delete_requests.update({
          where: {
            id: BigInt(id),
          },
          data: {
            status: false,
          },
        }),
      ]);
    }

    return {
      status: 'success',
      message: 'Updated successfully',
    };
  }
}