import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MusicDocument = Music & Document;

@Schema()
export class Music {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  artist: string;

  @Prop({ required: false })
  album: string;

  @Prop({ required: true })
  genre: MusicGenre[];

  @Prop({ type: [String], default: [], required: false })
  tags: string[];

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
