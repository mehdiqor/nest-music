import { Args, Query, Resolver } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { ArtistService } from './artist.service';

@Resolver((of) => Artist)
export class ArtistResolver {
  constructor(
    private artistService: ArtistService,
    @InjectModel(Artist.name)
    private musicModel: Model<Artist>,
  ) {}

  @Query(() => [Artist])
  async artists(): Promise<Artist[]> {
    return this.musicModel.find().exec();
  }

  @Query(() => Artist)
  async oneArtist(@Args('id') id: string): Promise<Artist> {
    return this.musicModel.findById(id).exec();
  }
}
