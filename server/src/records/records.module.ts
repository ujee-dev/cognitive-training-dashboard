import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

import { GameRecord, GameRecordSchema } from './schema/record.schema';
import { Game, GameSchema } from './schema/game.schema';
import { Difficulty } from './enum/difficulty.enum';
import {
  GameDifficultyConfig,
  GameDifficultyConfigSchema,
} from './schema/gameDifficultyConfig.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameRecord.name, schema: GameRecordSchema },
      { name: Game.name, schema: GameSchema },
      { name: GameDifficultyConfig.name, schema: GameDifficultyConfigSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule implements OnModuleInit {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(GameDifficultyConfig.name)
    private configModel: Model<GameDifficultyConfig>,
  ) {}

  // 서버 시작 시 초기 데이터(Seed) 삽입
  async onModuleInit() {
    const cardGame = await this.gameModel.findOneAndUpdate(
      { code: 'card-matching' },
      { name: '카드 짝 맞추기', isActive: true },
      { upsert: true, new: true },
    );

    const configs = [
      {
        difficulty: Difficulty.EASY,
        pairs: 4,
        timeLimit: 30,
        previewSeconds: 5,
        scoreMultiplier: 1,
        accuracyWeight: 0.8,
        reactionWeight: 0.2,
        penaltyWeight: 0,
      },
      {
        difficulty: Difficulty.NORMAL,
        pairs: 6,
        timeLimit: 50,
        previewSeconds: 5,
        scoreMultiplier: 1.2,
        accuracyWeight: 0.7,
        reactionWeight: 0.3,
        penaltyWeight: 2,
      },
      {
        difficulty: Difficulty.HARD,
        pairs: 8,
        timeLimit: 45,
        previewSeconds: 5,
        scoreMultiplier: 1.6,
        accuracyWeight: 0.7,
        reactionWeight: 0.3,
        penaltyWeight: 5,
      },
    ];

    for (const config of configs) {
      await this.configModel.updateOne(
        { gameId: cardGame._id, difficulty: config.difficulty },
        { $set: config },
        { upsert: true },
      );
    }
    console.log('Game Configs Seeded');
  }
}
