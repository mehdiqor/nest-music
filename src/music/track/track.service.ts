import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import {
  AddTrackDto,
  UpdateTrackDto,
} from './dto';
import getAudioDurationInSeconds from 'get-audio-duration';
import { deleteFileInPublic } from 'src/utils';

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
    const findAlbums =
      await this.artistModel.findOne({
        name: dto.ArtistName,
      });

    const album = findAlbums.albums.find(
      (t) => t.name == dto.AlbumName,
    );
    const findTrack = album.tracks.find(
      (t) => t.name === dto.name,
    );

    if (findTrack)
      throw new ConflictException(
        'this track is already exist',
      );

    // save tags in array
    let tag: any;
    if (!Array.isArray(dto.tags)) {
      tag = dto.tags.split(',');
    }
    dto.tags = tag;

    // uploaded file directory
    const host = this.config.get('HOST');
    const port = this.config.get('PORT');
    const filePath = `${host}:${port}/${file.filename}`;

    // calculate track length
    const seconds =
      await getAudioDurationInSeconds(file.path);
    const length = this.getTime(seconds);

    // add track to DB
    const data = {
      name: dto.name,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
      fileName: file.filename,
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

  async findTrack(
    trackName: string,
    albumName: string,
  ) {
    const findAlbums =
      await this.artistModel.findOne({
        'albums.tracks.name': trackName,
      });

    const album = findAlbums.albums.find(
      (t) => t.name == albumName,
    );
    const track = album.tracks.find(
      (t) => t.name === trackName,
    );

    if (!track) throw new NotFoundException();

    return track;
  }

  async updateTrack(dto: UpdateTrackDto) {
    // check track exist
    // await this.findTrackById(dto.trackId);

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update track info
    const data = {
      name: dto.name,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
    };

    const updatedTrack =
      await this.artistModel.updateOne(
        {
          'albums.tracks._id': dto.trackId,
        },
        {
          $set: {
            'albums.$.tracks': data,
          },
        },
      );

    if (updatedTrack.modifiedCount == 0)
      throw new InternalServerErrorException();

    return {
      msg: 'album info updated successfully',
      updated: updatedTrack.modifiedCount,
    };
  }

  async removeTrack(
    trackName: string,
    albumName: string,
  ) {
    // check exist track
    const { fileName } = await this.findTrack(
      trackName,
      albumName,
    );

    // delete track file
    deleteFileInPublic(fileName);

    // remove track from DB
    const removedTrack =
      await this.artistModel.updateOne(
        {
          'albums.tracks.name': trackName,
        },
        {
          $pull: {
            'albums.$.tracks': {
              name: trackName,
            },
          },
        },
      );

    if (removedTrack.modifiedCount == 0)
      throw new InternalServerErrorException();

    return {
      msg: 'track removed successfuly',
      removed: removedTrack.modifiedCount,
    };
  }

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
