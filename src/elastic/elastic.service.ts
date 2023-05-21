import { Client } from '@elastic/elasticsearch';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IndexDto } from './dto';

@Injectable()
export class ElasticService {
  constructor(
    @Inject('ELASTICSEARCH_CLIENT')
    private esClient: Client,
  ) {}

  async createIndex(dto: IndexDto) {
    // check exist index
    const exist = await this.checkExistIndex(dto);
    if (exist) throw new ConflictException();

    // add index
    const index =
      await this.esClient.indices.create({
        index: dto.indexName,
      });

    return index;
  }

  async removeIndex(dto: IndexDto) {
    const index =
      await this.esClient.indices.delete({
        index: dto.indexName,
      });

    if (index.acknowledged == false)
      throw new InternalServerErrorException();

    return { msg: 'Index removed' };
  }

  async checkExistIndex(dto: IndexDto) {
    const index =
      await this.esClient.indices.exists({
        index: dto.indexName,
      });

    return index;
  }

  async addToElastic(data, index: string) {
    const elastic = await this.esClient.index({
      index,
      id: data._id,
      body: {
        name: data.name,
        artist: data.artist,
        album: data.album,
        genre: data.genre,
        tags: data.tags,
        link: data.link,
        length: data.length,
        filePath: data.filePath,
      },
    });

    console.log(elastic);
    if (!elastic) console.log('elastic error');
  }

  async elasticSearchInMusics(search: string) {
    const body = await this.esClient.search({
      index: 'musics',
      body: {
        query: {
          bool: {
            should: [
              {
                match: {
                  name: search,
                },
              },
              {
                match: {
                  artist: search,
                },
              },
              {
                match: {
                  album: search,
                },
              },
              {
                match: {
                  genre: search,
                },
              },
              {
                match: {
                  tags: search,
                },
              },
            ],
          },
        },
      },
    });

    const result = body.hits.hits;
    return result;
  }

  async updateElastic(dto, index: string) {
    const elastic = await this.esClient.update({
      index,
      id: dto.id,
      body: {
        doc: {
          ...dto,
        },
      },
    });
    console.log(elastic);
    if (!elastic) console.log('elastic error');
  }

  async removeElastic(id, index: string) {
    const elastic = await this.esClient.delete({
      index,
      id,
    });
    console.log(elastic);
    if (!elastic) console.log('elastic error');
  }
}
