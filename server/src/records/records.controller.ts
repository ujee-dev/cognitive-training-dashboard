import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateRecordDto } from './dto/create-record.dto';
import type { Request } from 'express';

// 기록 저장 API에 JWT 보호 적용

@Controller('records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // 로그인한 사용자만 기록 저장 가능
  async saveRecord(@Body() createRecordDto: CreateRecordDto) {
    return await this.recordsService.create(createRecordDto);
  }

  // 랭킹 조회는 누구나 가능
  @Get('top10/:difficulty') // 랭킹 조회 (GET /records/top10)
  async getRankings(@Param('difficulty') difficulty?: string) {
    const result = await this.recordsService.findTop10(difficulty);
    console.log('📦 DB에서 꺼낸 데이터:', result); // 서버 터미널에 찍힙니다.
    return result;
  }

  @Get('my/:difficulty')
  @UseGuards(JwtAuthGuard) // 로그인 필수
  async getMyRecords(
    @Req() req: Request,
    @Param('difficulty') difficulty?: string,
  ) {
    // req.user가 존재하고 email이 있는지 안전하게 확인
    const user = req.user as { email: string };

    if (!user || !user.email) {
      throw new Error('유저 정보를 찾을 수 없습니다.');
    }

    console.log(`👤 ${user.email}의 기록 조회 중...`);
    return await this.recordsService.findByUser(user.email, difficulty);
  }
}
