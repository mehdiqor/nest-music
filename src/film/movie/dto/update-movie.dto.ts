import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MovieGenre } from 'src/schemas/movie.schema';

export class UpdateMovieDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  year?: string;

  @IsEnum(MovieGenre)
  @IsOptional()
  @ApiProperty({
    enum: MovieGenre,
    required: false,
  })
  genre?: MovieGenre;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  link?: string;
}
