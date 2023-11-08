import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeviceRepairHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  deviceId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  requestedBy: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  repairDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  repairDetail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier?: string;
}
