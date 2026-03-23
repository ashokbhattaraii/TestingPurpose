import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';

let app: any;

//test 222

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    app.use(cookieParser());

    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://testing-purpose-web.vercel.app',
      ],
      credentials: true,
    });

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();
  }

  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}
