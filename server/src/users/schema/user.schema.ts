import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string; // = ID

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  password: string; // bcrypt hash

  @Prop()
  profileImage?: string;

  // Refresh Token 해시 저장:
  // 동시에 로그인한 토큰 1개만 유지
  // 새 로그인 → 이전 Refresh Token 즉시 폐기
  // 보안 사고 시 “강제 로그아웃” 가능
  @Prop({
    type: String, // Mongoose에게 이 필드는 DB상에서 'String'임을 명시
    default: null, // 초기값은 null로 설정
  })
  currentHashedRefreshToken?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
