import { Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Artist,
  ArtistSchema,
} from 'src/schemas/music.schema';
import { ElasticModule } from 'src/elastic/elastic.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Artist.name,
        schema: ArtistSchema,
      },
    ]),
    ElasticModule
  ],
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}
