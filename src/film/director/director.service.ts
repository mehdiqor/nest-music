import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Director } from 'src/schemas/movie.schema';
import { AddDirectorDto, UpdateDirectorDto } from './dto';

@Injectable()
export class DirectorService {
  constructor(
    @InjectModel(Director.name)
    private directorModel: Model<Director>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addDirector(dto: AddDirectorDto) {
    // check exist director
    const findDirector = await this.findDirector(
      dto.name,
      null,
    );
    if (findDirector)
      throw new ConflictException(
        'this director is already exist',
      );

    // add to db
    const director = await this.directorModel.create({
      name: dto.name,
    });

    if (!director) throw new InternalServerErrorException();

    // send data to elastic
    this.eventEmitter.emit('add.director', director);

    return director;
  }

  async updateDirector(dto: UpdateDirectorDto) {
    // check exist director
    const findDirector = await this.findDirector(
      null,
      dto.id,
    );
    if (!findDirector) throw new NotFoundException();

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update director
    const updatedDirector =
      await this.directorModel.updateOne(
        { _id: dto.id },
        { name: dto.name },
      );

    if (updatedDirector.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data to elastic
    const data = {
      id: dto.id,
      name: dto.name,
    };
    this.eventEmitter.emit('edit.director', data);

    return {
      msg: 'director info updated successfully',
      updated: updatedDirector.modifiedCount,
    };
  }

  async removeDirector(id: string) {
    // check exist director
    const findDirector = await this.findDirector(null, id);
    if (!findDirector) throw new NotFoundException();

    // delete from db
    const removedDirector =
      await this.directorModel.deleteOne({ _id: id });

    if (removedDirector.deletedCount == 0)
      throw new InternalServerErrorException();

    // send data to elastic
    this.eventEmitter.emit('remove.director', id);

    return {
      msg: 'director removed successfully',
      removed: removedDirector.deletedCount,
    };
  }

  async findDirector(name?: string, id?: string) {
    if (name) {
      const find = await this.directorModel.findOne({
        name,
      });

      if (!find) return false;
      return true;
    }
    if (id) {
      const find = await this.directorModel.findById(id);

      if (!find) return false;
      return true;
    }
  }
}
