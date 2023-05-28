import {
  Args,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Director } from 'src/schemas/movie.schema';
import { DirectorService } from './director.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Resolver((of) => Director)
export class DirectorResolver {
  constructor(
    private directorService: DirectorService,
    @InjectModel(Director.name)
    private filmModel: Model<Director>,
  ) {}

  @Query(() => [Director])
  async directors(): Promise<Director[]> {
    return this.filmModel.find().exec();
  }

  @Query(() => Director)
  async oneDirector(@Args('id') id: string): Promise<Director> {
    return this.filmModel.findById(id).exec();
  }
}
