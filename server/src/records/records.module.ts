import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { Record, RecordSchema } from './record.schema';

@Module({
  imports: [
    // MongoDB에 Record 스키마 연결
    MongooseModule.forFeature([{ name: Record.name, schema: RecordSchema }]),
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
