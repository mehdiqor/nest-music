import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import {
  AddAlbumDto,
  UpdateAlbumDto,
} from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addAlbum(dto: AddAlbumDto) {
    // check exist artist
    const checkExistAlbum =
      await this.artistModel.findOne(
        { 'albums.albumName': dto.albumName },
        { 'albums.$': 1 },
      );

    if (checkExistAlbum)
      throw new ConflictException(
        'this album already exist!',
      );

    // add album to artist collection
    const addAlbum =
      await this.artistModel.updateOne(
        {
          _id: dto.artistId,
        },
        {
          $push: {
            albums: {
              albumName: dto.albumName,
              year: dto.year,
              genre: dto.genre,
            },
          },
        },
      );

    if (addAlbum.modifiedCount == 0)
      throw new InternalServerErrorException();

    // add to elastic
    const { albums } =
      await this.artistModel.findOne({
        _id: dto.artistId,
      });

    // send data with event emitter to elasticsearch
    const data = {
      id: dto.artistId,
      albums,
    };
    this.eventEmitter.emit('update.artist', data);

    return albums;
  }

  async getAlbumsOfArtist(artistName: string) {
    const album = await this.artistModel.findOne(
      { artistName },
      { albums: 1, name: 1, year: 1 },
    );

    if (!album) throw new NotFoundException();

    return album;
  }

  async getAlbumById(id: string) {
    const album = await this.artistModel.findOne(
      { 'albums._id': id },
      { 'albums.$': 1 },
    );

    if (!album) throw new NotFoundException();

    return album;
  }

  async updateAlbumById(dto: UpdateAlbumDto) {
    // check exist album
    const { _id: artistId } =
      await this.getAlbumById(dto.id);

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update album info
    const updatedAlbum =
      await this.artistModel.updateOne(
        {
          'albums._id': dto.id,
        },
        {
          $set: {
            'albums.$.albumName': dto.albumName,
            'albums.$.year': dto.year,
            'albums.$.genre': dto.genre,
          },
        },
      );

    if (updatedAlbum.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    const { albums } =
      await this.artistModel.findById(artistId);

    const data = {
      id: artistId,
      albums,
    };
    this.eventEmitter.emit('update.artist', data);

    return {
      msg: 'album info updated successfully',
      updated: updatedAlbum.modifiedCount,
    };
  }

  async removeAlbumById(id: string) {
    // check exist album
    const { _id: artistId } =
      await this.getAlbumById(id);

    // remove album from DB
    const removedAlbum =
      await this.artistModel.updateOne(
        {
          'albums._id': id,
        },
        {
          $pull: {
            albums: {
              _id: id,
            },
          },
        },
      );

    if (removedAlbum.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    const { albums } =
      await this.artistModel.findById(artistId);

    const data = {
      id: artistId,
      albums,
    };
    this.eventEmitter.emit('update.artist', data);

    return {
      msg: 'album removed successfuly',
      removed: removedAlbum.modifiedCount,
    };
  }
}
