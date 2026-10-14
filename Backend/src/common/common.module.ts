import { Global, Module } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { MailService } from './services/mail.service';
import { UploadService } from './upload/upload.service';

@Global()
@Module({
  providers: [S3Service,MailService,UploadService ],
  exports: [S3Service,MailService,UploadService],
})
export class CommonModule {}