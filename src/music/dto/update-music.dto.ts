import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MusicGenre } from 'src/schemas/music.schema';

export class UpdateMusicDto {
  @IsNotEmpty()
  @ApiProperty({ required: false })
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  artist?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  album?: string;

  @IsEnum(MusicGenre)
  @IsOptional()
  @ApiProperty({
    enum: [
      'ROCK',
      'METAL',
      'JAZZ',
      'BLUES',
      'COUNTRY',
      'CLASSIC',
      'ELECTRONIC',
      'POP',
      'RAP',
    ],
  })
  genre?: MusicGenre;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  link?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    required: false,
    type: [String],
    example: ['250top', 'progressive'],
  })
  tags?: string;
}
