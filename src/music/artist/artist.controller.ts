import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiProperty,
} from '@nestjs/swagger';
import { ArtistService } from './artist.service';
import {
  AddArtistDto,
  UpdateArtistDto,
} from './dto';

@ApiTags('Artist')
@Controller('artist')
export class ArtistController {
  constructor(
    private readonly artistService: ArtistService,
  ) {}

  @Post('add')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
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

  @Patch('update')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  updateArtistByName(
    @Body() dto: UpdateArtistDto,
  ) {
    return this.artistService.updateArtistByName(
      dto,
    );
  }

  @Delete('remove/:name')
  removeArtistByName(
    @Param('name') name: string,
  ) {
    return this.artistService.removeArtistByName(
      name,
    );
  }
}
