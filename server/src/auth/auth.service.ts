import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 회원가입
  async signup(email: string, password: string) {
    try {
      const hashed = await bcrypt.hash(password, 10);
      return this.usersService.create(email, hashed); // create : DB 저장
    } catch (err) {
      console.error(err);
      throw new Error('회원가입 실패');
    }
  }

  // 로그인
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. 사용자 존재 여부 확인
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('1');
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 2. 비밀번호 비교 (입력한 평문 vs DB의 해싱된 값)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('2');
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 3. JWT 토큰 발행
    const payload = { sub: user._id, email: user.email };

    // ⭐️ 이 부분이 실행될 때 에러가 나는지 보세요.
    //const token = this.jwtService.sign(payload);
    //console.log('발급된 토큰:', token); // <-- 서버 터미널에 찍히는지 확인

    return {
      // 클라이언트(React)는 이 'accessToken'이라는 키값을 기다리고 있습니다.
      accessToken: this.jwtService.sign(payload),
    };
  }
}
