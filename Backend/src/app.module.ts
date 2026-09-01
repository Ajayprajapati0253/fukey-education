import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './user/auth/auth.module';
import { AiModule } from './user/ai/ai.module';
import { CartModule } from './user/cart/cart.module';
import { DashboardModule } from './dashboard/dashboard.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   // ← isse har module me ConfigService seedha inject ho jayegi, baar-baar import nahi karna padega
    }),
    PrismaModule,
    AuthModule,
    FirebaseModule,
    AdminAuthModule,
    AdminModule,
    AiModule,
    CartModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}