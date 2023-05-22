import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  artistName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  newName?: string;
}
