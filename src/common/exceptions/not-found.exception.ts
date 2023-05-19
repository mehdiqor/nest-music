import { NotFoundException } from '@nestjs/common';

export class NotFoundHttpException extends NotFoundException {
  constructor(message?: string) {
    super(message || 'Not Found');
  }
}
