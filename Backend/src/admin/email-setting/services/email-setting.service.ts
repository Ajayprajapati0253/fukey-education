import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateEmailConfigDto } from '../dto/update-email-config.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@Injectable()
export class EmailSettingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get email configuration
   */
  async getEmailConfig() {
    const keys = [
      'mail_sender_name',
      'mail_host',
      'mail_sender_email',
      'contact_message_receiver_mail',
      'mail_username',
      'mail_password',
      'mail_port',
      'mail_encryption',
    ];

    const settings = await this.prisma.settings.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    const data: Record<string, string> = {};

    for (const setting of settings) {
      data[setting.key] = setting.value;
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * Update email configuration
   */
  async updateEmailConfig(dto: UpdateEmailConfigDto) {
    const settings: Record<string, string> = {
      mail_sender_name: dto.mail_sender_name,
      mail_host: dto.mail_host,
      mail_sender_email: dto.mail_sender_email,
      contact_message_receiver_mail:
        dto.contact_message_receiver_mail,
      mail_username: dto.mail_username,
      mail_password: dto.mail_password,
      mail_port: dto.mail_port,
      mail_encryption: dto.mail_encryption,
    };

    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.settings.updateMany({
        where: { key },
        data: { value },
      });
    }

    return {
      success: true,
      message: 'Update Successfully',
    };
  }

  /**
   * Get all email templates
   */
  async getEmailTemplates() {
    const templates = await this.prisma.email_templates.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return {
      success: true,
      data: templates.map((template) => ({
        ...template,
        id: template.id.toString(),
      })),
    };
  }

  /**
   * Get single email template
   */
  async getEmailTemplate(id: string) {
    const templateId = BigInt(id);

    const template = await this.prisma.email_templates.findUnique({
      where: {
        id: templateId,
      },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return {
      success: true,
      data: {
        ...template,
        id: template.id.toString(),
      },
    };
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(
    id: string,
    dto: UpdateEmailTemplateDto,
  ) {
    const templateId = BigInt(id);

    const template =
      await this.prisma.email_templates.findUnique({
        where: {
          id: templateId,
        },
      });

    if (!template) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }

    const updated =
      await this.prisma.email_templates.update({
        where: {
          id: templateId,
        },
        data: {
          subject: dto.subject,
          message: dto.message,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        ...updated,
        id: updated.id.toString(),
      },
    };
  }
}