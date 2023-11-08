import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRepairRequestStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note: string;
}
