import { ApiProperty } from '@nestjs/swagger';

export class TotalRequestDto {
  @ApiProperty()
  timeOffRequests: number;

  @ApiProperty()
  wfhRequests: number;
}
