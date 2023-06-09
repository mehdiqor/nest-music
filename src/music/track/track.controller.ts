import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { TrackService } from './track.service';
import { AddTrackDto, UpdateTrackDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Music')
@Controller('track')
export class TrackController {
  constructor(
    private readonly trackService: TrackService,
  ) {}

  @Patch('add')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('track'))
  addTrack(
    @Body() dto: AddTrackDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.trackService.addTrack(dto, file);
  }

  @Patch('update')
  @ApiConsumes('application/x-www-form-urlencoded')
  updateTrack(@Body() dto: UpdateTrackDto) {
    return this.trackService.updateTrack(dto);
  }

  @Patch('remove')
  removeTrack(
    @Query('trackName') trackName: string,
    @Query('albumName') albumName: string,
  ) {
    return this.trackService.removeTrack(
      trackName,
      albumName,
    );
  }
}
