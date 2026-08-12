import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(
    new ValidationPipe({
      transform: true,        // enables @Expose/@Match and auto-converts payload to DTO instance
      whitelist: true,        // strips properties not defined in the DTO
      forbidNonWhitelisted: true, // throws if extra/unexpected fields are sent (matches Laravel's strict validation behavior)
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
