import { Field, ObjectType } from '@nestjs/graphql';
import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';
@ObjectType()
@Schema()
export class Track extends Document {
  @Field(() => String)
  @Prop({ required: true })
  trackName: string;

  @Field(() => [String])
  @Prop({
    type: [String],
    default: [],
    required: false,
  })
  tags: string[];

  @Field(() => String)
  @Prop({ required: false })
  youtube_link: string;

  @Field(() => String)
  @Prop()
  length: string;

  @Field(() => String)
  @Prop()
  fileName: string;

  @Field(() => String)
  @Prop()
  filePath: string;
}

export const TrackSchema =
  SchemaFactory.createForClass(Track);

TrackSchema.index({
  trackName: 'text',
});

@ObjectType()
@Schema()
export class Album extends Document {
  @Field(() => String)
  @Prop({ required: true })
  albumName: string;

  @Field(() => String)
  @Prop({ required: false })
  year: string;

  @Field(() => String)
  @Prop({ required: true })
  genre: MusicGenre;

  @Field(() => [Track])
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
  albumName: 'text',
});

@ObjectType()
@Schema()
export class Artist extends Document {
  @Field(() => String)
  @Prop({ required: true })
  artistName: string;

  @Field(() => [Album])
  @Prop({ type: [AlbumSchema], default: [] })
  albums: [Album];
}

export const ArtistSchema =
  SchemaFactory.createForClass(Artist);

ArtistSchema.index({
  artistName: 'text',
});
