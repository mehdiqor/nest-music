import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiProperty,
} from '@nestjs/swagger';
import { AlbumService } from './album.service';
import { AddAlbumDto, UpdateAlbumDto } from './dto';

@ApiTags('Music')
@Controller('album')
export class AlbumController {
  constructor(
    private readonly albumService: AlbumService,
  ) {}

  @Patch('add')
  @ApiConsumes('application/x-www-form-urlencoded')
  addAlbum(@Body() dto: AddAlbumDto) {
    return this.albumService.addAlbum(dto);
  }

  @Patch('update')
  @ApiConsumes('application/x-www-form-urlencoded')
  updateAlbumById(@Body() dto: UpdateAlbumDto) {
    return this.albumService.updateAlbumById(dto);
  }

  @Patch('remove/:id')
  removeAlbumById(@Param('id') id: string) {
    return this.albumService.removeAlbumById(id);
  }
}
