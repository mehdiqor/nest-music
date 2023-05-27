import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDirectorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name: string;
}
