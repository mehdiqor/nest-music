import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { AddArtistDto, UpdateArtistDto } from './dto';
import {
  EventEmitter2,
  OnEvent,
} from '@nestjs/event-emitter';

@Injectable()
export class ArtistService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addArtist(dto: AddArtistDto) {
    // check exist artist
    try {
      const exist = await this.findArtist(
        dto.artistName,
        null,
      );
      if (exist) throw new ConflictException();
    } catch (e) {
      if (e.status == 409)
        return { msg: 'this artist is already exist' };
    }

    // create artist and save in DB
    const artist = await this.artistModel.create({
      artistName: dto.artistName,
    });

    if (!artist) throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    this.eventEmitter.emit('add.artist', artist);

    return artist;
  }

  async updateArtistById(id: string, dto: UpdateArtistDto) {
    // check exist artist
    await this.findArtist(null, id);

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update artist info
    const updatedArtist = await this.artistModel.updateOne(
      { _id: id },
      {
        artistName: dto.artistName,
      },
    );

    if (updatedArtist.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    const data = {
      id,
      artistName: dto.artistName,
    };
    this.eventEmitter.emit('edit.artist', data);

    return {
      msg: 'artist info updated successfully',
      updated: updatedArtist.modifiedCount,
    };
  }

  async removeArtistByName(artistName: string) {
    // check exist artist
    const { _id } = await this.findArtist(artistName, null);

    // remove artist from DB
    const deletedArtist = await this.artistModel.deleteOne({
      artistName,
    });

    if (deletedArtist.deletedCount == 0)
      throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    this.eventEmitter.emit('remove.artist', _id);

    return {
      msg: 'artist removed successfully',
      removed: deletedArtist.deletedCount,
    };
  }

  async findArtist(artistName?: string, id?: string) {
    if (artistName) {
      const artist = await this.artistModel.findOne({
        artistName,
      });

      if (!artist) throw new NotFoundException();
      return artist;
    }
    if (id) {
      const artist = await this.artistModel.findById(id);

      if (!artist) throw new NotFoundException();
      return artist;
    }
  }

  // Admin Panel
  @OnEvent('admin.musicData')
  async getAllDataOfMusics(
    resolve: (findAll: any) => void,
  ) {
    const findAll = await this.artistModel.find();

    resolve(findAll);
  }

  @OnEvent('admin.albums')
  async getAlbumsOfArtist(
    artistName: string,
    resolve: (albums: any) => void,
  ) {
    const albums = await this.artistModel.findOne(
      { artistName },
      { albums: 1, name: 1, year: 1 },
    );

    if (!albums) resolve('NotFound');
    resolve(albums);
  }

  @OnEvent('admin.musicSync')
  async syncMusicDataWithElastic(id: string) {
    const artist = await this.artistModel.findById(id);

    const data = {
      id,
      artistName: artist.artistName,
      albums: artist.albums,
    };

    this.eventEmitter.emit('music.sync', data);
  }
}
