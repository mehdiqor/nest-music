import {
  Body,
  Controller,
  Delete,
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

  @Delete('remove')
  removeDirectlyFromElastic(@Query('id') id: string) {
    return this.elasticService.removeDirectlyFromElastic(
      id,
    );
  }

  @Post('add-index')
  @ApiConsumes('application/x-www-form-urlencoded')
  createIndex(@Body() dto: IndexDto) {
    return this.elasticService.createIndex(dto);
  }

  @Post('exist-index')
  @ApiConsumes('application/x-www-form-urlencoded')
  checkExistIndex(@Body() dto: IndexDto) {
    return this.elasticService.checkExistIndex(dto);
  }

  @Delete('remove-index')
  @ApiConsumes('application/x-www-form-urlencoded')
  removeIndex(@Body() dto: IndexDto) {
    return this.elasticService.removeIndex(dto);
  }
}
