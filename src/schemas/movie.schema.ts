import { Field, ObjectType } from '@nestjs/graphql';
import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class Movie extends Document {
  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String)
  @Prop({ required: false })
  year: string;

  @Field(() => String)
  @Prop({ required: true })
  genre: MovieGenre;

  @Field(() => String)
  @Prop({ required: false })
  link: string;

  @Field(() => String)
  @Prop()
  imageName: string;

  @Field(() => String)
  @Prop()
  imagePath: string;
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

@ObjectType()
@Schema()
export class Director extends Document {
  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => [Movie])
  @Prop({ type: [MovieSchema], default: [] })
  movies: [Movie];
}

export const DirectorSchema =
  SchemaFactory.createForClass(Director);

DirectorSchema.index({
  name: 'text',
});
