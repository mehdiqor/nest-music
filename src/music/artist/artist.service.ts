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
  AddArtistDto,
  UpdateArtistDto,
} from './dto';

@Injectable()
export class ArtistService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
  ) {}

  async addArtist(dto: AddArtistDto) {
    // check exist artist
    const checkExistArtist =
      await this.artistModel.findOne({
        name: dto.name,
      });

    if (checkExistArtist)
      throw new ConflictException(
        'this artist already exist!',
      );

    // create artist and save in DB
    const artist = await this.artistModel.create(
      dto,
    );

    if (!artist)
      throw new InternalServerErrorException();

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

  async updateArtistByName(dto: UpdateArtistDto) {
    // check exist artist
    const { _id } = await this.findArtist(
      dto.artistName,
    );

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update artist info
    const updatedArtist =
      await this.artistModel.updateOne({_id}, {
        name: dto.newName,
      });
      
    if (updatedArtist.modifiedCount == 0)
      throw new InternalServerErrorException();

    return {
      msg: 'artist info updated successfully',
      updated: updatedArtist.modifiedCount,
    };
  }

  async removeArtistByName(name: string) {
    // check exist artist
    await this.findArtist(name);

    // remove artist from DB
    const deletedArtist =
      await this.artistModel.deleteOne({
        name,
      });

    if (deletedArtist.deletedCount == 0)
      throw new InternalServerErrorException();

    return {
      msg: 'artist removed successfully',
      removed: deletedArtist.deletedCount,
    };
  }

  async findArtist(name: string) {
    const artist = await this.artistModel.findOne(
      { name },
    );

    if (!artist) throw new NotFoundException();

    return artist;
  }
}
