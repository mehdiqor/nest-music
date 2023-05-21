import { Model } from 'mongoose';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Music } from '../schemas/music.schema';
import {
  AddMusicDto,
  FindGenreDto,
  UpdateMusicDto,
} from './dto';
import getAudioDurationInSeconds from 'get-audio-duration';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MusicService {
  constructor(
    @InjectModel(Music.name)
    private musicModel: Model<Music>,
    @Inject('ELASTICSEARCH_CLIENT')
    private esClient: Client,
    private config: ConfigService,
  ) {}

  async elasticIndex() {
    const index =
      await this.esClient.indices.create({
        index: 'musics',
      });
  }

  async addMusic(
    dto: AddMusicDto,
    file: Express.Multer.File,
  ) {
    // check music exist
    const musicExist = await this.findMusic(
      dto.name,
      dto.artist,
    );
    if (musicExist) throw new ConflictException();

    // save tags in array
    let tag: any;
    if (!Array.isArray(dto.tags)) {
      tag = dto.tags.split(',');
    }
    dto.tags = tag;

    // calculate music length
    const seconds =
      await getAudioDurationInSeconds(file.path);
    const time = this.getTime(seconds);

    const host = this.config.get('HOST');
    const port = this.config.get('PORT');
    const musicPath = `${host}:${port}/${file.filename}`;

    // add music to DB
    const music = await this.musicModel.create({
      ...dto,
      filePath: musicPath,
      length: time,
    });

    if (!music)
      throw new InternalServerErrorException();

    // add to elasticsearch
    const elastic = await this.esClient.index({
      index: 'musics',
      id: music._id,
      body: {
        name: music.name,
        artist: music.artist,
        album: music.album,
        genre: music.genre,
        tags: music.tags,
        link: music.link,
        length: music.length,
        filePath: music.filePath,
      },
    });
    if (!elastic) console.log('elastic error');

    return music;
  }

  async getAllMusics() {
    const allMusics =
      await this.musicModel.find();

    return allMusics;
  }

  async findById(id: string) {
    const music = await this.musicModel.findById(
      id,
    );

    if (!music) throw new NotFoundException();

    return music;
  }

  async findByGenre(genre: FindGenreDto) {
    const music = await this.musicModel.find({
      genre,
    });

    if (music.length == 0)
      throw new NotFoundException();

    return music;
  }

  async findWithElastic(search: string) {
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

  async updateMusic(dto: UpdateMusicDto) {
    // save tags in array
    if (dto.tags) {
      let tag: any;
      if (!Array.isArray(dto.tags)) {
        tag = dto.tags.split(',');
      }
      dto.tags = tag;
    }

    // update music in DB
    const music = await this.musicModel.updateOne(
      { _id: dto.id },
      {
        ...dto,
      },
    );

    if (music.modifiedCount == 0)
      throw new InternalServerErrorException();

    // update in elasticsearch
    const elastic = await this.esClient.update({
      index: 'musics',
      id: dto.id,
      body: {
        doc: {
          ...dto,
        },
      },
    });
    if (!elastic) console.log('elastic error');

    return {
      msg: 'Music info updated successfully!',
    };
  }

  async removeMusic(id: string) {
    const deletedMusic =
      await this.musicModel.findByIdAndDelete(id);

    if (!deletedMusic)
      throw new BadRequestException();

    // delete from elastic
    const elastic = await this.esClient.delete({
      index: 'music',
      id,
    });
    if (!elastic) console.log('elastic error');

    return { msg: 'deleted successfully' };
  }

  async findMusic(name, artist) {
    const music = await this.musicModel.findOne({
      name,
      artist,
    });

    return music;
  }

  getTime(seconds: number): string {
    let total: number = Math.round(seconds) / 60;
    let [minutes, percent]: string[] =
      String(total).split('.');
    let second: string = Math.round(
      (Number(percent) * 60) / 100,
    )
      .toString()
      .substring(0, 2);
    let hour: number = 0;
    if (Number(minutes) > 60) {
      total = Number(minutes) / 60;
      let [h1, percent] =
        String(total).split('.');
      hour = Number(h1);
      minutes = Math.round(
        (Number(percent) * 60) / 100,
      )
        .toString()
        .substring(0, 2);
    }
    if (String(hour).length == 1)
      hour = Number(`0${hour}`);
    if (String(minutes).length == 1)
      minutes = `0${minutes}`;
    if (String(second).length == 1)
      second = `0${second}`;
    return hour + ':' + minutes + ':' + second;
  }
}
