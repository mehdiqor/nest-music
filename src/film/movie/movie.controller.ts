import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MovieService } from './movie.service';
import { AddMovieDto, UpdateMovieDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Movie')
@Controller('movie')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
  ) {}

  @Patch('add')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  addMovie(
    @Body() dto: AddMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.movieService.addMovie(dto, file);
  }

  @Patch('update')
  @ApiConsumes('application/x-www-form-urlencoded')
  updateMovie(@Body() dto: UpdateMovieDto) {
    return this.movieService.updateMovie(dto);
  }

  @Patch('remove')
  removeMovie(
    @Query('name') name: string,
    @Query('title') title: string,
  ) {
    return this.movieService.removeMovie(name, title);
  }

  @Get('all')
  getMoviesOfDirector(@Query('name') name: string) {
    return this.movieService.getMoviesOfDirector(name);
  }
}
