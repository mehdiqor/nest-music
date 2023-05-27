import { ConfigService } from '@nestjs/config';
import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

const config = new ConfigService();

@Schema()
export class Movie extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  year: string;

  @Prop({ required: true })
  genre: MovieGenre;

  @Prop({ required: false })
  link: string;

  @Prop()
  fileName: string;

  @Prop()
  filePath: string;
}

export enum MovieGenre {
  DRAMA = 'DRAMA',
  COMEDY = 'COMEDY',
  ACTION = 'ACTION',
  FANTASY = 'FANTASY',
  HORROR = 'HORROR',
  ROMANCE = 'ROMANCE',
  WESTERN = 'WESTERN',
  THRILLER = 'THRILLER',
}

export const MovieSchema =
  SchemaFactory.createForClass(Movie);

MovieSchema.index({
  title: 'text',
  year: 'text',
});

MovieSchema.virtual('movieURL').get(function () {
  return `${config.get('HOST')}:${config.get('PORT')}/${this.fileName}`;
});

@Schema()
export class Director extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [MovieSchema], default: [] })
  movies: [Movie];
}

export const DirectorSchema =
  SchemaFactory.createForClass(Director);

DirectorSchema.index({
  name: 'text',
});
