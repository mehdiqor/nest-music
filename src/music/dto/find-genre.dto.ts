import { ApiProperty } from '@nestjs/swagger';
import { MusicGenre } from 'src/schemas/music.schema';

export class FindGenreDto {
  @ApiProperty({
    enum: MusicGenre,
  })
  genre: MusicGenre[];
}
