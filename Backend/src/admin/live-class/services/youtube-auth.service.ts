import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { google } from 'googleapis';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class YoutubeAuthService {
  private readonly client;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI,
    );
  }

  private get scopes(): string[] {
    return [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ];
  }

  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: this.scopes,
    });
  }

  async handleCallback(code: string): Promise<void> {
    const { tokens } =
      await this.client.getToken(code);

    if (!tokens.refresh_token) {
      throw new InternalServerErrorException(
        'Google did not return a refresh token. Please revoke the existing YouTube authorization and connect again.',
      );
    }

    await this.prisma.settings.updateMany({
      where: {
        key: 'youtube_refresh_token',
      },
      data: {
        value: tokens.refresh_token,
        updated_at: new Date(),
      },
    });

    const existing =
      await this.prisma.settings.findFirst({
        where: {
          key: 'youtube_refresh_token',
        },
      });

    if (!existing) {
      await this.prisma.settings.create({
        data: {
          key: 'youtube_refresh_token',
          value: tokens.refresh_token,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  async getAccessToken(): Promise<string> {
    const setting =
      await this.prisma.settings.findFirst({
        where: {
          key: 'youtube_refresh_token',
        },
      });

    if (!setting?.value) {
      throw new InternalServerErrorException(
        'YouTube is not connected.',
      );
    }

    this.client.setCredentials({
      refresh_token: setting.value,
    });

    try {
      const { credentials } =
        await this.client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error(
          'Unable to refresh access token.',
        );
      }

      return credentials.access_token;
    } catch (error: any) {
      const errorCode =
        error?.response?.data?.error;

      if (errorCode === 'invalid_grant') {
        await this.prisma.settings.deleteMany({
          where: {
            key: 'youtube_refresh_token',
          },
        });

        throw new InternalServerErrorException(
          'YouTube connection has expired or been revoked. Please reconnect YouTube from the admin panel.',
        );
      }

      throw new InternalServerErrorException(
        error?.response?.data?.error_description ||
          'Unable to refresh access token.',
      );
    }
  }

  async isConnected(): Promise<boolean> {
    const setting =
      await this.prisma.settings.findFirst({
        where: {
          key: 'youtube_refresh_token',
        },
      });

    return Boolean(setting?.value);
  }

  async getGoogleClient() {
    const accessToken =
      await this.getAccessToken();

    this.client.setCredentials({
      access_token: accessToken,
    });

    return this.client;
  }
}