import {
  CacheTTL,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CacheInterceptor,
  CacheKey,
} from '@nestjs/cache-manager';

// @UseInterceptors(CacheInterceptor)
@ApiTags('Search')
@Controller('elastic')
export class ElasticController {
  constructor(
    private readonly elasticService: ElasticService,
  ) {}

  // @CacheKey('findWord')
  // @CacheTTL(60000)
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

  // @CacheKey('findMovie')
  // @CacheTTL(60000)
  @Get('find-movie')
  findMovie(@Query('search') search: string) {
    return this.elasticService.findMovie(search);
  }

  // @CacheKey('regexp')
  // @CacheTTL(60000)
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
