import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';


import { PrismaModule } from '../prisma/prisma.module';
import { TvLoginController } from './controller/tv-login.controller';
import { TvLoginService } from './services/tv-login.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [TvLoginController],
  providers: [TvLoginService],
})
export class TvLoginModule {}