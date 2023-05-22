import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Render,
} from '@nestjs/common';
import { ElasticService } from './elastic.service';
import {
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IndexDto } from './dto';

@ApiTags('Elastic Search')
@Controller('elastic')
export class ElasticController {
  constructor(
    private readonly elasticService: ElasticService,
  ) {}

  @Post('add-index')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  createIndex(@Body() dto: IndexDto) {
    return this.elasticService.createIndex(dto);
  }

  @Post('exist-index')
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
    required: false,
  })
  elasticSearchInMusics(
    @Query('search') search: string,
  ) {
    return this.elasticService.elasticSearchInMusics(
      search,
    );
  }

  @Get('search')
  // @Render('search-engine/search')
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
  })
  searchengine(@Query('search') search: string) {
    return this.elasticService.searchengine(
      search,
    );
  }

  @Delete('remove-index')
  @ApiConsumes(
    'application/x-www-form-urlencoded',
  )
  removeIndex(@Body() dto: IndexDto) {
    return this.elasticService.removeIndex(dto);
  }
}
