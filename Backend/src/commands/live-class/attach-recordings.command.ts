
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LiveClassService } from '../../admin/live-class/services/live-class.service';

@Injectable()
export class AttachRecordingsCommand {
  private readonly logger = new Logger(AttachRecordingsCommand.name);
  private isRunning = false;

  constructor(
    private readonly liveClassService: LiveClassService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Recording job already running. Skipping.');
      return;
    }

    this.isRunning = true;

    try {
      this.logger.log('Recording attachment job started.');

      const result = await this.liveClassService.attachRecordings();

      this.logger.log(
        `Recording attachment job completed: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      this.logger.error(
        'Recording attachment job failed.',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isRunning = false;
    }
  }
}
