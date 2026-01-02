import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // 회원 생성
  async create(email: string, password: string) {
    // 1. 비밀번호 해싱 (Salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);
    // 2. 해싱된 비밀번호로 유저 생성
    const user = new this.userModel({
      email,
      password: hashedPassword,
    });
    // 반드시 await를 붙여서 DB 저장이 끝날 때까지 기다려야 합니다.
    const savedUser = await user.save();
    console.log('DB에 저장된 유저:', savedUser); // 서버 터미널에서 확인용
    return savedUser; // MongoDB users 컬렉션에 저장
  }

  // 이메일로 사용자 조회
  async findByEmail(email: string) {
    // .lean()을 붙이면 Mongoose 문서 객체가 아닌 순수 JS 객체로 반환되어 성능이 좋아집니다.
    return this.userModel.findOne({ email }).lean();
  }
}
