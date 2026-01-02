import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Record {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  difficulty: string; // easy / medium / hard

  @Prop({ default: 'default' })
  theme: string;

  @Prop({ required: true })
  clearTime: number;

  @Prop({ required: true })
  flipCount: number;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
