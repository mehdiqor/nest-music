import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { NotFoundHttpException } from '../exceptions/not-found.exception';

@Catch(NotFoundHttpException)
export class NotFoundHttpFilter
  implements ExceptionFilter
{
  catch(
    exception: NotFoundHttpException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(404)
      .sendFile('404.html', { root: 'public' });
  }
}
