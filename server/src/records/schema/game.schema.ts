import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Game {
  @Prop({ required: true, unique: true })
  code: string; // URL용 이름 (예: "card-matching")

  @Prop({ required: true })
  name: string; // 카드 짝 맞추기

  @Prop()
  description?: string;

  // 이벤트/시즌 대응 (기간 한정 난이도 가능)
  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  validFrom?: Date;

  @Prop()
  validTo?: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
