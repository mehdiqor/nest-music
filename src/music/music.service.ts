import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Music,
  MusicDocument,
} from 'src/schemas/music.schema';
import { AddMusicDto } from './dto';

@Injectable()
export class MusicService {
  constructor(
    @InjectModel(Music.name)
    private musicModel: Model<MusicDocument>,
  ) {}

  async addMusic(dto: AddMusicDto) {
    console.log('dto: ', dto);

    const music = await this.musicModel.create(
      dto,
    );
    return music;
  }
}
