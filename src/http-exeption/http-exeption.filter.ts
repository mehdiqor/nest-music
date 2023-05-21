import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExeptionFilter
  implements ExceptionFilter
{
  catch(
    exception: HttpException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    switch (status) {
      case HttpStatus.NOT_FOUND:
        response.render('404');
        break;
      case HttpStatus.CONFLICT:
        response.status(status).json({
          statusCode: status,
          message: 'This file already exist!',
        });
        break;
      case HttpStatus.BAD_REQUEST:
        response.status(status).json({
          statusCode: status,
          message: 'Bad Request',
        });
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        response.status(status).json({
          statusCode: status,
          message: 'Proccess not be successful',
        });
        break;
      case HttpStatus.PAYLOAD_TOO_LARGE:
        response.status(status).json({
          statusCode: status,
          message: 'File too large',
        });
        break;
      default:
        response.status(status).json({
          statusCode: status,
          message: 'Something went wrong',
        });
        break;
    }
  }
}
