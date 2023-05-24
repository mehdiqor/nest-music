import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
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
    ElasticModule,
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
})
export class AlbumModule {}
