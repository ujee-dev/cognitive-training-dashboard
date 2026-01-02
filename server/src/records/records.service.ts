import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from './record.schema';
import { CreateRecordDto } from './dto/create-record.dto'; // 위에서 만든 DTO 임포트

@Injectable()
export class RecordsService {
  constructor(@InjectModel(Record.name) private recordModel: Model<Record>) {}

  // 기록 저장
  async create(createRecordDto: CreateRecordDto) {
    const record = new this.recordModel(createRecordDto);
    return await record.save();
  }

  // 상위 10개 랭킹
  async findTop10(difficulty?: string) {
    return await this.recordModel
      .find({ difficulty })
      .sort({
        clearTime: 1, // 1순위: 클리어 시간 오름차순 (짧은 순)
        flipCount: 1, // 2순위: 시간이 같다면 뒤집기 횟수 오름차순 (적은 순)
      })
      .limit(10) // 10개만
      .exec(); // 실행
  }

  // 내 기록
  async findByUser(email: string, difficulty?: string) {
    //const today = new Date();
    //today.setHours(0, 0, 0, 0); // 오늘 00:00:00

    return await this.recordModel
      //.find({ createdAt: { $gte: today }, userName: email }) // 오늘 0시 이후 데이터만
      .find({ userName: email, difficulty }) // 내 이메일과 일치하는 것만
      .sort({ createdAt: -1 }) // 최신순 정렬
      .exec();
  }
}
