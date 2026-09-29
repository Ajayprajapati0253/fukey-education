import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class JitsiService {
  private readonly domain =
    process.env.JITSI_DOMAIN || '';

  private readonly appId =
    process.env.JITSI_APP_ID || '';

  private readonly appSecret =
    process.env.JITSI_APP_SECRET || '';

  generateMeetingId(): string {
    const random = randomBytes(8)
      .toString('hex')
      .slice(0, 10);

    return `class-${random}`;
  }

  generateMeetingUrl(meetingId: string): string {
    return `https://${this.domain}/${meetingId}`;
  }

  getConfig() {
    return {
      domain: this.domain,
      appId: this.appId,
      appSecret: this.appSecret,
    };
  }
}