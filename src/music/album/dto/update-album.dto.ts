import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MusicGenre } from 'src/schemas/music.schema';

export class UpdateAlbumDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  albumName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  year?: string;

  @IsEnum(MusicGenre)
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: MusicGenre,
  })
  genre?: MusicGenre;
}
