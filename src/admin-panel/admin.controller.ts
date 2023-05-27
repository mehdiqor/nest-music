import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('all-musics')
  getAllDataOfMusics() {
    return this.adminService.getAllDataOfMusics();
  }

  @Get('get-albums')
  getAlbumsOfArtist(
    @Query('artistName') artistName: string,
  ) {
    return this.adminService.getAlbumsOfArtist(artistName);
  }

  @Get('sync-music')
  syncMusicDataWithElastic(@Query('id') id: string) {
    return this.adminService.syncMusicDataWithElastic(id);
  }

  @Get('all-films')
  getAllDataOfFilms() {
    return this.adminService.getAllDataOfFilms();
  }

  @Get('get-movies')
  getMoviesOfDirector(
    @Query('directorName') directorName: string,
  ) {
    return this.adminService.getMoviesOfDirector(
      directorName,
    );
  }

  @Get('sync-film')
  syncFilmDataWithElastic(@Query('id') id: string) {
    return this.adminService.syncFilmDataWithElastic(id);
  }

  @Get('remove-elastic')
  removeDirectlyFromElastic(
    @Query('index') index: string,
    @Query('id') id: string,
  ) {
    return this.adminService.removeDirectlyFromElastic(
      index,
      id,
    );
  }

  @Get('add-index')
  createElasticIndexcreateIndex(
    @Query('indexName') indexName: string,
  ) {
    return this.adminService.createElasticIndex(indexName);
  }

  @Get('exist-index')
  checkExisElasticIndex(
    @Query('indexName') indexName: string,
  ) {
    return this.adminService.checkExisElasticIndex(
      indexName,
    );
  }

  @Get('remove-index')
  removeElasticIndex(
    @Query('indexName') indexName: string,
  ) {
    return this.adminService.removeElasticIndex(indexName);
  }
}
