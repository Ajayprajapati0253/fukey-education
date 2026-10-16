import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

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

  generateJwt(
    user: {
      id: bigint | number | string;
      name: string;
      email: string | null;
    },
    liveClass: {
      is_recurring: boolean;
      recurring_time: Date | string | null;
      start_time: Date | string;
      duration: number;
      meeting_id: string;
    },
    isModerator: boolean,
  ): string {
    let start: number;

    if (liveClass.is_recurring) {
      const recurringTime = new Date(
        liveClass.recurring_time as Date,
      );

      const now = new Date();

      const todayStart = new Date(now);

      todayStart.setHours(
        recurringTime.getHours(),
        recurringTime.getMinutes(),
        recurringTime.getSeconds(),
        0,
      );

      start = Math.floor(
        todayStart.getTime() / 1000,
      );
    } else {
      start = Math.floor(
        new Date(liveClass.start_time).getTime() /
          1000,
      );
    }

    const end =
      start +
      liveClass.duration * 60 +
      1800;

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      aud: this.appId,
      iss: this.appId,
      sub: this.domain,
      room: liveClass.meeting_id,

      // Moderator: immediately valid
      // Student: valid 5 minutes before class
      nbf: isModerator
        ? now - 60
        : start - 300,

      iat: now,
      exp: end,

      context: {
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          moderator: isModerator,
          role: isModerator
            ? 'instructor'
            : 'student',
        },

        features: {
          livestreaming: isModerator,
          recording: isModerator,
          transcription: false,
          'outbound-call': false,
        },
      },
    };

    return jwt.sign(
      payload,
      this.appSecret,
      {
        algorithm: 'HS256',
      },
    );
  }

  getConfig() {
    return {
      domain: this.domain,
      appId: this.appId,
      appSecret: this.appSecret,
    };
  }
}