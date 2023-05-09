import { Controller, Post } from '@nestjs/common';
import { MusicService } from './music.service';
import { AddMusicDto } from './dto';

@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
  ) {}

  @Post()
  addMusic(dto: AddMusicDto) {
    console.log("dto: ", dto);
    return this.musicService.addMusic(dto);
  }
}
