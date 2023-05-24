import {
  ConflictException,
  Inject,
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
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    @Inject('ELASTICSEARCH_CLIENT')
    private esClient: Client,
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

    const elastic = await this.esClient.update({
      index: 'musics',
      id: dto.artistId,
      body: {
        doc: {
          albums,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );

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

    // update elastic
    const { albums } =
      await this.artistModel.findById(artistId);

    const elastic = await this.esClient.update({
      index: 'musics',
      id: artistId,
      body: {
        doc: {
          albums,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );

    return {
      msg: 'album info updated successfully',
      mongoUpdated: updatedAlbum.modifiedCount,
      elasticUpdated: elastic._shards.successful,
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

    // remove from elastic
    const { albums } =
      await this.artistModel.findById(artistId);

    const elastic = await this.esClient.update({
      index: 'musics',
      id: artistId,
      body: {
        doc: {
          albums,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );

    return {
      msg: 'album removed successfuly',
      mongoRemoved: removedAlbum.modifiedCount,
      elasticRemoved: elastic._shards.successful,
    };
  }
}
