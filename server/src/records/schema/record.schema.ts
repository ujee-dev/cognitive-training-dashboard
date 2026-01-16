import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Difficulty } from '../enum/difficulty.enum';

export type GameRecordDocument = HydratedDocument<GameRecord>;

@Schema({ timestamps: true }) // createdAt: Date 자동생성 됨
export class GameRecord {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Game',
    required: true,
    index: true,
  })
  gameId: Types.ObjectId;

  @Prop({ enum: Difficulty, required: true })
  difficulty: Difficulty;

  @Prop({ required: true })
  skillScore: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  accuracy: number;

  @Prop({ required: true })
  avgReactionTime: number;

  @Prop() totalAttempts?: number;
  @Prop() correctMatches?: number;
  @Prop() failedAttempts?: number;

  @Prop() theme?: string; // 테마값

  @Prop({ type: [Number] })
  reactionTimeDetails?: number[]; // 개별 반응 시간들 (표준편차 재계산용)
  @Prop() stdDev?: number; // 표준편차
  @Prop() consistencyScore?: number; // 일관성 점수 (0~100)
}

export const GameRecordSchema = SchemaFactory.createForClass(GameRecord);

// 랭킹 및 최근 기록 조회를 위한 복합 인덱스
GameRecordSchema.index({
  userId: 1,
  gameId: 1,
  difficulty: 1,
  createdAt: -1,
});
GameRecordSchema.index({ gameId: 1, difficulty: 1, skillScore: -1 });
