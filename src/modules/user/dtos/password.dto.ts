import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { IsPassword } from '../../../decorators';

export class PasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @IsPassword()
  newPassword: string;
}
