import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateType, RequestStatusType } from '../../../constants';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import { DateProvider } from '../../../providers';
import type { TimeOffRequestEntity } from '../entities/time-off-request.entity';

export class TimeOffRequestDto extends AbstractDto {
  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  dateFrom: Date;

  @ApiProperty()
  dateTo: Date;

  @ApiProperty({ enum: DateType })
  dateType: string;

  @ApiProperty()
  totalHours: number;

  @ApiProperty()
  details: string;

  @ApiPropertyOptional()
  attachedFile?: string | null;

  @ApiPropertyOptional({ enum: RequestStatusType })
  status?: string;

  constructor(timeOffRequestEntity: TimeOffRequestEntity) {
    super(timeOffRequestEntity);
    this.user = timeOffRequestEntity.user;
    timeOffRequestEntity.user.password = undefined;
    this.dateFrom = DateProvider.formatDate(timeOffRequestEntity.dateFrom);
    this.dateTo = DateProvider.formatDate(timeOffRequestEntity.dateTo);
    this.dateType = timeOffRequestEntity.dateType;
    this.totalHours = timeOffRequestEntity.totalHours;
    this.details = timeOffRequestEntity.details;
    this.attachedFile = timeOffRequestEntity.attachedFile;
    this.status = timeOffRequestEntity.status;
  }
}
