import { Module } from '@nestjs/common';
import { ElasticController } from './elastic.controller';
import { ElasticService } from './elastic.service';
import { Client } from '@elastic/elasticsearch';

@Module({
  controllers: [ElasticController],
  providers: [
    {
      provide: 'ELASTICSEARCH_CLIENT',
      useFactory: () => {
        return new Client({
          node: process.env.ELASTIC_URL,
          auth: {
            username:
              process.env.ELASTIC_USERNAME,
            password:
              process.env.ELASTIC_PASSWORD,
          },
        });
      },
    },
    ElasticService,
  ],
  exports: [
    'ELASTICSEARCH_CLIENT',
    ElasticService,
  ],
})
export class ElasticModule {}
