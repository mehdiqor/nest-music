import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ElasticService } from './elastic.service';
import {
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IndexDto } from './dto';

@ApiTags('Elastic Search')
@Controller('elasticsearch')
export class ElasticController {
  constructor(
    private readonly elasticService: ElasticService,
  ) {}

  @Post('add')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  addMusic(@Body() dto: IndexDto) {
    return this.elasticService.createIndex(dto);
  }

  @Post('remove')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  removeIndex(@Body() dto: IndexDto) {
    return this.elasticService.removeIndex(dto);
  }

  @Post('exist')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  checkExistIndex(@Body() dto: IndexDto) {
    return this.elasticService.checkExistIndex(
      dto,
    );
  }

  @Get('find')
  @ApiQuery({
    name: 'search',
    type: String,
  })
  elasticSearchInMusics(
    @Query('search') search: string,
  ) {
    return this.elasticService.elasticSearchInMusics(
      search,
    );
  }
}
