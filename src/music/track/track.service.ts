import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { AddTrackDto, UpdateTrackDto } from './dto';
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
    const artist = await this.artistModel.findOne({
      artistName: dto.artistName,
    });

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
    const seconds = await getAudioDurationInSeconds(
      file.path,
    );
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

    const track = await this.artistModel.updateOne(
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
    const { _id, albums } = await this.artistModel.findOne({
      artistName: dto.artistName,
    });

    const elasticData = {
      id: _id,
      albums,
    };
    this.eventEmitter.emit('update.artist', elasticData);

    return {
      msg: 'created successfully',
      added: track.modifiedCount,
    };
  }

  async findTrackByName(
    trackName: string,
    albumName: string,
  ) {
    const artist = await this.artistModel.findOne({
      'albums.tracks.trackName': trackName,
    });

    const album = artist.albums.find(
      (t) => t.albumName == albumName,
    );
    const track = album.tracks.find(
      (t) => t.trackName === trackName,
    );

    if (!track) throw new NotFoundException();

    return track;
  }

  async findTrackById(id: string) {
    const findTrack = await this.artistModel.aggregate([
      {
        $unwind: '$albums',
      },
      {
        $unwind: '$albums.tracks',
      },
      {
        $match: {
          'albums.tracks._id': {
            $eq: new mongoose.Types.ObjectId(id),
          },
        },
      },
      // {
      //   $project: {
      //     trackName: '$albums.tracks.trackName',
      //     tags: '$albums.tracks.tags',
      //     youtube_link:
      //       '$albums.tracks.youtube_link',
      //     length: '$albums.tracks.length',
      //     fileName: '$albums.tracks.fileName',
      //     filePath: '$albums.tracks.filePath',
      //     _id: '$albums.tracks._id',
      //   },
      // },
    ]);

    if (!findTrack) throw new NotFoundException();
    return findTrack;
  }

  // async findAggregate(id: string) {
  //   const findTrack =
  //     await this.artistModel.aggregate([
  //       {
  //         $addFields: {
  //           trackDetail: {
  //             $map: {
  //               input: '$albums',
  //               as: 'album',
  //               in: {
  //                 $arrayElemAt: [
  //                   {
  //                     $filter: {
  //                       input: '$tracks',
  //                       as: 'track',
  //                       cond: {
  //                         $eq: [
  //                           '$$track._id',
  //                           id,
  //                         ],
  //                       },
  //                     },
  //                   },
  //                   0,
  //                 ],
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ]);

  //   if (!findTrack) throw new NotFoundException();

  //   return findTrack[0];
  // }

  async updateTrack(dto: UpdateTrackDto) {
    // check exist track
    const findTrack = await this.findTrackById(dto.trackId);
    const { _id: albumId } = findTrack[0].albums;

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
      trackName: dto.trackName,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
    };

    const updatedTrack = await this.artistModel.updateOne(
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

    // send data with event emitter to elasticsearch
    const { _id, albums } = await this.artistModel.findOne(
      { 'albums._id': albumId },
      { 'albums.$': 1 },
    );

    const elasticData = {
      id: _id,
      albums,
    };
    this.eventEmitter.emit('update.artist', elasticData);

    return {
      msg: 'track info updated successfully',
      updated: updatedTrack.modifiedCount,
    };
  }

  async removeTrack(trackName: string, albumName: string) {
    // check exist track
    const { fileName } = await this.findTrackByName(
      trackName,
      albumName,
    );

    // remove track from DB
    const removedTrack = await this.artistModel.updateOne(
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

    // delete track file
    deleteFileInPublic(fileName);

    // send data with event emitter to elasticsearch
    const { _id, albums } = await this.artistModel.findOne(
      { 'albums.albumName': albumName },
      { 'albums.$': 1 },
    );

    const elasticData = {
      id: _id,
      albums,
    };
    this.eventEmitter.emit('update.artist', elasticData);

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
      let [h1, percent] = String(total).split('.');
      hour = Number(h1);
      minutes = Math.round((Number(percent) * 60) / 100)
        .toString()
        .substring(0, 2);
    }
    if (String(hour).length == 1) hour = Number(`0${hour}`);
    if (String(minutes).length == 1)
      minutes = String(`0${minutes}`);
    if (String(second).length == 1)
      second = String(`0${second}`);
    return hour + ':' + minutes + ':' + second;
  }
}
