import { Module } from '@nestjs/common';
import { ArtistModule } from './artist/artist.module';
import { AlbumModule } from './album/album.module';
import { TrackModule } from './track/track.module';
import { ElasticModule } from 'src/elastic/elastic.module';

@Module({
  imports: [
    ArtistModule,
    AlbumModule,
    TrackModule,
    ElasticModule,
  ],
})
export class MusicModule {}
