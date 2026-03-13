import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountdDto } from './dto/delete-account';
import * as path from 'path';
import * as fs from 'fs';

// 해싱 책임 → AuthService
// DB 저장 책임 → UsersService

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 비밀번호는 평문이든 해시든 인증 정보이기 때문에
  // 반드시 서버에서 해싱하고 클라이언트는 절대 관여하지 않습니다.

  // 회원 생성
  async create(userData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel({
      ...userData,
      name: userData.name ?? 'default',
      nickname: userData.nickname ?? 'user',
    });
    return newUser.save();
  }

  /**
   * 이메일 기준 사용자 조회: 읽기 전용 작업은 lean()을 사용하여 성능 최적화
   * - 회원가입: 이메일 중복 체크 / 로그인: 비밀번호 비교
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).lean();
  }

  /**
   * MongoDB _id 기준 사용자 조회
   * - Refresh Token 검증 / Access Token 재발급 / 로그아웃 시 Refresh Token 제거
   * -> 이후 user.save()가 필요하므로 반드시 Document 형태로 조회
   */
  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  /**
   * Refresh Token 업데이트
   * : findByIdAndUpdate보다 'findById -> save() 방식'이 권장되는 이유:
   * Mongoose 미들웨어(pre-save)가 작동하며, 객체 지향적인 업데이트가 가능합니다.
   */

  // clearRefreshToken은 결국 setCurrentRefreshToken에 null을 넣는 것과 같습니다.
  // 실무에서는 코드 중복을 줄이기 위해 하나로 합치거나 내부적으로 재사용합니다.
  async setCurrentRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();

    // NotFoundException 에러 해결: 'new' 키워드와 함께 표준 방식으로 사용
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // 타입 에러 방지를 위해 명시적 할당
    // Schema 정의에서 해당 필드가 null을 허용하도록 설정되어 있어야 함
    user.currentHashedRefreshToken = hashedToken;
    await user.save();
  }

  // 로그아웃 (setCurrentRefreshToken 재사용으로 중복 제거)
  async removeRefreshToken(userId: string): Promise<void> {
    return this.setCurrentRefreshToken(userId, null);
  }

  async getUserIfRefreshTokenMatches(
    userId: string,
    refreshToken: string,
  ): Promise<UserDocument | null> {
    const user = await this.findById(userId);
    if (!user || !user.currentHashedRefreshToken) {
      return null;
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    return isMatch ? user : null;
  }

  // 프로필 수정
  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<UserDocument> {
    // 1. 기존 유저 정보 조회
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 2. 물리적 파일 삭제 로직 (이미지가 교체되거나 삭제될 때)
    // updateData.profileImage가 존재한다는 것은 수정(새 경로) 또는 삭제(null) 요청이라는 뜻입니다.
    if (
      Object.prototype.hasOwnProperty.call(updateData, 'profileImage') &&
      user.profileImage
    ) {
      const oldFilePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // 서버에서 실제 파일 삭제
      }
    }

    // 3. DB 업데이트
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }, // 업데이트된 데이터 반환
      )
      .exec();

    if (!updatedUser)
      throw new NotFoundException('수정 중 오류가 발생했습니다.');
    return updatedUser;
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;

    await user.save();
  }

  /**
   * 회원 탈퇴
   */
  async deleteAccount(userId: string, dto: DeleteAccountdDto): Promise<void> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 비밀번호 검증 (bcrypt 사용 시)
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    // 프로필 이미지가 있다면 물리적 파일 삭제
    if (user.profileImage) {
      const absolutePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (err) {
          console.error('파일 삭제 실패:', err);
        }
      }
    }

    // DB에서 사용자 삭제
    await this.userModel.findByIdAndDelete(userId);
  }
}
