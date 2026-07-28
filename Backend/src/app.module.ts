import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/controllers/auth/auth.controller';
import { Controller } from './auth/controllers/.controller';

@Module({
  imports: [AuthModule],
  controllers: [AppController, AuthController, Controller],
  providers: [AppService],
})
export class AppModule {}
