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
import {
  HttpErrorFilter,
  NotFoundHttpFilter,
} from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  app.useGlobalFilters(
    new NotFoundHttpFilter(),
  );
  app.useGlobalFilters(new HttpErrorFilter());

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

  const port = 3020;
  await app.listen(port);

  // Logger
  const logger = new Logger();
  logger.log(
    `Application runnig -> http://localhost:${port}`,
  );
}
bootstrap();
