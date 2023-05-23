import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTrackDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  trackId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  name?: string;

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
}
