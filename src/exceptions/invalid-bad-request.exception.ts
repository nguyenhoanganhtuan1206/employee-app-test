import { BadRequestException } from '@nestjs/common';

import type { ErrorCode } from './error-code';
import { ERROR_MESSAGES } from './error-messages';

export class InvalidBadRequestException extends BadRequestException {
  constructor(private readonly errorCode: ErrorCode) {
    super(ERROR_MESSAGES[errorCode]);
  }
}
