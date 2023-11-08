import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { AttendanceEntity } from '../entities/attendance.entity';
import type { TimeOffRequestDto } from './time-off-request.dto';
import type { WfhRequestDto } from './wfh-request.dto';

export class AttendanceDto extends AbstractDto {
  @ApiPropertyOptional()
  date?: Date | null;

  @ApiPropertyOptional()
  checkIn?: Date | null;

  @ApiPropertyOptional()
  checkOut?: Date | null;

  @ApiPropertyOptional()
  workingHours?: Date | null;

  @ApiPropertyOptional()
  timeOffRequest?: TimeOffRequestDto | null;

  @ApiPropertyOptional()
  wfhRequest?: WfhRequestDto | null;

  constructor(attendanceEntity: AttendanceEntity) {
    super(attendanceEntity);
    this.checkIn = attendanceEntity.checkIn;
    this.checkOut = attendanceEntity.checkOut;
    this.timeOffRequest = attendanceEntity.timeOffRequest;
    this.wfhRequest = attendanceEntity.wfhRequest;
  }
}
