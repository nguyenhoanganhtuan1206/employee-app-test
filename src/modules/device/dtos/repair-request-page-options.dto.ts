import { IsDateString, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import type { RequestStatusType } from '../../../constants';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class RepairRequestPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  typeIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  modelIds?: number[];

  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @IsOptional()
  @IsString()
  serialNumber: string;

  @IsOptional()
  @UseQueryArrayTransformer()
  statuses?: RequestStatusType[];
}
