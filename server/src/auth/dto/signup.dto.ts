import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  nickname: string;

  @IsString()
  profileImage: string;
}
