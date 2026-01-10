import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecordsModule } from './records/records.module';
//import { TestController } from './test/test.controller';

@Module({
  imports: [
    // configModule 먼저 로드
    ConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 설정해야 다른 모듈에서 inject 가능
      envFilePath: (() => {
        const env = process.env.NODE_ENV || 'development';
        console.log(
          'Loaded NODE_ENV:',
          env === 'production' ? '.env.prod' : '.env.dev',
        ); // 서버 시작 시 로그 확인
        return env === 'production' ? '.env.prod' : '.env.dev';
      })(),
    }), // 기본값이 .env 이지만 명시적으로 확인
    // MongooseModule을 ConfigService로 안전하게 연결
    MongooseModule.forRootAsync({
      // imports: [ConfigModule], // isGlobal: true라면 생략 가능하지만 명시해도 좋음
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        console.log('Loaded MONGO_URI:', uri); // 서버 시작 시 로그 확인

        if (!uri) {
          throw new Error('MONGO_URI is not defined in .env file');
        }
        return {
          uri,
          // 최신 버전에서는 아래 옵션 필요 없음
          // useNewUrlParser: true,
          //useUnifiedTopology: true,
        };
      },
    }),
    AuthModule,
    UsersModule, // 여기가 빠져있으면 UsersController가 작동하지 않습니다.
    RecordsModule,
  ],
  //controllers: [TestController], // 권한 테스트용 등록
})
export class AppModule {}
