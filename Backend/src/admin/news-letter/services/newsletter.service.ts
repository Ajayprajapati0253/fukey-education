
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/common/services/mail.service';
import { NewsletterRequestDto } from '../dto/newsletter-request.dto';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async newsletterRequest(dto: NewsletterRequestDto) {
    const email = dto.email.trim();

    const existing = await this.prisma.news_letters.findFirst({
      where: { email },
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: { email: ['Email already exist'] },
      });
    }

    const verifyToken = randomBytes(50).toString('hex');

    const newsletter = await this.prisma.news_letters.create({
      data: {
        email,
        verify_token: verifyToken,
        status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    try {
      const template = await this.prisma.email_templates.findFirst({
        where: { name: 'subscribe_notification' },
      });

      if (!template) {
        throw new Error(
          'Email template subscribe_notification not found',
        );
      }

      const verificationUrl =
        `${process.env.BACKEND_URL}/newsletter/verification/${verifyToken}`;

      const html = template.message.replace(
        /\{\{\s*verification_url\s*\}\}/g,
        verificationUrl,
      );

      await this.mailService.sendMail({
        to: newsletter.email,
        subject: template.subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        'Newsletter verification email failed',
        error instanceof Error ? error.stack : String(error),
      );

      // Keep the saved record and token so the request can be retried.
      throw new InternalServerErrorException(
        'Newsletter saved, but verification email could not be sent',
      );
    }

    return {
      message:
        'A verification link has been sent to your email, please verify it and get our newsletter',
    };
  }

  async newsletterVerification(token: string) {
    const newsletter = await this.prisma.news_letters.findFirst({
      where: { verify_token: token },
    });

    if (!newsletter) {
      throw new NotFoundException(
        'Newsletter verification failed for invalid token',
      );
    }

    await this.prisma.news_letters.update({
      where: { id: newsletter.id },
      data: {
        verify_token: null,
        status: 'verified',
        updated_at: new Date(),
      },
    });

    return {
      message: 'Newsletter verification successfully',
    };
  }
}
