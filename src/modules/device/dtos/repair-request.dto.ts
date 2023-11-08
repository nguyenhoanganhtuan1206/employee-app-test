import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { RequestStatusType } from '../../../constants';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import type { RepairRequestEntity } from '../entities/repair-request.entity';
import { DeviceDto } from './device.dto';

export class RepairRequestDto extends AbstractDto {
  @ApiProperty()
  device: DeviceDto;

  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  status: RequestStatusType;

  constructor(repairRequestEntity: RepairRequestEntity) {
    super(repairRequestEntity);
    this.device = repairRequestEntity.device.toDto();
    this.user = repairRequestEntity.user.toDto();
    this.reason = repairRequestEntity.reason;
    this.note = repairRequestEntity.note;
    this.status = repairRequestEntity.status;
  }
}
