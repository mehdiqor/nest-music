import { ConfigService } from '@nestjs/config';
import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

const config = new ConfigService();
@Schema()
export class Track extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: [String],
    default: [],
    required: false,
  })
  tags: string[];

  @Prop({ required: false })
  youtube_link: string;

  @Prop()
  length: string;

  @Prop()
  filePath: string;
}

export const TrackSchema =
  SchemaFactory.createForClass(Track);

TrackSchema.index({
  name: 'text',
});

TrackSchema.virtual('trackURL').get(function () {
  return `${config.get(
    'HOST',
  )}:${config.get('PORT')}/${this.filePath}`;
});

@Schema()
export class Album extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  year: number;

  @Prop({ required: true })
  genre: MusicGenre;

  @Prop({ type: [TrackSchema], default: [] })
  tracks: [Track];
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

export const AlbumSchema =
  SchemaFactory.createForClass(Album);

AlbumSchema.index({
  name: 'text',
});

@Schema()
export class Artist extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [AlbumSchema], default: [] })
  albums: [Album];
}

export const ArtistSchema =
  SchemaFactory.createForClass(Artist);

ArtistSchema.index({
  name: 'text',
});
