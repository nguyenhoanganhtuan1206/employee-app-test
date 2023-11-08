import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import type { RequestStatusType } from '../../../constants/request-status-type';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class TimeOffRequestsPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateTo?: Date;

  @IsOptional()
  @UseQueryArrayTransformer()
  statuses?: RequestStatusType[];
}
