import {
  Controller,
  Post,
  Body,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      console.log('클라이언트 요청 도달:', signupDto); // 1. 이 로그가 찍히는지 확인
      const result = await this.usersService.create(
        signupDto.email,
        signupDto.password,
      ); // 2. await 확인
      console.log('서비스 호출 결과:', result); // 3. 이 로그가 찍히는지 확인
      return result;
    } catch (err: unknown) {
      // 1. error가 객체이고 code 속성이 11000인지 안전하게 검사
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        throw new ConflictException('이미 존재하는 이메일입니다.');
      }

      // 2. Prettier 줄바꿈 규칙 준수
      throw new InternalServerErrorException(
        '회원가입 중 서버 에러가 발생했습니다.',
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('클라이언트 요청 도달:', JSON.stringify(loginDto)); // 1. 이 로그가 찍히는지 확인
    return this.authService.login(loginDto);
  }
}
