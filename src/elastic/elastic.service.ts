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

  async findWIthWord(search: string) {
    const body = await this.esClient.search({
      index: 'musics',
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

  async removeDirectlyFromElastic(id: string) {
    const elastic = await this.esClient.delete({
      index: 'musics',
      id,
    });
    if (elastic?._shards?.successful == 0)
      console.log('not deleted from elastic');
  }

  async createIndex(dto: IndexDto) {
    // check exist index
    const exist = await this.checkExistIndex(dto);
    if (exist) throw new ConflictException();

    // add index
    const index =
      await this.esClient.indices.create({
        index: dto.indexName,
      });
    console.log(index);

    return index;
  }

  async checkExistIndex(dto: IndexDto) {
    const index =
      await this.esClient.indices.exists({
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
}
