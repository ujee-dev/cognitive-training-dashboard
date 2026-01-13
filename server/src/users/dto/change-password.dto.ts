import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호는 필수 입력 항목입니다.' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }) // 맞지 않으면 실패
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
  })
  newPassword: string;
}
