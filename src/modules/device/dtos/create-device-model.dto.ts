import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDeviceModelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: "Device's model name not exceed 100 characters" })
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  typeId: number;
}
