import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // 토큰 검증 성공 시 실행
  validate(payload: JwtPayload): JwtPayload {
    // payload = { sub, email }
    return payload;
  }
}

/*
  - JWT를 "어디서 꺼낼지"
  - JWT가 "유효한지"
  - 유효하면 `req.user`에 정보 저장
  => Spring Security의 `JwtFilter` 역할
*/
