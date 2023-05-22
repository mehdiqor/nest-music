import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AddArtistDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
