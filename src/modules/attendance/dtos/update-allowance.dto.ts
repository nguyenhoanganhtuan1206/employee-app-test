import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateAllowanceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsInt({ message: 'Total allowance must be an integer' })
  @Min(0, { message: 'Total allowance cannot be less than 0' })
  @IsNotEmpty()
  total: number;
}
