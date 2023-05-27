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
import { AddMovieDto, UpdateMovieDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { deleteImageInPublic } from 'src/utils';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Director.name)
    private directorModel: Model<Director>,
    private eventEmitter: EventEmitter2,
    private config: ConfigService,
  ) {}

  async addMovie(
    dto: AddMovieDto,
    file: Express.Multer.File,
  ) {
    try {
      // check exist movie
      const exist = await this.findMovie(dto.title, null);
      if (exist) throw new ConflictException();
    } catch (e) {
      if (e.status == 409)
        return {msg: 'this movie is already exist'}
    }

    // uploaded file directory
    const host = this.config.get('HOST');
    const port = this.config.get('PORT');
    const imagePath = `${host}:${port}/films/${file.filename}`;

    // add to db
    const data = {
      title: dto.title,
      year: dto.year,
      genre: dto.genre,
      link: dto.link,
      imageName: file.filename,
      imagePath,
    };

    const movie = await this.directorModel.updateOne(
      { name: dto.directorName },
      {
        $push: {
          movies: {
            ...data,
          },
        },
      },
    );

    if (movie.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data to elastic
    const { _id, movies } =
      await this.directorModel.findOne({
        name: dto.directorName,
      });

    const elasticData = {
      id: _id,
      movies,
    };

    this.eventEmitter.emit('update.director', elasticData);

    return {
      msg: 'movie added successfully',
      add: movie.modifiedCount,
    };
  }

  async updateMovie(dto: UpdateMovieDto) {
    // check exist movie
    const { _id: directorId } = await this.findMovie(
      null,
      dto.id,
    );

    const data = {
      title: dto.title,
      year: dto.year,
      genre: dto.genre,
      link: dto.link,
    };

    // delete empty data
    Object.keys(data).forEach((key) => {
      if (!data[key]) delete data[key];
    });

    // update movie
    const updatedMovie = await this.directorModel.updateOne(
      { 'movies._id': dto.id },
      {
        $set: {
          movies: {
            ...data,
          },
        },
      },
    );

    if (updatedMovie.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data to elastic
    const { movies } = await this.directorModel.findById(
      directorId,
    );

    const elasticData = {
      id: directorId,
      movies,
    };
    this.eventEmitter.emit('update.director', elasticData);

    return {
      msg: 'movie info updated successfully',
      updated: updatedMovie.modifiedCount,
    };
  }

  async removeMovie(name: string, title: string) {
    // check exist movie
    const findMovie = await this.findMovie(title, null);
    if (!findMovie) throw new NotFoundException();

    // remove from db
    const removedMovie = await this.directorModel.updateOne(
      { 'movies.title': title },
      {
        $pull: {
          movies: {
            title,
          },
        },
      },
    );

    if (removedMovie.modifiedCount == 0)
      throw new InternalServerErrorException();

    // delete image
    const { imageName } = findMovie.movies[0];
    deleteImageInPublic(imageName);

    // send data to elastic
    const { _id, movies } =
      await this.directorModel.findOne({ name });

    const elasticData = {
      id: _id,
      movies,
    };

    this.eventEmitter.emit('update.director', elasticData);

    return {
      msg: 'movie removed successfully',
      removed: removedMovie.modifiedCount,
    };
  }

  async getMoviesOfDirector(name: string) {
    const movies = await this.directorModel.findOne(
      { name },
      { movies: 1 },
    );

    if (!movies) throw new NotFoundException();
    return movies;
  }

  async findMovie(title?: string, id?: string) {
    if (title) {
      const movie = await this.directorModel.findOne(
        { 'movies.title': title },
        { 'movies.$': 1 },
      );

      if (!movie) throw new NotFoundException();
      return movie;
    }
    if (id) {
      const movie = await this.directorModel.findOne({
        'movies._id': id,
      });

      if (!movie) throw new NotFoundException();
      return movie;
    }
  }
}
