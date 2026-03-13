import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development on your Mac
      'https://testing-purpose-web.vercel.app', // Production frontend
    ],
    credentials: true, // Essential for cookie-based auth
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(` Backend running on port ${port}`);
}
bootstrap();
