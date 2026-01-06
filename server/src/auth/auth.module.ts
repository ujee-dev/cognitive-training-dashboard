import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. 추가
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

//AuthModule에 JWT 설정 추가

@Module({
  imports: [
    UsersModule,
    // 2. register를 registerAsync로 변경
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // async를 빼고 화살표 함수 뒤의 중괄호를 소괄호로 바꾸거나 return을 명시합니다.
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
