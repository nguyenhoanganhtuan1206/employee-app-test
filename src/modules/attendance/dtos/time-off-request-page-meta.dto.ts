import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import type { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { AllowanceDto } from './allowance.dto';

interface ITimeOffRequestPageMetaParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
  allowance: AllowanceDto;
}

export class TimeOffRequestPageMeta extends PageMetaDto {
  @ApiProperty()
  readonly allowance: AllowanceDto;

  constructor({
    pageOptionsDto,
    itemCount,
    allowance,
  }: ITimeOffRequestPageMetaParameters) {
    super({ pageOptionsDto, itemCount });
    this.allowance = allowance;
  }
}
