import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDeviceModelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: "Device's model name not exceed 100 characters" })
  name: string;
}
