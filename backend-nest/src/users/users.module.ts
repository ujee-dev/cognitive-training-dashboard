// src/users/users.module.ts (파일 위치를 확인하세요)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schema/user.schema'; // 유저 스키마 경로 확인

@Module({
  imports: [
    // 이 부분이 핵심입니다! UserModel을 이 모듈에서 쓸 수 있게 등록합니다.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 다른 모듈(AuthModule 등)에서 쓸 경우 필요
})
export class UsersModule {}
