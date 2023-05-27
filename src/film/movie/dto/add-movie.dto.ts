import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MovieGenre } from 'src/schemas/movie.schema';

export class AddMovieDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  directorName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  year?: string;

  @IsEnum(MovieGenre)
  @IsNotEmpty()
  @ApiProperty({
    enum: MovieGenre,
  })
  genre: MovieGenre;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  link?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;
}
