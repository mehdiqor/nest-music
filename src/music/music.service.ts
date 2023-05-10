import { Model } from 'mongoose';
import {
  ConflictException,
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

@Injectable()
export class MusicService {
  constructor(
    @InjectModel(Music.name)
    private musicModel: Model<Music>,
  ) {}

  async addMusic(dto: AddMusicDto) {
    // check music exist
    const musicExist = await this.findMusic(
      dto.name,
      dto.artist,
    );

    if (musicExist)
      throw new ConflictException(
        'this music already exist!',
      );

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
        'proccess not be successful',
      );

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

    if (!music) throw new NotFoundException();

    return music;
  }

  async query() {}

  async updateMusic(dto: UpdateMusicDto) {
    // save tags in array
    let tag;
    if (!Array.isArray(dto.tags)) {
      tag = dto.tags.split(',');
    }
    dto.tags = tag;

    // add music to DB
    const music = await this.musicModel.updateOne(
      { _id: dto.id },
      {
        ...dto,
      },
    );

    if (music.modifiedCount == 0)
      throw new InternalServerErrorException(
        'proccess not be successful',
      );

    return {
      msg: 'Music info updated successfully!',
    };
  }

  async findMusic(name, artist) {
    const music = await this.musicModel.findOne({
      name,
      artist,
    });

    return music;
  }
}
