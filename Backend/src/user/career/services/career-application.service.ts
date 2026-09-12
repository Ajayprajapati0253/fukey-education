import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/common/services/s3.service';
import { CreateCareerApplicationDto } from '../dto/create-career-application.dto';

@Injectable()
export class CareerApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    dto: CreateCareerApplicationDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    // Check career
    const careerId = BigInt(dto.career_id);

    const career = await this.prisma.careers.findUnique({
      where: {
        id: careerId,
      },
    });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    // Same as Laravel
    if (career.status !== 'published') {
      throw new BadRequestException(
        'This position is no longer accepting applications.',
      );
    }

    // Resume validation
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Resume must be a PDF, DOC, or DOCX file.',
      );
    }

    // 2MB maximum
    if (file.size > 8 * 1024 * 1024) {
      throw new BadRequestException(
        'Resume file size must not exceed 2MB.',
      );
    }

    // Generate safe filename
    const safeName = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const extension = file.originalname
      .split('.')
      .pop()
      ?.toLowerCase();

    const fileName = `${safeName}-${Date.now()}.${extension}`;

    const resumeKey = `resumes/${fileName}`;

    // Upload resume to S3
    await this.s3Service.uploadFile(
      process.env.AWS_S3_RESUME_BUCKET!,
      resumeKey,
      file.buffer,
      file.mimetype,
    );

    // Save application
    const application =
      await this.prisma.career_applications.create({
        data: {
          career_id: careerId,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          experience: dto.experience ?? null,
          current_company: dto.current_company ?? null,
          expected_salary: dto.expected_salary ?? null,
          resume: resumeKey,
          cover_letter: dto.cover_letter ?? null,
          status: 'pending',
        },
      });

    return {
      status: 'success',
      message: 'Thank you for applying! We will get back to you soon.',
      data: {
        id: application.id.toString(),
        career_id: application.career_id.toString(),
        name: application.name,
        email: application.email,
        phone: application.phone,
        resume: application.resume,
        status: application.status,
      },
    };
  }
}