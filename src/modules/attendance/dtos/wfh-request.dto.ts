import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateType, RequestStatusType } from '../../../constants';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import { DateProvider } from '../../../providers';
import type { WfhRequestEntity } from './../entities/wfh-request.entity';

export class WfhRequestDto extends AbstractDto {
  @ApiPropertyOptional()
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

  constructor(wfhRequestEntity: WfhRequestEntity) {
    super(wfhRequestEntity);
    // Set the user's password to undefined. This is used when an admin retrieves a user.
    wfhRequestEntity.user.password = undefined;
    this.dateFrom = DateProvider.formatDate(wfhRequestEntity.dateFrom);
    this.dateTo = DateProvider.formatDate(wfhRequestEntity.dateTo);
    this.dateType = wfhRequestEntity.dateType;
    this.totalHours = wfhRequestEntity.totalHours;
    this.details = wfhRequestEntity.details;
    this.attachedFile = wfhRequestEntity.attachedFile;
    this.status = wfhRequestEntity.status;
    this.user = wfhRequestEntity.user;
  }
}
