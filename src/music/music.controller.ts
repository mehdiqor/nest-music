import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpErrorFilter } from 'src/common/filters';

@ApiTags('Music')
@Controller('music')
@UseFilters(HttpErrorFilter)
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
  ) {}

  @Post('add')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('music'))
  addMusic(
    @Body() dto: AddMusicDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.musicService.addMusic(dto, file);
  }

  @Get('find/:id')
  @ApiProperty()
  findById(@Query(':id') id: string) {
    return this.musicService.findById(id);
  }

  @Get('findall')
  getAllMusics() {
    return this.musicService.getAllMusics();
  }

  @Get('genre')
  @ApiQuery({
    name: 'genre',
    type: FindGenreDto,
    enum: MusicGenre,
  })
  findByGenre(
    @Query('genre') genre: FindGenreDto,
  ) {
    return this.musicService.findByGenre(genre);
  }

  @Get('search')
  @ApiQuery({
    name: 'search',
    type: String,
  })
  searchInMusic(@Query('search') query: string) {
    return this.musicService.searchInMusic(query);
  }

  @Patch('update')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
    'application/json',
  )
  updateMusic(@Body() dto: UpdateMusicDto) {
    return this.musicService.updateMusic(dto);
  }

  @Delete('remove/:id')
  removeMusic(@Param('id') id: string) {
    return this.musicService.removeMusic(id);
  }
}
