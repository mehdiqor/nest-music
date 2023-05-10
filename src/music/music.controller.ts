import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { AddMusicDto } from './dto';
import {
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';

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
}
