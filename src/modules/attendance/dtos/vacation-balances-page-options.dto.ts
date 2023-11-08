import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class VacationBalancesPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];
}
