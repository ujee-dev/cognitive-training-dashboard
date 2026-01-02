import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 이 줄을 추가해야 DTO의 @IsEmail 등이 동작합니다.
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:5173', // Vite 기본 포트
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap();
