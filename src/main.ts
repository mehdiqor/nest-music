import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Logger,
  ValidationPipe,
} from '@nestjs/common';

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

  const port = 3010;
  await app.listen(port);

  const logger = new Logger();
  logger.log(
    `Application runnig -> http://localhost:${port}`,
  );
}
bootstrap();
