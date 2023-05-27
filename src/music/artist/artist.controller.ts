import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiProperty,
} from '@nestjs/swagger';
import { ArtistService } from './artist.service';
import { AddArtistDto, UpdateArtistDto } from './dto';

@ApiTags('Music')
@Controller('artist')
export class ArtistController {
  constructor(
    private readonly artistService: ArtistService,
  ) {}

  @Get('sync')
  syncElasticWithMongo(@Query('id') id: string) {
    return this.artistService.syncElasticWithMongo(id);
  }

  @Post('add')
  @ApiConsumes('application/x-www-form-urlencoded')
  addArtist(@Body() dto: AddArtistDto) {
    return this.artistService.addArtist(dto);
  }

  @Get('findall')
  getAllArtists() {
    return this.artistService.getAllArtists();
  }

  @Get('find/:id')
  @ApiProperty()
  getArtistById(@Param('id') id: string) {
    return this.artistService.getArtistById(id);
  }

  @Patch('update/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  updateArtistById(
    @Param('id') id: string,
    @Body() dto: UpdateArtistDto,
  ) {
    return this.artistService.updateArtistById(id, dto);
  }

  @Delete('remove/:artistName')
  removeArtistByName(
    @Param('artistName') artistName: string,
  ) {
    return this.artistService.removeArtistByName(
      artistName,
    );
  }
}
