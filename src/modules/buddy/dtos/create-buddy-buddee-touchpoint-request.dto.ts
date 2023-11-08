import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBuddyBuddeeTouchpointRequestDto {
  @ApiProperty()
  @IsNumber()
  buddyId: number;

  @ApiProperty()
  @IsNumber()
  buddeeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  note: string;

  @ApiProperty()
  @IsBoolean()
  visible: boolean;
}
