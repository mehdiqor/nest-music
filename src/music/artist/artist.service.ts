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
  AddArtistDto,
  UpdateArtistDto,
} from './dto';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ArtistService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    @Inject('ELASTICSEARCH_CLIENT')
    private esClient: Client,
  ) {}

  async addArtist(dto: AddArtistDto) {
    // check exist artist
    const checkExistArtist =
      await this.artistModel.findOne({
        artistName: dto.artistName,
      });

    if (checkExistArtist)
      throw new ConflictException(
        'this artist already exist!',
      );

    // create artist and save in DB
    const artist = await this.artistModel.create({
      artistName: dto.artistName,
    });

    if (!artist)
      throw new InternalServerErrorException();

    // add artist to elastic
    const elastic = await this.esClient.index({
      index: 'musics',
      id: artist._id,
      body: {
        artistName: artist.artistName,
        albums: artist.albums,
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );

    return artist;
  }

  async getAllArtists() {
    const allArtists =
      await this.artistModel.find();

    return allArtists;
  }

  async getArtistById(id: string) {
    const artist =
      await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException();

    return artist;
  }

  async updateArtistById(
    id: string,
    dto: UpdateArtistDto,
  ) {
    // check exist artist
    await this.getArtistById(id);

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update artist info
    const updatedArtist =
      await this.artistModel.updateOne(
        { _id: id },
        {
          artistName: dto.artistName,
        },
      );

    if (updatedArtist.modifiedCount == 0)
      throw new InternalServerErrorException();

    // update elastic
    const elastic = await this.esClient.update({
      index: 'musics',
      id,
      body: {
        doc: {
          artistName: dto.artistName,
        },
      },
    });

    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );

    return {
      msg: 'artist info updated successfully',
      mongoUpdated: updatedArtist.modifiedCount,
      elasticUpdated: elastic._shards.successful,
    };
  }

  async removeArtistByName(artistName: string) {
    // check exist artist
    const { _id } = await this.findArtist(
      artistName,
    );

    // remove artist from DB
    const deletedArtist =
      await this.artistModel.deleteOne({
        artistName,
      });

    if (deletedArtist.deletedCount == 0)
      throw new InternalServerErrorException();

    // remove from elastic
    const elastic = await this.esClient.delete({
      index: 'musics',
      id: _id,
    });
    if (elastic._shards.successful == 0)
      throw new InternalServerErrorException(
        'elastic error',
      );

    return {
      msg: 'artist removed successfully',
      mongoRemoved: deletedArtist.deletedCount,
      elasticRemoved: elastic._shards.successful,
    };
  }

  async findArtist(artistName: string) {
    const artist = await this.artistModel.findOne(
      { artistName },
    );

    if (!artist) throw new NotFoundException();

    return artist;
  }
}
