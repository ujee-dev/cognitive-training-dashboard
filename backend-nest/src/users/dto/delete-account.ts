import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteAccountdDto {
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  password: string;
}
