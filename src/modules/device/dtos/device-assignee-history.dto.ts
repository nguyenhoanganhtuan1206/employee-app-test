import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import { DateProvider } from '../../../providers';
import type { DeviceAssigneeHistoryEntity } from '../entities/device-assiginee-history.entity';

export class DeviceAssigneeHistoryDto extends AbstractDto {
  @ApiProperty()
  deviceId: number;

  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  assignedAt: Date;

  @ApiProperty()
  returnedAt: Date | null;

  constructor(deviceAssigneeHistoryEntity: DeviceAssigneeHistoryEntity) {
    super(deviceAssigneeHistoryEntity);
    this.deviceId = deviceAssigneeHistoryEntity.deviceId;
    this.user = deviceAssigneeHistoryEntity.user.toDto();
    this.assignedAt = DateProvider.formatDateUTC(
      deviceAssigneeHistoryEntity.assignedAt,
    );
    this.returnedAt = deviceAssigneeHistoryEntity.returnedAt
      ? DateProvider.formatDateUTC(deviceAssigneeHistoryEntity.returnedAt)
      : null;
  }
}
