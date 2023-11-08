import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DeviceStatus } from '../../../constants/device-status';
import type { UserDto } from '../../../modules/user/dtos/user.dto';
import type { DeviceEntity } from '../entities/device.entity';
import { DeviceModelDto } from './device-model.dto';
import { DeviceTypeDto } from './device-type.dto';

export class DeviceDto extends AbstractDto {
  @ApiProperty()
  model: DeviceModelDto;

  @ApiProperty()
  type: DeviceTypeDto;

  @ApiProperty()
  serialNumber: string;

  @ApiProperty()
  detail: string;

  @ApiPropertyOptional()
  note: string;

  @ApiPropertyOptional({ nullable: true })
  user: UserDto | null;

  @ApiProperty()
  status: DeviceStatus;

  constructor(deviceEntity: DeviceEntity) {
    super(deviceEntity);
    this.model = deviceEntity.model;
    this.type = deviceEntity.type;
    this.serialNumber = deviceEntity.serialNumber;
    this.detail = deviceEntity.detail;
    this.note = deviceEntity.note;
    this.status = deviceEntity.status;
    this.user = deviceEntity.user;

    if (deviceEntity.user) {
      // Set the user's password to undefined. This is used when an admin retrieves a user.
      deviceEntity.user.password = undefined;
    }
  }
}
