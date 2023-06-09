import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddTrackDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  artistName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  albumName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  trackName: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    required: false,
    type: [String],
    example: ['250top', 'progressive'],
  })
  tags?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  youtube_link?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  track: Express.Multer.File;
}
