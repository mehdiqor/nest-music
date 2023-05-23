import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  artistName?: string;
}
