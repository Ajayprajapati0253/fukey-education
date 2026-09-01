import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';


@Module({
  imports: [
    PrismaModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [AdminAuthController],

  providers: [AdminAuthService,AdminAuthGuard],
    exports: [
    AdminAuthService,
    AdminAuthGuard,
    JwtModule
  ],
})
export class AdminAuthModule {}