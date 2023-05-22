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
import {
  AddAlbumDto,
  UpdateAlbumDto,
} from './dto';

@ApiTags('Album')
@Controller('album')
export class AlbumController {
  constructor(
    private readonly albumService: AlbumService,
  ) {}

  @Patch('add')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  addAlbum(@Body() dto: AddAlbumDto) {
    return this.albumService.addAlbum(dto);
  }

  @Get('albums')
  getAlbumsOfArtist(
    @Query('artistName') artistName: string,
  ) {
    return this.albumService.getAlbumsOfArtist(
      artistName,
    );
  }

  @Get('find')
  @ApiProperty()
  getOneAlbum(
    @Query('albumName') albumName: string,
  ) {
    return this.albumService.getOneAlbum(
      albumName,
    );
  }

  @Patch('update')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  updateAlbumById(@Body() dto: UpdateAlbumDto) {
    return this.albumService.updateAlbumById(dto);
  }

  @Patch('remove/:albumName')
  removeAlbum(
    @Param('albumName') albumName: string,
  ) {
    return this.albumService.removeAlbum(
      albumName,
    );
  }
}
