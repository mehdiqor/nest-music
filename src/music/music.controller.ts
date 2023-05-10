import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MusicService } from './music.service';
import {
  AddMusicDto,
  FindGenreDto,
  UpdateMusicDto,
} from './dto';
import {
  ApiTags,
  ApiConsumes,
  ApiProperty,
  ApiQuery,
} from '@nestjs/swagger';
import { MusicGenre } from 'src/schemas/music.schema';

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
  ) {}

  @ApiConsumes(
    'application/x-www-form-urlencoded',
    'application/json',
  )
  @Post()
  addMusic(@Body() dto: AddMusicDto) {
    return this.musicService.addMusic(dto);
  }

  @ApiProperty()
  @Get('find/:id')
  findById(@Query(':id') id: string) {
    return this.musicService.findById(id);
  }

  @Get()
  getAllMusics() {
    return this.musicService.getAllMusics();
  }

  @Get('genre')
  @ApiQuery({
    name: 'genre',
    type: FindGenreDto,
    enum: MusicGenre,
  })
  findByGenre(@Query('genre') genre: FindGenreDto) {
    return this.musicService.findByGenre(genre);
  }

  @ApiConsumes(
    'application/x-www-form-urlencoded',
    'application/json',
  )
  @Patch('update')
  updateMusic(@Body() dto: UpdateMusicDto) {
    return this.musicService.updateMusic(dto);
  }
}
