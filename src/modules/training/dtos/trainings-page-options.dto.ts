import { IsDateString, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class TrainingsPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @IsOptional()
  @IsString()
  userName: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @IsOptional()
  @UseQueryArrayTransformer()
  positionIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  levelIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  topicIds?: number[];

  @IsOptional()
  @IsString()
  title: string;
}
