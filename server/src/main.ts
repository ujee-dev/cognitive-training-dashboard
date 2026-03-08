import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';
//import * as cookieParser from "cookie-parser"; // 이렇게 임포트해야 합니다.

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.pem')),
  };
  console.log('SSL Key Loaded:', !!httpsOptions.key); // true가 찍혀야 함
  console.log('SSL Cert Loaded:', !!httpsOptions.cert); // true가 찍혀야 함

  // 두 번째 인자로 반드시 객체 형태 { httpsOptions } 로 전달해야 합니다.
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // 2. 쿠키 파서 등록 (반드시 CORS 설정보다 위에 있는 것이 좋습니다)
  app.use(cookieParser());

  // CORS 설정 (프론트엔드와 쿠키를 주고받기 위해 필수)
  // 이 줄을 추가해야 DTO의 @IsEmail 등이 동작합니다.
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    // 개발 포트(5173)와 프리뷰 포트(4173)를 모두 허용해야 합니다.
    origin: ['https://localhost:5173', 'https://localhost:4173'],
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
