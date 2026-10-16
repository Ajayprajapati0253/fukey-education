import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CareerService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /careers
   *
   * Laravel equivalent:
   * Career::published()->orderBy('id', 'desc')->get()
   */
  async findAll() {
    const jobs = await this.prisma.careers.findMany({
      where: {
        status: 'published',
        deleted_at: null,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      status: true,
      message: 'Careers fetched successfully.',
      data: jobs.map((job) => this.serializeJob(job)),
    };
  }

  /**
   * GET /careers/:slug
   *
   * Published and closed jobs can be viewed.
   */
  async findBySlug(slug: string) {
    const job = await this.prisma.careers.findFirst({
      where: {
        slug,
        status: {
          in: ['published', 'closed'],
        },
        deleted_at: null,
      },
    });

    if (!job) {
      throw new NotFoundException('Career not found.');
    }

    const relatedJobs = await this.prisma.careers.findMany({
      where: {
        status: 'published',
        deleted_at: null,
        id: {
          not: job.id,
        },
        ...(job.department
          ? { department: job.department }
          : {}),
      },
      orderBy: {
        id: 'desc',
      },
      take: 3,
    });

    return {
      status: true,
      message: 'Career details fetched successfully.',
      data: {
        job: this.serializeJob(job),
        relatedJobs: relatedJobs.map((relatedJob) =>
          this.serializeJob(relatedJob),
        ),
      },
    };
  }

  /**
   * Convert Prisma BigInt values to strings
   * so the response can be serialized as JSON.
   */
  private serializeJob<T extends { id: bigint }>(
    job: T,
  ) {
    return {
      ...job,
      id: job.id.toString(),
    };
  }
}