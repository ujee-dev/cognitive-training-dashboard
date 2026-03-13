import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  JwtPayload,
  ValidatedRefreshUser,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      // 1. 쿠키에서 추출 (타입 에러 방지를 위해 명시적 함수 작성)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const cookies = req.cookies as
            | Record<string, string | undefined>
            | undefined;
          return cookies?.['refreshToken'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      // validate 함수에서 req 객체를 사용할 수 있게 설정
      passReqToCallback: true,
    });
  }

  /**
   * 리프레시 토큰 검증 성공 시 실행
   * 반환 타입: ValidatedRefreshUser (userId, email, refreshToken 포함)
   */
  validate(req: Request, payload: JwtPayload): ValidatedRefreshUser {
    const cookies = req.cookies as
      | Record<string, string | undefined>
      | undefined;
    const refreshToken = cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 쿠키에 없습니다.');
    }

    // 기존 인터페이스 가이드에 맞춰 sub를 userId로 매핑
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken: refreshToken,
    };
  }
}
