import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class IndexDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  indexName: string;
}
