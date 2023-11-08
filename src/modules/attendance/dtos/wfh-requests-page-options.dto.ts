import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import type { RequestStatusType } from '../../../constants';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class WfhRequestsPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;

  @IsOptional()
  @UseQueryArrayTransformer()
  statuses?: RequestStatusType[];
}
