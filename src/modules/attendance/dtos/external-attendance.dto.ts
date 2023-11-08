import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class ExternalAttendanceDto {
  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty()
  @IsDateString()
  checkIn: Date;

  @ApiProperty()
  @IsDateString()
  checkOut: Date;

  @ApiProperty()
  @IsNotEmpty()
  userId: number;
}
