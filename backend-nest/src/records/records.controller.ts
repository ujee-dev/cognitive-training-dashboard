import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ValidatedUser } from '../auth/interfaces/jwt-payload.interface';
import { Difficulty } from './enum/difficulty.enum';
import { RecordsService } from './records.service';
import { CreateGameRecordDto } from './dto/create-record.dto';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /** 게임 기록 생성 */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: Request & { user: ValidatedUser },
    @Body() dto: CreateGameRecordDto,
  ) {
    const userId: string = req.user.userId; // AuthGuard에서 JWT payload로 들어온 userId
    return this.recordsService.create(userId, dto);
  }

  /** 게임 ID */
  @Get('games/:code')
  async getGame(@Param('code') code: string) {
    return this.recordsService.getGame(code);
  }

  /** 게임 난이도 설정 */
  @Get('gameConfig')
  async getGameConfig(
    @Query('gameId') gameId: string,
    @Query(
      'difficulty',
      new ParseEnumPipe(Difficulty, { errorHttpStatusCode: 400 }),
    )
    difficulty: Difficulty,
  ) {
    return this.recordsService.getGameConfig(gameId, difficulty);
  }

  /** 대시보드 조회 (최근 기록, 내 통계, 랭킹) */
  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(
    @Req() req: Request & { user: ValidatedUser },
    @Query('gameId') gameId: string,
    @Query(
      'difficulty',
      new ParseEnumPipe(Difficulty, { errorHttpStatusCode: 400 }),
    )
    difficulty: Difficulty,
  ) {
    const userId: string = req.user.userId;
    return this.recordsService.getDashboard(userId, gameId, difficulty);
  }

  /** 최근 30일 난이도별 평균 기록 조회 */
  @Get('stats/summary')
  @UseGuards(AuthGuard('jwt'))
  async getStatsSummary(
    @Req() req: Request & { user: ValidatedUser },
    @Query('gameId') gameId: string,
  ) {
    const userId: string = req.user.userId;
    return this.recordsService.getMyStatsAllDifficulties(userId, gameId);
  }
}
