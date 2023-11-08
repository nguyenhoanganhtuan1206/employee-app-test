import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBuddyRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
