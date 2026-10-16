import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { google } from 'googleapis';

import { YoutubeAuthService } from './youtube-auth.service';

@Injectable()
export class YoutubeLiveService {
  constructor(
    private readonly youtubeAuthService: YoutubeAuthService,
  ) {}

  async createBroadcast(data: {
    title: string;
    description?: string;
    start_time: string;
  }) {
    const auth =
      await this.youtubeAuthService.getGoogleClient();

    const youtube = google.youtube({
      version: 'v3',
      auth,
    });

    const response =
      await youtube.liveBroadcasts.insert({
        part: ['snippet', 'status', 'contentDetails'],
        requestBody: {
          snippet: {
            title: data.title,
            description: data.description ?? '',
            scheduledStartTime: data.start_time,
          },
          status: {
            privacyStatus: 'public',
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
            enableEmbed: true,
          },
        },
      });

    if (!response.data.id) {
      throw new InternalServerErrorException(
        'YouTube broadcast was not created.',
      );
    }

    return response.data;
  }

  async createStream(data: {
    title: string;
  }) {
    const auth =
      await this.youtubeAuthService.getGoogleClient();

    const youtube = google.youtube({
      version: 'v3',
      auth,
    });

    const response =
      await youtube.liveStreams.insert({
        part: ['snippet', 'cdn'],
        requestBody: {
          snippet: {
            title: data.title,
          },
          cdn: {
            frameRate: '30fps',
            ingestionType: 'rtmp',
            resolution: '1080p',
          },
        },
      });

    if (!response.data.id) {
      throw new InternalServerErrorException(
        'YouTube stream was not created.',
      );
    }

    return response.data;
  }

  async bindBroadcast(
    broadcastId: string,
    streamId: string,
  ) {
    const auth =
      await this.youtubeAuthService.getGoogleClient();

    const youtube = google.youtube({
      version: 'v3',
      auth,
    });

    return youtube.liveBroadcasts.bind({
      id: broadcastId,
      part: ['id', 'contentDetails'],
      streamId,
    });
  }

  async createLive(data: {
    title: string;
    description?: string;
    start_time: string;
  }) {
    const broadcast =
      await this.createBroadcast({
        title: data.title,
        description: data.description,
        start_time: data.start_time,
      });

    const stream =
      await this.createStream({
        title: data.title,
      });

    await this.bindBroadcast(
      broadcast.id!,
      stream.id!,
    );

    const ingestionInfo =
      stream.cdn?.ingestionInfo;

    if (!ingestionInfo) {
      throw new InternalServerErrorException(
        'YouTube stream ingestion information was not returned.',
      );
    }

    return {
      broadcast_id: broadcast.id,
      stream_id: stream.id,
      stream_key: ingestionInfo.streamName,
      rtmp_url: ingestionInfo.ingestionAddress,
      watch_url:
        `https://www.youtube.com/watch?v=${broadcast.id}`,
    };
  }
}