import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCourseDeleteRequestDto } from '../dto/update-course-delete-request.dto';

@Injectable()
export class CourseDeleteRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const requests =
      await this.prisma.course_delete_requests.findMany({
        orderBy: {
          id: 'desc',
        },
      });

    return {
      status: 'success',
      data: requests.map((request) => ({
        ...request,
        id: request.id.toString(),
        course_id: request.course_id.toString(),
      })),
    };
  }

  async update(
    id: string,
    dto: UpdateCourseDeleteRequestDto,
  ) {
    const requestId = BigInt(id);

    const deleteRequest =
      await this.prisma.course_delete_requests.findUnique({
        where: {
          id: requestId,
        },
      });

    if (!deleteRequest) {
      throw new NotFoundException(
        'Course delete request not found',
      );
    }

    const courseId = deleteRequest.course_id;

    const course = await this.prisma.courses.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (dto.action === 'inactive') {
      // Laravel Course::delete() = soft delete
      await this.prisma.courses.update({
        where: {
          id: courseId,
        },
        data: {
          status: 'inactive',
          updated_at: new Date(),
        },
      });

      await this.prisma.course_delete_requests.update({
        where: {
          id: requestId,
        },
        data: {
          status: true,
          updated_at: new Date(),
        },
      });
    } else {
      // Laravel withTrashed()->restore()
      await this.prisma.courses.update({
        where: {
          id: courseId,
        },
        data: {
          status: 'active',
          updated_at: new Date(),
        },
      });

      await this.prisma.course_delete_requests.update({
        where: {
          id: requestId,
        },
        data: {
          status: false,
          updated_at: new Date(),
        },
      });
    }

    return {
      status: 'success',
      message: 'Updated successfully',
    };
  }
}