import {
  Controller,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountdDto } from './dto/delete-account';
import { AuthGuard } from '@nestjs/passport';
import type { ValidatedUser } from '../auth/interfaces/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 프로필 수정
   * PATCH /users/profile
   */
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('profileImage', {
      // 1. 파일이 서버 메모리에만 머물지 않고 실제 폴더에 저장되도록 설정 추가
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      // 이미지 파일 형식 제한 (보안 강화)
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async updateProfile(
    @Req() req: Request & { user: ValidatedUser },
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File, // 파일은 선택 사항일 수 있으므로 '?' 추가
  ) {
    // 2. 업데이트할 데이터 객체 구성
    const updateData: Partial<{
      nickname: string;
      profileImage?: string | null;
    }> = {};

    if (dto.nickname) {
      updateData.nickname = dto.nickname;
    }

    if (file) {
      // 파일이 새로 들어온 경우
      updateData.profileImage = `/uploads/profiles/${file.filename}`;
    } else if (dto.profileImage === '') {
      // 핵심: 클라이언트가 삭제 신호('')를 보낸 경우만 null로 설정
      updateData.profileImage = null;
    }

    //console.log(updateData.profileImage);

    // 3. 수정할 내용이 아무것도 없는 경우 예외 처리
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('수정할 내용이 없습니다.');
    }

    const updated = await this.usersService.updateProfile(
      req.user.userId,
      updateData,
    );

    // 4. 결과 반환 (비밀번호 등 민감정보 제외)
    return {
      id: updated._id.toString(),
      email: updated.email,
      name: updated.name,
      nickname: updated.nickname,
      profileImage: updated.profileImage,
    };
  }

  /**
   * 비밀번호 변경
   * Patch /users/password
   */
  @Post('password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req: Request & { user: ValidatedUser },
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    //console.log('req.user =', req.user);
    return await this.usersService.changePassword(req.user.userId, dto);
  }

  @Delete('account')
  @UseGuards(AuthGuard('jwt'))
  async deleteAccount(
    @Req() req: Request & { user: ValidatedUser },
    @Body() dto: DeleteAccountdDto,
  ) {
    await this.usersService.deleteAccount(req.user.userId, dto);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
