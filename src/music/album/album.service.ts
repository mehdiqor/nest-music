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

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
  ) {}

  async addAlbum(dto: AddAlbumDto) {
    // check exist artist
    const checkExistAlbum =
      await this.artistModel.findOne(
        { 'albums.name': dto.name },
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
          name: dto.artistName,
        },
        {
          $push: {
            albums: {
              name: dto.name,
              year: dto.year,
              genre: dto.genre,
            },
          },
        },
      );

    if (addAlbum.modifiedCount == 0)
      throw new InternalServerErrorException();

    const album = await this.getOneAlbum(
      dto.name,
    );
    return album;
  }

  async getAlbumsOfArtist(artistName: string) {
    const album = await this.artistModel.findOne(
      { name: artistName },
      { albums: 1, name: 1, year: 1 },
    );

    if (!album) throw new NotFoundException();

    return album;
  }

  async getOneAlbum(albumName: string) {
    const album = await this.artistModel.findOne(
      { 'albums.name': albumName },
      { 'albums.$': 1 },
    );

    if (!album) throw new NotFoundException();

    return album;
  }

  // async findByGenre(genre: FindGenreDto) {
  //   const music = await this.musicModel.find({
  //     genre,
  //   });

  //   if (music.length == 0)
  //     throw new NotFoundException();

  //   return music;
  // }

  async updateAlbumById(dto: UpdateAlbumDto) {
    // check exist album
    const checkExistAlbum =
      await this.artistModel.findOne(
        { 'albums._id': dto.id },
        { 'albums.$': 1 },
      );

    if (!checkExistAlbum)
      throw new NotFoundException();

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
            'albums.$.name': dto.name,
            'albums.$.year': dto.year,
            'albums.$.genre': dto.genre,
          },
        },
      );

    if (updatedAlbum.modifiedCount == 0)
      throw new InternalServerErrorException();

    return {
      msg: 'album info updated successfully',
      updated: updatedAlbum.modifiedCount,
    };
  }

  async removeAlbum(albumName: string) {
    // check exist album
    const find = await this.getOneAlbum(
      albumName,
    );
    const id = find.albums[0]._id;

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

    return {
      msg: 'album removed successfuly',
      removed: removedAlbum.modifiedCount,
    };
  }
}
