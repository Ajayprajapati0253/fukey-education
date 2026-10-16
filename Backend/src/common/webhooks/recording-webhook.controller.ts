import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { LiveClassService } from 'src/admin/live-class/services/live-class.service';

@Controller('webhooks/recordings')
export class RecordingWebhookController {
  private readonly logger = new Logger(
    RecordingWebhookController.name,
  );

  constructor(
    private readonly liveClassService: LiveClassService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(@Body() body: any) {
    const expectedSecret = this.configService.get<string>(
      'RECORDING_WEBHOOK_SECRET',
    );

    if (
      !expectedSecret ||
      typeof body?.secret !== 'string' ||
      body.secret !== expectedSecret
    ) {
      throw new ForbiddenException({
        status: false,
        message: 'Unauthorized',
      });
    }

    const filePath =
      typeof body?.file_path === 'string'
        ? body.file_path.trim()
        : '';

    if (!filePath) {
      throw new BadRequestException({
        status: false,
        message: 'file_path missing',
      });
    }

    try {
      return await this.liveClassService.importRecordingFromWebhook(
        filePath,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        'Recording webhook import failed',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException({
        status: false,
        message: 'internal server error',
      });
    }
  }
}