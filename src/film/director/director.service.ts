import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  EventEmitter2,
  OnEvent,
} from '@nestjs/event-emitter';
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
    try {
      const exist = await this.findDirector(dto.name, null);
      if (exist) throw new ConflictException();
    } catch (e) {
      if (e.status == 409)
        return { msg: 'this director is already exist' };
    }

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
    await this.findDirector(null, dto.id);

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
    await this.findDirector(null, id);

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

      if (!find) throw new NotFoundException();
      return find;
    }
    if (id) {
      const find = await this.directorModel.findById(id);

      if (!find) throw new NotFoundException();
      return find;
    }
  }

  // Admin Panel
  @OnEvent('admin.filmData')
  async getAllDataOfFilms(resolve: (findAll: any) => void) {
    const findAll = await this.directorModel.find();

    resolve(findAll);
  }

  @OnEvent('admin.movies')
  async getMoviesOfDirector(
    directorName: string,
    resolve: (albums: any) => void,
  ) {
    const movies = await this.directorModel.findOne(
      { name: directorName },
      { movies: 1 },
    );

    if (!movies) resolve('NotFound');
    resolve(movies);
  }

  @OnEvent('admin.filmSync')
  async syncFilmDataWithElastic(id: string) {
    const director = await this.directorModel.findById(id);

    const data = {
      id,
      name: director.name,
      movies: director.movies,
    };

    this.eventEmitter.emit('film.sync', data);
  }
}
