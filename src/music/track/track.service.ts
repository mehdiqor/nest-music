import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { AddTrackDto } from './dto';
import getAudioDurationInSeconds from 'get-audio-duration';
import { join } from 'path';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private config: ConfigService,
  ) {}

  async addTrack(
    dto: AddTrackDto,
    file: Express.Multer.File,
  ) {
    // check exist track

    // save tags in array
    let tag: any;
    if (!Array.isArray(dto.tags)) {
      tag = dto.tags.split(',');
    }
    dto.tags = tag;

    // uploaded file directory
    // we need to "fileUploadPath", that is: {file.path} OR {file.destination}
    const fileAddress = join(
      file.path,
      file.filename,
    );
    const host = this.config.get('HOST');
    const port = this.config.get('PORT');
    const filePath = `${host}:${port}/${fileAddress}`;

    // calculate track length
    const seconds =
      await getAudioDurationInSeconds(file.path);
    const length = this.getTime(seconds);

    // add track to DB
    const data = {
      name: dto.name,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
      filePath,
      length,
    };

    const track =
      await this.artistModel.updateOne(
        {
          name: dto.ArtistName,
          'albums.name': dto.AlbumName,
        },
        {
          $push: {
            'albums.$.tracks': data,
          },
        },
      );

    if (track.modifiedCount == 0)
      throw new InternalServerErrorException();

    return { msg: 'created successfully' };
  }

  async findTrackById(id: string) {
    const findTrack =
      await this.artistModel.findOne({
        'albums.tracks._id': id,
      });

    if (!findTrack) throw new NotFoundException();

    const track = await findTrack?.albums?.[0]
      ?.tracks?.[0];
    if (!track) throw new NotFoundException();

    return this.copyObject(track);
  }

  async updateTrack() {}

  async removeTrack() {}

  getTime(seconds: number): string {
    let total: number = Math.round(seconds) / 60;
    let [minutes, percent]: string[] =
      String(total).split('.');
    let second: string = Math.round(
      (Number(percent) * 60) / 100,
    )
      .toString()
      .substring(0, 2);
    let hour: number = 0;
    if (Number(minutes) > 60) {
      total = Number(minutes) / 60;
      let [h1, percent] =
        String(total).split('.');
      hour = Number(h1);
      minutes = Math.round(
        (Number(percent) * 60) / 100,
      )
        .toString()
        .substring(0, 2);
    }
    if (String(hour).length == 1)
      hour = Number(`0${hour}`);
    if (String(minutes).length == 1)
      minutes = `0${minutes}`;
    if (String(second).length == 1)
      second = `0${second}`;
    return hour + ':' + minutes + ':' + second;
  }

  copyObject(object: object) {
    return JSON.parse(JSON.stringify(object));
  }
}
