import { IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import type { DeviceStatus } from '../../../constants';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class DevicesPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  typeIds?: number[];

  @IsOptional()
  @UseQueryArrayTransformer()
  modelIds?: number[];

  @IsOptional()
  @IsString()
  detail: string;

  @IsOptional()
  @IsString()
  serialNumber: string;

  @IsOptional()
  @UseQueryArrayTransformer()
  statuses?: DeviceStatus[];

  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];
}
