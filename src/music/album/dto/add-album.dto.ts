import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MusicGenre } from 'src/schemas/music.schema';

export class AddAlbumDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  artistName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  year?: string;

  @IsEnum(MusicGenre)
  @IsNotEmpty()
  @ApiProperty({
    enum: MusicGenre,
  })
  genre: MusicGenre;
}
