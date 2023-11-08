import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  modelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Serial number is too long' })
  serialNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  detail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assigneeId?: number;
}
