import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Music extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  artist: string;

  @Prop({ required: false })
  album: string;

  @Prop({ required: true })
  genre: MusicGenre;

  @Prop({
    type: [String],
    default: [],
    required: false,
  })
  tags: string[];

  @Prop({ required: false })
  link: string;

  @Prop()
  length: string;

  @Prop()
  filePath: string;
}

export enum MusicGenre {
  ROCK = 'ROCK',
  METAL = 'METAL',
  JAZZ = 'JAZZ',
  BLUES = 'BLUES',
  COUNTRY = 'COUNTRY',
  CLASSIC = 'CLASSIC',
  ELECTRONIC = 'ELECTRONIC',
  POP = 'POP',
  RAP = 'RAP',
}

export const MusicSchema =
  SchemaFactory.createForClass(Music);
