import { IsEmail, IsString, IsNotEmpty } from 'class-validator'; // 설치 필요: npm install class-validator class-transformer

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;
}

/**
 * 로그인은 이미 정책을 만족하는 값과의 비교 단계이므로
 * 형식 검증보다는 값 존재 여부만 확인
 * 또한 로그인 단계에서 과도한 Validation 메시지는
 * 보안 정책을 노출할 수 있어 의도적으로 최소화
 */
