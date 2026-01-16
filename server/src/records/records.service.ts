import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Game } from './schema/game.schema';
import { GameRecord, GameRecordDocument } from './schema/record.schema';
import { GameDifficultyConfig } from './schema/gameDifficultyConfig.schema';
import { CreateGameRecordDto } from './dto/create-record.dto';
import { Difficulty } from './enum/difficulty.enum';
import { calculateReactionScore } from './util/reaction-scale.util';
import { User } from '../users/schema/user.schema';
import { DashboardResponseDto, ProgressDto } from './dto/dashboard.dto';

export interface DifficultyStats {
  difficulty: string;
  games: number;
  avgAccuracy: number;
  avgReactionTime: number;
  avgDuration: number;
}

// aggregate 전용
interface AvgReactionAgg {
  _id: null;
  avgReactionTime: number;
}

interface AvgAccuracyAgg {
  _id: null;
  avgAccuracy: number;
}

interface AvgSkillScoreAgg {
  _id: null;
  avgSkillScore: number;
}

interface RankAgg {
  _id: Types.ObjectId;
  bestScore: number;
  rank: number;
}

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Game.name)
    private readonly gameModel: Model<Game>,

    @InjectModel(GameRecord.name)
    private readonly recordModel: Model<GameRecordDocument>,

    @InjectModel(GameDifficultyConfig.name)
    private readonly configModel: Model<GameDifficultyConfig>,
  ) {}

  // 게임 정보
  async getGame(code: string) {
    const game = await this.gameModel.findOne({ code }).lean();
    if (!game) throw new NotFoundException('Game not found');

    return {
      id: game._id.toString(),
      code: game.code,
      name: game.name,
    };
  }

  // 게임 난이도 설정
  async getGameConfig(gameIdStr: string, difficulty: Difficulty) {
    const gameConfig = await this.configModel
      .findOne({
        gameId: new Types.ObjectId(gameIdStr),
        difficulty,
      })
      .lean();

    if (!gameConfig) throw new NotFoundException('Game not found');
    return { gameConfig };
  }

  // 기록 저장
  async create(userIdStr: string, dto: CreateGameRecordDto) {
    const userObjectId = new Types.ObjectId(userIdStr);
    const gameObjectId = new Types.ObjectId(dto.gameId);

    const config = await this.configModel.findOne({
      gameId: gameObjectId,
      difficulty: dto.difficulty,
    });

    if (!config) throw new NotFoundException('Game configuration not found');

    const score = this.calculateServerScore(dto, config);

    return this.recordModel.create({
      ...dto,
      skillScore: score,
      userId: userObjectId,
      gameId: gameObjectId,
    });
  }

  private calculateServerScore(
    dto: CreateGameRecordDto,
    config: GameDifficultyConfig,
  ): number {
    // 반응속도 점수화
    const reactionScore = calculateReactionScore(
      dto.avgReactionTime,
      dto.difficulty,
    );

    // 가중치 기반 기본 점수 > 배율 적용
    let finalScore =
      (dto.accuracy * config.accuracyWeight +
        reactionScore * config.reactionWeight) *
      config.scoreMultiplier;

    // 감점 적용
    if (dto.failedAttempts && config.penaltyWeight) {
      finalScore -= dto.failedAttempts * config.penaltyWeight;
    }

    return Math.max(0, Math.round(finalScore));
  }

  // 대시보드 (랭킹 포함)
  async getDashboard(
    userIdStr: string,
    gameIdStr: string,
    difficulty: Difficulty,
  ): Promise<DashboardResponseDto> {
    const userId = new Types.ObjectId(userIdStr);
    const gameId = new Types.ObjectId(gameIdStr);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 병렬 조회: (참고 10회 평균 반응 속도는 별도 계산)
    // 최근 10회 기록, 30일 평균 반응속도
    // bestScore, worstScore, Redis 랭킹 TOP 10, 판정용 데이터
    const [
      recentRecords,
      avgReaction30d,
      bestScore,
      worstScore,
      rankingRaw,
      myRankRaw,
      avgScore30d, // 판정용
      avgAccuracy30d,
    ] = await Promise.all([
      // 최근 10회
      this.recordModel
        .find({ userId, gameId, difficulty })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // 30일 평균 반응속도
      this.recordModel.aggregate<AvgReactionAgg>([
        {
          $match: {
            userId,
            gameId,
            difficulty,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            avgReactionTime: { $avg: '$avgReactionTime' },
          },
        },
      ]),

      // 최고 점수
      this.recordModel
        .findOne({ userId, gameId, difficulty })
        .sort({ skillScore: -1 })
        .lean(),

      // 최저 점수
      this.recordModel
        .findOne({ userId, gameId, difficulty })
        .sort({ skillScore: 1 })
        .lean(),

      // 랭킹 Top 10 (유저별 최고 점수)
      this.recordModel.aggregate<RankAgg>([
        { $match: { gameId, difficulty } },
        {
          $group: {
            _id: '$userId', // 사용자별 그룹
            bestScore: { $max: '$skillScore' },
          },
        },
        { $sort: { bestScore: -1 } },
        { $limit: 10 },
      ]),

      // 내 랭킹 계산
      this.recordModel.aggregate<RankAgg>([
        { $match: { gameId, difficulty } },
        {
          $group: {
            _id: '$userId',
            bestScore: { $max: '$skillScore' },
          },
        },
        { $sort: { bestScore: -1 } },
        {
          $setWindowFields: {
            sortBy: { bestScore: -1 },
            output: {
              rank: { $rank: {} }, // MongoDB의 $rank: 전체 결과, 동점자는 같은 랭크
            },
          },
        },
        { $match: { _id: userId } }, // 내 아이디
      ]),

      // avgScore30d: 30일 기간 평균 점수 + 판정용
      this.recordModel.aggregate<AvgSkillScoreAgg>([
        {
          $match: {
            userId,
            gameId,
            difficulty,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        { $group: { _id: null, avgSkillScore: { $avg: '$skillScore' } } },
      ]),

      // avgAccuracy30d: 30일 기간 평균 정확도
      this.recordModel.aggregate<AvgAccuracyAgg>([
        {
          $match: {
            userId,
            gameId,
            difficulty,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } },
      ]),
    ]);

    // 최근 10회 평균 (반응속도)
    const avgReactionRecent10 =
      recentRecords.length > 0
        ? Number(
            (
              recentRecords.reduce((acc, r) => acc + r.avgReactionTime, 0) /
              recentRecords.length
            ).toFixed(3),
          )
        : 0;

    // 30일 평균 반응속도 처리
    const avgReaction30dValue: number =
      avgReaction30d.length > 0
        ? Number(avgReaction30d[0].avgReactionTime.toFixed(3))
        : 0;

    // 30일 평균 정확도 처리
    const avgAccuracy30dValue: number =
      avgAccuracy30d.length > 0
        ? Number(avgAccuracy30d[0].avgAccuracy.toFixed(1))
        : 0;

    // best worst score
    const bestSkillScore = bestScore?.skillScore ?? 0;
    const worstSkillScore = worstScore?.skillScore ?? 0;

    // 위에서 SkillScoreAvgResult 타입 정의로 숫자 인지
    const overallAvgSkillScore =
      avgScore30d.length > 0 ? avgScore30d[0].avgSkillScore : 0;

    // 실력 판정 (Progress Judgment) 로직
    const judgeProgress = (): ProgressDto => {
      const CONFIG = {
        MIN_DATA_FOR_TREND: 5,
        SHORT_TERM_THRESHOLD: 0.2,
        CONSISTENCY_THRESHOLD: 0.1,
      };
      const THEME = {
        IMPROVED: { status: '향상', color: 'bg-blue-300', trend: 'up' },
        DECLINED: { status: '저하', color: 'bg-red-300', trend: 'down' },
        MAINTAINED: { status: '유지', color: 'bg-gray-100', trend: 'flat' },
        NO_DATA: {
          status: '데이터가 없습니다.',
          color: 'bg-gray-100',
          trend: 'none',
        },
      };

      const count = recentRecords.length;
      if (count === 0)
        return {
          status: '데이터가 없습니다.',
          color: 'bg-gray-100',
          trend: 'none',
          duration: 'short',
          message: '아직 분석할 플레이 기록이 없습니다.',
        };

      // 판정 로직을 위해 시간 순서대로 정렬 (최신 10개를 가져왔으므로 뒤집기)
      const scores = [...recentRecords].reverse().map((r) => r.skillScore);

      const safeChangeRate = (curr: number, base: number) =>
        base === 0 ? 0 : (curr - base) / base;
      const formatChangeText = (rate: number) => {
        const percent = Number((rate * 100).toFixed(1));
        if (percent === 0) return '';
        return percent > 0
          ? `약 ${percent}% 상승`
          : `약 ${Math.abs(percent)}% 하락`;
      };

      if (count === 1)
        return {
          status: '유지',
          color: 'bg-gray-100',
          trend: 'flat',
          message:
            '첫 기록입니다. 이후 플레이를 통해 실력 변화를 분석할 수 있습니다.',
        };

      // 단기 데이터 (2~4개)
      if (count < CONFIG.MIN_DATA_FOR_TREND) {
        const first = scores[0];
        const last = scores[scores.length - 1];
        const changeRate = safeChangeRate(last, first);
        const changeText = formatChangeText(changeRate);

        const isImprovingConsistently = scores.every(
          (s, i) => i === 0 || s >= first * (1 - CONFIG.CONSISTENCY_THRESHOLD),
        );
        const isDecliningConsistently = scores.every(
          (s, i) => i === 0 || s <= first * (1 + CONFIG.CONSISTENCY_THRESHOLD),
        );

        if (
          changeRate >= CONFIG.SHORT_TERM_THRESHOLD &&
          isImprovingConsistently
        ) {
          return {
            status: '향상',
            color: 'bg-blue-300',
            trend: 'up',
            changeRate,
            duration: 'short',
            message: `최근 ${count}회 동안 점수가 ${changeText}하며 안정적으로 적응 중입니다.`,
          };
        }
        if (
          changeRate <= -CONFIG.SHORT_TERM_THRESHOLD &&
          isDecliningConsistently
        ) {
          return {
            status: '저하',
            color: 'bg-red-300',
            trend: 'down',
            changeRate,
            duration: 'short',
            message: `최근 점수가 ${changeText} 중입니다. 난이도를 조절하거나 휴식을 취해 보세요.`,
          };
        }
        return {
          status: '유지',
          color: 'bg-gray-100',
          trend: 'flat',
          changeRate,
          duration: 'short',
          message:
            '초기 기록 측정 중입니다. 점수 변동을 관찰하며 안정적인 추이를 확인하세요.',
        };
      }

      // 장기 데이터 (5개 이상)
      const calcAvg = (arr: number[]) =>
        arr.reduce((a, b) => a + b, 0) / arr.length;
      const recentAvg = calcAvg(scores);
      const mid = Math.floor(scores.length / 2);
      const firstHalfAvg = calcAvg(scores.slice(0, mid));
      const secondHalfAvg = calcAvg(scores.slice(mid));

      const trend =
        secondHalfAvg > firstHalfAvg * 1.05
          ? 'up'
          : secondHalfAvg < firstHalfAvg * 0.95
            ? 'down'
            : 'flat';
      const changeRate = safeChangeRate(recentAvg, overallAvgSkillScore);
      const changeText = formatChangeText(changeRate);

      if (trend === 'up') {
        const isAboveAvg = recentAvg >= overallAvgSkillScore;
        return {
          ...THEME[isAboveAvg ? 'IMPROVED' : 'MAINTAINED'],
          trend,
          duration: 'long',
          changeRate,
          message: isAboveAvg
            ? `점수가 꾸준히 상승하여 평균 기량을 회복했습니다. ${changeText}`
            : `점수가 회복세에 있습니다. 곧 이전 평균을 상회할 것으로 보입니다!`,
        };
      }
      if (trend === 'down' && recentAvg < overallAvgSkillScore) {
        return {
          ...THEME.DECLINED,
          trend,
          duration: 'long',
          changeRate,
          message: `최근 집중도가 다소 저하되었습니다. ${changeText ? `" ${changeText} "` : ''} - 정확도 향상 훈련을 권장합니다.`,
        };
      }
      return {
        ...THEME.MAINTAINED,
        trend,
        duration: 'long',
        changeRate,
        message:
          '최근 점수 흐름에 큰 변화가 없어 안정적인 인지 상태를 유지 중입니다.',
      };
    };

    // 랭킹 (유저 정보 확인)
    const userIds = rankingRaw.map((r) => r._id);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('_id nickname profileImage')
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    let currentRank = 0;
    let lastScore: number | null = null;

    const ranking = rankingRaw.map((r, index) => {
      if (lastScore === null || r.bestScore < lastScore) {
        currentRank = index + 1;
        lastScore = r.bestScore;
      }

      return {
        rank: currentRank, // 공동 랭킹
        userId: r._id.toString(),
        score: r.bestScore,
        nickname: userMap.get(r._id.toString())?.nickname ?? 'Unknown',
        profileImage: userMap.get(r._id.toString())?.profileImage ?? null,
        isMe: r._id.toString() === userIdStr,
      };
    });

    const myRank = myRankRaw.length ? myRankRaw[0].rank : null;

    // 상위 퍼센트
    const totalPlayersAgg = await this.recordModel.aggregate<{
      total: number;
    }>([
      { $match: { gameId, difficulty } },
      { $group: { _id: '$userId' } },
      { $count: 'total' },
    ]);

    const totalPlayers = totalPlayersAgg.length ? totalPlayersAgg[0].total : 0;

    const topPercentage =
      myRank && totalPlayers
        ? Number(((myRank / totalPlayers) * 100).toFixed(1))
        : null;

    return {
      recentRecords,
      avgReactionRecent10,
      avgReaction30dValue,
      overallAvgSkillScore,
      avgAccuracy30dValue,
      bestSkillScore,
      worstSkillScore,
      ranking,
      myRank,
      totalPlayers,
      topPercentage,
      progress: judgeProgress(),
    };
  }

  // 난이도별 통계
  async getMyStatsAllDifficulties(
    userIdStr: string,
    gameIdStr: string,
  ): Promise<DifficultyStats[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await this.recordModel.aggregate<DifficultyStats>([
      {
        $match: {
          userId: new Types.ObjectId(userIdStr),
          gameId: new Types.ObjectId(gameIdStr),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$difficulty',
          avgAccuracy: { $avg: '$accuracy' },
          avgReactionTime: { $avg: '$avgReactionTime' },
          avgDuration: { $avg: '$duration' },
          games: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          difficulty: '$_id',
          avgAccuracy: { $toDouble: { $round: ['$avgAccuracy', 1] } },
          avgReactionTime: { $toDouble: { $round: ['$avgReactionTime', 3] } },
          avgDuration: { $toDouble: { $round: ['$avgDuration', 1] } },
          games: 1,
        },
      },
    ]);

    const difficulties = ['EASY', 'NORMAL', 'HARD'];

    const result = difficulties.map((diff): DifficultyStats => {
      const found = data.find((stat) => stat.difficulty === diff);
      return (
        found || {
          difficulty: diff,
          games: 0,
          avgAccuracy: 0,
          avgReactionTime: 0,
          avgDuration: 0,
        }
      );
    });
    //console.log('result', result);
    return result;
  }
}
