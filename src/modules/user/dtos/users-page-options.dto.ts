import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import type { GenderType } from '../../../constants/gender-type';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class UsersPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  genders?: GenderType[];

  @IsOptional()
  @UseQueryArrayTransformer()
  emails?: string[];

  @IsOptional()
  @UseQueryArrayTransformer()
  positionIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  levelIds?: number[];
}
