import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.enableCors({
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Error handling
  // app.useGlobalFilters(new HttpExeptionFilter());

  // Handlerbar template engine
  app.useStaticAssets(
    join(__dirname, '..', 'src', 'public'),
  );
  app.setBaseViewsDir(
    join(__dirname, '..', 'src', 'public'),
  );
  app.setViewEngine('hbs');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Music and Movie')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );
  SwaggerModule.setup('swagger', app, document);

  // host and port
  const configService = new ConfigService()
  const host = configService.get('HOST')
  const port = configService.get('PORT');

  await app.listen(port);

  // Logger
  const logger = new Logger();
  logger.log(
    `Application runnig -> ${host}:${port}`,
  );
}
bootstrap();
