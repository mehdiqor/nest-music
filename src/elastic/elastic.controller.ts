import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ElasticService } from './elastic.service';
import {
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Search')
@Controller('elastic')
export class ElasticController {
  constructor(
    private readonly elasticService: ElasticService,
  ) {}

  @Get('find')
  @ApiQuery({
    name: 'index',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
  })
  findWIthWord(
    @Query('index') index: string,
    @Query('search') search: string,
  ) {
    return this.elasticService.findWIthWord(index, search);
  }

  @Get('regexp')
  // @Render('search-engine/search')
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
  })
  searchWithRegexp(@Query('search') search: string) {
    return this.elasticService.searchWithRegexp(search);
  }
}
