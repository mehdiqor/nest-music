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
