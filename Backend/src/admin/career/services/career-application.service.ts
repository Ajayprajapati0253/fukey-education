import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from 'src/common/services/s3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCareerApplicationStatusDto } from '../dto/update-career-application-status.dto';

@Injectable()
export class CareerApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,

  ) {}

  async findAll(
    careerId: string,
    page = 1,
    limit = 20,
    status?: string,
    keyword?: string,
  ) {
    const careerIdBigInt = BigInt(careerId);

    // Laravel: Career::findOrFail($careerId)
    const career = await this.prisma.careers.findUnique({
      where: {
        id: careerIdBigInt,
      },
    });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    const skip = (page - 1) * limit;

    const where: any = {
      career_id: careerIdBigInt,
    };

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        {
          name: {
            contains: keyword,
          },
        },
        {
          email: {
            contains: keyword,
          },
        },
      ];
    }

    const [total, applications] =
      await this.prisma.$transaction([
        this.prisma.career_applications.count({
          where,
        }),

        this.prisma.career_applications.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            id: 'desc',
          },
        }),
      ]);

    return {
      status: 'success',
      data: applications.map((application) => ({
        ...application,
        id: application.id.toString(),
        career_id: application.career_id.toString(),
      })),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateCareerApplicationStatusDto,
  ) {
    const applicationId = BigInt(id);

    const application =
      await this.prisma.career_applications.findUnique({
        where: {
          id: applicationId,
        },
      });

    if (!application) {
      throw new NotFoundException(
        'Career application not found',
      );
    }

    const updated =
      await this.prisma.career_applications.update({
        where: {
          id: applicationId,
        },
        data: {
          status: dto.status,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        ...updated,
        id: updated.id.toString(),
        career_id: updated.career_id.toString(),
      },
    };
  }

  async remove(id: string) {
    const applicationId = BigInt(id);

    const application =
      await this.prisma.career_applications.findUnique({
        where: {
          id: applicationId,
        },
      });

    if (!application) {
      throw new NotFoundException(
        'Career application not found',
      );
    }

    await this.prisma.career_applications.delete({
      where: {
        id: applicationId,
      },
    });

    return {
      status: 'success',
      message: 'Deleted Successfully',
    };
  }

  async getResumeUrl(id: string) {
  const applicationId = BigInt(id);

  const application =
    await this.prisma.career_applications.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        id: true,
        name: true,
        resume: true,
      },
    });

  if (!application) {
    throw new NotFoundException(
      'Career application not found',
    );
  }

  const url = await this.s3Service.getSignedUrl(
    process.env.AWS_S3_RESUME_BUCKET!,
    application.resume,
  );

  return {
    status: 'success',
    data: {
      id: application.id.toString(),
      name: application.name,
      resume_url: url,
    },
  };
}
}