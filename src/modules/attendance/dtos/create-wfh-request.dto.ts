import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

import { DateType } from '../../../constants';

export class CreateWfhRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateFrom: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateTo: Date;

  @ApiProperty({ enum: DateType })
  @IsNotEmpty()
  dateType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  totalHours: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024, { message: 'Detail is too long' })
  details: string;
}
