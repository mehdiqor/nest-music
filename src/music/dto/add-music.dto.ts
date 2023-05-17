import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MusicGenre } from 'src/schemas/music.schema';

export class AddMusicDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  artist: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  album?: string;

  @IsEnum(MusicGenre)
  @IsNotEmpty()
  @ApiProperty({
    enum: MusicGenre,
  })
  genre: MusicGenre;

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

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  music: Express.Multer.File;
}
