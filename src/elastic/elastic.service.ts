import { Client } from '@elastic/elasticsearch';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ElasticService {
  constructor(
    @Inject('ELASTICSEARCH_CLIENT')
    private esClient: Client,
  ) {}

  // Search
  async findWIthWord(index: string, search: string) {
    const body = await this.esClient.search({
      index,
      q: search,
    });

    const result = body.hits.hits;
    return result;
  }

  async searchWithRegexp(search: string) {
    const body = await this.esClient.search({
      index: 'musics',
      query: {
        bool: {
          should: [
            {
              regexp: {
                artistName: `.*${search}.*`,
              },
            },
            {
              regexp: {
                albumName: `.*${search}.*`,
              },
            },
            {
              regexp: {
                trackName: `.*${search}.*`,
              },
            },
            {
              regexp: { genre: `.*${search}.*` },
            },
            {
              regexp: { tags: `.*${search}.*` },
            },
          ],
        },
      },
    });

    const result = body.hits.hits;
    return result;
  }

  // Admin Panel
  @OnEvent('admin.remove')
  async removeDirectlyFromElastic(data) {
    const elastic = await this.esClient.delete({
      index: data.index,
      id: data.id,
    });

    if (elastic._shards.successful == 0)
      console.log('elastic error');

    console.log({
      msg: 'Removed',
      result: elastic._shards,
    });
  }

  @OnEvent('music.sync')
  async syncMusicDataWithElastic(data) {
    const elastic = await this.esClient.index({
      index: 'musics',
      id: data.id,
      body: {
        artistName: data.artistName,
        albums: data.albums,
      },
    });

    if (elastic._shards.successful == 0)
      console.log('elastic error');

    console.log({
      msg: 'Synced',
      result: elastic._shards,
    });
  }

  @OnEvent('film.sync')
  async syncFilmDataWithElastic(data) {
    const elastic = await this.esClient.index({
      index: 'film',
      id: data.id,
      body: {
        name: data.name,
        movies: data.movies,
      },
    });

    if (elastic._shards.successful == 0)
      console.log('elastic error');

    console.log({
      msg: 'Synced',
      result: elastic._shards,
    });
  }

  @OnEvent('admin.createIndex')
  async createIndex(indexName: string) {
    // check exist index
    const exist = await this.checkExistIndex(indexName);
    if (exist) throw new ConflictException();

    // add index
    const index = await this.esClient.indices.create({
      index: indexName,
    });
    console.log(index);
  }

  @OnEvent('admin.checkIndex')
  async checkExistIndex(indexName: string) {
    const index = await this.esClient.indices.exists({
      index: indexName,
    });

    console.log(index);
    return index;
  }

  @OnEvent('admin.removeIndex')
  async removeIndex(indexName: string) {
    const index = await this.esClient.indices.delete({
      index: indexName,
    });

    if (index.acknowledged == false)
      console.log('elastic error');

    console.log({
      msg: 'Index removed',
      removed: index.acknowledged,
    });
  }

  // Artist Event Emitter
  @OnEvent('add.artist')
  async addArtist(data) {
    const elastic = await this.esClient.index({
      index: 'musics',
      id: data._id,
      body: {
        artistName: data.artistName,
        albums: data.albums,
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  @OnEvent('edit.artist')
  async editArtist(data) {
    const elastic = await this.esClient.update({
      index: 'musics',
      id: data.id,
      body: {
        doc: {
          artistName: data.artistName,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  @OnEvent('remove.artist')
  async removeArtist(id: string) {
    const elastic = await this.esClient.delete({
      index: 'musics',
      id,
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  @OnEvent('update.artist')
  async updateArtist(data) {
    const elastic = await this.esClient.update({
      index: 'musics',
      id: data.id,
      body: {
        doc: {
          albums: data.albums,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  // Director Event Emitter
  @OnEvent('add.director')
  async addDirector(data) {
    const elastic = await this.esClient.index({
      index: 'film',
      id: data._id,
      body: {
        name: data.name,
        movies: data.movies,
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  @OnEvent('edit.director')
  async editDirector(data) {
    const elastic = await this.esClient.update({
      index: 'film',
      id: data.id,
      body: {
        doc: {
          name: data.name,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  @OnEvent('remove.director')
  async removeDirector(id: string) {
    const elastic = await this.esClient.delete({
      index: 'film',
      id,
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }

  @OnEvent('update.director')
  async updateDirector(data) {
    const elastic = await this.esClient.update({
      index: 'film',
      id: data.id,
      body: {
        doc: {
          movies: data.movies,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );
  }
}
