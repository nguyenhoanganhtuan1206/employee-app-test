import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreateBuddyBuddeesPairRequestDto {
  @ApiProperty()
  @IsNumber()
  buddyId: number;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  buddeeIds: number[];
}
