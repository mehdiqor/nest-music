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

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
  ) {}

  @Post()
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
  findByGenre(
    @Query('genre') genre: FindGenreDto,
  ) {
    return this.musicService.findByGenre(genre);
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
