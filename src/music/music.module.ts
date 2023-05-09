import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Music,
  MusicSchema,
} from 'src/schemas/music.schema';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Music.name,
        schema: MusicSchema,
      },
    ]),
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
