import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ValidatedUser, JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      // 헤더에서 Authorization: Bearer <token> 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 만료된 토큰은 거절
      // getOrThrow를 사용해 설정값이 없으면 서버 시작 단계에서 에러를 내도록 합니다. (필수)
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Passport가 토큰을 해독한 후 자동으로 실행함
  validate(payload: JwtPayload): ValidatedUser {
    // payload = { sub, email }
    // req.user에 이 객체가 들어갑니다.
    return { userId: payload.sub, email: payload.email };
  }
}

/*
  - JWT를 "어디서 꺼낼지"
  - JWT가 "유효한지"
  - 유효하면 `req.user`에 정보 저장
  => Spring Security의 `JwtFilter` 역할
*/
