import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(
    bucket: string,
    key: string,
    file: Buffer,
    contentType: string,
  ) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresIn = 300,
  ) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
  }

  async deleteFile(
    bucket: string,
    key: string,
  ) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}