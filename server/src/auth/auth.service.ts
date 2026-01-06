import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from '../auth/dto/login.dto';
import { SignupDto } from './dto/signup.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 회원가입
  async signup(signupDto: SignupDto) {
    try {
      // spread 연산자(...)를 쓰면 깔끔
      const { password, ...others } = signupDto;
      const hashed = await bcrypt.hash(password, 10);

      // DB 저장: 'others' 안의 email, name, nickname과 해싱된 password를 합침
      const user = await this.usersService.create({
        ...others, // name, nickname 등이 그대로 복사됨
        password: hashed,
      });

      // 응답은 가이드대로 id와 email만 추려서 보냄
      // user._id는 MongoDB 객체이므로 안전하게 string으로 변환하거나 그대로 반환
      return { id: user._id.toString(), email: user.email };
    } catch (err: unknown) {
      // MongoDB Unique Index 위반 에러(이메일 중복) 처리
      // 에러가 객체이고 code 속성이 있는지 확인하는 타입 가드
      // 하단에 private isMongoError 선언
      if (this.isMongoError(err) && err.code === 11000) {
        throw new ConflictException('이미 존재하는 이메일입니다.');
      }

      console.error(err);
      throw new InternalServerErrorException('회원가입 실패');
    }
  }

  // 2. 헬퍼 메서드: Mongo 에러 타입인지 판별
  private isMongoError(err: any): err is { code: number } {
    return err !== null && typeof err === 'object' && 'code' in err;
  }

  async logout(userId: string): Promise<void> {
    // 이미 UsersService에 구현된 메서드를 재사용하여 책임 분리
    await this.usersService.removeRefreshToken(userId);
  }

  // 로그인
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. 사용자 존재 여부 확인
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 2. 비밀번호 비교 (입력한 평문 vs DB의 해싱된 값)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 3. JWT 토큰 발행
    // JwtPayload 사용
    // sub 사용 OK
    // string OK (MongoDB)
    const payload = { sub: user._id.toString(), email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Refresh Token 해시 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setCurrentRefreshToken(
      user._id.toString(),
      hashedRefreshToken,
    );

    return {
      // 클라이언트(React)는 이 'accessToken'이라는 키값을 기다리고 있습니다.
      //accessToken: this.jwtService.sign(payload),
      accessToken,
      refreshToken,
    };
  }

  /**
   * 토큰 갱신
   */
  async refreshTokens(userId: string, email: string, refreshToken: string) {
    const user = await this.usersService.getUserIfRefreshTokenMatches(
      userId,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException(
        '접근이 거부되었습니다. 다시 로그인하세요.',
      );
    }

    // DB에서 해당 유저를 찾고 저장된 리프레시 토큰이 있는지 확인
    // (MongoDB 연동 시 userModel.findById(userId) 등을 사용)
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Refresh Token 해시 저장: DB 갱신 (기존 리프레시 토큰은 이제 못 씀)
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.setCurrentRefreshToken(
      user._id.toString(),
      hashedRefreshToken,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // 컨트롤러에서 쿠키를 구워줘야 함
    };
  }
}
