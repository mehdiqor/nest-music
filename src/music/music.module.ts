import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ElasticService } from 'src/elastic/elastic.service';
import { ElasticModule } from 'src/elastic/elastic.module';
import { ArtistModule } from './artist/artist.module';
import { AlbumModule } from './album/album.module';
import { TrackModule } from './track/track.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async () => ({
        dest: join(
          __dirname,
          '..',
          '..',
          'uploads',
          'musics',
        ),
        limits: { fileSize: 50000000 },
        fileFilter: (req, file, cb) => {
          if (
            !file.originalname.match(
              /\.(mp3|m4a)$/,
            )
          ) {
            return cb(
              new Error(
                'Only audio files are allowed!',
              ),
              false,
            );
          }
          cb(null, true);
        },
        storage: diskStorage({
          destination: join(
            __dirname,
            '..',
            '..',
            'uploads',
            'musics',
          ),
          // filename: editFileName,
        }),
      }),
    }),
    ArtistModule,
    AlbumModule,
    TrackModule,
    ElasticModule,
  ],
  providers: [ElasticService],
})
export class MusicModule {}
