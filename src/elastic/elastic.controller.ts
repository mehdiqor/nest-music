import { Controller, Get, Query } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('elastic')
export class ElasticController {
  constructor(
    private readonly elasticService: ElasticService,
  ) {}

  @Get('word-search')
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

  @Get('find-movie')
  findMovie(@Query('search') search: string) {
    return this.elasticService.findMovie(search);
  }

  @Get('regexp-search')
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
