import { Module } from '@nestjs/common';
import { ElasticService } from 'src/elastic/elastic.service';
import { ElasticModule } from 'src/elastic/elastic.module';
import { ArtistModule } from './artist/artist.module';
import { AlbumModule } from './album/album.module';
import { TrackModule } from './track/track.module';

@Module({
  imports: [
    ArtistModule,
    AlbumModule,
    TrackModule,
    ElasticModule,
  ],
  providers: [ElasticService],
})
export class MusicModule {}
