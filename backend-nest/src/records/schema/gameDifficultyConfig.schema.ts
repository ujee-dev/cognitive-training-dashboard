import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Difficulty } from '../enum/difficulty.enum';
import { Types } from 'mongoose';

@Schema()
export class GameDifficultyConfig {
  @Prop({ type: Types.ObjectId, ref: 'Game', index: true })
  gameId: Types.ObjectId;

  @Prop({ enum: Difficulty, required: true })
  difficulty: Difficulty;

  // Gameplay rule
  @Prop() pairs: number;
  @Prop() timeLimit: number;
  @Prop() previewSeconds: number;

  // Score rule : 난이도별 계산 가중치
  @Prop() scoreMultiplier: number;
  @Prop() accuracyWeight: number;
  @Prop() reactionWeight: number;
  @Prop() penaltyWeight: number;
}

export const GameDifficultyConfigSchema =
  SchemaFactory.createForClass(GameDifficultyConfig);
