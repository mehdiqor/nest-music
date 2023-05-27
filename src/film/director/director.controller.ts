import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DirectorService } from './director.service';
import { AddDirectorDto, UpdateDirectorDto } from './dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Film')
@Controller('director')
export class DirectorController {
  constructor(
    private readonly directorService: DirectorService,
  ) {}

  @Post('add')
  @ApiConsumes('application/x-www-form-urlencoded')
  addDirector(@Body() dto: AddDirectorDto) {
    return this.directorService.addDirector(dto);
  }

  @Patch('update')
  @ApiConsumes('application/x-www-form-urlencoded')
  updateDirector(@Body() dto: UpdateDirectorDto) {
    return this.directorService.updateDirector(dto);
  }

  @Delete('remove/:id')
  removeDirector(@Param('id') id: string) {
    return this.directorService.removeDirector(id);
  }
}
