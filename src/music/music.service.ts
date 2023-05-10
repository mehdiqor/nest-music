import { Model } from 'mongoose';
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Music } from '../schemas/music.schema';
import { AddMusicDto } from './dto';

@Injectable()
export class MusicService {
  constructor(
    @InjectModel(Music.name)
    private musicModel: Model<Music>,
  ) {}

  async addMusic(dto: AddMusicDto) {
    // check music exist
    /**
     *
     */

    // save tags in array
    let tag;
    if (!Array.isArray(dto.tags)) {
      tag = dto.tags.split(',');
    }
    dto.tags = tag;

    // add music to DB
    const music = await this.musicModel.create(
      dto,
    );

    if (!music)
      throw new InternalServerErrorException(
        'not added!',
      );

    return music;
  }
}
