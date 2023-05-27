import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdminService {
  constructor(private eventEmitter: EventEmitter2) {}

  async getAllDataOfMusics() {
    const result = await new Promise((resolve) => {
      this.eventEmitter.emit('admin.musicData', resolve);
    });

    return result;
  }

  async getAlbumsOfArtist(artistName: string) {
    const albums = await new Promise((resolve) => {
      this.eventEmitter.emit(
        'admin.albums',
        artistName,
        resolve,
      );
    });

    return albums;
  }

  async syncMusicDataWithElastic(id: string) {
    this.eventEmitter.emit('admin.musicSync', id);
  }

  async getAllDataOfFilms() {
    const result = await new Promise((resolve) => {
      this.eventEmitter.emit('admin.filmData', resolve);
    });

    return result;
  }

  async getMoviesOfDirector(directorName: string) {
    const albums = await new Promise((resolve) => {
      this.eventEmitter.emit(
        'admin.movies',
        directorName,
        resolve,
      );
    });

    return albums;
  }

  async syncFilmDataWithElastic(id: string) {
    this.eventEmitter.emit('admin.filmSync', id);
  }

  async removeDirectlyFromElastic(
    index: string,
    id: string,
  ) {
    const data = { index, id };
    this.eventEmitter.emit('admin.remove', data);
  }

  async createElasticIndex(indexName: string) {
    this.eventEmitter.emit('admin.createIndex', indexName);
  }

  async checkExisElasticIndex(indexName: string) {
    this.eventEmitter.emit('admin.checkIndex', indexName);
  }

  async removeElasticIndex(indexName: string) {
    this.eventEmitter.emit('admin.removeIndex', indexName);
  }
}
