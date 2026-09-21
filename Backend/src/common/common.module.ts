import { Global, Module } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { MailService } from './services/mail.service';

@Global()
@Module({
  providers: [S3Service,MailService ],
  exports: [S3Service,MailService],
})
export class CommonModule {}