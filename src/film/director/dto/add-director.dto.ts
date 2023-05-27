import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AddDirectorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
