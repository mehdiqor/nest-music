import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Music,
  MusicSchema,
} from 'src/schemas/music.schema';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utils';
import { join } from 'path';
import { Client } from '@elastic/elasticsearch';

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
        limits: { fileSize: 20000000 },
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
          filename: editFileName,
        }),
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Music.name,
        schema: MusicSchema,
      },
    ]),
  ],
  controllers: [MusicController],
  providers: [
    MusicService,
    {
      provide: 'ELASTICSEARCH_CLIENT',
      useFactory: () => {
        return new Client({
          node: 'http://localhost:9200',
        });
      },
    },
  ],
  exports: ['ELASTICSEARCH_CLIENT'],
})
export class MusicModule {}
