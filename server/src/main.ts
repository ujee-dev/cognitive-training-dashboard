import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
//import * as cookieParser from "cookie-parser"; // 이렇게 임포트해야 합니다.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. 쿠키 파서 등록 (반드시 CORS 설정보다 위에 있는 것이 좋습니다)
  app.use(cookieParser());

  // CORS 설정 (프론트엔드와 쿠키를 주고받기 위해 필수)
  // 이 줄을 추가해야 DTO의 @IsEmail 등이 동작합니다.
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:5173', // Vite 기본 포트
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 쿠키를 주고받으려면 반드시 true
  });

  // 전역 파이프 설정 (Dto 검증용 - 취업용 프로젝트 필수)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

// 에러 방지 및 안전한 실행
bootstrap().catch((err) => console.error(err));
