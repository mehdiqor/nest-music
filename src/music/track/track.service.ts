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
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async addTrack(
    dto: AddTrackDto,
    file: Express.Multer.File,
  ) {
    // check exist track
    const artist = await this.artistModel.findOne(
      { artistName: dto.artistName },
    );

    const album = artist.albums.find(
      (t) => t.albumName == dto.albumName,
    );
    const findTrack = album.tracks.find(
      (t) => t.trackName === dto.trackName,
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
      trackName: dto.trackName,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
      fileName: file.filename,
      filePath,
      length,
    };

    const track =
      await this.artistModel.updateOne(
        {
          artistName: dto.artistName,
          'albums.albumName': dto.albumName,
        },
        {
          $push: {
            'albums.$.tracks': data,
          },
        },
      );

    if (track.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    const { _id, albums } =
      await this.artistModel.findOne({
        artistName: dto.artistName,
      });

    const elasticData = {
      id: _id,
      albums,
    };
    this.eventEmitter.emit(
      'update.model',
      elasticData,
    );

    return {
      msg: 'created successfully',
      added: track.modifiedCount,
    };
  }

  async findTrack(
    trackName: string,
    albumName: string,
  ) {
    const artist = await this.artistModel.findOne(
      {
        'albums.tracks.trackName': trackName,
      },
    );

    const album = artist.albums.find(
      (t) => t.albumName == albumName,
    );
    const track = album.tracks.find(
      (t) => t.trackName === trackName,
    );

    if (!track) throw new NotFoundException();

    return track;
  }

  // bug report
  async updateTrack(dto: UpdateTrackDto) {
    // check exist track
    const artist = await this.artistModel.findOne(
      { 'albums.albumName': dto.albumName },
    );

    const album = artist.albums.find(
      (t) => t.albumName == dto.albumName,
    );
    const track = album.tracks.find(
      (t) => t.trackName === dto.trackName,
    );

    if (!track) throw new NotFoundException();

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // save tags in array
    if (dto.tags) {
      let tag: any;
      if (!Array.isArray(dto.tags)) {
        tag = dto.tags.split(',');
      }
      dto.tags = tag;
    }

    // update track info
    const data = {
      trackName: dto.newTrackName,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
    };

    const updatedTrack =
      await this.artistModel.updateOne(
        {
          'albums.tracks.trackName':
            dto.trackName,
        },
        {
          $set: {
            'albums.$.tracks': data,
          },
        },
      );

    if (updatedTrack.modifiedCount == 0)
      throw new InternalServerErrorException();

    // // send data with event emitter to elasticsearch
    const { _id, albums } =
      await this.artistModel.findOne(
        { 'albums.albumName': dto.albumName },
        { 'albums.$': 1 },
      );

    const elasticData = {
      id: _id,
      albums,
    };
    this.eventEmitter.emit(
      'update.model',
      elasticData,
    );

    return {
      msg: 'track info updated successfully',
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
          'albums.tracks.trackName': trackName,
        },
        {
          $pull: {
            'albums.$.tracks': {
              trackName,
            },
          },
        },
      );

    if (removedTrack.modifiedCount == 0)
      throw new InternalServerErrorException();

    // send data with event emitter to elasticsearch
    const { _id, albums } =
      await this.artistModel.findOne(
        { 'albums.albumName': albumName },
        { 'albums.$': 1 },
      );

    const elasticData = {
      id: _id,
      albums,
    };
    this.eventEmitter.emit(
      'update.model',
      elasticData,
    );

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
      minutes = String(`0${minutes}`);
    if (String(second).length == 1)
      second = String(`0${second}`);
    return hour + ':' + minutes + ':' + second;
  }
}
