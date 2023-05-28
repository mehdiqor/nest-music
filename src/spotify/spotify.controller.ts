import {
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Spotify')
@Controller('spotify')
export class SpotifyController {
  constructor(private spotifyService: SpotifyService) {}

  @Post()
  getToken() {
    return this.spotifyService.getToken();
  }

  @Get()
  getArtist(@Query('id') id: string) {
    return this.spotifyService.getArtist(id);
  }
}
