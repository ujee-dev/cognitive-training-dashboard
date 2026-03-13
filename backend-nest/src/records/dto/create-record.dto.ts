import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Difficulty } from '../enum/difficulty.enum';

export class CreateGameRecordDto {
  @IsString() gameId: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  // skillScore는 서버 계산으로 Dto에서 제외
  @IsNumber() duration: number;
  @IsNumber() accuracy: number;
  @IsNumber() avgReactionTime: number;

  @IsOptional()
  @IsNumber()
  totalAttempts?: number;

  @IsOptional()
  @IsNumber()
  correctMatches?: number;

  @IsOptional()
  @IsNumber()
  failedAttempts?: number;

  @IsOptional()
  @IsNumber()
  stdDev?: number;

  @IsOptional()
  @IsNumber()
  consistencyScore?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  reactionTimeDetails?: number[]; // 개별 반응 시간들 (표준편차 재계산용)

  @IsOptional()
  @IsString()
  theme?: string;
}
