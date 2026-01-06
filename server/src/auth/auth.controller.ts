import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { Response, Request } from 'express';
import type {
  ValidatedRefreshUser,
  ValidatedUser,
} from './interfaces/jwt-payload.interface';

// 컨트롤러는 JWT 구조를 모름
// userId / email / refreshToken만 신뢰
// Passport 책임 범위를 넘지 않음
// 절대 payload.sub를 여기서 다시 쓰면 안 됨

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ✅ 회원가입
   */

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    // Service에서 이미 예외 처리를 하므로 Controller는 결과만 반환합니다.
    return await this.authService.signup(signupDto);
  }

  /**
   * ✅ 로그인
   * - Access Token: 응답 body
   * - Refresh Token: HttpOnly Cookie
   */
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response, // 명시
  ) {
    const { accessToken, refreshToken } = await this.authService.login(body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return { accessToken };
  }

  /**
   * 토큰 갱신 (Refresh)
   */
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: ValidatedRefreshUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user.userId,
      req.user.email,
      req.user.refreshToken,
    );

    // 새로 발급된 리프레시 토큰으로 쿠키 업데이트
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return { accessToken };
  }

  /**
   * 🚪 로그아웃
   * - Refresh Token 쿠키 삭제
   */
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Req() req: Request & { user: ValidatedUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.userId);
    res.clearCookie('refreshToken', { path: '/' });
    return { message: '로그아웃 완료' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Access Token이 유효해야만 접근 가능
  getMe(@Req() req: Request & { user: ValidatedUser }) {
    // JwtStrategy의 validate()에서 반환한 { userId, email }이 req.user에 들어있습니다.
    return req.user;
  }
}
